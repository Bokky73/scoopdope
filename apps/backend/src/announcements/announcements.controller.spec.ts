import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsService } from './announcements.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { AnnouncementSortBy } from './dto/announcement-query.dto';

describe('AnnouncementsController', () => {
  let controller: AnnouncementsController;
  let service: AnnouncementsService;

  const mockAnnouncement = {
    id: 'announcement-1',
    courseId: 'course-1',
    instructorId: 'instructor-1',
    title: 'Module 3 Released',
    content: 'Module 3 is now available for all students',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    instructor: {
      id: 'instructor-1',
      email: 'instructor@example.com',
      username: 'instructor',
      avatar: null,
    },
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findByCourse: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnnouncementsController],
      providers: [
        {
          provide: AnnouncementsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AnnouncementsController>(AnnouncementsController);
    service = module.get<AnnouncementsService>(AnnouncementsService);
  });

  describe('create', () => {
    it('should create an announcement', async () => {
      const dto = {
        title: 'Module 3 Released',
        content: 'Module 3 is now available for all students',
      };

      const req = { user: { id: 'instructor-1' } };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(service, 'create').mockResolvedValue(mockAnnouncement as any);

      const result = await controller.create(req, 'course-1', dto);

      expect(result).toEqual(mockAnnouncement);
      expect(service.create).toHaveBeenCalledWith('instructor-1', 'course-1', dto);
    });

    it('should return 403 when user is not the instructor', async () => {
      const dto = {
        title: 'Module 3 Released',
        content: 'Module 3 is now available for all students',
      };

      const req = { user: { id: 'student-1' } };

      jest.spyOn(service, 'create').mockRejectedValue(new ForbiddenException());

      await expect(controller.create(req, 'course-1', dto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('list', () => {
    it('should return paginated announcements', async () => {
      const expectedResponse = {
        data: [mockAnnouncement],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      const query = { page: 1, limit: 10, sortBy: AnnouncementSortBy.NEWEST };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(service, 'findByCourse').mockResolvedValue(expectedResponse as any);

      const result = await controller.list('course-1', query);

      expect(result).toEqual(expectedResponse);
      expect(service.findByCourse).toHaveBeenCalledWith('course-1', query);
    });

    it('should use default pagination values', async () => {
      const expectedResponse = {
        data: [mockAnnouncement],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(service, 'findByCourse').mockResolvedValue(expectedResponse as any);

      const result = await controller.list('course-1', {});

      expect(result).toEqual(expectedResponse);
      expect(service.findByCourse).toHaveBeenCalled();
    });

    it('should return 404 when course does not exist', async () => {
      jest.spyOn(service, 'findByCourse').mockRejectedValue(new NotFoundException());

      await expect(controller.list('invalid-course', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return a single announcement', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(service, 'findOne').mockResolvedValue(mockAnnouncement as any);

      const result = await controller.findOne('announcement-1');

      expect(result).toEqual(mockAnnouncement);
      expect(service.findOne).toHaveBeenCalledWith('announcement-1');
    });

    it('should return 404 when announcement does not exist', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete an announcement', async () => {
      const req = { user: { id: 'instructor-1' } };

      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      await controller.remove(req, 'announcement-1');

      expect(service.remove).toHaveBeenCalledWith('announcement-1', 'instructor-1');
    });

    it('should return 403 when user is not the announcement owner', async () => {
      const req = { user: { id: 'other-user' } };

      jest.spyOn(service, 'remove').mockRejectedValue(new ForbiddenException());

      await expect(controller.remove(req, 'announcement-1')).rejects.toThrow(ForbiddenException);
    });

    it('should return 404 when announcement does not exist', async () => {
      const req = { user: { id: 'instructor-1' } };

      jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException());

      await expect(controller.remove(req, 'invalid-id')).rejects.toThrow(NotFoundException);
    });
  });
});
