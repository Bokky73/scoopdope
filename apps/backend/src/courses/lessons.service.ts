import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { Lesson } from './lesson.entity';
import { SearchService } from '../search/search.service';
import { TranscribeService } from './transcribe.service';
import { ProgressService } from '../progress/progress.service';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class LessonsService {
  private readonly logger = new Logger(LessonsService.name);

  constructor(
    @InjectRepository(Lesson) private repo: Repository<Lesson>,
    private readonly searchService: SearchService,
    private readonly transcribeService: TranscribeService,
    private readonly progressService: ProgressService,
  ) {}

  findByModule(moduleId: string) {
    return this.repo.find({ where: { moduleId }, order: { order: 'ASC' } });
  }

  findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async create(moduleId: string, data: Partial<Lesson>) {
    const lesson = await this.repo.save(this.repo.create({ ...data, moduleId }));
    await this.searchService.indexLesson(lesson).catch(() => {});
    
    if (lesson.videoUrl) {
      this.triggerTranscription(lesson);
    }
    
    return lesson;
  }

  async update(id: string, data: Partial<Lesson>) {
    const lesson = await this.findOne(id);
    if (!lesson) throw new NotFoundException('Lesson not found');
    
    const oldVideoUrl = lesson.videoUrl;
    const updated = await this.repo.save({ ...lesson, ...data });
    await this.searchService.indexLesson(updated).catch(() => {});
    
    if (updated.videoUrl && updated.videoUrl !== oldVideoUrl) {
      this.triggerTranscription(updated);
    }
    
    return updated;
  }

  private async triggerTranscription(lesson: Lesson) {
    try {
      const jobName = await this.transcribeService.startTranscription(lesson.id, lesson.videoUrl);
      await this.repo.update(lesson.id, { transcriptionJobName: jobName });
    } catch (error) {
      this.logger.error(`Failed to trigger transcription for lesson ${lesson.id}: ${error.message}`);
    }
  }

  @Interval(60000) // Every 1 minute
  async checkTranscriptionJobs() {
    const lessons = await this.repo.find({
      where: {
        transcriptionJobName: Not(IsNull()),
        transcript: IsNull(),
      },
    });

    for (const lesson of lessons) {
      try {
        const result = await this.transcribeService.getTranscriptionResult(lesson.transcriptionJobName);
        if (result && typeof result !== 'string') {
          // COMPLETED
          const srt = this.transcribeService.convertToSrt(result);
          await this.repo.update(lesson.id, {
            transcript: result,
            transcriptSrt: srt,
          });
          this.logger.log(`Transcription completed for lesson ${lesson.id}`);
        }
      } catch (error) {
        this.logger.error(`Error checking transcription for lesson ${lesson.id}: ${error.message}`);
      }
    }
  }

  async remove(id: string) {
    const lesson = await this.findOne(id);
    if (!lesson) throw new NotFoundException('Lesson not found');

    // Count total lessons in the same module's course before deletion
    const moduleId = lesson.moduleId;
    const lessonModule = await this.repo.manager.query(
      `SELECT "courseId" FROM course_modules WHERE id = $1`,
      [moduleId],
    );
    const courseId: string | undefined = lessonModule[0]?.courseId;

    let totalBefore = 0;
    if (courseId) {
      totalBefore = await this.repo
        .createQueryBuilder('lesson')
        .innerJoin('course_modules', 'module', 'module.id = lesson."moduleId"')
        .where('module."courseId" = :courseId', { courseId })
        .getCount();
    }

    await this.searchService.deleteFromIndex('lessons', id).catch(() => {});
    await this.repo.remove(lesson);

    // Recalculate enrolled users' progress now that one lesson is gone
    if (courseId && totalBefore > 0) {
      const totalAfter = totalBefore - 1;
      await this.progressService
        .recalcOnLessonDeletion(courseId, id, totalBefore, totalAfter)
        .catch((err) =>
          this.logger.error(`Failed to recalc progress after lesson deletion: ${err.message}`),
        );
    }
  }
}
