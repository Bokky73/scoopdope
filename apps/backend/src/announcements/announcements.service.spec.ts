import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { Announcement } from './announcement.entity';
import { Course } from '../courses/course.entity';
import { User } from '../users/user.entity';
import { Enrollment } from '../enrollments/enrollment.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { AnnouncementSortBy } from './dto/announcement-query.dto';

describe('AnnouncementsService', () => {
  let service: AnnouncementsService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockAnnouncementRepo: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockCourseRepo: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockUserRepo: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockEnrollmentRepo: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockNotificationsService: any;

  const mockInstructor: User = {
    id: 'instructor-1',
    email: 'instructor@example.com',
    username: 'instructor',
    avatar: null,
    bio: null,
    stellarPublicKey: null,
    role: 'instructor',
    isBanned: false,
    isVerified: true,
    deletedAt: null,
    verificationToken: null,
    verificationTokenExpiresAt: null,
    mfaEnabled: false,
    mfaSecret: null,
    mfaBackupCodes: null,
    referralCode: 'REF123',
    referredBy: null,
    currentStreak: 0,
    longestStreak: 0,
    lastActivityAt: null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subscriptionTier: 'free' as any,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    subscriptionExpiresAt: null,
    notificationPreferences: {
      courseUpdates: true,
      liveSessions: true,
      tokenRewards: true,
      pushEnabled: false,
    },
    createdAt: new Date(),
    passwordHash: 'hash',
  };

  const mockCourse: Course = {
    id: 'course-1',
    title: 'Stellar Basics',
    description: 'Learn Stellar',
    level: 'beginner',
    language: 'en',
    durationHours: 10,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    status: 'published' as any,
    isPublished: true,
    isDeleted: false,
    requiresKyc: false,
    instructorId: 'instructor-1',
    thumbnailUrl: null,
    priceUsd: null,
    skills: ['stellar', 'blockchain'],
    scheduledAt: null,
    publishedAt: new Date(),
    maxEnrollment: null,
    instructor: mockInstructor,
    modules: [],
    reviews: [],
    prerequisites: [],
    createdAt: new Date(),
  };

  const mockAnnouncement: Announcement = {
    id: 'announcement-1',
    courseId: 'course-1',
    instructorId: 'instructor-1',
    title: 'Module 3 Released',
    content: 'Module 3 is now available for all students',
    course: mockCourse,
    instructor: mockInstructor,
    createdAt: new Date('2024-01-15T10:00:00Z'),
  };

  beforeEach(async () => {
    mockAnnouncementRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    mockCourseRepo = {
      findOne: jest.fn(),
    };

    mockUserRepo = {
      findOne: jest.fn(),
    };

    mockEnrollmentRepo = {
      find: jest.fn(),
    };

    mockNotificationsService = {
      create: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnnouncementsService,
        {
          provide: getRepositoryToken(Announcement),
          useValue: mockAnnouncementRepo,
        },
        {
          provide: getRepositoryToken(Course),
          useValue: mockCourseRepo,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
        {
          provide: getRepositoryToken(Enrollment),
          useValue: mockEnrollmentRepo,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<AnnouncementsService>(AnnouncementsService);
  });

  describe('create', () => {
    it('should create an announcement when instructor is the course owner', async () => {
      const dto = {
        title: 'Module 3 Released',
        content: 'Module 3 is now available for all students',
      };

      mockCourseRepo.findOne.mockResolvedValue(mockCourse);
      mockAnnouncementRepo.create.mockReturnValue(mockAnnouncement);
      mockAnnouncementRepo.save.mockResolvedValue(mockAnnouncement);
      mockUserRepo.findOne.mockResolvedValue(mockInstructor);
      mockEnrollmentRepo.find.mockResolvedValue([]);

      const result = await service.create('instructor-1', 'course-1', dto);

      expect(result).toEqual({ ...mockAnnouncement, instructor: mockInstructor });
      expect(mockCourseRepo.findOne).toHaveBeenCalledWith({ where: { id: 'course-1' } });
      expect(mockAnnouncementRepo.create).toHaveBeenCalledWith({
        courseId: 'course-1',
        instructorId: 'instructor-1',
        title: dto.title,
        content: dto.content,
      });
    });

    it('should throw ForbiddenException when user is not course instructor', async () => {
      const dto = {
        title: 'Module 3 Released',
        content: 'Module 3 is now available for all students',
      };

      mockCourseRepo.findOne.mockResolvedValue(mockCourse);

      await expect(service.create('other-user', 'course-1', dto)).rejects.toThrow(
        ForbiddenException
      );
    });

    it('should throw NotFoundException when course does not exist', async () => {
      const dto = {
        title: 'Module 3 Released',
        content: 'Module 3 is now available for all students',
      };

      mockCourseRepo.findOne.mockResolvedValue(null);

      await expect(service.create('instructor-1', 'invalid-course', dto)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('findByCourse', () => {
    it('should return paginated announcements sorted by newest first', async () => {
      const query = { page: 1, limit: 10, sortBy: AnnouncementSortBy.NEWEST };

      mockCourseRepo.findOne.mockResolvedValue(mockCourse);
      mockAnnouncementRepo.findAndCount.mockResolvedValue([[mockAnnouncement], 1]);

      const result = await service.findByCourse('course-1', query);

      expect(result).toEqual({
        data: [mockAnnouncement],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(mockAnnouncementRepo.findAndCount).toHaveBeenCalledWith({
        where: { courseId: 'course-1' },
        relations: ['instructor'],
        select: {
          id: true,
          courseId: true,
          instructorId: true,
          title: true,
          content: true,
          createdAt: true,
          instructor: {
            id: true,
            email: true,
            username: true,
            avatar: true,
          },
        },
        order: { createdAt: 'DESC' },
        take: 10,
        skip: 0,
      });
    });

    it('should return announcements sorted by oldest first', async () => {
      const query = { page: 1, limit: 10, sortBy: AnnouncementSortBy.OLDEST };

      mockCourseRepo.findOne.mockResolvedValue(mockCourse);
      mockAnnouncementRepo.findAndCount.mockResolvedValue([[mockAnnouncement], 1]);

      await service.findByCourse('course-1', query);

      const callArgs = mockAnnouncementRepo.findAndCount.mock.calls[0][0];
      expect(callArgs.order).toEqual({ createdAt: 'ASC' });
    });

    it('should handle pagination correctly', async () => {
      const query = { page: 2, limit: 5, sortBy: AnnouncementSortBy.NEWEST };

      mockCourseRepo.findOne.mockResolvedValue(mockCourse);
      mockAnnouncementRepo.findAndCount.mockResolvedValue([[mockAnnouncement], 10]);

      const result = await service.findByCourse('course-1', query);

      expect(result.totalPages).toBe(2);
      const callArgs = mockAnnouncementRepo.findAndCount.mock.calls[0][0];
      expect(callArgs.skip).toBe(5); // (2-1) * 5
      expect(callArgs.take).toBe(5);
    });

    it('should throw NotFoundException when course does not exist', async () => {
      const query = { page: 1, limit: 10 };

      mockCourseRepo.findOne.mockResolvedValue(null);

      await expect(service.findByCourse('invalid-course', query)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('findLatest', () => {
    it('should return latest announcements limited to 5 by default', async () => {
      mockCourseRepo.findOne.mockResolvedValue(mockCourse);
      mockAnnouncementRepo.find.mockResolvedValue([mockAnnouncement]);

      const result = await service.findLatest('course-1');

      expect(result).toEqual([mockAnnouncement]);
      const callArgs = mockAnnouncementRepo.find.mock.calls[0][0];
      expect(callArgs.take).toBe(5);
      expect(callArgs.order).toEqual({ createdAt: 'DESC' });
    });

    it('should accept custom limit', async () => {
      mockCourseRepo.findOne.mockResolvedValue(mockCourse);
      mockAnnouncementRepo.find.mockResolvedValue([mockAnnouncement]);

      await service.findLatest('course-1', 3);

      const callArgs = mockAnnouncementRepo.find.mock.calls[0][0];
      expect(callArgs.take).toBe(3);
    });
  });

  describe('findOne', () => {
    it('should return a single announcement', async () => {
      mockAnnouncementRepo.findOne.mockResolvedValue(mockAnnouncement);

      const result = await service.findOne('announcement-1');

      expect(result).toEqual(mockAnnouncement);
    });

    it('should throw NotFoundException when announcement does not exist', async () => {
      mockAnnouncementRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete announcement when user is the owner', async () => {
      mockAnnouncementRepo.findOne.mockResolvedValue(mockAnnouncement);
      mockAnnouncementRepo.remove.mockResolvedValue(mockAnnouncement);

      await service.remove('announcement-1', 'instructor-1');

      expect(mockAnnouncementRepo.remove).toHaveBeenCalledWith(mockAnnouncement);
    });

    it('should throw NotFoundException when announcement does not exist', async () => {
      mockAnnouncementRepo.findOne.mockResolvedValue(null);

      await expect(service.remove('invalid-id', 'instructor-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not the announcement owner', async () => {
      mockAnnouncementRepo.findOne.mockResolvedValue(mockAnnouncement);

      await expect(service.remove('announcement-1', 'other-user')).rejects.toThrow(
        ForbiddenException
      );
    });
  });
});
