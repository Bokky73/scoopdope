import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Enrollment } from '../enrollments/enrollment.entity';
import { Progress } from '../progress/progress.entity';
import { Lesson } from '../courses/lesson.entity';

export interface DateRangeFilter {
  from?: Date;
  to?: Date;
}

export interface EnrollmentTrend {
  period: string;
  count: number;
}

export interface LessonDifficulty {
  lessonId: string;
  lessonTitle: string;
  moduleId: string;
  dropCount: number;
  avgProgressAtDrop: number;
}

export interface InstructorCourseAnalytics {
  courseId: string;
  /** Total number of enrollments */
  totalEnrollments: number;
  /** Number of students who completed the course */
  totalCompletions: number;
  /** Completion rate as a percentage */
  completionRate: number;
  /** Students who have updated progress in the last 30 days */
  activeStudents: number;
  /** 7-day enrollment trend */
  trend7Days: EnrollmentTrend[];
  /** 14-day enrollment trend */
  trend14Days: EnrollmentTrend[];
  /** 30-day enrollment trend */
  trend30Days: EnrollmentTrend[];
  /** The lesson where most students drop off */
  primaryDropoutLesson?: LessonDifficulty;
  /** Top 5 lessons by difficulty (dropout rate) */
  difficultLessons: LessonDifficulty[];
}

@Injectable()
export class InstructorAnalyticsService {
  private readonly logger = new Logger(InstructorAnalyticsService.name);
  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly CACHE_PREFIX = 'instructor_analytics:';

  constructor(
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(Progress)
    private progressRepo: Repository<Progress>,
    @InjectRepository(Lesson)
    private lessonRepo: Repository<Lesson>,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  /**
   * Get full analytics dashboard for a specific course, optionally filtered by date range.
   */
  async getCourseAnalytics(
    courseId: string,
    filter: DateRangeFilter = {},
  ): Promise<InstructorCourseAnalytics> {
    const cacheKey = `${this.CACHE_PREFIX}${courseId}:${filter.from?.toISOString() ?? ''}:${filter.to?.toISOString() ?? ''}`;
    const cached = await this.cache.get<InstructorCourseAnalytics>(cacheKey);
    if (cached) return cached;

    const [
      totalEnrollments,
      totalCompletions,
      activeStudents,
      trend7Days,
      trend14Days,
      trend30Days,
      difficultLessons,
    ] = await Promise.all([
      this.countEnrollments(courseId, filter),
      this.countCompletions(courseId, filter),
      this.countActiveStudents(courseId),
      this.getEnrollmentTrend(courseId, 7),
      this.getEnrollmentTrend(courseId, 14),
      this.getEnrollmentTrend(courseId, 30),
      this.getDifficultLessons(courseId),
    ]);

    const completionRate =
      totalEnrollments > 0
        ? Math.round((totalCompletions / totalEnrollments) * 10000) / 100
        : 0;

    const result: InstructorCourseAnalytics = {
      courseId,
      totalEnrollments,
      totalCompletions,
      completionRate,
      activeStudents,
      trend7Days,
      trend14Days,
      trend30Days,
      primaryDropoutLesson: difficultLessons[0],
      difficultLessons,
    };

    await this.cache.set(cacheKey, result, this.CACHE_TTL);
    return result;
  }

  /**
   * Get analytics for all courses taught by an instructor.
   */
  async getInstructorDashboard(
    instructorId: string,
    filter: DateRangeFilter = {},
  ): Promise<{
    totalStudents: number;
    totalEnrollments: number;
    totalCompletions: number;
    overallCompletionRate: number;
    courses: InstructorCourseAnalytics[];
  }> {
    const cacheKey = `${this.CACHE_PREFIX}instructor:${instructorId}:${filter.from?.toISOString() ?? ''}:${filter.to?.toISOString() ?? ''}`;
    const cached = await this.cache.get<any>(cacheKey);
    if (cached) return cached;

    // Find all courses taught by this instructor
    const courseIds = await this.enrollmentRepo
      .createQueryBuilder('e')
      .innerJoin('courses', 'c', 'c.id = e.courseId')
      .where('c.instructorId = :instructorId', { instructorId })
      .select('DISTINCT e.courseId', 'courseId')
      .getRawMany<{ courseId: string }>();

    const courses = await Promise.all(
      courseIds.map(({ courseId }) => this.getCourseAnalytics(courseId, filter)),
    );

    const totalEnrollments = courses.reduce((s, c) => s + c.totalEnrollments, 0);
    const totalCompletions = courses.reduce((s, c) => s + c.totalCompletions, 0);

    // Unique students across all courses
    const uniqueStudentsRaw = await this.enrollmentRepo
      .createQueryBuilder('e')
      .innerJoin('courses', 'c', 'c.id = e.courseId')
      .where('c.instructorId = :instructorId', { instructorId })
      .select('COUNT(DISTINCT e.userId)', 'count')
      .getRawOne<{ count: string }>();

    const totalStudents = Number(uniqueStudentsRaw?.count ?? 0);
    const overallCompletionRate =
      totalEnrollments > 0
        ? Math.round((totalCompletions / totalEnrollments) * 10000) / 100
        : 0;

    const result = {
      totalStudents,
      totalEnrollments,
      totalCompletions,
      overallCompletionRate,
      courses,
    };

    await this.cache.set(cacheKey, result, this.CACHE_TTL);
    return result;
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  private async countEnrollments(
    courseId: string,
    filter: DateRangeFilter,
  ): Promise<number> {
    const qb = this.enrollmentRepo
      .createQueryBuilder('e')
      .where('e.courseId = :courseId', { courseId });

    if (filter.from) qb.andWhere('e.enrolledAt >= :from', { from: filter.from });
    if (filter.to) qb.andWhere('e.enrolledAt <= :to', { to: filter.to });

    return qb.getCount();
  }

  private async countCompletions(
    courseId: string,
    filter: DateRangeFilter,
  ): Promise<number> {
    const qb = this.enrollmentRepo
      .createQueryBuilder('e')
      .where('e.courseId = :courseId', { courseId })
      .andWhere('e.completedAt IS NOT NULL');

    if (filter.from) qb.andWhere('e.completedAt >= :from', { from: filter.from });
    if (filter.to) qb.andWhere('e.completedAt <= :to', { to: filter.to });

    return qb.getCount();
  }

  private async countActiveStudents(courseId: string): Promise<number> {
    const since = new Date(Date.now() - 30 * 86_400_000);
    const result = await this.progressRepo
      .createQueryBuilder('p')
      .where('p.courseId = :courseId', { courseId })
      .andWhere('p.updatedAt >= :since', { since })
      .select('COUNT(DISTINCT p.userId)', 'count')
      .getRawOne<{ count: string }>();
    return Number(result?.count ?? 0);
  }

  /**
   * Build a daily enrollment trend for the last N days.
   */
  private async getEnrollmentTrend(
    courseId: string,
    days: number,
  ): Promise<EnrollmentTrend[]> {
    const since = new Date(Date.now() - days * 86_400_000);
    const rows = await this.enrollmentRepo
      .createQueryBuilder('e')
      .where('e.courseId = :courseId', { courseId })
      .andWhere('e.enrolledAt >= :since', { since })
      .select("TO_CHAR(e.enrolledAt, 'YYYY-MM-DD')", 'period')
      .addSelect('COUNT(*)', 'count')
      .groupBy("TO_CHAR(e.enrolledAt, 'YYYY-MM-DD')")
      .orderBy("TO_CHAR(e.enrolledAt, 'YYYY-MM-DD')", 'ASC')
      .getRawMany<{ period: string; count: string }>();

    // Build complete date range with zeros for missing days
    const map = new Map(rows.map((r) => [r.period, Number(r.count)]));
    const trend: EnrollmentTrend[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86_400_000);
      const key = d.toISOString().slice(0, 10);
      trend.push({ period: key, count: map.get(key) ?? 0 });
    }
    return trend;
  }

  /**
   * Identify lessons where students stop progressing (dropout points).
   * A "dropout" is a progress record where progressPct < 100 and the lesson
   * appears as the last lesson touched. We rank by dropout count descending.
   */
  private async getDifficultLessons(
    courseId: string,
  ): Promise<LessonDifficulty[]> {
    // Find students who haven't completed the course
    const dropRows = await this.progressRepo
      .createQueryBuilder('p')
      .where('p.courseId = :courseId', { courseId })
      .andWhere('p.completedAt IS NULL')
      .andWhere('p.lessonId IS NOT NULL')
      .andWhere('p.progressPct > 0')
      .andWhere('p.progressPct < 100')
      .select('p.lessonId', 'lessonId')
      .addSelect('COUNT(*)', 'dropCount')
      .addSelect('AVG(p.progressPct)', 'avgProgressAtDrop')
      .groupBy('p.lessonId')
      .orderBy('COUNT(*)', 'DESC')
      .limit(5)
      .getRawMany<{ lessonId: string; dropCount: string; avgProgressAtDrop: string }>();

    if (!dropRows.length) return [];

    const lessonIds = dropRows.map((r) => r.lessonId);
    const lessons = await this.lessonRepo.findByIds(lessonIds);
    const lessonMap = new Map(lessons.map((l) => [l.id, l]));

    return dropRows.map((row) => {
      const lesson = lessonMap.get(row.lessonId);
      return {
        lessonId: row.lessonId,
        lessonTitle: lesson?.title ?? 'Unknown Lesson',
        moduleId: lesson?.moduleId ?? '',
        dropCount: Number(row.dropCount),
        avgProgressAtDrop: Math.round(Number(row.avgProgressAtDrop) * 100) / 100,
      };
    });
  }
}
