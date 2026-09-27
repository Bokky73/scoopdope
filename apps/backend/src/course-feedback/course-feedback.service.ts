import {
  Injectable,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseFeedback } from './course-feedback.entity';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';
import { Enrollment } from '../enrollments/enrollment.entity';

export interface FeedbackSummary {
  courseId: string;
  totalResponses: number;
  averages: {
    contentQuality: number;
    difficulty: number;
    relevance: number;
    instructorRating: number;
    overallRating: number;
  };
  /** Monthly trend of average overall rating */
  trend: { month: string; avgOverallRating: number; count: number }[];
  /** Latest 10 comments */
  recentComments: { comment: string; submittedAt: Date }[];
}

@Injectable()
export class CourseFeedbackService {
  constructor(
    @InjectRepository(CourseFeedback)
    private feedbackRepo: Repository<CourseFeedback>,
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
  ) {}

  /**
   * Submit feedback for a course.
   * Only students who have completed the course may submit feedback.
   * One submission per student per course.
   */
  async submitFeedback(
    userId: string,
    courseId: string,
    dto: SubmitFeedbackDto,
  ): Promise<CourseFeedback> {
    // Check the student has completed the course
    const enrollment = await this.enrollmentRepo.findOne({
      where: { userId, courseId },
    });
    if (!enrollment) {
      throw new ForbiddenException('You are not enrolled in this course');
    }
    if (!enrollment.completedAt) {
      throw new ForbiddenException(
        'You must complete the course before submitting feedback',
      );
    }

    // Enforce one feedback per student per course
    const existing = await this.feedbackRepo.findOne({
      where: { userId, courseId },
    });
    if (existing) {
      throw new ConflictException(
        'You have already submitted feedback for this course',
      );
    }

    const feedback = this.feedbackRepo.create({
      userId,
      courseId,
      contentQuality: dto.contentQuality,
      difficulty: dto.difficulty,
      relevance: dto.relevance,
      instructorRating: dto.instructorRating,
      overallRating: dto.overallRating,
      comment: dto.comment ?? null,
    });

    return this.feedbackRepo.save(feedback);
  }

  /**
   * Get all feedback responses for a course (instructor/admin only).
   */
  async getFeedbackResponses(courseId: string): Promise<CourseFeedback[]> {
    return this.feedbackRepo.find({
      where: { courseId },
      order: { submittedAt: 'DESC' },
      relations: ['user'],
    });
  }

  /**
   * Get aggregated feedback summary with averages and trend.
   */
  async getFeedbackSummary(courseId: string): Promise<FeedbackSummary> {
    const [aggregates, trendRows, recentComments, totalResponses] =
      await Promise.all([
        this.feedbackRepo
          .createQueryBuilder('f')
          .where('f.courseId = :courseId', { courseId })
          .select('AVG(f.contentQuality)', 'avgContentQuality')
          .addSelect('AVG(f.difficulty)', 'avgDifficulty')
          .addSelect('AVG(f.relevance)', 'avgRelevance')
          .addSelect('AVG(f.instructorRating)', 'avgInstructorRating')
          .addSelect('AVG(f.overallRating)', 'avgOverallRating')
          .getRawOne<{
            avgContentQuality: string;
            avgDifficulty: string;
            avgRelevance: string;
            avgInstructorRating: string;
            avgOverallRating: string;
          }>(),
        this.feedbackRepo
          .createQueryBuilder('f')
          .where('f.courseId = :courseId', { courseId })
          .select("TO_CHAR(f.submittedAt, 'YYYY-MM')", 'month')
          .addSelect('AVG(f.overallRating)', 'avgOverallRating')
          .addSelect('COUNT(*)', 'count')
          .groupBy("TO_CHAR(f.submittedAt, 'YYYY-MM')")
          .orderBy("TO_CHAR(f.submittedAt, 'YYYY-MM')", 'ASC')
          .getRawMany<{ month: string; avgOverallRating: string; count: string }>(),
        this.feedbackRepo.find({
          where: { courseId },
          select: ['comment', 'submittedAt'],
          order: { submittedAt: 'DESC' },
          take: 10,
        }),
        this.feedbackRepo.count({ where: { courseId } }),
      ]);

    const round2 = (v: string | undefined) =>
      Math.round(Number(v ?? 0) * 100) / 100;

    return {
      courseId,
      totalResponses,
      averages: {
        contentQuality: round2(aggregates?.avgContentQuality),
        difficulty: round2(aggregates?.avgDifficulty),
        relevance: round2(aggregates?.avgRelevance),
        instructorRating: round2(aggregates?.avgInstructorRating),
        overallRating: round2(aggregates?.avgOverallRating),
      },
      trend: trendRows.map((r) => ({
        month: r.month,
        avgOverallRating: round2(r.avgOverallRating),
        count: Number(r.count),
      })),
      recentComments: recentComments
        .filter((f) => f.comment)
        .map((f) => ({ comment: f.comment!, submittedAt: f.submittedAt })),
    };
  }

  /**
   * Export all feedback for a course as a structured array (for CSV/download).
   */
  async exportFeedback(courseId: string): Promise<object[]> {
    const rows = await this.feedbackRepo.find({
      where: { courseId },
      relations: ['user'],
      order: { submittedAt: 'DESC' },
    });

    return rows.map((r) => ({
      id: r.id,
      courseId: r.courseId,
      userId: r.userId,
      userEmail: r.user?.email ?? '',
      contentQuality: r.contentQuality,
      difficulty: r.difficulty,
      relevance: r.relevance,
      instructorRating: r.instructorRating,
      overallRating: r.overallRating,
      comment: r.comment ?? '',
      submittedAt: r.submittedAt.toISOString(),
    }));
  }
}
