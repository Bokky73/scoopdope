import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Course, CourseStatus } from './course.entity';

describe('CoursesService', () => {
  let repo: any;
  let cacheManager: any;
  let searchService: any;
  let metricsService: any;
  let service: CoursesService;

  const baseCourse = (): Course =>
    ({
      id: 'c1',
      title: 'Intro to Stellar',
      description: 'A thorough introduction to the Stellar network',
      instructorId: 'instr-1',
      status: CourseStatus.DRAFT,
      isPublished: false,
      isDeleted: false,
      modules: [{ id: 'm1' }],
    }) as unknown as Course;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = {
      findOne: jest.fn(),
      save: jest.fn().mockImplementation((c) => Promise.resolve(c)),
      create: jest.fn((d) => d),
      remove: jest.fn(),
    };
    cacheManager = { get: jest.fn(), set: jest.fn(), del: jest.fn(), reset: jest.fn() };
    searchService = { indexCourse: jest.fn().mockResolvedValue(undefined), deleteFromIndex: jest.fn().mockResolvedValue(undefined) };
    metricsService = { incrementCacheHit: jest.fn(), incrementCacheMiss: jest.fn() };
    service = new CoursesService(repo, cacheManager, searchService, metricsService);
  });

  describe('findOneForViewer', () => {
    it('returns a published course to anyone', async () => {
      const course = { ...baseCourse(), status: CourseStatus.PUBLISHED };
      repo.findOne.mockResolvedValue(course);

      await expect(service.findOneForViewer('c1')).resolves.toBe(course);
    });

    it('hides a draft course from an unrelated viewer', async () => {
      repo.findOne.mockResolvedValue(baseCourse());

      await expect(
        service.findOneForViewer('c1', { id: 'someone-else', role: 'student' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('shows a draft course to its creator', async () => {
      const course = baseCourse();
      repo.findOne.mockResolvedValue(course);

      await expect(
        service.findOneForViewer('c1', { id: 'instr-1', role: 'instructor' }),
      ).resolves.toBe(course);
    });

    it('shows a draft course to an admin', async () => {
      const course = baseCourse();
      repo.findOne.mockResolvedValue(course);

      await expect(
        service.findOneForViewer('c1', { id: 'admin-9', role: 'admin' }),
      ).resolves.toBe(course);
    });
  });

  describe('submitForReview', () => {
    it('moves a valid draft to PENDING_REVIEW', async () => {
      repo.findOne.mockResolvedValue(baseCourse());

      const result = await service.submitForReview('c1', { id: 'instr-1', role: 'instructor' });

      expect(result.status).toBe(CourseStatus.PENDING_REVIEW);
      expect(repo.save).toHaveBeenCalled();
    });

    it('rejects a non-owner instructor', async () => {
      repo.findOne.mockResolvedValue(baseCourse());

      await expect(
        service.submitForReview('c1', { id: 'other-instr', role: 'instructor' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejects a course that is not a draft', async () => {
      repo.findOne.mockResolvedValue({ ...baseCourse(), status: CourseStatus.PUBLISHED });

      await expect(
        service.submitForReview('c1', { id: 'instr-1', role: 'instructor' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects a course missing modules', async () => {
      repo.findOne.mockResolvedValue({ ...baseCourse(), modules: [] });

      await expect(
        service.submitForReview('c1', { id: 'instr-1', role: 'instructor' }),
      ).rejects.toThrow(/missing required content/);
    });

    it('throws NotFound when the course does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(
        service.submitForReview('nope', { id: 'instr-1', role: 'instructor' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('approveCourse', () => {
    it('publishes a course that is pending review', async () => {
      repo.findOne.mockResolvedValue({ ...baseCourse(), status: CourseStatus.PENDING_REVIEW });

      const result = await service.approveCourse('c1');

      expect(result.status).toBe(CourseStatus.PUBLISHED);
      expect(result.isPublished).toBe(true);
      expect(result.publishedAt).toBeInstanceOf(Date);
      expect(searchService.indexCourse).toHaveBeenCalled();
    });

    it('rejects a course that is not pending review', async () => {
      repo.findOne.mockResolvedValue({ ...baseCourse(), status: CourseStatus.DRAFT });

      await expect(service.approveCourse('c1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('archiveCourse', () => {
    it('archives a published course for its owner', async () => {
      repo.findOne.mockResolvedValue({ ...baseCourse(), status: CourseStatus.PUBLISHED, isPublished: true });

      const result = await service.archiveCourse('c1', { id: 'instr-1', role: 'instructor' });

      expect(result.status).toBe(CourseStatus.ARCHIVED);
      expect(result.isPublished).toBe(false);
    });

    it('rejects a non-owner', async () => {
      repo.findOne.mockResolvedValue({ ...baseCourse(), status: CourseStatus.PUBLISHED });

      await expect(
        service.archiveCourse('c1', { id: 'stranger', role: 'instructor' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejects a course that is not published', async () => {
      repo.findOne.mockResolvedValue(baseCourse());

      await expect(
        service.archiveCourse('c1', { id: 'instr-1', role: 'instructor' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
