import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Course, CourseStatus } from './course.entity';
import { CourseQueryDto } from './dto/course-query.dto';
import { SearchService } from '../search/search.service';
import { MetricsService } from '../metrics/metrics.service';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);
  private readonly CACHE_KEY = 'courses:all';
  /** 5-minute TTL in milliseconds */
  private readonly CACHE_TTL = 300_000;

  constructor(
    @InjectRepository(Course) private repo: Repository<Course>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache = {} as Cache,
    private readonly searchService: SearchService = {} as SearchService,
    private readonly metricsService: MetricsService = {} as MetricsService
  ) {}

  /**
   * Get average rating for a course from reviews
   */
  async getAverageRating(courseId: string): Promise<number | null> {
    const course = await this.repo
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.reviews', 'review')
      .where('course.id = :courseId', { courseId })
      .getOne();

    if (!course || !course.reviews || course.reviews.length === 0) {
      return null;
    }

    const sum = course.reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return parseFloat((sum / course.reviews.length).toFixed(2));
  }

  async findAll(query: CourseQueryDto = {}) {
    const { search, level, category, language, page = 1, limit = 20 } = query;

    // Cache key encodes all filter params; skip cache for search queries
    const tagsKey = tags?.length ? tags.sort().join(',') : '';
    const cacheKey = !search
      ? `courses:catalog:${level ?? ''}:${category ?? ''}:${language ?? ''}:${page}:${limit}`
      : null;

    if (cacheKey) {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        this.metricsService.incrementCacheHit('courses');
        return cached;
      }
      this.metricsService.incrementCacheMiss('courses');
    }

    // Only PUBLISHED courses are visible in the public catalogue. Draft,
    // pending-review, scheduled and archived courses are excluded here.
    const qb = this.repo
      .createQueryBuilder('course')
      .where('course.status = :publishedStatus', { publishedStatus: CourseStatus.PUBLISHED })
      .andWhere('course.isDeleted = :isDeleted', { isDeleted: false });

    if (search) {
      qb.andWhere('(course.title ILIKE :search OR course.description ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (level) {
      qb.andWhere('course.level = :level', { level });
    }

    if (category) {
      qb.andWhere('course.category = :category', { category });
    }

    if (language) {
      qb.andWhere('course.language = :language', { language });
    }

    if (categoryId) {
      qb.andWhere('course.categoryId = :categoryId', { categoryId });
    } else if (category) {
      // Filter by slug when a full UUID is not provided
      qb.andWhere('category.slug = :categorySlug', { categorySlug: category });
    }

    const total = await qb.clone().getCount();
    const offset = (page - 1) * limit;

    // Always select the enrollment count subquery so we can sort by it when needed
    qb.leftJoin('course.reviews', 'review')
      .addSelect('COALESCE(AVG(review.rating), 0)', 'course_averageRating')
      .addSelect(
        '(SELECT COUNT(e.id) FROM enrollments e WHERE e."courseId" = course.id)',
        'enrollment_count',
      )
      .skip(offset)
      .take(limit)
      .orderBy('course.createdAt', 'DESC')
      .groupBy('course.id')
      .addGroupBy('category.id')
      .getRawAndEntities();

    const enrollmentCountMap = new Map(
      raw.map((item, index) => [entities[index].id, Number(item.enrollment_count) || 0]),
    );

    const data = entities.map((course) => ({
      ...course,
      averageRating: ratingMap.get(course.id) ?? 0,
      enrollmentCount: enrollmentCountMap.get(course.id) ?? 0,
    }));

    const result = { data, total, page, limit };

    if (cacheKey) {
      await this.cacheManager.set(cacheKey, result, this.CACHE_TTL);
    }

    return result;
  }

  async search(query: string, page = 1, limit = 20) {
    const normalized = query.trim();
    if (!normalized) return this.findAll({ page, limit });

    const prefixQuery = normalized
      .toLowerCase()
      .split(/\s+/)
      .map((term) => term.replace(/[^a-z0-9_]+/g, ''))
      .filter(Boolean)
      .map((term) => `${term}:*`)
      .join(' & ');
    if (!prefixQuery) return this.findAll({ page, limit });

    const contains = `%${normalized}%`;
    const qb = this.repo
      .createQueryBuilder('course')
      .where('course.isPublished = :isPublished', { isPublished: true })
      .andWhere('course.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere(
        "(to_tsvector('simple', concat_ws(' ', course.title, course.description)) @@ to_tsquery('simple', :prefixQuery) OR course.title ILIKE :contains OR course.description ILIKE :contains)",
        { prefixQuery, contains },
      );

    const total = await qb.clone().getCount();
    const { raw, entities } = await qb
      .leftJoin('course.reviews', 'review')
      .addSelect('COALESCE(AVG(review.rating), 0)', 'course_averageRating')
      .addSelect(
        "CASE WHEN course.title ILIKE :startsWith THEN 3 WHEN course.title ILIKE :contains THEN 2 WHEN course.description ILIKE :contains THEN 1 ELSE 0 END",
        'course_searchRank',
      )
      .setParameter('startsWith', `${normalized}%`)
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('course_searchRank', 'DESC')
      .addOrderBy('course.createdAt', 'DESC')
      .groupBy('course.id')
      .getRawAndEntities();

    const averageRatings = new Map(
      raw.map((item, index) => [entities[index].id, Number(item.course_averageRating) || 0]),
    );
    return {
      data: entities.map((course) => ({ ...course, averageRating: averageRatings.get(course.id) ?? 0 })),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.repo.findOne({
      where: { id, isDeleted: false },
      relations: [
        'prerequisites',
        'prerequisites.prerequisite',
        'modules',
        'modules.lessons',
        'instructor',
      ],
    });
    if (!course) throw new NotFoundException('Course not found');

    // Sort modules and lessons by order
    if (course.modules) {
      course.modules.sort((a, b) => a.order - b.order);
      course.modules.forEach((module) => {
        if (module.lessons) {
          module.lessons.sort((a, b) => a.order - b.order);
        }
      });
    }

    return course;
  }

  async create(data: Partial<Course>) {
    const course = await this.repo.save(this.repo.create(data));
    await this.invalidateCache();
    await this.searchService.indexCourse(course).catch(() => {});
    return course;
  }

  async update(id: string, data: Partial<Course>) {
    const course = await this.findOne(id);
    if (!course) throw new NotFoundException('Course not found');
    const updated = await this.repo.save({ ...course, ...data });
    await this.invalidateCache();
    await this.searchService.indexCourse(updated).catch(() => {});
    return updated;
  }

  async delete(id: string) {
    const course = await this.findOne(id);
    if (!course) throw new NotFoundException('Course not found');
    const removed = await this.repo.remove(course);
    await this.invalidateCache();
    await this.searchService.deleteFromIndex('courses', id).catch(() => {});
    return removed;
  }

  private async invalidateCache() {
    await this.cacheManager.del(this.CACHE_KEY);
    // Catalogue entries use dynamic keys, so clear the whole store. Different
    // cache-manager versions expose this as clear() or reset(); tolerate either
    // and treat failure as non-fatal (stale entries expire via TTL).
    const store = this.cacheManager as unknown as {
      clear?: () => Promise<unknown>;
      reset?: () => Promise<unknown>;
    };
    try {
      await (store.clear?.() ?? store.reset?.());
    } catch {
      /* non-fatal */
    }
  }

  async scheduleCourse(id: string, scheduledAt: Date): Promise<Course> {
    if (scheduledAt <= new Date()) {
      throw new BadRequestException('scheduledAt must be in the future');
    }
    const course = await this.findOne(id);
    return this.repo.save({
      ...course,
      status: CourseStatus.SCHEDULED,
      scheduledAt,
      isPublished: false,
    });
  }

  async publishNow(id: string): Promise<Course> {
    const course = await this.findOne(id);
    const now = new Date();

    course.status = CourseStatus.PUBLISHED;
    course.isPublished = true;
    course.publishedAt = now;
    course.scheduledAt = course.scheduledAt ?? null;

    return this.repo.save(course);
  }

  // ---------------------------------------------------------------------------
  // Publishing workflow: DRAFT -> PENDING_REVIEW -> PUBLISHED, plus ARCHIVED.
  // ---------------------------------------------------------------------------

  /**
   * Fetches a course for a specific viewer, enforcing visibility rules:
   * non-published courses are only visible to their creator or an admin.
   * Anyone else gets a 404 (existence is not disclosed).
   */
  async findOneForViewer(
    id: string,
    viewer?: { id?: string; role?: string },
  ): Promise<Course> {
    const course = await this.findOne(id);
    if (course.status === CourseStatus.PUBLISHED) return course;

    const isPrivileged =
      !!viewer &&
      (viewer.role === 'admin' ||
        (!!course.instructorId && course.instructorId === viewer.id));

    if (!isPrivileged) throw new NotFoundException('Course not found');
    return course;
  }

  /**
   * Instructor action: move a DRAFT course to PENDING_REVIEW so an admin can
   * approve it. Fails if the course is missing required content.
   */
  async submitForReview(id: string, actor: { id: string; role: string }): Promise<Course> {
    const course = await this.loadWithModules(id);

    if (actor.role !== 'admin' && course.instructorId !== actor.id) {
      throw new ForbiddenException('You can only submit your own courses for review');
    }
    if (course.status !== CourseStatus.DRAFT) {
      throw new BadRequestException(
        `Only draft courses can be submitted for review (current status: ${course.status})`,
      );
    }
    this.assertPublishable(course);

    course.status = CourseStatus.PENDING_REVIEW;
    const saved = await this.repo.save(course);
    await this.invalidateCache();
    this.logger.log(`Course ${id} submitted for review by ${actor.id}`);
    return saved;
  }

  /**
   * Admin action: approve a PENDING_REVIEW course, making it PUBLISHED and
   * visible in the public catalogue.
   */
  async approveCourse(id: string): Promise<Course> {
    const course = await this.loadWithModules(id);

    if (course.status !== CourseStatus.PENDING_REVIEW) {
      throw new BadRequestException(
        `Only courses pending review can be approved (current status: ${course.status})`,
      );
    }
    this.assertPublishable(course);

    const now = new Date();
    course.status = CourseStatus.PUBLISHED;
    course.isPublished = true;
    course.publishedAt = now;

    const saved = await this.repo.save(course);
    await this.invalidateCache();
    await this.searchService.indexCourse(saved).catch(() => {});
    this.logger.log(`Course ${id} approved and published`);
    return saved;
  }

  /**
   * Instructor (or admin) action: archive a PUBLISHED course, removing it from
   * the catalogue while retaining its content.
   */
  async archiveCourse(id: string, actor: { id: string; role: string }): Promise<Course> {
    const course = await this.findOne(id);

    if (actor.role !== 'admin' && course.instructorId !== actor.id) {
      throw new ForbiddenException('You can only archive your own courses');
    }
    if (course.status !== CourseStatus.PUBLISHED) {
      throw new BadRequestException(
        `Only published courses can be archived (current status: ${course.status})`,
      );
    }

    course.status = CourseStatus.ARCHIVED;
    course.isPublished = false;

    const saved = await this.repo.save(course);
    await this.invalidateCache();
    await this.searchService.deleteFromIndex('courses', id).catch(() => {});
    this.logger.log(`Course ${id} archived by ${actor.id}`);
    return saved;
  }

  private async loadWithModules(id: string): Promise<Course> {
    const course = await this.repo.findOne({
      where: { id, isDeleted: false },
      relations: ['modules'],
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  /** Validates a course carries the minimum content required to be published. */
  private assertPublishable(course: Course): void {
    const missing: string[] = [];
    if (!course.title || !course.title.trim()) missing.push('title');
    if (!course.description || !course.description.trim()) missing.push('description');
    if (!course.modules || course.modules.length === 0) missing.push('modules');

    if (missing.length > 0) {
      throw new BadRequestException(
        `Course is missing required content: ${missing.join(', ')}`,
      );
    }
  }
}
