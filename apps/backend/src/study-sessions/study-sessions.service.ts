import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudySession } from './study-session.entity';
import { CreateStudySessionDto } from './dto/create-study-session.dto';

/** Maximum allowed seconds per session — anti-fraud cap. */
const MAX_SESSION_SECONDS = 3600;

/** Minimum time between two sessions for the same user+course to count (seconds). */
const MIN_SESSION_GAP_SECONDS = 5;

export interface StudyTimeSummary {
  totalSeconds: number;
  totalHours: number;
  sessionCount: number;
}

export interface CourseStudyTime {
  courseId: string;
  totalSeconds: number;
  totalHours: number;
  sessionCount: number;
}

export interface UserStudyStats {
  totalSeconds: number;
  totalHours: number;
  sessionCount: number;
  byCourse: CourseStudyTime[];
  last30DaysSeconds: number;
  last7DaysSeconds: number;
  thisWeekLessonsCompleted: number;
}

@Injectable()
export class StudySessionsService {
  private readonly logger = new Logger(StudySessionsService.name);

  constructor(
    @InjectRepository(StudySession)
    private readonly sessionRepo: Repository<StudySession>,
  ) {}

  /**
   * Records a completed study session.
   * Anti-fraud checks:
   *   1. Duration is capped at MAX_SESSION_SECONDS (enforced by DTO + here).
   *   2. Duplicate sessions within MIN_SESSION_GAP_SECONDS for same user+course are ignored.
   */
  async create(userId: string, dto: CreateStudySessionDto): Promise<StudySession> {
    // Cap duration defensively even if DTO validation is bypassed
    const duration = Math.min(dto.durationSeconds, MAX_SESSION_SECONDS);
    if (duration < 1) {
      throw new BadRequestException('durationSeconds must be at least 1');
    }

    // Anti-fraud: reject duplicate rapid sessions
    const recentCutoff = new Date(Date.now() - MIN_SESSION_GAP_SECONDS * 1000);
    const recent = await this.sessionRepo
      .createQueryBuilder('s')
      .where('s.userId = :userId', { userId })
      .andWhere('s.courseId = :courseId', { courseId: dto.courseId ?? null })
      .andWhere('s.startedAt > :cutoff', { cutoff: recentCutoff })
      .getOne();

    if (recent) {
      this.logger.warn(
        `Anti-fraud: duplicate session ignored for user ${userId} course ${dto.courseId}`,
      );
      return recent;
    }

    const session = this.sessionRepo.create({
      userId,
      courseId: dto.courseId,
      lessonId: dto.lessonId,
      durationSeconds: duration,
    });

    return this.sessionRepo.save(session);
  }

  /** Aggregated study stats for a single user. */
  async getStatsForUser(userId: string): Promise<UserStudyStats> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400_000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400_000);

    // Start of current ISO week (Monday)
    const dayOfWeek = now.getUTCDay(); // 0=Sunday
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(now);
    weekStart.setUTCDate(now.getUTCDate() - daysFromMonday);
    weekStart.setUTCHours(0, 0, 0, 0);

    const [totals, byCourseRaw, last30, last7] = await Promise.all([
      this.sessionRepo
        .createQueryBuilder('s')
        .select('SUM(s.durationSeconds)', 'totalSeconds')
        .addSelect('COUNT(*)', 'sessionCount')
        .where('s.userId = :userId', { userId })
        .getRawOne<{ totalSeconds: string; sessionCount: string }>(),

      this.sessionRepo
        .createQueryBuilder('s')
        .select('s.courseId', 'courseId')
        .addSelect('SUM(s.durationSeconds)', 'totalSeconds')
        .addSelect('COUNT(*)', 'sessionCount')
        .where('s.userId = :userId', { userId })
        .andWhere('s.courseId IS NOT NULL')
        .groupBy('s.courseId')
        .getRawMany<{ courseId: string; totalSeconds: string; sessionCount: string }>(),

      this.sessionRepo
        .createQueryBuilder('s')
        .select('SUM(s.durationSeconds)', 'totalSeconds')
        .where('s.userId = :userId', { userId })
        .andWhere('s.startedAt >= :since', { since: thirtyDaysAgo })
        .getRawOne<{ totalSeconds: string }>(),

      this.sessionRepo
        .createQueryBuilder('s')
        .select('SUM(s.durationSeconds)', 'totalSeconds')
        .where('s.userId = :userId', { userId })
        .andWhere('s.startedAt >= :since', { since: sevenDaysAgo })
        .getRawOne<{ totalSeconds: string }>(),
    ]);

    // Count distinct lessons completed this week (lessons with at least one session)
    const weekLessonsResult = await this.sessionRepo
      .createQueryBuilder('s')
      .select('COUNT(DISTINCT s.lessonId)', 'cnt')
      .where('s.userId = :userId', { userId })
      .andWhere('s.lessonId IS NOT NULL')
      .andWhere('s.startedAt >= :since', { since: weekStart })
      .getRawOne<{ cnt: string }>();

    const totalSeconds = Number(totals?.totalSeconds ?? 0);
    const sessionCount = Number(totals?.sessionCount ?? 0);

    return {
      totalSeconds,
      totalHours: Math.round((totalSeconds / 3600) * 100) / 100,
      sessionCount,
      byCourse: byCourseRaw.map((r) => {
        const sec = Number(r.totalSeconds);
        return {
          courseId: r.courseId,
          totalSeconds: sec,
          totalHours: Math.round((sec / 3600) * 100) / 100,
          sessionCount: Number(r.sessionCount),
        };
      }),
      last30DaysSeconds: Number(last30?.totalSeconds ?? 0),
      last7DaysSeconds: Number(last7?.totalSeconds ?? 0),
      thisWeekLessonsCompleted: Number(weekLessonsResult?.cnt ?? 0),
    };
  }

  /** Study time for a single course and user. */
  async getCourseTimeForUser(userId: string, courseId: string): Promise<StudyTimeSummary> {
    const result = await this.sessionRepo
      .createQueryBuilder('s')
      .select('SUM(s.durationSeconds)', 'totalSeconds')
      .addSelect('COUNT(*)', 'sessionCount')
      .where('s.userId = :userId', { userId })
      .andWhere('s.courseId = :courseId', { courseId })
      .getRawOne<{ totalSeconds: string; sessionCount: string }>();

    const totalSeconds = Number(result?.totalSeconds ?? 0);
    return {
      totalSeconds,
      totalHours: Math.round((totalSeconds / 3600) * 100) / 100,
      sessionCount: Number(result?.sessionCount ?? 0),
    };
  }
}
