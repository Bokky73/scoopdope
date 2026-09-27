import { Injectable } from '@nestjs/common';
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

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(Progress) private repo: Repository<Progress>,
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

  /**
   * Recalculate progress percentages for all enrolled users in a course after a lesson is deleted.
   *
   * Because progress is stored as a percentage (not per-lesson completion flags),
   * we scale each user's existing progressPct proportionally:
   *   newPct = round(oldPct * totalLessonsBeforeDeletion / totalLessonsAfterDeletion)
   * clamped to [0, 100].  Users who had already reached 100% retain 100% only
   * if they still have 100% after the scale (i.e., they keep their completion).
   *
   * If the deleted lesson was the last lesson in the course (totalLessonsAfterDeletion === 0),
   * all in-progress records are left unchanged and only the lessonId pointer is cleared
   * for records that referenced the deleted lesson.
   *
   * @param courseId                   ID of the course the lesson belonged to
   * @param deletedLessonId            ID of the lesson that was just removed
   * @param totalLessonsBeforeDeletion Total lesson count before the deletion
   * @param totalLessonsAfterDeletion  Total lesson count after the deletion
   */
  async recalcOnLessonDeletion(
    courseId: string,
    deletedLessonId: string,
    totalLessonsBeforeDeletion: number,
    totalLessonsAfterDeletion: number,
  ): Promise<void> {
    const records = await this.repo.find({ where: { courseId } });
    if (records.length === 0) return;

    for (const record of records) {
      // Clear dangling lessonId reference
      if (record.lessonId === deletedLessonId) {
        record.lessonId = undefined as unknown as string;
      }

      if (totalLessonsAfterDeletion > 0 && totalLessonsBeforeDeletion > 0) {
        const scaled = Math.round(
          (record.progressPct * totalLessonsBeforeDeletion) / totalLessonsAfterDeletion,
        );
        record.progressPct = Math.min(100, Math.max(0, scaled));

        // If newly below 100, clear the completedAt timestamp
        if (record.progressPct < 100 && record.completedAt) {
          record.completedAt = undefined as unknown as Date;
        }
      }
    }

    await this.repo.save(records);
  }
}
