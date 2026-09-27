import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Progress } from './progress.entity';
import { RecordProgressDto } from './dto/record-progress.dto';
import { StellarService } from '../stellar/stellar.service';
import { CredentialsService } from '../credentials/credentials.service';
import { UsersService } from '../users/users.service';
import { StreaksService } from '../streaks/streaks.service';
import { BundlesService } from '../bundles/bundles.service';
import { MetricsService } from '../metrics/metrics.service';
import { Course } from '../courses/course.entity';
import { CourseModule as CourseModuleEntity } from '../courses/course-module.entity';
import { Enrollment } from '../enrollments/enrollment.entity';

/** Average minutes to allow per lesson when a course doesn't record durations. */
const DEFAULT_LESSON_MINUTES = 10;

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(Progress) private repo: Repository<Progress>,
    @InjectRepository(Course) private courseRepo: Repository<Course>,
    @InjectRepository(CourseModuleEntity) private moduleRepo: Repository<CourseModuleEntity>,
    @InjectRepository(Enrollment) private enrollmentRepo: Repository<Enrollment>,
    private stellarService: StellarService,
    private credentialsService: CredentialsService,
    private usersService: UsersService,
    private streaksService: StreaksService,
    private bundlesService: BundlesService,
    private metrics: MetricsService,
    private eventEmitter: EventEmitter2,
  ) {}

  async record(userId: string, dto: RecordProgressDto, stellarPublicKey: string) {
    // Record activity for streak
    await this.streaksService.recordActivity(userId);

    let progress = await this.repo.findOne({
      where: { userId, courseId: dto.courseId },
    });

    if (!progress) {
      progress = this.repo.create({ userId, courseId: dto.courseId });
    }

    progress.lessonId = dto.lessonId ?? progress.lessonId;
    progress.progressPct = dto.progressPct;

    if (dto.progressPct >= 100) {
      progress.completedAt = new Date();
    }

    // Record on-chain
    try {
      const txHash = await this.stellarService.recordProgress(
        stellarPublicKey,
        dto.courseId,
        dto.progressPct
      );
      progress.txHash = txHash;
    } catch (err) {
      // Non-fatal: store progress off-chain even if on-chain call fails
    }

    const saved = await this.repo.save(progress);

    // Emit progress.updated so ProgressSyncGateway can broadcast to other devices
    this.eventEmitter.emit('progress.updated', {
      userId,
      courseId: dto.courseId,
      lessonId: saved.lessonId,
      progressPct: saved.progressPct,
      updatedAt: saved.updatedAt.toISOString(),
    });

    // Update bundle progress if applicable
    if (dto.progressPct >= 100) {
      await this.bundlesService.updateProgress(userId, dto.courseId);
    }

    // Auto-issue credential at 100%
    if (dto.progressPct >= 100) {
      this.metrics.incrementCourseCompleted(dto.courseId, 'all');

      await this.credentialsService.issue(userId, dto.courseId, stellarPublicKey);

      // Emit event so CertificatesService can issue an on-chain certificate.
      // `course.completed` is the canonical domain event; `progress.completed`
      // is retained for backwards compatibility with existing listeners.
      const completionPayload = {
        userId,
        courseId: dto.courseId,
        stellarPublicKey,
        courseName: dto.courseId, // enriched downstream via the enrollment relation
      };
      this.eventEmitter.emit('course.completed', completionPayload);
      this.eventEmitter.emit('progress.completed', completionPayload);

      // Mint 50 BST to referrer on first course completion
      const completedCount = await this.repo.count({
        where: { userId, completedAt: Not(IsNull()) },
      });
      if (completedCount === 1) {
        const user = await this.usersService.findById(userId);
        if (user?.referredBy) {
          const referrer = await this.usersService.findById(user.referredBy);
          if (referrer?.stellarPublicKey) {
            try {
              await this.stellarService.mintReward(referrer.stellarPublicKey, 50);
            } catch (_) {
              // Non-fatal
            }
          }
        }
      }
    }

    return saved;
  }

  findByUser(userId: string) {
    return this.repo.find({ where: { userId }, order: { updatedAt: 'DESC' } });
  }

  /** Per-module/per-lesson completion breakdown for GET /courses/:courseId/progress */
  async getCourseProgress(userId: string, courseId: string) {
    const enrollment = await this.enrollmentRepo.findOne({ where: { userId, courseId } });
    if (!enrollment) throw new ForbiddenException('You are not enrolled in this course');

    const course = await this.courseRepo.findOne({ where: { id: courseId, isDeleted: false } });
    if (!course) throw new NotFoundException('Course not found');

    const modules = await this.moduleRepo.find({
      where: { courseId },
      relations: ['lessons'],
      order: { order: 'ASC' },
    });
    for (const m of modules) m.lessons.sort((a, b) => a.order - b.order);

    const progress = await this.repo.findOne({ where: { userId, courseId } });
    const overallCompletionPercentage = progress?.progressPct ?? 0;

    const flatLessons = modules.flatMap((m) => m.lessons);
    const totalLessons = flatLessons.length;
    const completedCount = Math.min(
      totalLessons,
      Math.round((overallCompletionPercentage / 100) * totalLessons),
    );

    let seen = 0;
    const lessonsResponse: any[] = [];
    const modulesResponse = modules.map((m) => {
      const lessons = m.lessons.map((lesson) => {
        const index = seen++;
        const status: 'completed' | 'in_progress' | 'not_started' =
          index < completedCount
            ? 'completed'
            : lesson.id === progress?.lessonId
              ? 'in_progress'
              : 'not_started';
        const entry = {
          id: lesson.id,
          title: lesson.title,
          moduleId: m.id,
          status,
          last_accessed_at: lesson.id === progress?.lessonId ? progress?.updatedAt ?? null : null,
        };
        lessonsResponse.push(entry);
        return entry;
      });

      const moduleCompleted = lessons.length > 0 && lessons.every((l) => l.status === 'completed');
      const moduleStarted = lessons.some((l) => l.status !== 'not_started');

      return {
        id: m.id,
        title: m.title,
        status: moduleCompleted ? 'completed' : moduleStarted ? 'in_progress' : 'not_started',
        completionPercentage: lessons.length
          ? Math.round((lessons.filter((l) => l.status === 'completed').length / lessons.length) * 100)
          : 0,
      };
    });

    // Estimated time remaining, based on the student's own completion pace so far.
    const remainingLessons = totalLessons - completedCount;
    const remainingMinutes = flatLessons
      .slice(completedCount)
      .reduce((sum, l) => sum + (l.durationMinutes || DEFAULT_LESSON_MINUTES), 0);

    const daysSinceEnrollment = Math.max(
      1,
      Math.ceil((Date.now() - enrollment.enrolledAt.getTime()) / (24 * 60 * 60 * 1000)),
    );
    const pace = completedCount / daysSinceEnrollment; // lessons/day
    const estimatedDaysRemaining = pace > 0 ? Math.ceil(remainingLessons / pace) : null;

    const user = await this.usersService.findById(userId);

    return {
      courseId,
      courseTitle: course.title,
      overall_completion_percentage: overallCompletionPercentage,
      modules: modulesResponse,
      lessons: lessonsResponse,
      estimatedCompletionTime: {
        remainingLessons,
        remainingMinutes,
        estimatedDaysRemaining,
      },
      streak: user?.currentStreak ?? 0,
      lastActivityAt: user?.lastActivityAt ?? null,
    };
  }
}
