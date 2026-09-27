import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModuleCompletion } from './module-completion.entity';
import { Progress } from './progress.entity';
import { Enrollment } from '../enrollments/enrollment.entity';
import { CourseModule } from '../courses/course-module.entity';
import { Lesson } from '../courses/lesson.entity';

export interface ModuleCompletionResult {
  /** Whether this was the first completion (201) or a duplicate (200) */
  created: boolean;
  completion: ModuleCompletion;
  /** Updated course completion percentage (0-100) */
  courseProgressPct: number;
}

@Injectable()
export class ModuleCompletionService {
  constructor(
    @InjectRepository(ModuleCompletion)
    private readonly completionRepo: Repository<ModuleCompletion>,
    @InjectRepository(Progress)
    private readonly progressRepo: Repository<Progress>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(CourseModule)
    private readonly moduleRepo: Repository<CourseModule>,
    @InjectRepository(Lesson)
    private readonly lessonRepo: Repository<Lesson>,
  ) {}

  /**
   * Mark a module as complete for the authenticated student.
   *
   * Rules:
   * 1. Student must be enrolled in the course.
   * 2. All lessons in the module must have a completed progress record (completedAt != null).
   * 3. If already completed → idempotent (returns existing record, created=false).
   *
   * @throws NotFoundException   – module not found
   * @throws ForbiddenException  – student not enrolled in the course
   * @throws BadRequestException – not all lessons are completed
   */
  async completeModule(
    userId: string,
    moduleId: string,
  ): Promise<ModuleCompletionResult> {
    // 1. Load module with its course
    const mod = await this.moduleRepo.findOne({
      where: { id: moduleId },
      relations: ['course'],
    });
    if (!mod) {
      throw new NotFoundException(`Module ${moduleId} not found`);
    }
    const courseId = mod.courseId;

    // 2. Verify enrollment
    const enrollment = await this.enrollmentRepo.findOne({
      where: { userId, courseId },
    });
    if (!enrollment) {
      throw new ForbiddenException(
        'You must be enrolled in the course to mark a module as complete',
      );
    }

    // 3. Idempotency – return existing completion without re-checking lessons
    const existing = await this.completionRepo.findOne({
      where: { userId, moduleId },
    });
    if (existing) {
      const courseProgressPct = await this.calculateCourseProgress(userId, courseId);
      return { created: false, completion: existing, courseProgressPct };
    }

    // 4. Verify all lessons are completed
    const lessons = await this.lessonRepo.find({ where: { moduleId } });

    if (lessons.length > 0) {
      // Count how many lessons have a completedAt progress record for this user
      const completedLessons = await this.progressRepo
        .createQueryBuilder('p')
        .where('p.userId = :userId', { userId })
        .andWhere('p.courseId = :courseId', { courseId })
        .andWhere('p.lessonId IN (:...lessonIds)', {
          lessonIds: lessons.map((l) => l.id),
        })
        .andWhere('p.completedAt IS NOT NULL')
        .getCount();

      if (completedLessons < lessons.length) {
        throw new BadRequestException(
          `Cannot complete module: ${completedLessons}/${lessons.length} lessons completed. ` +
            'All lessons must be completed first.',
        );
      }
    }
    // A module with 0 lessons can be completed immediately (no blocking lessons)

    // 5. Record the completion
    const completion = await this.completionRepo.save(
      this.completionRepo.create({ userId, moduleId, courseId }),
    );

    // 6. Calculate and return updated course progress
    const courseProgressPct = await this.calculateCourseProgress(userId, courseId);

    return { created: true, completion, courseProgressPct };
  }

  /**
   * Get all module completions for a user within a course.
   */
  async getByUserAndCourse(
    userId: string,
    courseId: string,
  ): Promise<ModuleCompletion[]> {
    return this.completionRepo.find({
      where: { userId, courseId },
      order: { completedAt: 'ASC' },
    });
  }

  /**
   * Calculate the percentage of modules completed for a course.
   * Returns 0-100.
   */
  private async calculateCourseProgress(
    userId: string,
    courseId: string,
  ): Promise<number> {
    const [totalModules, completedModules] = await Promise.all([
      this.moduleRepo.count({ where: { courseId } }),
      this.completionRepo.count({ where: { userId, courseId } }),
    ]);

    if (totalModules === 0) return 0;
    return Math.round((completedModules / totalModules) * 100);
  }
}
