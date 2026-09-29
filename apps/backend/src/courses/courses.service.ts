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

/** Result of a single CSV row during a bulk course import. */
export interface CourseImportRowResult {
  row: number;
  title?: string;
  success: boolean;
  error?: string;
  courseId?: string;
}

/** Summary returned by {@link CoursesService.importFromCsv}. */
export interface CourseImportSummary {
  total: number;
  created: number;
  failed: number;
  results: CourseImportRowResult[];
}

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

  /**
   * Bulk import courses from a CSV file.
   *
   * Expected header row (case-insensitive): title, description, level,
   * category, language, price, status. Only `title` is required. Rows are
   * validated individually; invalid rows are reported per-row without
   * aborting the whole import. Valid rows are persisted and a summary of
   * created/failed entries is returned.
   */
  async importFromCsv(file: { buffer: Buffer }): Promise<CourseImportSummary> {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('A non-empty CSV file is required');
    }

    const rows = this.parseCsv(file.buffer.toString('utf-8'));
    if (rows.length === 0) {
      throw new BadRequestException('CSV file contains no data rows');
    }

    const header = rows[0].map((h) => h.trim().toLowerCase());
    const titleIndex = header.indexOf('title');
    if (titleIndex === -1) {
      throw new BadRequestException('CSV must include a "title" column');
    }

    const columnIndex = (name: string) => header.indexOf(name);
    const results: CourseImportRowResult[] = [];
    let created = 0;

    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i];
      const rowNumber = i + 1;
      const title = (cells[titleIndex] ?? '').trim();

      if (!title) {
        results.push({ row: rowNumber, success: false, error: 'Missing required field: title' });
        continue;
      }

      const statusValue = this.readCell(cells, columnIndex('status'));
      if (statusValue && !Object.values(CourseStatus).includes(statusValue as CourseStatus)) {
        results.push({
          row: rowNumber,
          title,
          success: false,
          error: `Invalid status: ${statusValue}`,
        });
        continue;
      }

      const priceValue = this.readCell(cells, columnIndex('price'));
      let price: number | undefined;
      if (priceValue) {
        price = Number(priceValue);
        if (Number.isNaN(price) || price < 0) {
          results.push({
            row: rowNumber,
            title,
            success: false,
            error: `Invalid price: ${priceValue}`,
          });
          continue;
        }
      }

      try {
        const course = await this.create({
          title,
          description: this.readCell(cells, columnIndex('description')) || undefined,
          level: this.readCell(cells, columnIndex('level')) || undefined,
          category: this.readCell(cells, columnIndex('category')) || undefined,
          language: this.readCell(cells, columnIndex('language')) || undefined,
          price,
          status: (statusValue as CourseStatus) || CourseStatus.DRAFT,
        });
        created++;
        results.push({ row: rowNumber, title, success: true, courseId: course.id });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        this.logger.warn(`CSV import failed for row ${rowNumber}: ${message}`);
        results.push({ row: rowNumber, title, success: false, error: message });
      }
    }

    return {
      total: results.length,
      created,
      failed: results.length - created,
      results,
    };
  }

  /** Read a trimmed cell value by column index, tolerating missing columns. */
  private readCell(cells: string[], index: number): string {
    if (index < 0 || index >= cells.length) return '';
    return (cells[index] ?? '').trim();
  }

  /**
   * Minimal RFC-4180-ish CSV parser supporting quoted fields, escaped quotes
   * and embedded newlines. Returns an array of rows (each an array of cells).
   */
  private parseCsv(input: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let field = '';
    let inQuotes = false;

    for (let i = 0; i < input.length; i++) {
      const char = input[i];

      if (inQuotes) {
        if (char === '"') {
          if (input[i + 1] === '"') {
            field += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          field += char;
        }
        continue;
      }

      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(field);
        field = '';
      } else if (char === '\n') {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      } else if (char === '\r') {
        // ignore CR; handled by LF
      } else {
        field += char;
      }
    }

    if (field.length > 0 || row.length > 0) {
      row.push(field);
      rows.push(row);
    }

    // Drop fully empty trailing rows
    return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
  }

  async findAll(query: CourseQueryDto = {}) {
    const { search, level, category, language, page = 1, limit = 20 } = query;

    // Cache key encodes all filter params; skip cache for search queries
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
    // C

/* … truncated 5609 chars — edit only what you need near the top … */
