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
import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Enrollment } from '../enrollments/enrollment.entity';
import { Course } from '../courses/course.entity';
import { Progress } from '../progress/progress.entity';
@Injectable()
export class RecommendationsService {
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(@InjectRepository(Enrollment)
  private enrollmentRepo: Repository<Enrollment>, @InjectRepository(Course)
  private courseRepo: Repository<Course>, @InjectRepository(Progress)
  private progressRepo: Repository<Progress>, @Inject(CACHE_MANAGER)
  private cache: Cache) {}
  async getRecommendations(userId: string, limit = 10): Promise<Course[]> {
    if (stryMutAct_9fa48("5919")) {
      {}
    } else {
      stryCov_9fa48("5919");
      const cacheKey = stryMutAct_9fa48("5920") ? `` : (stryCov_9fa48("5920"), `recommendations:${userId}`);
      const cached = await this.cache.get<Course[]>(cacheKey);
      if (stryMutAct_9fa48("5922") ? false : stryMutAct_9fa48("5921") ? true : (stryCov_9fa48("5921", "5922"), cached)) return cached;
      const [collaborative, contentBased] = await Promise.all(stryMutAct_9fa48("5923") ? [] : (stryCov_9fa48("5923"), [this.collaborativeFiltering(userId, limit), this.contentBasedFiltering(userId, limit)]));

      // Merge and deduplicate, collaborative first
      const seen = new Set<string>();
      const merged: Course[] = stryMutAct_9fa48("5924") ? ["Stryker was here"] : (stryCov_9fa48("5924"), []);
      for (const c of stryMutAct_9fa48("5925") ? [] : (stryCov_9fa48("5925"), [...collaborative, ...contentBased])) {
        if (stryMutAct_9fa48("5926")) {
          {}
        } else {
          stryCov_9fa48("5926");
          if (stryMutAct_9fa48("5929") ? !seen.has(c.id) || merged.length < limit : stryMutAct_9fa48("5928") ? false : stryMutAct_9fa48("5927") ? true : (stryCov_9fa48("5927", "5928", "5929"), (stryMutAct_9fa48("5930") ? seen.has(c.id) : (stryCov_9fa48("5930"), !seen.has(c.id))) && (stryMutAct_9fa48("5933") ? merged.length >= limit : stryMutAct_9fa48("5932") ? merged.length <= limit : stryMutAct_9fa48("5931") ? true : (stryCov_9fa48("5931", "5932", "5933"), merged.length < limit)))) {
            if (stryMutAct_9fa48("5934")) {
              {}
            } else {
              stryCov_9fa48("5934");
              seen.add(c.id);
              merged.push(c);
            }
          }
        }
      }

      // Fallback: popular courses if not enough
      if (stryMutAct_9fa48("5938") ? merged.length >= limit : stryMutAct_9fa48("5937") ? merged.length <= limit : stryMutAct_9fa48("5936") ? false : stryMutAct_9fa48("5935") ? true : (stryCov_9fa48("5935", "5936", "5937", "5938"), merged.length < limit)) {
        if (stryMutAct_9fa48("5939")) {
          {}
        } else {
          stryCov_9fa48("5939");
          const popular = await this.getPopularCourses(stryMutAct_9fa48("5940") ? limit + merged.length : (stryCov_9fa48("5940"), limit - merged.length), seen);
          merged.push(...popular);
        }
      }
      await this.cache.set(cacheKey, merged, this.CACHE_TTL);
      return merged;
    }
  }

  /** Collaborative filtering: find users with similar enrollments */
  private async collaborativeFiltering(userId: string, limit: number): Promise<Course[]> {
    if (stryMutAct_9fa48("5941")) {
      {}
    } else {
      stryCov_9fa48("5941");
      // Get courses the user is already enrolled in
      const userEnrollments = await this.enrollmentRepo.find(stryMutAct_9fa48("5942") ? {} : (stryCov_9fa48("5942"), {
        where: stryMutAct_9fa48("5943") ? {} : (stryCov_9fa48("5943"), {
          userId
        })
      }));
      const enrolledIds = userEnrollments.map(stryMutAct_9fa48("5944") ? () => undefined : (stryCov_9fa48("5944"), e => e.courseId));
      if (stryMutAct_9fa48("5947") ? false : stryMutAct_9fa48("5946") ? true : stryMutAct_9fa48("5945") ? enrolledIds.length : (stryCov_9fa48("5945", "5946", "5947"), !enrolledIds.length)) return stryMutAct_9fa48("5948") ? ["Stryker was here"] : (stryCov_9fa48("5948"), []);

      // Find users who share at least one course
      const similarUsers = await this.enrollmentRepo.createQueryBuilder(stryMutAct_9fa48("5949") ? "" : (stryCov_9fa48("5949"), 'e')).select(stryMutAct_9fa48("5950") ? "" : (stryCov_9fa48("5950"), 'e.userId'), stryMutAct_9fa48("5951") ? "" : (stryCov_9fa48("5951"), 'userId')).addSelect(stryMutAct_9fa48("5952") ? "" : (stryCov_9fa48("5952"), 'COUNT(*)'), stryMutAct_9fa48("5953") ? "" : (stryCov_9fa48("5953"), 'overlap')).where(stryMutAct_9fa48("5954") ? "" : (stryCov_9fa48("5954"), 'e.courseId IN (:...ids)'), stryMutAct_9fa48("5955") ? {} : (stryCov_9fa48("5955"), {
        ids: enrolledIds
      })).andWhere(stryMutAct_9fa48("5956") ? "" : (stryCov_9fa48("5956"), 'e.userId != :userId'), stryMutAct_9fa48("5957") ? {} : (stryCov_9fa48("5957"), {
        userId
      })).groupBy(stryMutAct_9fa48("5958") ? "" : (stryCov_9fa48("5958"), 'e.userId')).orderBy(stryMutAct_9fa48("5959") ? "" : (stryCov_9fa48("5959"), 'overlap'), stryMutAct_9fa48("5960") ? "" : (stryCov_9fa48("5960"), 'DESC')).limit(20).getRawMany<{
        userId: string;
      }>();
      if (stryMutAct_9fa48("5963") ? false : stryMutAct_9fa48("5962") ? true : stryMutAct_9fa48("5961") ? similarUsers.length : (stryCov_9fa48("5961", "5962", "5963"), !similarUsers.length)) return stryMutAct_9fa48("5964") ? ["Stryker was here"] : (stryCov_9fa48("5964"), []);
      const similarUserIds = similarUsers.map(stryMutAct_9fa48("5965") ? () => undefined : (stryCov_9fa48("5965"), u => u.userId));

      // Get courses those users enrolled in that our user hasn't
      const recs = await this.enrollmentRepo.createQueryBuilder(stryMutAct_9fa48("5966") ? "" : (stryCov_9fa48("5966"), 'e')).innerJoinAndSelect(stryMutAct_9fa48("5967") ? "" : (stryCov_9fa48("5967"), 'e.course'), stryMutAct_9fa48("5968") ? "" : (stryCov_9fa48("5968"), 'course')).where(stryMutAct_9fa48("5969") ? "" : (stryCov_9fa48("5969"), 'e.userId IN (:...ids)'), stryMutAct_9fa48("5970") ? {} : (stryCov_9fa48("5970"), {
        ids: similarUserIds
      })).andWhere(enrolledIds.length ? stryMutAct_9fa48("5971") ? "" : (stryCov_9fa48("5971"), 'e.courseId NOT IN (:...enrolled)') : stryMutAct_9fa48("5972") ? "" : (stryCov_9fa48("5972"), '1=1'), stryMutAct_9fa48("5973") ? {} : (stryCov_9fa48("5973"), {
        enrolled: enrolledIds
      })).andWhere(stryMutAct_9fa48("5974") ? "" : (stryCov_9fa48("5974"), 'course.isPublished = true')).andWhere(stryMutAct_9fa48("5975") ? "" : (stryCov_9fa48("5975"), 'course.isDeleted = false')).select(stryMutAct_9fa48("5976") ? "" : (stryCov_9fa48("5976"), 'e.courseId'), stryMutAct_9fa48("5977") ? "" : (stryCov_9fa48("5977"), 'courseId')).addSelect(stryMutAct_9fa48("5978") ? "" : (stryCov_9fa48("5978"), 'COUNT(*)'), stryMutAct_9fa48("5979") ? "" : (stryCov_9fa48("5979"), 'score')).groupBy(stryMutAct_9fa48("5980") ? "" : (stryCov_9fa48("5980"), 'e.courseId')).orderBy(stryMutAct_9fa48("5981") ? "" : (stryCov_9fa48("5981"), 'score'), stryMutAct_9fa48("5982") ? "" : (stryCov_9fa48("5982"), 'DESC')).limit(limit).getRawMany<{
        courseId: string;
      }>();
      if (stryMutAct_9fa48("5985") ? false : stryMutAct_9fa48("5984") ? true : stryMutAct_9fa48("5983") ? recs.length : (stryCov_9fa48("5983", "5984", "5985"), !recs.length)) return stryMutAct_9fa48("5986") ? ["Stryker was here"] : (stryCov_9fa48("5986"), []);
      return this.courseRepo.findByIds(recs.map(stryMutAct_9fa48("5987") ? () => undefined : (stryCov_9fa48("5987"), r => r.courseId)));
    }
  }

  /** Content-based filtering: recommend courses with same level as completed ones */
  private async contentBasedFiltering(userId: string, limit: number): Promise<Course[]> {
    if (stryMutAct_9fa48("5988")) {
      {}
    } else {
      stryCov_9fa48("5988");
      const completed = await this.enrollmentRepo.find(stryMutAct_9fa48("5989") ? {} : (stryCov_9fa48("5989"), {
        where: stryMutAct_9fa48("5990") ? {} : (stryCov_9fa48("5990"), {
          userId
        }),
        relations: stryMutAct_9fa48("5991") ? [] : (stryCov_9fa48("5991"), [stryMutAct_9fa48("5992") ? "" : (stryCov_9fa48("5992"), 'course')])
      }));
      if (stryMutAct_9fa48("5995") ? false : stryMutAct_9fa48("5994") ? true : stryMutAct_9fa48("5993") ? completed.length : (stryCov_9fa48("5993", "5994", "5995"), !completed.length)) return stryMutAct_9fa48("5996") ? ["Stryker was here"] : (stryCov_9fa48("5996"), []);
      const enrolledIds = completed.map(stryMutAct_9fa48("5997") ? () => undefined : (stryCov_9fa48("5997"), e => e.courseId));
      const levels = stryMutAct_9fa48("5998") ? [] : (stryCov_9fa48("5998"), [...new Set(stryMutAct_9fa48("5999") ? completed.map(e => e.course?.level) : (stryCov_9fa48("5999"), completed.map(stryMutAct_9fa48("6000") ? () => undefined : (stryCov_9fa48("6000"), e => stryMutAct_9fa48("6001") ? e.course.level : (stryCov_9fa48("6001"), e.course?.level))).filter(Boolean)))]);
      if (stryMutAct_9fa48("6004") ? false : stryMutAct_9fa48("6003") ? true : stryMutAct_9fa48("6002") ? levels.length : (stryCov_9fa48("6002", "6003", "6004"), !levels.length)) return stryMutAct_9fa48("6005") ? ["Stryker was here"] : (stryCov_9fa48("6005"), []);
      const qb = this.courseRepo.createQueryBuilder(stryMutAct_9fa48("6006") ? "" : (stryCov_9fa48("6006"), 'course')).where(stryMutAct_9fa48("6007") ? "" : (stryCov_9fa48("6007"), 'course.level IN (:...levels)'), stryMutAct_9fa48("6008") ? {} : (stryCov_9fa48("6008"), {
        levels
      })).andWhere(stryMutAct_9fa48("6009") ? "" : (stryCov_9fa48("6009"), 'course.isPublished = true')).andWhere(stryMutAct_9fa48("6010") ? "" : (stryCov_9fa48("6010"), 'course.isDeleted = false')).andWhere(stryMutAct_9fa48("6011") ? "" : (stryCov_9fa48("6011"), 'course.id NOT IN (:...enrolled)'), stryMutAct_9fa48("6012") ? {} : (stryCov_9fa48("6012"), {
        enrolled: enrolledIds
      })).orderBy(stryMutAct_9fa48("6013") ? "" : (stryCov_9fa48("6013"), 'course.createdAt'), stryMutAct_9fa48("6014") ? "" : (stryCov_9fa48("6014"), 'DESC')).limit(limit);
      return qb.getMany();
    }
  }
  private async getPopularCourses(limit: number, exclude: Set<string>): Promise<Course[]> {
    if (stryMutAct_9fa48("6015")) {
      {}
    } else {
      stryCov_9fa48("6015");
      const popular = await this.enrollmentRepo.createQueryBuilder(stryMutAct_9fa48("6016") ? "" : (stryCov_9fa48("6016"), 'e')).select(stryMutAct_9fa48("6017") ? "" : (stryCov_9fa48("6017"), 'e.courseId'), stryMutAct_9fa48("6018") ? "" : (stryCov_9fa48("6018"), 'courseId')).addSelect(stryMutAct_9fa48("6019") ? "" : (stryCov_9fa48("6019"), 'COUNT(*)'), stryMutAct_9fa48("6020") ? "" : (stryCov_9fa48("6020"), 'cnt')).groupBy(stryMutAct_9fa48("6021") ? "" : (stryCov_9fa48("6021"), 'e.courseId')).orderBy(stryMutAct_9fa48("6022") ? "" : (stryCov_9fa48("6022"), 'cnt'), stryMutAct_9fa48("6023") ? "" : (stryCov_9fa48("6023"), 'DESC')).limit(stryMutAct_9fa48("6024") ? limit - exclude.size : (stryCov_9fa48("6024"), limit + exclude.size)).getRawMany<{
        courseId: string;
      }>();
      const ids = stryMutAct_9fa48("6026") ? popular.map(p => p.courseId).slice(0, limit) : stryMutAct_9fa48("6025") ? popular.map(p => p.courseId).filter(id => !exclude.has(id)) : (stryCov_9fa48("6025", "6026"), popular.map(stryMutAct_9fa48("6027") ? () => undefined : (stryCov_9fa48("6027"), p => p.courseId)).filter(stryMutAct_9fa48("6028") ? () => undefined : (stryCov_9fa48("6028"), id => stryMutAct_9fa48("6029") ? exclude.has(id) : (stryCov_9fa48("6029"), !exclude.has(id)))).slice(0, limit));
      if (stryMutAct_9fa48("6032") ? false : stryMutAct_9fa48("6031") ? true : stryMutAct_9fa48("6030") ? ids.length : (stryCov_9fa48("6030", "6031", "6032"), !ids.length)) return stryMutAct_9fa48("6033") ? ["Stryker was here"] : (stryCov_9fa48("6033"), []);
      return this.courseRepo.findByIds(ids);
    }
  }
  async invalidateCache(userId: string) {
    if (stryMutAct_9fa48("6034")) {
      {}
    } else {
      stryCov_9fa48("6034");
      await this.cache.del(stryMutAct_9fa48("6035") ? `` : (stryCov_9fa48("6035"), `recommendations:${userId}`));
    }
  }
}