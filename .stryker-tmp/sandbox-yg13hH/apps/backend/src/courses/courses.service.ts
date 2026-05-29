function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
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
  private readonly CACHE_KEY = stryMutAct_9fa48("2551") ? "" : (stryCov_9fa48("2551"), 'courses:all');
  /** 5-minute TTL in milliseconds */
  private readonly CACHE_TTL = 300_000;
  constructor(@InjectRepository(Course)
  private repo: Repository<Course>, @Inject(CACHE_MANAGER)
  private cacheManager: Cache, private readonly searchService: SearchService, private readonly metricsService: MetricsService) {}
  async findAll(query: CourseQueryDto = {}) {
    if (stryMutAct_9fa48("2552")) {
      {}
    } else {
      stryCov_9fa48("2552");
      const {
        search,
        level,
        language,
        page = 1,
        limit = 20
      } = query;

      // Cache key encodes all filter params; skip cache for search queries
      const cacheKey = (stryMutAct_9fa48("2553") ? search : (stryCov_9fa48("2553"), !search)) ? stryMutAct_9fa48("2554") ? `` : (stryCov_9fa48("2554"), `courses:catalog:${stryMutAct_9fa48("2555") ? level && '' : (stryCov_9fa48("2555"), level ?? (stryMutAct_9fa48("2556") ? "Stryker was here!" : (stryCov_9fa48("2556"), '')))}:${stryMutAct_9fa48("2557") ? language && '' : (stryCov_9fa48("2557"), language ?? (stryMutAct_9fa48("2558") ? "Stryker was here!" : (stryCov_9fa48("2558"), '')))}:${page}:${limit}`) : null;
      if (stryMutAct_9fa48("2560") ? false : stryMutAct_9fa48("2559") ? true : (stryCov_9fa48("2559", "2560"), cacheKey)) {
        if (stryMutAct_9fa48("2561")) {
          {}
        } else {
          stryCov_9fa48("2561");
          const cached = await this.cacheManager.get(cacheKey);
          if (stryMutAct_9fa48("2563") ? false : stryMutAct_9fa48("2562") ? true : (stryCov_9fa48("2562", "2563"), cached)) {
            if (stryMutAct_9fa48("2564")) {
              {}
            } else {
              stryCov_9fa48("2564");
              this.metricsService.incrementCacheHit(stryMutAct_9fa48("2565") ? "" : (stryCov_9fa48("2565"), 'courses'));
              return cached;
            }
          }
          this.metricsService.incrementCacheMiss(stryMutAct_9fa48("2566") ? "" : (stryCov_9fa48("2566"), 'courses'));
        }
      }
      const qb = this.repo.createQueryBuilder(stryMutAct_9fa48("2567") ? "" : (stryCov_9fa48("2567"), 'course')).where(stryMutAct_9fa48("2568") ? "" : (stryCov_9fa48("2568"), 'course.isPublished = :isPublished'), stryMutAct_9fa48("2569") ? {} : (stryCov_9fa48("2569"), {
        isPublished: stryMutAct_9fa48("2570") ? false : (stryCov_9fa48("2570"), true)
      })).andWhere(stryMutAct_9fa48("2571") ? "" : (stryCov_9fa48("2571"), 'course.isDeleted = :isDeleted'), stryMutAct_9fa48("2572") ? {} : (stryCov_9fa48("2572"), {
        isDeleted: stryMutAct_9fa48("2573") ? true : (stryCov_9fa48("2573"), false)
      }));
      if (stryMutAct_9fa48("2575") ? false : stryMutAct_9fa48("2574") ? true : (stryCov_9fa48("2574", "2575"), search)) {
        if (stryMutAct_9fa48("2576")) {
          {}
        } else {
          stryCov_9fa48("2576");
          qb.andWhere(stryMutAct_9fa48("2577") ? "" : (stryCov_9fa48("2577"), '(course.title ILIKE :search OR course.description ILIKE :search)'), stryMutAct_9fa48("2578") ? {} : (stryCov_9fa48("2578"), {
            search: stryMutAct_9fa48("2579") ? `` : (stryCov_9fa48("2579"), `%${search}%`)
          }));
        }
      }
      if (stryMutAct_9fa48("2581") ? false : stryMutAct_9fa48("2580") ? true : (stryCov_9fa48("2580", "2581"), level)) {
        if (stryMutAct_9fa48("2582")) {
          {}
        } else {
          stryCov_9fa48("2582");
          qb.andWhere(stryMutAct_9fa48("2583") ? "" : (stryCov_9fa48("2583"), 'course.level = :level'), stryMutAct_9fa48("2584") ? {} : (stryCov_9fa48("2584"), {
            level
          }));
        }
      }
      if (stryMutAct_9fa48("2586") ? false : stryMutAct_9fa48("2585") ? true : (stryCov_9fa48("2585", "2586"), language)) {
        if (stryMutAct_9fa48("2587")) {
          {}
        } else {
          stryCov_9fa48("2587");
          qb.andWhere(stryMutAct_9fa48("2588") ? "" : (stryCov_9fa48("2588"), 'course.language = :language'), stryMutAct_9fa48("2589") ? {} : (stryCov_9fa48("2589"), {
            language
          }));
        }
      }
      const total = await qb.clone().getCount();
      const offset = stryMutAct_9fa48("2590") ? (page - 1) / limit : (stryCov_9fa48("2590"), (stryMutAct_9fa48("2591") ? page + 1 : (stryCov_9fa48("2591"), page - 1)) * limit);
      const {
        raw,
        entities
      } = await qb.leftJoin(stryMutAct_9fa48("2592") ? "" : (stryCov_9fa48("2592"), 'course.reviews'), stryMutAct_9fa48("2593") ? "" : (stryCov_9fa48("2593"), 'review')).addSelect(stryMutAct_9fa48("2594") ? "" : (stryCov_9fa48("2594"), 'COALESCE(AVG(review.rating), 0)'), stryMutAct_9fa48("2595") ? "" : (stryCov_9fa48("2595"), 'course_averageRating')).skip(offset).take(limit).orderBy(stryMutAct_9fa48("2596") ? "" : (stryCov_9fa48("2596"), 'course.createdAt'), stryMutAct_9fa48("2597") ? "" : (stryCov_9fa48("2597"), 'DESC')).groupBy(stryMutAct_9fa48("2598") ? "" : (stryCov_9fa48("2598"), 'course.id')).getRawAndEntities();
      const averageRatings = new Map(raw.map(stryMutAct_9fa48("2599") ? () => undefined : (stryCov_9fa48("2599"), (item, index) => stryMutAct_9fa48("2600") ? [] : (stryCov_9fa48("2600"), [entities[index].id, stryMutAct_9fa48("2603") ? Number(item.course_averageRating) && 0 : stryMutAct_9fa48("2602") ? false : stryMutAct_9fa48("2601") ? true : (stryCov_9fa48("2601", "2602", "2603"), Number(item.course_averageRating) || 0)]))));
      const data = entities.map(stryMutAct_9fa48("2604") ? () => undefined : (stryCov_9fa48("2604"), course => stryMutAct_9fa48("2605") ? {} : (stryCov_9fa48("2605"), {
        ...course,
        averageRating: stryMutAct_9fa48("2606") ? averageRatings.get(course.id) && 0 : (stryCov_9fa48("2606"), averageRatings.get(course.id) ?? 0)
      })));
      const result = stryMutAct_9fa48("2607") ? {} : (stryCov_9fa48("2607"), {
        data,
        total,
        page,
        limit
      });
      if (stryMutAct_9fa48("2609") ? false : stryMutAct_9fa48("2608") ? true : (stryCov_9fa48("2608", "2609"), cacheKey)) {
        if (stryMutAct_9fa48("2610")) {
          {}
        } else {
          stryCov_9fa48("2610");
          await this.cacheManager.set(cacheKey, result, this.CACHE_TTL);
        }
      }
      return result;
    }
  }
  async findOne(id: string): Promise<Course> {
    if (stryMutAct_9fa48("2611")) {
      {}
    } else {
      stryCov_9fa48("2611");
      const course = await this.repo.findOne(stryMutAct_9fa48("2612") ? {} : (stryCov_9fa48("2612"), {
        where: stryMutAct_9fa48("2613") ? {} : (stryCov_9fa48("2613"), {
          id,
          isDeleted: stryMutAct_9fa48("2614") ? true : (stryCov_9fa48("2614"), false)
        }),
        relations: stryMutAct_9fa48("2615") ? [] : (stryCov_9fa48("2615"), [stryMutAct_9fa48("2616") ? "" : (stryCov_9fa48("2616"), 'prerequisites'), stryMutAct_9fa48("2617") ? "" : (stryCov_9fa48("2617"), 'prerequisites.prerequisite')])
      }));
      if (stryMutAct_9fa48("2620") ? false : stryMutAct_9fa48("2619") ? true : stryMutAct_9fa48("2618") ? course : (stryCov_9fa48("2618", "2619", "2620"), !course)) throw new NotFoundException(stryMutAct_9fa48("2621") ? "" : (stryCov_9fa48("2621"), 'Course not found'));
      return course;
    }
  }
  async create(data: Partial<Course>) {
    if (stryMutAct_9fa48("2622")) {
      {}
    } else {
      stryCov_9fa48("2622");
      const course = await this.repo.save(this.repo.create(data));
      await this.invalidateCache();
      await this.searchService.indexCourse(course).catch(() => {});
      return course;
    }
  }
  async update(id: string, data: Partial<Course>) {
    if (stryMutAct_9fa48("2623")) {
      {}
    } else {
      stryCov_9fa48("2623");
      const course = await this.findOne(id);
      if (stryMutAct_9fa48("2626") ? false : stryMutAct_9fa48("2625") ? true : stryMutAct_9fa48("2624") ? course : (stryCov_9fa48("2624", "2625", "2626"), !course)) throw new NotFoundException(stryMutAct_9fa48("2627") ? "" : (stryCov_9fa48("2627"), 'Course not found'));
      const updated = await this.repo.save(stryMutAct_9fa48("2628") ? {} : (stryCov_9fa48("2628"), {
        ...course,
        ...data
      }));
      await this.invalidateCache();
      await this.searchService.indexCourse(updated).catch(() => {});
      return updated;
    }
  }
  async delete(id: string) {
    if (stryMutAct_9fa48("2629")) {
      {}
    } else {
      stryCov_9fa48("2629");
      const course = await this.findOne(id);
      if (stryMutAct_9fa48("2632") ? false : stryMutAct_9fa48("2631") ? true : stryMutAct_9fa48("2630") ? course : (stryCov_9fa48("2630", "2631", "2632"), !course)) throw new NotFoundException(stryMutAct_9fa48("2633") ? "" : (stryCov_9fa48("2633"), 'Course not found'));
      const removed = await this.repo.remove(course);
      await this.invalidateCache();
      await this.searchService.deleteFromIndex(stryMutAct_9fa48("2634") ? "" : (stryCov_9fa48("2634"), 'courses'), id).catch(() => {});
      return removed;
    }
  }
  private async invalidateCache() {
    if (stryMutAct_9fa48("2635")) {
      {}
    } else {
      stryCov_9fa48("2635");
      await this.cacheManager.del(this.CACHE_KEY);
      // Invalidate catalog cache entries (pattern-based via store reset)
      await this.cacheManager.reset().catch(() => {});
    }
  }
  async scheduleCourse(id: string, scheduledAt: Date): Promise<Course> {
    if (stryMutAct_9fa48("2636")) {
      {}
    } else {
      stryCov_9fa48("2636");
      if (stryMutAct_9fa48("2640") ? scheduledAt > new Date() : stryMutAct_9fa48("2639") ? scheduledAt < new Date() : stryMutAct_9fa48("2638") ? false : stryMutAct_9fa48("2637") ? true : (stryCov_9fa48("2637", "2638", "2639", "2640"), scheduledAt <= new Date())) {
        if (stryMutAct_9fa48("2641")) {
          {}
        } else {
          stryCov_9fa48("2641");
          throw new BadRequestException(stryMutAct_9fa48("2642") ? "" : (stryCov_9fa48("2642"), 'scheduledAt must be in the future'));
        }
      }
      const course = await this.findOne(id);
      return this.repo.save(stryMutAct_9fa48("2643") ? {} : (stryCov_9fa48("2643"), {
        ...course,
        status: CourseStatus.SCHEDULED,
        scheduledAt,
        isPublished: stryMutAct_9fa48("2644") ? true : (stryCov_9fa48("2644"), false)
      }));
    }
  }
  async publishNow(id: string): Promise<Course> {
    if (stryMutAct_9fa48("2645")) {
      {}
    } else {
      stryCov_9fa48("2645");
      const course = await this.findOne(id);
      const now = new Date();
      return this.repo.save(stryMutAct_9fa48("2646") ? {} : (stryCov_9fa48("2646"), {
        ...course,
        status: CourseStatus.PUBLISHED,
        isPublished: stryMutAct_9fa48("2647") ? false : (stryCov_9fa48("2647"), true),
        publishedAt: now,
        scheduledAt: stryMutAct_9fa48("2648") ? course.scheduledAt && null : (stryCov_9fa48("2648"), course.scheduledAt ?? null)
      }));
    }
  }
}