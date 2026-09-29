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
      // Case-insensitive match on title/description (ILIKE handles casing).
      qb.andWhere('(course.title ILIKE :search OR course.description ILIKE :search)', {
        search: `%${search}%`,
      });
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

  private async invalidateCache() {
    await this.cacheManager.del(this.CACHE_KEY).catch(() => {});
  }
}
