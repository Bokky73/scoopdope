// @ts-nocheck
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
import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CourseAnalytics } from './course-analytics.entity';
import { Enrollment } from '../enrollments/enrollment.entity';
import { Progress } from '../progress/progress.entity';
import { Review } from '../courses/review.entity';
import { User } from '../users/user.entity';
export interface PlatformAnalytics {
  totalUsers: number;
  totalEnrollments: number;
  totalCompletions: number;
  totalRevenue: number;
  completionRate: number;
  userGrowth: {
    month: string;
    count: number;
  }[];
  enrollmentGrowth: {
    month: string;
    count: number;
  }[];
  completionGrowth: {
    month: string;
    count: number;
  }[];
  revenueGrowth: {
    month: string;
    amount: number;
  }[];
  topCourses: {
    courseId: string;
    title: string;
    enrollments: number;
    completions: number;
    completionRate: number;
  }[];
}
@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private readonly CACHE_TTL = 3600;
  constructor(@InjectRepository(CourseAnalytics)
  private analyticsRepo: Repository<CourseAnalytics>, @InjectRepository(Enrollment)
  private enrollmentRepo: Repository<Enrollment>, @InjectRepository(Progress)
  private progressRepo: Repository<Progress>, @InjectRepository(Review)
  private reviewRepo: Repository<Review>, @InjectRepository(User)
  private userRepo: Repository<User>, @Inject(CACHE_MANAGER)
  private cache: Cache) {}
  async getAnalytics(courseId: string): Promise<CourseAnalytics> {
    if (stryMutAct_9fa48("210")) {
      {}
    } else {
      stryCov_9fa48("210");
      const cacheKey = stryMutAct_9fa48("211") ? `` : (stryCov_9fa48("211"), `analytics:${courseId}`);
      const cached = await this.cache.get<CourseAnalytics>(cacheKey);
      if (stryMutAct_9fa48("213") ? false : stryMutAct_9fa48("212") ? true : (stryCov_9fa48("212", "213"), cached)) return cached;
      let analytics = await this.analyticsRepo.findOne(stryMutAct_9fa48("214") ? {} : (stryCov_9fa48("214"), {
        where: stryMutAct_9fa48("215") ? {} : (stryCov_9fa48("215"), {
          courseId
        })
      }));
      if (stryMutAct_9fa48("218") ? false : stryMutAct_9fa48("217") ? true : stryMutAct_9fa48("216") ? analytics : (stryCov_9fa48("216", "217", "218"), !analytics)) {
        if (stryMutAct_9fa48("219")) {
          {}
        } else {
          stryCov_9fa48("219");
          analytics = await this.aggregateCourse(courseId);
        }
      }
      await this.cache.set(cacheKey, analytics, this.CACHE_TTL);
      return analytics;
    }
  }
  async aggregateCourse(courseId: string): Promise<CourseAnalytics> {
    if (stryMutAct_9fa48("220")) {
      {}
    } else {
      stryCov_9fa48("220");
      const [totalEnrollments, totalCompletions, reviewStats, progressStats, activeCount] = await Promise.all(stryMutAct_9fa48("221") ? [] : (stryCov_9fa48("221"), [this.enrollmentRepo.count(stryMutAct_9fa48("222") ? {} : (stryCov_9fa48("222"), {
        where: stryMutAct_9fa48("223") ? {} : (stryCov_9fa48("223"), {
          courseId
        })
      })), this.enrollmentRepo.count(stryMutAct_9fa48("224") ? {} : (stryCov_9fa48("224"), {
        where: stryMutAct_9fa48("225") ? {} : (stryCov_9fa48("225"), {
          courseId
        })
      })).then(async () => {
        if (stryMutAct_9fa48("226")) {
          {}
        } else {
          stryCov_9fa48("226");
          const res = await this.enrollmentRepo.createQueryBuilder(stryMutAct_9fa48("227") ? "" : (stryCov_9fa48("227"), 'e')).where(stryMutAct_9fa48("228") ? "" : (stryCov_9fa48("228"), 'e.courseId = :courseId'), stryMutAct_9fa48("229") ? {} : (stryCov_9fa48("229"), {
            courseId
          })).andWhere(stryMutAct_9fa48("230") ? "" : (stryCov_9fa48("230"), 'e.completedAt IS NOT NULL')).getCount();
          return res;
        }
      }), this.reviewRepo.createQueryBuilder(stryMutAct_9fa48("231") ? "" : (stryCov_9fa48("231"), 'r')).select(stryMutAct_9fa48("232") ? "" : (stryCov_9fa48("232"), 'AVG(r.rating)'), stryMutAct_9fa48("233") ? "" : (stryCov_9fa48("233"), 'avg')).addSelect(stryMutAct_9fa48("234") ? "" : (stryCov_9fa48("234"), 'COUNT(*)'), stryMutAct_9fa48("235") ? "" : (stryCov_9fa48("235"), 'cnt')).where(stryMutAct_9fa48("236") ? "" : (stryCov_9fa48("236"), 'r.courseId = :courseId'), stryMutAct_9fa48("237") ? {} : (stryCov_9fa48("237"), {
        courseId
      })).getRawOne<{
        avg: string;
        cnt: string;
      }>(), this.progressRepo.createQueryBuilder(stryMutAct_9fa48("238") ? "" : (stryCov_9fa48("238"), 'p')).select(stryMutAct_9fa48("239") ? "" : (stryCov_9fa48("239"), 'AVG(p.progressPct)'), stryMutAct_9fa48("240") ? "" : (stryCov_9fa48("240"), 'avg')).where(stryMutAct_9fa48("241") ? "" : (stryCov_9fa48("241"), 'p.courseId = :courseId'), stryMutAct_9fa48("242") ? {} : (stryCov_9fa48("242"), {
        courseId
      })).getRawOne<{
        avg: string;
      }>(), this.progressRepo.createQueryBuilder(stryMutAct_9fa48("243") ? "" : (stryCov_9fa48("243"), 'p')).where(stryMutAct_9fa48("244") ? "" : (stryCov_9fa48("244"), 'p.courseId = :courseId'), stryMutAct_9fa48("245") ? {} : (stryCov_9fa48("245"), {
        courseId
      })).andWhere(stryMutAct_9fa48("246") ? "" : (stryCov_9fa48("246"), 'p.updatedAt > :since'), stryMutAct_9fa48("247") ? {} : (stryCov_9fa48("247"), {
        since: new Date(stryMutAct_9fa48("248") ? Date.now() + 30 * 86400_000 : (stryCov_9fa48("248"), Date.now() - (stryMutAct_9fa48("249") ? 30 / 86400_000 : (stryCov_9fa48("249"), 30 * 86400_000))))
      })).select(stryMutAct_9fa48("250") ? "" : (stryCov_9fa48("250"), 'COUNT(DISTINCT p.userId)'), stryMutAct_9fa48("251") ? "" : (stryCov_9fa48("251"), 'cnt')).getRawOne<{
        cnt: string;
      }>()]));
      const completionRate = (stryMutAct_9fa48("255") ? totalEnrollments <= 0 : stryMutAct_9fa48("254") ? totalEnrollments >= 0 : stryMutAct_9fa48("253") ? false : stryMutAct_9fa48("252") ? true : (stryCov_9fa48("252", "253", "254", "255"), totalEnrollments > 0)) ? stryMutAct_9fa48("256") ? totalCompletions / totalEnrollments / 100 : (stryCov_9fa48("256"), (stryMutAct_9fa48("257") ? totalCompletions * totalEnrollments : (stryCov_9fa48("257"), totalCompletions / totalEnrollments)) * 100) : 0;
      const existing = await this.analyticsRepo.findOne(stryMutAct_9fa48("258") ? {} : (stryCov_9fa48("258"), {
        where: stryMutAct_9fa48("259") ? {} : (stryCov_9fa48("259"), {
          courseId
        })
      }));
      const record = stryMutAct_9fa48("260") ? existing && this.analyticsRepo.create({
        courseId
      }) : (stryCov_9fa48("260"), existing ?? this.analyticsRepo.create(stryMutAct_9fa48("261") ? {} : (stryCov_9fa48("261"), {
        courseId
      })));
      Object.assign(record, stryMutAct_9fa48("262") ? {} : (stryCov_9fa48("262"), {
        totalEnrollments,
        totalCompletions,
        completionRate: stryMutAct_9fa48("263") ? Math.round(completionRate * 100) * 100 : (stryCov_9fa48("263"), Math.round(stryMutAct_9fa48("264") ? completionRate / 100 : (stryCov_9fa48("264"), completionRate * 100)) / 100),
        averageRating: stryMutAct_9fa48("265") ? Math.round(Number(reviewStats?.avg ?? 0) * 100) * 100 : (stryCov_9fa48("265"), Math.round(stryMutAct_9fa48("266") ? Number(reviewStats?.avg ?? 0) / 100 : (stryCov_9fa48("266"), Number(stryMutAct_9fa48("267") ? reviewStats?.avg && 0 : (stryCov_9fa48("267"), (stryMutAct_9fa48("268") ? reviewStats.avg : (stryCov_9fa48("268"), reviewStats?.avg)) ?? 0)) * 100)) / 100),
        totalReviews: Number(stryMutAct_9fa48("269") ? reviewStats?.cnt && 0 : (stryCov_9fa48("269"), (stryMutAct_9fa48("270") ? reviewStats.cnt : (stryCov_9fa48("270"), reviewStats?.cnt)) ?? 0)),
        averageProgressPct: stryMutAct_9fa48("271") ? Math.round(Number(progressStats?.avg ?? 0) * 100) * 100 : (stryCov_9fa48("271"), Math.round(stryMutAct_9fa48("272") ? Number(progressStats?.avg ?? 0) / 100 : (stryCov_9fa48("272"), Number(stryMutAct_9fa48("273") ? progressStats?.avg && 0 : (stryCov_9fa48("273"), (stryMutAct_9fa48("274") ? progressStats.avg : (stryCov_9fa48("274"), progressStats?.avg)) ?? 0)) * 100)) / 100),
        activeLearnersLast30Days: Number(stryMutAct_9fa48("275") ? activeCount?.cnt && 0 : (stryCov_9fa48("275"), (stryMutAct_9fa48("276") ? activeCount.cnt : (stryCov_9fa48("276"), activeCount?.cnt)) ?? 0))
      }));
      const saved = await this.analyticsRepo.save(record);
      await this.cache.del(stryMutAct_9fa48("277") ? `` : (stryCov_9fa48("277"), `analytics:${courseId}`));
      return saved;
    }
  }
  async getPlatformAnalytics(): Promise<PlatformAnalytics> {
    if (stryMutAct_9fa48("278")) {
      {}
    } else {
      stryCov_9fa48("278");
      const cacheKey = stryMutAct_9fa48("279") ? "" : (stryCov_9fa48("279"), 'analytics:platform');
      const cached = await this.cache.get<PlatformAnalytics>(cacheKey);
      if (stryMutAct_9fa48("281") ? false : stryMutAct_9fa48("280") ? true : (stryCov_9fa48("280", "281"), cached)) return cached;
      const now = new Date();
      // Build 12-month buckets (YYYY-MM)
      const months: string[] = stryMutAct_9fa48("282") ? ["Stryker was here"] : (stryCov_9fa48("282"), []);
      for (let i = 11; stryMutAct_9fa48("285") ? i < 0 : stryMutAct_9fa48("284") ? i > 0 : stryMutAct_9fa48("283") ? false : (stryCov_9fa48("283", "284", "285"), i >= 0); stryMutAct_9fa48("286") ? i++ : (stryCov_9fa48("286"), i--)) {
        if (stryMutAct_9fa48("287")) {
          {}
        } else {
          stryCov_9fa48("287");
          const d = new Date(now.getFullYear(), stryMutAct_9fa48("288") ? now.getMonth() + i : (stryCov_9fa48("288"), now.getMonth() - i), 1);
          months.push(stryMutAct_9fa48("289") ? `` : (stryCov_9fa48("289"), `${d.getFullYear()}-${String(stryMutAct_9fa48("290") ? d.getMonth() - 1 : (stryCov_9fa48("290"), d.getMonth() + 1)).padStart(2, stryMutAct_9fa48("291") ? "" : (stryCov_9fa48("291"), '0'))}`));
        }
      }
      const [totalUsers, totalEnrollments, totalCompletions, usersByMonth, enrollmentsByMonth, completionsByMonth, topCoursesRaw] = await Promise.all(stryMutAct_9fa48("292") ? [] : (stryCov_9fa48("292"), [this.userRepo.count(stryMutAct_9fa48("293") ? {} : (stryCov_9fa48("293"), {
        where: stryMutAct_9fa48("294") ? {} : (stryCov_9fa48("294"), {
          isBanned: stryMutAct_9fa48("295") ? true : (stryCov_9fa48("295"), false)
        })
      })), this.enrollmentRepo.count(), this.enrollmentRepo.createQueryBuilder(stryMutAct_9fa48("296") ? "" : (stryCov_9fa48("296"), 'e')).where(stryMutAct_9fa48("297") ? "" : (stryCov_9fa48("297"), 'e.completedAt IS NOT NULL')).getCount(), this.userRepo.createQueryBuilder(stryMutAct_9fa48("298") ? "" : (stryCov_9fa48("298"), 'u')).select(stryMutAct_9fa48("299") ? "" : (stryCov_9fa48("299"), "TO_CHAR(u.createdAt, 'YYYY-MM')"), stryMutAct_9fa48("300") ? "" : (stryCov_9fa48("300"), 'month')).addSelect(stryMutAct_9fa48("301") ? "" : (stryCov_9fa48("301"), 'COUNT(*)'), stryMutAct_9fa48("302") ? "" : (stryCov_9fa48("302"), 'count')).where(stryMutAct_9fa48("303") ? "" : (stryCov_9fa48("303"), "u.createdAt >= :since"), stryMutAct_9fa48("304") ? {} : (stryCov_9fa48("304"), {
        since: new Date(now.getFullYear(), stryMutAct_9fa48("305") ? now.getMonth() + 11 : (stryCov_9fa48("305"), now.getMonth() - 11), 1)
      })).groupBy(stryMutAct_9fa48("306") ? "" : (stryCov_9fa48("306"), "TO_CHAR(u.createdAt, 'YYYY-MM')")).orderBy(stryMutAct_9fa48("307") ? "" : (stryCov_9fa48("307"), "TO_CHAR(u.createdAt, 'YYYY-MM')"), stryMutAct_9fa48("308") ? "" : (stryCov_9fa48("308"), 'ASC')).getRawMany<{
        month: string;
        count: string;
      }>(), this.enrollmentRepo.createQueryBuilder(stryMutAct_9fa48("309") ? "" : (stryCov_9fa48("309"), 'e')).select(stryMutAct_9fa48("310") ? "" : (stryCov_9fa48("310"), "TO_CHAR(e.enrolledAt, 'YYYY-MM')"), stryMutAct_9fa48("311") ? "" : (stryCov_9fa48("311"), 'month')).addSelect(stryMutAct_9fa48("312") ? "" : (stryCov_9fa48("312"), 'COUNT(*)'), stryMutAct_9fa48("313") ? "" : (stryCov_9fa48("313"), 'count')).where(stryMutAct_9fa48("314") ? "" : (stryCov_9fa48("314"), "e.enrolledAt >= :since"), stryMutAct_9fa48("315") ? {} : (stryCov_9fa48("315"), {
        since: new Date(now.getFullYear(), stryMutAct_9fa48("316") ? now.getMonth() + 11 : (stryCov_9fa48("316"), now.getMonth() - 11), 1)
      })).groupBy(stryMutAct_9fa48("317") ? "" : (stryCov_9fa48("317"), "TO_CHAR(e.enrolledAt, 'YYYY-MM')")).orderBy(stryMutAct_9fa48("318") ? "" : (stryCov_9fa48("318"), "TO_CHAR(e.enrolledAt, 'YYYY-MM')"), stryMutAct_9fa48("319") ? "" : (stryCov_9fa48("319"), 'ASC')).getRawMany<{
        month: string;
        count: string;
      }>(), this.enrollmentRepo.createQueryBuilder(stryMutAct_9fa48("320") ? "" : (stryCov_9fa48("320"), 'e')).select(stryMutAct_9fa48("321") ? "" : (stryCov_9fa48("321"), "TO_CHAR(e.completedAt, 'YYYY-MM')"), stryMutAct_9fa48("322") ? "" : (stryCov_9fa48("322"), 'month')).addSelect(stryMutAct_9fa48("323") ? "" : (stryCov_9fa48("323"), 'COUNT(*)'), stryMutAct_9fa48("324") ? "" : (stryCov_9fa48("324"), 'count')).where(stryMutAct_9fa48("325") ? "" : (stryCov_9fa48("325"), 'e.completedAt IS NOT NULL')).andWhere(stryMutAct_9fa48("326") ? "" : (stryCov_9fa48("326"), "e.completedAt >= :since"), stryMutAct_9fa48("327") ? {} : (stryCov_9fa48("327"), {
        since: new Date(now.getFullYear(), stryMutAct_9fa48("328") ? now.getMonth() + 11 : (stryCov_9fa48("328"), now.getMonth() - 11), 1)
      })).groupBy(stryMutAct_9fa48("329") ? "" : (stryCov_9fa48("329"), "TO_CHAR(e.completedAt, 'YYYY-MM')")).orderBy(stryMutAct_9fa48("330") ? "" : (stryCov_9fa48("330"), "TO_CHAR(e.completedAt, 'YYYY-MM')"), stryMutAct_9fa48("331") ? "" : (stryCov_9fa48("331"), 'ASC')).getRawMany<{
        month: string;
        count: string;
      }>(), this.analyticsRepo.createQueryBuilder(stryMutAct_9fa48("332") ? "" : (stryCov_9fa48("332"), 'a')).leftJoin(stryMutAct_9fa48("333") ? "" : (stryCov_9fa48("333"), 'courses'), stryMutAct_9fa48("334") ? "" : (stryCov_9fa48("334"), 'c'), stryMutAct_9fa48("335") ? "" : (stryCov_9fa48("335"), 'c.id = a.courseId')).select(stryMutAct_9fa48("336") ? "" : (stryCov_9fa48("336"), 'a.courseId'), stryMutAct_9fa48("337") ? "" : (stryCov_9fa48("337"), 'courseId')).addSelect(stryMutAct_9fa48("338") ? "" : (stryCov_9fa48("338"), 'c.title'), stryMutAct_9fa48("339") ? "" : (stryCov_9fa48("339"), 'title')).addSelect(stryMutAct_9fa48("340") ? "" : (stryCov_9fa48("340"), 'a.totalEnrollments'), stryMutAct_9fa48("341") ? "" : (stryCov_9fa48("341"), 'enrollments')).addSelect(stryMutAct_9fa48("342") ? "" : (stryCov_9fa48("342"), 'a.totalCompletions'), stryMutAct_9fa48("343") ? "" : (stryCov_9fa48("343"), 'completions')).addSelect(stryMutAct_9fa48("344") ? "" : (stryCov_9fa48("344"), 'a.completionRate'), stryMutAct_9fa48("345") ? "" : (stryCov_9fa48("345"), 'completionRate')).orderBy(stryMutAct_9fa48("346") ? "" : (stryCov_9fa48("346"), 'a.totalEnrollments'), stryMutAct_9fa48("347") ? "" : (stryCov_9fa48("347"), 'DESC')).limit(10).getRawMany<{
        courseId: string;
        title: string;
        enrollments: string;
        completions: string;
        completionRate: string;
      }>()]));

      // Map month buckets, filling zeros for missing months
      const toMap = stryMutAct_9fa48("348") ? () => undefined : (stryCov_9fa48("348"), (() => {
        const toMap = (rows: {
          month: string;
          count: string;
        }[]) => new Map(rows.map(stryMutAct_9fa48("349") ? () => undefined : (stryCov_9fa48("349"), r => stryMutAct_9fa48("350") ? [] : (stryCov_9fa48("350"), [r.month, Number(r.count)]))));
        return toMap;
      })());
      const userMap = toMap(usersByMonth);
      const enrollMap = toMap(enrollmentsByMonth);
      const completionMap = toMap(completionsByMonth);
      const userGrowth = months.map(stryMutAct_9fa48("351") ? () => undefined : (stryCov_9fa48("351"), m => stryMutAct_9fa48("352") ? {} : (stryCov_9fa48("352"), {
        month: m,
        count: stryMutAct_9fa48("353") ? userMap.get(m) && 0 : (stryCov_9fa48("353"), userMap.get(m) ?? 0)
      })));
      const enrollmentGrowth = months.map(stryMutAct_9fa48("354") ? () => undefined : (stryCov_9fa48("354"), m => stryMutAct_9fa48("355") ? {} : (stryCov_9fa48("355"), {
        month: m,
        count: stryMutAct_9fa48("356") ? enrollMap.get(m) && 0 : (stryCov_9fa48("356"), enrollMap.get(m) ?? 0)
      })));
      const completionGrowth = months.map(stryMutAct_9fa48("357") ? () => undefined : (stryCov_9fa48("357"), m => stryMutAct_9fa48("358") ? {} : (stryCov_9fa48("358"), {
        month: m,
        count: stryMutAct_9fa48("359") ? completionMap.get(m) && 0 : (stryCov_9fa48("359"), completionMap.get(m) ?? 0)
      })));

      // Revenue is approximated from enrollment counts (no payment table available)
      const revenueGrowth = enrollmentGrowth.map(stryMutAct_9fa48("360") ? () => undefined : (stryCov_9fa48("360"), e => stryMutAct_9fa48("361") ? {} : (stryCov_9fa48("361"), {
        month: e.month,
        amount: 0
      })));
      const completionRate = (stryMutAct_9fa48("365") ? totalEnrollments <= 0 : stryMutAct_9fa48("364") ? totalEnrollments >= 0 : stryMutAct_9fa48("363") ? false : stryMutAct_9fa48("362") ? true : (stryCov_9fa48("362", "363", "364", "365"), totalEnrollments > 0)) ? stryMutAct_9fa48("366") ? Math.round(totalCompletions / totalEnrollments * 10000) * 100 : (stryCov_9fa48("366"), Math.round(stryMutAct_9fa48("367") ? totalCompletions / totalEnrollments / 10000 : (stryCov_9fa48("367"), (stryMutAct_9fa48("368") ? totalCompletions * totalEnrollments : (stryCov_9fa48("368"), totalCompletions / totalEnrollments)) * 10000)) / 100) : 0;
      const result: PlatformAnalytics = stryMutAct_9fa48("369") ? {} : (stryCov_9fa48("369"), {
        totalUsers,
        totalEnrollments,
        totalCompletions,
        totalRevenue: 0,
        completionRate,
        userGrowth,
        enrollmentGrowth,
        completionGrowth,
        revenueGrowth,
        topCourses: topCoursesRaw.map(stryMutAct_9fa48("370") ? () => undefined : (stryCov_9fa48("370"), r => stryMutAct_9fa48("371") ? {} : (stryCov_9fa48("371"), {
          courseId: r.courseId,
          title: stryMutAct_9fa48("372") ? r.title && 'Unknown' : (stryCov_9fa48("372"), r.title ?? (stryMutAct_9fa48("373") ? "" : (stryCov_9fa48("373"), 'Unknown'))),
          enrollments: Number(r.enrollments),
          completions: Number(r.completions),
          completionRate: Number(r.completionRate)
        })))
      });
      await this.cache.set(cacheKey, result, this.CACHE_TTL);
      return result;
    }
  }

  /** Hourly: aggregate all courses */
  @Cron(CronExpression.EVERY_HOUR)
  async aggregateAll(): Promise<void> {
    if (stryMutAct_9fa48("374")) {
      {}
    } else {
      stryCov_9fa48("374");
      this.logger.log(stryMutAct_9fa48("375") ? "" : (stryCov_9fa48("375"), 'Running hourly analytics aggregation'));
      const courseIds = await this.enrollmentRepo.createQueryBuilder(stryMutAct_9fa48("376") ? "" : (stryCov_9fa48("376"), 'e')).select(stryMutAct_9fa48("377") ? "" : (stryCov_9fa48("377"), 'DISTINCT e.courseId'), stryMutAct_9fa48("378") ? "" : (stryCov_9fa48("378"), 'courseId')).getRawMany<{
        courseId: string;
      }>();
      for (const {
        courseId
      } of courseIds) {
        if (stryMutAct_9fa48("379")) {
          {}
        } else {
          stryCov_9fa48("379");
          try {
            if (stryMutAct_9fa48("380")) {
              {}
            } else {
              stryCov_9fa48("380");
              await this.aggregateCourse(courseId);
            }
          } catch (err: any) {
            if (stryMutAct_9fa48("381")) {
              {}
            } else {
              stryCov_9fa48("381");
              this.logger.error(stryMutAct_9fa48("382") ? `` : (stryCov_9fa48("382"), `Failed to aggregate course ${courseId}: ${err.message}`));
            }
          }
        }
      }
    }
  }
}