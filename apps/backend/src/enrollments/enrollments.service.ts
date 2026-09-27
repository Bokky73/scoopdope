import {
  Injectable,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Enrollment } from './enrollment.entity';
import { EnrollmentConfirmedEvent } from './enrollment-confirmed.event';
import { PrerequisitesService } from '../courses/prerequisites.service';
import { CourseVersioningService } from '../courses/course-versioning.service';
import { CoursesService } from '../courses/courses.service';
import { CourseStatus } from '../courses/course.entity';
import { MetricsService } from '../metrics/metrics.service';
import { StellarService } from '../stellar/stellar.service';

@Injectable()
export class EnrollmentsService {
  private readonly logger = new Logger(EnrollmentsService.name);

  constructor(
    @InjectRepository(Enrollment)
    private repo: Repository<Enrollment>,
    private eventEmitter: EventEmitter2,
    private prereqService: PrerequisitesService,
    private versioningService: CourseVersioningService,
    private coursesService: CoursesService,
    private metrics: MetricsService,
    private stellarService: StellarService,
  ) {}

  async enroll(userId: string, courseId: string, adminOverride = false): Promise<Enrollment> {
    // Throws NotFoundException (404) when the course doesn't exist (or is soft-deleted).
    const course = await this.coursesService.findOne(courseId);

    if (course.status !== CourseStatus.PUBLISHED && !adminOverride) {
      throw new ForbiddenException('Course is not open for enrollment');
    }

    const existing = await this.repo.findOne({ where: { userId, courseId } });
    if (existing) throw new ConflictException('Already enrolled in this course');

    await this.prereqService.enforcePrerequisites(userId, courseId, adminOverride);

    // Pin the student to the latest published version at enrollment time
    const versions = await this.versioningService.listVersions(courseId);
    const latestVersion = versions[0] ?? null;

    const enrollment = await this.repo.save(
      this.repo.create({
        userId,
        courseId,
        enrolledVersionNumber: latestVersion?.versionNumber ?? null,
        transactionHash: null,
      }),
    );

    // Record the enrollment on-chain. If the Soroban call fails we roll back
    // the enrollment row so the database never holds an un-anchored record.
    let transactionHash: string | null = null;
    try {
      transactionHash = await this.stellarService.recordEnrollment(userId, courseId);
      enrollment.transactionHash = transactionHash;
      await this.repo.save(enrollment);
      this.logger.log(
        `Enrollment ${enrollment.id} anchored on-chain (tx: ${transactionHash})`,
      );
    } catch (err: any) {
      this.logger.error(
        `On-chain enrollment failed for user=${userId} course=${courseId}: ${err.message}`,
        err.stack,
      );

      // Remove the DB row — keeps the database consistent.
      await this.repo.remove(enrollment).catch((removeErr) =>
        this.logger.error(
          `Failed to remove enrollment after on-chain failure: ${removeErr.message}`,
        ),
      );

      throw new InternalServerErrorException({
        message: 'Failed to record enrollment on the Stellar network. Please try again.',
        detail: err.message,
      });
    }

    // Emit legacy event consumed by notifications / other listeners.
    this.eventEmitter.emit('enrollment.created', {
      enrollmentId: enrollment.id,
      userId,
      courseId,
      enrolledAt: enrollment.enrolledAt,
    });

    // Emit the richer on-chain confirmed event for analytics and downstream modules.
    this.eventEmitter.emit(
      'enrollment.confirmed',
      new EnrollmentConfirmedEvent({
        enrollmentId: enrollment.id,
        userId,
        courseId,
        transactionHash,
        enrolledAt: enrollment.enrolledAt,
      }),
    );

    this.metrics.incrementEnrollment(courseId, 'all');

    return enrollment;
  }

  /**
   * Count total enrollments for a course
   */
  async countByCoursId(courseId: string): Promise<number> {
    return this.repo.count({ where: { courseId } });
  }

  /**
   * Count completed enrollments for a course
   */
  async countCompletedByCourseId(courseId: string): Promise<number> {
    return this.repo
      .createQueryBuilder('enrollment')
      .where('enrollment.courseId = :courseId', { courseId })
      .andWhere('enrollment.completedAt IS NOT NULL')
      .getCount();
  }

  async unenroll(userId: string, courseId: string): Promise<void> {
    const enrollment = await this.repo.findOne({ where: { userId, courseId } });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    await this.repo.remove(enrollment);

    // Notify waitlist system that a spot has opened
    this.eventEmitter.emit('enrollment.removed', { userId, courseId });
  }

  findByUser(userId: string): Promise<Enrollment[]> {
    return this.repo.find({
      where: { userId },
      relations: ['course'],
      order: { enrolledAt: 'DESC' },
    });
  }

  /** Upgrade a student's pinned version to the latest available version. */
  async upgradeVersion(userId: string, courseId: string): Promise<Enrollment> {
    const enrollment = await this.repo.findOne({ where: { userId, courseId } });
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    const versions = await this.versioningService.listVersions(courseId);
    const latestVersion = versions[0];
    if (!latestVersion) throw new NotFoundException('No versions found for this course');

    enrollment.enrolledVersionNumber = latestVersion.versionNumber;
    return this.repo.save(enrollment);
  }
}
