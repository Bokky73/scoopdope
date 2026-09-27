import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import { Repository } from 'typeorm';

import { EnrollmentsService } from './enrollments.service';
import { Enrollment } from './enrollment.entity';
import { EnrollmentConfirmedEvent } from './enrollment-confirmed.event';
import { PrerequisitesService } from '../courses/prerequisites.service';
import { CourseVersioningService } from '../courses/course-versioning.service';
import { CoursesService } from '../courses/courses.service';
import { CourseStatus } from '../courses/course.entity';
import { MetricsService } from '../metrics/metrics.service';
import { StellarService } from '../stellar/stellar.service';

// ── Helpers ───────────────────────────────────────────────────────────────────

const USER_ID = 'user-uuid-1';
const COURSE_ID = 'course-uuid-1';
const ENROLLMENT_ID = 'enrollment-uuid-1';
const TX_HASH = 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';

function makeEnrollment(overrides: Partial<Enrollment> = {}): Enrollment {
  return {
    id: ENROLLMENT_ID,
    userId: USER_ID,
    courseId: COURSE_ID,
    enrolledAt: new Date('2026-01-01T00:00:00Z'),
    completedAt: null,
    enrolledVersionNumber: 1,
    transactionHash: null,
    user: null as any,
    course: null as any,
    ...overrides,
  };
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe('EnrollmentsService — on-chain enrollment flow', () => {
  let service: EnrollmentsService;
  let enrollmentRepo: jest.Mocked<Repository<Enrollment>>;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let stellarService: jest.Mocked<StellarService>;
  let prereqService: jest.Mocked<PrerequisitesService>;
  let versioningService: jest.Mocked<CourseVersioningService>;
  let coursesService: jest.Mocked<CoursesService>;
  let metricsService: jest.Mocked<MetricsService>;

  beforeEach(async () => {
    // Build lightweight mocks for every dependency
    const mockRepo: Partial<jest.Mocked<Repository<Enrollment>>> = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const mockEventEmitter: Partial<jest.Mocked<EventEmitter2>> = {
      emit: jest.fn(),
    };

    const mockStellar: Partial<jest.Mocked<StellarService>> = {
      recordEnrollment: jest.fn(),
    };

    const mockPrereq: Partial<jest.Mocked<PrerequisitesService>> = {
      enforcePrerequisites: jest.fn(),
    };

    const mockVersioning: Partial<jest.Mocked<CourseVersioningService>> = {
      listVersions: jest.fn(),
    };

    const mockCourses: Partial<jest.Mocked<CoursesService>> = {
      findOne: jest.fn().mockResolvedValue({ id: COURSE_ID, status: CourseStatus.PUBLISHED } as any),
    };

    const mockMetrics: Partial<jest.Mocked<MetricsService>> = {
      incrementEnrollment: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentsService,
        { provide: getRepositoryToken(Enrollment), useValue: mockRepo },
        { provide: EventEmitter2, useValue: mockEventEmitter },
        { provide: StellarService, useValue: mockStellar },
        { provide: PrerequisitesService, useValue: mockPrereq },
        { provide: CourseVersioningService, useValue: mockVersioning },
        { provide: CoursesService, useValue: mockCourses },
        { provide: MetricsService, useValue: mockMetrics },
      ],
    }).compile();

    service = module.get(EnrollmentsService);
    enrollmentRepo = module.get(getRepositoryToken(Enrollment));
    eventEmitter = module.get(EventEmitter2);
    stellarService = module.get(StellarService);
    prereqService = module.get(PrerequisitesService);
    versioningService = module.get(CourseVersioningService);
    coursesService = module.get(CoursesService);
    metricsService = module.get(MetricsService);
  });

  // ── Happy path ──────────────────────────────────────────────────────────────

  describe('enroll — success', () => {
    it('saves enrollment, stores transaction hash, and emits both events', async () => {
      const savedEnrollment = makeEnrollment();

      enrollmentRepo.findOne.mockResolvedValueOnce(null); // no duplicate
      prereqService.enforcePrerequisites.mockResolvedValueOnce(undefined);
      versioningService.listVersions.mockResolvedValueOnce([
        { versionNumber: 1 } as any,
      ]);
      enrollmentRepo.create.mockReturnValueOnce(savedEnrollment);

      // First save — persists the enrollment row (transactionHash = null)
      enrollmentRepo.save.mockResolvedValueOnce(savedEnrollment);

      stellarService.recordEnrollment.mockResolvedValueOnce(TX_HASH);

      // Second save — persists the transaction hash
      const finalEnrollment = makeEnrollment({ transactionHash: TX_HASH });
      enrollmentRepo.save.mockResolvedValueOnce(finalEnrollment);

      const result = await service.enroll(USER_ID, COURSE_ID);

      // Correct prerequisites check
      expect(prereqService.enforcePrerequisites).toHaveBeenCalledWith(
        USER_ID,
        COURSE_ID,
        false,
      );

      // On-chain call received the right arguments
      expect(stellarService.recordEnrollment).toHaveBeenCalledWith(USER_ID, COURSE_ID);

      // transactionHash was written onto the enrollment before the second save
      expect(enrollmentRepo.save).toHaveBeenCalledTimes(2);
      const secondSaveArg = enrollmentRepo.save.mock.calls[1][0] as Enrollment;
      expect(secondSaveArg.transactionHash).toBe(TX_HASH);

      // Legacy event emitted
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'enrollment.created',
        expect.objectContaining({ userId: USER_ID, courseId: COURSE_ID }),
      );

      // New on-chain confirmed event emitted
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'enrollment.confirmed',
        expect.any(EnrollmentConfirmedEvent),
      );

      const confirmedEventArg = eventEmitter.emit.mock.calls.find(
        ([name]) => name === 'enrollment.confirmed',
      )?.[1] as EnrollmentConfirmedEvent;

      expect(confirmedEventArg.transactionHash).toBe(TX_HASH);
      expect(confirmedEventArg.userId).toBe(USER_ID);
      expect(confirmedEventArg.courseId).toBe(COURSE_ID);

      // Metrics incremented
      expect(metricsService.incrementEnrollment).toHaveBeenCalledWith(COURSE_ID, 'all');

      expect(result.transactionHash).toBe(TX_HASH);
    });
  });

  // ── Duplicate enrollment ────────────────────────────────────────────────────

  describe('enroll — duplicate', () => {
    it('throws ConflictException when enrollment already exists', async () => {
      enrollmentRepo.findOne.mockResolvedValueOnce(makeEnrollment());

      await expect(service.enroll(USER_ID, COURSE_ID)).rejects.toThrow(ConflictException);

      expect(stellarService.recordEnrollment).not.toHaveBeenCalled();
    });
  });

  // ── Soroban failure ─────────────────────────────────────────────────────────

  describe('enroll — Soroban failure', () => {
    it('removes the enrollment row and throws InternalServerErrorException', async () => {
      const savedEnrollment = makeEnrollment();

      enrollmentRepo.findOne.mockResolvedValueOnce(null);
      prereqService.enforcePrerequisites.mockResolvedValueOnce(undefined);
      versioningService.listVersions.mockResolvedValueOnce([{ versionNumber: 1 } as any]);
      enrollmentRepo.create.mockReturnValueOnce(savedEnrollment);
      enrollmentRepo.save.mockResolvedValueOnce(savedEnrollment);

      stellarService.recordEnrollment.mockRejectedValueOnce(
        new Error('Soroban RPC timeout'),
      );

      enrollmentRepo.remove.mockResolvedValueOnce(savedEnrollment);

      await expect(service.enroll(USER_ID, COURSE_ID)).rejects.toThrow(
        InternalServerErrorException,
      );

      // DB row must have been cleaned up
      expect(enrollmentRepo.remove).toHaveBeenCalledWith(savedEnrollment);

      // Neither event should have been emitted
      expect(eventEmitter.emit).not.toHaveBeenCalled();

      // Metrics must NOT be incremented on failure
      expect(metricsService.incrementEnrollment).not.toHaveBeenCalled();
    });

    it('throws InternalServerErrorException containing a user-friendly message', async () => {
      const savedEnrollment = makeEnrollment();

      enrollmentRepo.findOne.mockResolvedValueOnce(null);
      prereqService.enforcePrerequisites.mockResolvedValueOnce(undefined);
      versioningService.listVersions.mockResolvedValueOnce([{ versionNumber: 1 } as any]);
      enrollmentRepo.create.mockReturnValueOnce(savedEnrollment);
      enrollmentRepo.save.mockResolvedValueOnce(savedEnrollment);
      stellarService.recordEnrollment.mockRejectedValueOnce(new Error('network error'));
      enrollmentRepo.remove.mockResolvedValueOnce(savedEnrollment);

      try {
        await service.enroll(USER_ID, COURSE_ID);
        fail('Expected InternalServerErrorException to be thrown');
      } catch (err: any) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
        expect(err.getResponse().message).toContain('Stellar network');
      }
    });
  });

  // ── Prerequisite failure ────────────────────────────────────────────────────

  describe('enroll — prerequisites not met', () => {
    it('does not attempt Soroban call when prerequisites are missing', async () => {
      const { ForbiddenException } = await import('@nestjs/common');

      enrollmentRepo.findOne.mockResolvedValueOnce(null);
      prereqService.enforcePrerequisites.mockRejectedValueOnce(
        new ForbiddenException('Prerequisites not completed'),
      );

      await expect(service.enroll(USER_ID, COURSE_ID)).rejects.toThrow('Prerequisites');

      expect(stellarService.recordEnrollment).not.toHaveBeenCalled();
      expect(enrollmentRepo.save).not.toHaveBeenCalled();
    });
  });
});
