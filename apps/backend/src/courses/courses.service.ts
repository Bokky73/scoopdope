import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
  private readonly CACHE_KEY = 'courses:all';
  /** 5-minute TTL in milliseconds */
  private readonly CACHE_TTL = 300_000;

  constructor(
    @InjectRepository(Course) private repo: Repository<Course>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly searchService: SearchService,
    private readonly metricsService: MetricsService
  ) {}

  async findAll(query: CourseQueryDto = {}) {
    const { search, level, language, tags, page = 1, limit = 20 } = query;

    // Cache key encodes all filter params; skip cache for search queries
    const tagsKey = tags?.length ? tags.sort().join(',') : '';
    const cacheKey = !search
      ? `courses:catalog:${level ?? ''}:${language ?? ''}:${tagsKey}:${page}:${limit}`
      : null;

    if (cacheKey) {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        this.metricsService.incrementCacheHit('courses');
        return cached;
      }
      this.metricsService.incrementCacheMiss('courses');
    }

    const qb = this.repo
      .createQueryBuilder('course')
      .where('course.isPublished = :isPublished', { isPublished: true })
      .andWhere('course.isDeleted = :isDeleted', { isDeleted: false });

    if (search) {
      qb.andWhere('(course.title ILIKE :search OR course.description ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (level) {
      qb.andWhere('course.level = :level', { level });
    }

    if (language) {
      qb.andWhere('course.language = :language', { language });
    }

    // Filter by tags: course must contain ALL provided tags (jsonb @> operator)
    if (tags && tags.length > 0) {
      qb.andWhere('course.tags @> :tags::jsonb', { tags: JSON.stringify(tags) });
    }

    const total = await qb.clone().getCount();
    const offset = (page - 1) * limit;

    const { raw, entities } = await qb
      .leftJoin('course.reviews', 'review')
      .addSelect('COALESCE(AVG(review.rating), 0)', 'course_averageRating')
      .skip(offset)
      .take(limit)
      .orderBy('course.createdAt', 'DESC')
      .groupBy('course.id')
      .getRawAndEntities();

    const averageRatings = new Map(
      raw.map((item, index) => [entities[index].id, Number(item.course_averageRating) || 0])
    );

    const data = entities.map((course) => ({
      ...course,
      averageRating: averageRatings.get(course.id) ?? 0,
    }));

    const result = { data, total, page, limit };

    if (cacheKey) {
      await this.cacheManager.set(cacheKey, result, this.CACHE_TTL);
    }

    return result;
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.repo.findOne({
      where: { id, isDeleted: false },
      relations: ['prerequisites', 'prerequisites.prerequisite'],
    });
    if (!course) throw new NotFoundException('Course not found');
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
    // Invalidate catalog cache entries (pattern-based via store reset)
    await this.cacheManager.reset().catch(() => {});
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
}
