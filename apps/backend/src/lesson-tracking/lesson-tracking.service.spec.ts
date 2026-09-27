import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LessonTrackingService } from '../lesson-tracking.service';
import { StudySession } from '../study-session.entity';
import { LessonTimeStat } from '../lesson-time-stat.entity';
import { Lesson } from '../../courses/lesson.entity';

describe('LessonTrackingService', () => {
  let service: LessonTrackingService;
  let mockSessionRepo: any;
  let mockStatsRepo: any;
  let mockLessonRepo: any;

  beforeEach(async () => {
    mockSessionRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(),
      update: jest.fn(),
    };

    mockStatsRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    mockLessonRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonTrackingService,
        {
          provide: getRepositoryToken(StudySession),
          useValue: mockSessionRepo,
        },
        {
          provide: getRepositoryToken(LessonTimeStat),
          useValue: mockStatsRepo,
        },
        {
          provide: getRepositoryToken(Lesson),
          useValue: mockLessonRepo,
        },
      ],
    }).compile();

    service = module.get<LessonTrackingService>(LessonTrackingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startSession', () => {
    it('should create a study session', async () => {
      const userId = 'user-1';
      const lessonId = 'lesson-1';
      const courseId = 'course-1';

      const mockSession = {
        id: 'session-1',
        userId,
        lessonId,
        courseId,
        startedAt: new Date(),
        isActive: true,
        durationSeconds: 0,
      };

      mockSessionRepo.create.mockReturnValue(mockSession);
      mockSessionRepo.save.mockResolvedValue(mockSession);
      mockSessionRepo.update.mockResolvedValue({ affected: 0 });

      const result = await service.startSession(userId, lessonId, courseId);

      expect(result).toEqual(mockSession);
      expect(mockSessionRepo.create).toHaveBeenCalled();
      expect(mockSessionRepo.save).toHaveBeenCalled();
    });
  });

  describe('endSession', () => {
    it('should end a session and calculate duration', async () => {
      const sessionId = 'session-1';
      const startedAt = new Date(Date.now() - 600000); // 10 minutes ago

      const mockSession = {
        id: sessionId,
        userId: 'user-1',
        lessonId: 'lesson-1',
        courseId: 'course-1',
        startedAt,
        endedAt: null,
        durationSeconds: 0,
        isActive: true,
      };

      mockSessionRepo.findOne.mockResolvedValue(mockSession);
      mockSessionRepo.save.mockImplementation((session) => Promise.resolve(session));
      mockStatsRepo.findOne.mockResolvedValue(null);
      mockStatsRepo.create.mockReturnValue({});
      mockStatsRepo.save.mockResolvedValue({});
      mockLessonRepo.findOne.mockResolvedValue({ id: 'lesson-1' });

      const result = await service.endSession(sessionId);

      expect(result.isActive).toBe(false);
      expect(result.durationSeconds).toBeGreaterThan(0);
    });
  });

  describe('getTotalTimeForLesson', () => {
    it('should calculate total time for a lesson', async () => {
      const userId = 'user-1';
      const lessonId = 'lesson-1';

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ totalSeconds: '3600' }),
      };

      mockSessionRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getTotalTimeForLesson(userId, lessonId);

      expect(result).toBe(3600);
    });

    it('should return 0 if no sessions', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(null),
      };

      mockSessionRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getTotalTimeForLesson('user-1', 'lesson-1');

      expect(result).toBe(0);
    });
  });

  describe('getDifficultyReport', () => {
    it('should generate a difficulty report for a course', async () => {
      const courseId = 'course-1';
      const mockStats = [
        {
          lessonId: 'lesson-1',
          courseId,
          averageTimeSeconds: 2400,
          studentCount: 10,
          isDifficult: true,
          lesson: { title: 'Hard Lesson' },
        },
        {
          lessonId: 'lesson-2',
          courseId,
          averageTimeSeconds: 600,
          studentCount: 10,
          isDifficult: false,
          lesson: { title: 'Easy Lesson' },
        },
      ];

      mockStatsRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      });

      mockStatsRepo.find.mockResolvedValue(mockStats);

      const mockDifficultQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockStats[0]]),
      };

      mockStatsRepo.createQueryBuilder.mockReturnValue(mockDifficultQueryBuilder);

      const result = await service.getDifficultyReport(courseId);

      expect(result.courseId).toBe(courseId);
      expect(result.difficultLessons).toBeDefined();
      expect(result.overallMedianTimeSeconds).toBeDefined();
    });
  });
});
