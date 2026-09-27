import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { DataSource } from 'typeorm';
import { CoursesService } from './courses.service';
import { Course, CourseStatus } from './course.entity';
import { SearchService } from '../search/search.service';
import { setupTestDatabase, teardownTestDatabase } from '../test/integration-test.setup';

describe('CoursesService (Integration)', () => {
  let service: CoursesService;
  let module: TestingModule;
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await setupTestDatabase();

    module = await Test.createTestingModule({
      imports: [TypeOrmModule.forFeature([Course]), CacheModule.register()],
      providers: [
        CoursesService,
        {
          provide: SearchService,
          useValue: {
            indexCourse: jest.fn(),
            deleteFromIndex: jest.fn(),
          },
        },
      ],
    })
      .overrideProvider('DataSource')
      .useValue(dataSource)
      .compile();

    service = module.get<CoursesService>(CoursesService);
  });

  afterAll(async () => {
    await module.close();
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    const repo = dataSource.getRepository(Course);
    await repo.clear();
  });

  describe('create', () => {
    it('should create a course', async () => {
      const courseData = {
        title: 'Blockchain Basics',
        description: 'Learn blockchain fundamentals',
        level: 'beginner',
        isPublished: true,
      };

      const course = await service.create(courseData);

      expect(course).toBeDefined();
      expect(course.title).toBe(courseData.title);
      expect(course.description).toBe(courseData.description);
    });
  });

  describe('findAll', () => {
    it('should return published courses', async () => {
      await service.create({
        title: 'Course 1',
        description: 'Desc 1',
        level: 'beginner',
        isPublished: true,
        status: CourseStatus.PUBLISHED,
      });

      await service.create({
        title: 'Course 2',
        description: 'Desc 2',
        level: 'intermediate',
        isPublished: false,
        status: CourseStatus.DRAFT,
      });

      const result = await service.findAll();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe('Course 1');
      expect(result.total).toBe(1);
    });

    it('should filter by search term', async () => {
      await service.create({
        title: 'Stellar Blockchain',
        description: 'Learn Stellar',
        level: 'beginner',
        isPublished: true,
        status: CourseStatus.PUBLISHED,
      });

      await service.create({
        title: 'Solana Blockchain',
        description: 'Learn Solana',
        level: 'beginner',
        isPublished: true,
        status: CourseStatus.PUBLISHED,
      });

      const result = await service.findAll({ search: 'Stellar' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toContain('Stellar');
    });

    it('should filter by level', async () => {
      await service.create({
        title: 'Beginner Course',
        description: 'Desc',
        level: 'beginner',
        isPublished: true,
        status: CourseStatus.PUBLISHED,
      });

      await service.create({
        title: 'Advanced Course',
        description: 'Desc',
        level: 'advanced',
        isPublished: true,
        status: CourseStatus.PUBLISHED,
      });

      const result = await service.findAll({ level: 'beginner' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].level).toBe('beginner');
    });
  });

  describe('findOne', () => {
    it('should return a course by id', async () => {
      const created = await service.create({
        title: 'Test Course',
        description: 'Test',
        level: 'beginner',
        isPublished: true,
      });

      const found = await service.findOne(created.id);

      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.title).toBe('Test Course');
    });

    it('should throw NotFoundException for non-existent course', async () => {
      await expect(service.findOne('non-existent-id')).rejects.toThrow('Course not found');
    });
  });

  describe('update', () => {
    it('should update a course', async () => {
      const created = await service.create({
        title: 'Original Title',
        description: 'Original Desc',
        level: 'beginner',
        isPublished: true,
      });

      const updated = await service.update(created.id, {
        title: 'Updated Title',
      });

      expect(updated.title).toBe('Updated Title');
      expect(updated.description).toBe('Original Desc');
    });
  });

  describe('publishNow', () => {
    it('should set publishedAt when publishing a course', async () => {
      const created = await service.create({
        title: 'To Publish',
        description: 'Desc',
        level: 'beginner',
        isPublished: false,
        status: CourseStatus.DRAFT,
      });

      const published = await service.publishNow(created.id);

      expect(published.status).toBe(CourseStatus.PUBLISHED);
      expect(published.isPublished).toBe(true);
      expect(published.publishedAt).toBeDefined();
      expect(published.publishedAt).toBeInstanceOf(Date);
    });
  });

  describe('delete', () => {
    it('should delete a course', async () => {
      const created = await service.create({
        title: 'To Delete',
        description: 'Desc',
        level: 'beginner',
        isPublished: true,
      });

      await service.delete(created.id);

      await expect(service.findOne(created.id)).rejects.toThrow('Course not found');
    });
  });
});
