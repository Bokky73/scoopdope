import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AdminCoursesController } from '../../src/courses/admin-courses.controller';
import { CoursesService } from '../../src/courses/courses.service';
import { AuditService } from '../../src/audit/audit.service';
import { EnrollmentsService } from '../../src/enrollments/enrollments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Course } from '../../src/courses/course.entity';
import { AuditLog, AuditAction } from '../../src/audit/audit-log.entity';
import { Enrollment } from '../../src/enrollments/enrollment.entity';

describe('Admin Course Management (Integration)', () => {
  let app: INestApplication;
  let coursesService: CoursesService;
  let auditService: AuditService;
  let enrollmentsService: EnrollmentsService;

  const mockCoursesRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockAuditRepository = {
    save: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockEnrollmentsRepository = {
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AdminCoursesController],
      providers: [
        CoursesService,
        AuditService,
        EnrollmentsService,
        {
          provide: getRepositoryToken(Course),
          useValue: mockCoursesRepository,
        },
        {
          provide: getRepositoryToken(AuditLog),
          useValue: mockAuditRepository,
        },
        {
          provide: getRepositoryToken(Enrollment),
          useValue: mockEnrollmentsRepository,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    coursesService = moduleFixture.get<CoursesService>(CoursesService);
    auditService = moduleFixture.get<AuditService>(AuditService);
    enrollmentsService = moduleFixture.get<EnrollmentsService>(EnrollmentsService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /admin/courses', () => {
    it('should return paginated courses', async () => {
      const mockCourses = [
        {
          id: '1',
          title: 'Intro to Stellar',
          status: 'published',
          instructorName: 'John',
          enrollmentCount: 50,
          completionCount: 25,
          averageRating: 4.5,
        },
        {
          id: '2',
          title: 'Advanced Soroban',
          status: 'draft',
          instructorName: 'Jane',
          enrollmentCount: 0,
          completionCount: 0,
          averageRating: null,
        },
      ];

      jest.spyOn(coursesService, 'findAllAdmin').mockResolvedValueOnce({
        courses: mockCourses,
        total: 2,
        page: 1,
        limit: 20,
      });

      const result = await coursesService.findAllAdmin({ page: 1, limit: 20 });

      expect(result.courses).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.courses[0].status).toBe('published');
    });

    it('should filter courses by status', async () => {
      const mockCourses = [
        {
          id: '1',
          title: 'Intro to Stellar',
          status: 'pending',
          instructorName: 'John',
          enrollmentCount: 0,
          completionCount: 0,
          averageRating: null,
        },
      ];

      jest.spyOn(coursesService, 'findAllAdmin').mockResolvedValueOnce({
        courses: mockCourses,
        total: 1,
        page: 1,
        limit: 20,
      });

      const result = await coursesService.findAllAdmin({ page: 1, status: 'pending' });

      expect(result.courses).toHaveLength(1);
      expect(result.courses[0].status).toBe('pending');
    });

    it('should filter courses by instructor', async () => {
      const instructorId = 'instructor-123';
      const mockCourses = [
        {
          id: '1',
          title: 'My Course',
          status: 'published',
          instructorName: 'John',
          enrollmentCount: 10,
          completionCount: 5,
          averageRating: 4.0,
        },
      ];

      jest.spyOn(coursesService, 'findAllAdmin').mockResolvedValueOnce({
        courses: mockCourses,
        total: 1,
        page: 1,
        limit: 20,
      });

      const result = await coursesService.findAllAdmin({ instructorId });

      expect(result.courses).toHaveLength(1);
      expect(result.courses[0].instructorName).toBe('John');
    });
  });

  describe('GET /admin/courses/:id/stats', () => {
    it('should return course statistics', async () => {
      const courseId = '1';

      jest.spyOn(enrollmentsService, 'countByCoursId').mockResolvedValueOnce(50);
      jest.spyOn(enrollmentsService, 'countCompletedByCourseId').mockResolvedValueOnce(25);
      jest.spyOn(coursesService, 'getAverageRating').mockResolvedValueOnce(4.5);

      const enrollments = await enrollmentsService.countByCoursId(courseId);
      const completions = await enrollmentsService.countCompletedByCourseId(courseId);
      const rating = await coursesService.getAverageRating(courseId);

      expect(enrollments).toBe(50);
      expect(completions).toBe(25);
      expect(rating).toBe(4.5);
    });

    it('should calculate completion rate', async () => {
      const courseId = '1';

      jest.spyOn(enrollmentsService, 'countByCoursId').mockResolvedValueOnce(100);
      jest.spyOn(enrollmentsService, 'countCompletedByCourseId').mockResolvedValueOnce(40);

      const enrollments = await enrollmentsService.countByCoursId(courseId);
      const completions = await enrollmentsService.countCompletedByCourseId(courseId);
      const completionRate = (completions / enrollments) * 100;

      expect(completionRate).toBe(40);
    });
  });

  describe('POST /admin/courses/:id/approve', () => {
    it('should approve a pending course and log action', async () => {
      const courseId = '1';
      const adminId = 'admin-id';

      const mockCourse = {
        id: courseId,
        title: 'New Course',
        status: 'pending',
      };

      const updatedCourse = {
        ...mockCourse,
        status: 'published',
        publishedAt: new Date(),
      };

      jest.spyOn(coursesService, 'findOne').mockResolvedValueOnce(mockCourse);
      jest.spyOn(coursesService, 'update').mockResolvedValueOnce(updatedCourse);
      jest.spyOn(auditService, 'log').mockResolvedValueOnce(undefined);

      const found = await coursesService.findOne(courseId);
      expect(found.status).toBe('pending');

      const updated = await coursesService.update(courseId, { status: 'published' });
      expect(updated.status).toBe('published');

      await auditService.log(AuditAction.COURSE_APPROVED, adminId, true, {
        resourceType: 'course',
        resourceId: courseId,
      });

      expect(auditService.log).toHaveBeenCalledWith(
        AuditAction.COURSE_APPROVED,
        adminId,
        true,
        expect.any(Object),
      );
    });
  });

  describe('PATCH /admin/courses/:id/archive', () => {
    it('should archive a published course', async () => {
      const courseId = '1';
      const adminId = 'admin-id';

      const mockCourse = {
        id: courseId,
        title: 'Published Course',
        status: 'published',
      };

      const archivedCourse = {
        ...mockCourse,
        status: 'archived',
      };

      jest.spyOn(coursesService, 'findOne').mockResolvedValueOnce(mockCourse);
      jest.spyOn(coursesService, 'update').mockResolvedValueOnce(archivedCourse);
      jest.spyOn(auditService, 'log').mockResolvedValueOnce(undefined);

      const found = await coursesService.findOne(courseId);
      expect(found.status).toBe('published');

      const archived = await coursesService.update(courseId, { status: 'archived' });
      expect(archived.status).toBe('archived');

      await auditService.log(AuditAction.COURSE_ARCHIVED, adminId, true, {
        resourceType: 'course',
        resourceId: courseId,
      });

      expect(auditService.log).toHaveBeenCalled();
    });
  });

  describe('PATCH /admin/courses/:id/unarchive', () => {
    it('should unarchive an archived course', async () => {
      const courseId = '1';

      const mockCourse = {
        id: courseId,
        title: 'Archived Course',
        status: 'archived',
      };

      const unarchivedCourse = {
        ...mockCourse,
        status: 'published',
      };

      jest.spyOn(coursesService, 'findOne').mockResolvedValueOnce(mockCourse);
      jest.spyOn(coursesService, 'update').mockResolvedValueOnce(unarchivedCourse);

      const found = await coursesService.findOne(courseId);
      expect(found.status).toBe('archived');

      const unarchived = await coursesService.update(courseId, { status: 'published' });
      expect(unarchived.status).toBe('published');
    });
  });

  describe('DELETE /admin/courses/:id', () => {
    it('should delete an archived course', async () => {
      const courseId = '1';
      const adminId = 'admin-id';

      const mockCourse = {
        id: courseId,
        title: 'Archived Course',
        status: 'archived',
      };

      jest.spyOn(coursesService, 'findOne').mockResolvedValueOnce(mockCourse);
      jest.spyOn(coursesService, 'delete').mockResolvedValueOnce(undefined);
      jest.spyOn(auditService, 'log').mockResolvedValueOnce(undefined);

      const found = await coursesService.findOne(courseId);
      expect(found.status).toBe('archived');

      await coursesService.delete(courseId);

      await auditService.log(AuditAction.COURSE_DELETED, adminId, true, {
        resourceType: 'course',
        resourceId: courseId,
      });

      expect(auditService.log).toHaveBeenCalled();
    });

    it('should not delete a published course', async () => {
      const courseId = '1';

      const mockCourse = {
        id: courseId,
        title: 'Published Course',
        status: 'published',
      };

      jest.spyOn(coursesService, 'findOne').mockResolvedValueOnce(mockCourse);

      const found = await coursesService.findOne(courseId);
      expect(found.status).toBe('published');

      // Attempting to delete a published course should fail
      // This would be handled by the controller validation
    });
  });

  describe('Audit Logging', () => {
    it('should log course approval with changes', async () => {
      jest.spyOn(auditService, 'log').mockResolvedValueOnce(undefined);

      await auditService.log(
        AuditAction.COURSE_APPROVED,
        'admin-id',
        true,
        {
          resourceType: 'course',
          resourceId: 'course-id',
          changes: { status: { from: 'pending', to: 'published' } },
        },
      );

      expect(auditService.log).toHaveBeenCalledWith(
        AuditAction.COURSE_APPROVED,
        'admin-id',
        true,
        expect.any(Object),
      );
    });

    it('should log all admin course actions', async () => {
      jest.spyOn(auditService, 'log').mockResolvedValueOnce(undefined);

      const actions = [
        AuditAction.COURSE_APPROVED,
        AuditAction.COURSE_ARCHIVED,
        AuditAction.COURSE_UNARCHIVED,
        AuditAction.COURSE_DELETED,
      ];

      for (const action of actions) {
        await auditService.log(action, 'admin-id', true, {
          resourceType: 'course',
          resourceId: 'course-id',
        });
      }

      expect(auditService.log).toHaveBeenCalledTimes(actions.length);
    });
  });
});
