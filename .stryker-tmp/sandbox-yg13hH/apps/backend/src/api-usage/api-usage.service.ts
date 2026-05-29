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
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiUsageLog } from './api-usage-log.entity';
@Injectable()
export class ApiUsageService {
  constructor(@InjectRepository(ApiUsageLog)
  private logRepo: Repository<ApiUsageLog>) {}
  async log(data: Partial<ApiUsageLog>): Promise<void> {
    if (stryMutAct_9fa48("438")) {
      {}
    } else {
      stryCov_9fa48("438");
      await this.logRepo.save(this.logRepo.create(data));
    }
  }
  async getAggregatedByEndpoint(from: Date, to: Date) {
    if (stryMutAct_9fa48("439")) {
      {}
    } else {
      stryCov_9fa48("439");
      return this.logRepo.createQueryBuilder(stryMutAct_9fa48("440") ? "" : (stryCov_9fa48("440"), 'log')).select(stryMutAct_9fa48("441") ? "" : (stryCov_9fa48("441"), 'log.endpoint'), stryMutAct_9fa48("442") ? "" : (stryCov_9fa48("442"), 'endpoint')).addSelect(stryMutAct_9fa48("443") ? "" : (stryCov_9fa48("443"), 'log.method'), stryMutAct_9fa48("444") ? "" : (stryCov_9fa48("444"), 'method')).addSelect(stryMutAct_9fa48("445") ? "" : (stryCov_9fa48("445"), 'COUNT(*)'), stryMutAct_9fa48("446") ? "" : (stryCov_9fa48("446"), 'requestCount')).addSelect(stryMutAct_9fa48("447") ? "" : (stryCov_9fa48("447"), 'AVG(log.responseTimeMs)'), stryMutAct_9fa48("448") ? "" : (stryCov_9fa48("448"), 'avgResponseTimeMs')).addSelect(stryMutAct_9fa48("449") ? "" : (stryCov_9fa48("449"), 'SUM(CASE WHEN log.statusCode >= 400 THEN 1 ELSE 0 END)'), stryMutAct_9fa48("450") ? "" : (stryCov_9fa48("450"), 'errorCount')).where(stryMutAct_9fa48("451") ? "" : (stryCov_9fa48("451"), 'log.createdAt BETWEEN :from AND :to'), stryMutAct_9fa48("452") ? {} : (stryCov_9fa48("452"), {
        from,
        to
      })).groupBy(stryMutAct_9fa48("453") ? "" : (stryCov_9fa48("453"), 'log.endpoint')).addGroupBy(stryMutAct_9fa48("454") ? "" : (stryCov_9fa48("454"), 'log.method')).orderBy(stryMutAct_9fa48("455") ? "" : (stryCov_9fa48("455"), '"requestCount"'), stryMutAct_9fa48("456") ? "" : (stryCov_9fa48("456"), 'DESC')).getRawMany();
    }
  }
  async getAggregatedByUser(from: Date, to: Date) {
    if (stryMutAct_9fa48("457")) {
      {}
    } else {
      stryCov_9fa48("457");
      return this.logRepo.createQueryBuilder(stryMutAct_9fa48("458") ? "" : (stryCov_9fa48("458"), 'log')).select(stryMutAct_9fa48("459") ? "" : (stryCov_9fa48("459"), 'log.userId'), stryMutAct_9fa48("460") ? "" : (stryCov_9fa48("460"), 'userId')).addSelect(stryMutAct_9fa48("461") ? "" : (stryCov_9fa48("461"), 'COUNT(*)'), stryMutAct_9fa48("462") ? "" : (stryCov_9fa48("462"), 'requestCount')).addSelect(stryMutAct_9fa48("463") ? "" : (stryCov_9fa48("463"), 'AVG(log.responseTimeMs)'), stryMutAct_9fa48("464") ? "" : (stryCov_9fa48("464"), 'avgResponseTimeMs')).where(stryMutAct_9fa48("465") ? "" : (stryCov_9fa48("465"), 'log.createdAt BETWEEN :from AND :to'), stryMutAct_9fa48("466") ? {} : (stryCov_9fa48("466"), {
        from,
        to
      })).andWhere(stryMutAct_9fa48("467") ? "" : (stryCov_9fa48("467"), 'log.userId IS NOT NULL')).groupBy(stryMutAct_9fa48("468") ? "" : (stryCov_9fa48("468"), 'log.userId')).orderBy(stryMutAct_9fa48("469") ? "" : (stryCov_9fa48("469"), '"requestCount"'), stryMutAct_9fa48("470") ? "" : (stryCov_9fa48("470"), 'DESC')).getRawMany();
    }
  }
  async getAggregatedByTime(from: Date, to: Date, granularity: 'hour' | 'day' = stryMutAct_9fa48("471") ? "" : (stryCov_9fa48("471"), 'hour')) {
    if (stryMutAct_9fa48("472")) {
      {}
    } else {
      stryCov_9fa48("472");
      const trunc = (stryMutAct_9fa48("475") ? granularity !== 'hour' : stryMutAct_9fa48("474") ? false : stryMutAct_9fa48("473") ? true : (stryCov_9fa48("473", "474", "475"), granularity === (stryMutAct_9fa48("476") ? "" : (stryCov_9fa48("476"), 'hour')))) ? stryMutAct_9fa48("477") ? "" : (stryCov_9fa48("477"), 'hour') : stryMutAct_9fa48("478") ? "" : (stryCov_9fa48("478"), 'day');
      return this.logRepo.createQueryBuilder(stryMutAct_9fa48("479") ? "" : (stryCov_9fa48("479"), 'log')).select(stryMutAct_9fa48("480") ? `` : (stryCov_9fa48("480"), `DATE_TRUNC('${trunc}', log.createdAt)`), stryMutAct_9fa48("481") ? "" : (stryCov_9fa48("481"), 'period')).addSelect(stryMutAct_9fa48("482") ? "" : (stryCov_9fa48("482"), 'COUNT(*)'), stryMutAct_9fa48("483") ? "" : (stryCov_9fa48("483"), 'requestCount')).where(stryMutAct_9fa48("484") ? "" : (stryCov_9fa48("484"), 'log.createdAt BETWEEN :from AND :to'), stryMutAct_9fa48("485") ? {} : (stryCov_9fa48("485"), {
        from,
        to
      })).groupBy(stryMutAct_9fa48("486") ? "" : (stryCov_9fa48("486"), 'period')).orderBy(stryMutAct_9fa48("487") ? "" : (stryCov_9fa48("487"), 'period'), stryMutAct_9fa48("488") ? "" : (stryCov_9fa48("488"), 'ASC')).getRawMany();
    }
  }
  async getDashboard(from: Date, to: Date) {
    if (stryMutAct_9fa48("489")) {
      {}
    } else {
      stryCov_9fa48("489");
      const [byEndpoint, byUser, byTime, totals] = await Promise.all(stryMutAct_9fa48("490") ? [] : (stryCov_9fa48("490"), [this.getAggregatedByEndpoint(from, to), this.getAggregatedByUser(from, to), this.getAggregatedByTime(from, to, stryMutAct_9fa48("491") ? "" : (stryCov_9fa48("491"), 'day')), this.logRepo.createQueryBuilder(stryMutAct_9fa48("492") ? "" : (stryCov_9fa48("492"), 'log')).select(stryMutAct_9fa48("493") ? "" : (stryCov_9fa48("493"), 'COUNT(*)'), stryMutAct_9fa48("494") ? "" : (stryCov_9fa48("494"), 'totalRequests')).addSelect(stryMutAct_9fa48("495") ? "" : (stryCov_9fa48("495"), 'AVG(log.responseTimeMs)'), stryMutAct_9fa48("496") ? "" : (stryCov_9fa48("496"), 'avgResponseTimeMs')).addSelect(stryMutAct_9fa48("497") ? "" : (stryCov_9fa48("497"), 'SUM(CASE WHEN log.statusCode >= 400 THEN 1 ELSE 0 END)'), stryMutAct_9fa48("498") ? "" : (stryCov_9fa48("498"), 'totalErrors')).where(stryMutAct_9fa48("499") ? "" : (stryCov_9fa48("499"), 'log.createdAt BETWEEN :from AND :to'), stryMutAct_9fa48("500") ? {} : (stryCov_9fa48("500"), {
        from,
        to
      })).getRawOne()]));
      return stryMutAct_9fa48("501") ? {} : (stryCov_9fa48("501"), {
        totals,
        byEndpoint: stryMutAct_9fa48("502") ? byEndpoint : (stryCov_9fa48("502"), byEndpoint.slice(0, 20)),
        byUser: stryMutAct_9fa48("503") ? byUser : (stryCov_9fa48("503"), byUser.slice(0, 20)),
        byTime
      });
    }
  }
  async checkUsageAlerts(thresholdPerMinute = 100): Promise<{
    alert: boolean;
    count: number;
  }> {
    if (stryMutAct_9fa48("504")) {
      {}
    } else {
      stryCov_9fa48("504");
      const since = new Date(stryMutAct_9fa48("505") ? Date.now() + 60_000 : (stryCov_9fa48("505"), Date.now() - 60_000));
      const count = await this.logRepo.createQueryBuilder(stryMutAct_9fa48("506") ? "" : (stryCov_9fa48("506"), 'log')).where(stryMutAct_9fa48("507") ? "" : (stryCov_9fa48("507"), 'log.createdAt > :since'), stryMutAct_9fa48("508") ? {} : (stryCov_9fa48("508"), {
        since
      })).getCount();
      return stryMutAct_9fa48("509") ? {} : (stryCov_9fa48("509"), {
        alert: stryMutAct_9fa48("513") ? count <= thresholdPerMinute : stryMutAct_9fa48("512") ? count >= thresholdPerMinute : stryMutAct_9fa48("511") ? false : stryMutAct_9fa48("510") ? true : (stryCov_9fa48("510", "511", "512", "513"), count > thresholdPerMinute),
        count
      });
    }
  }
  async getUserRequestCount(userId: string, windowMs: number): Promise<number> {
    if (stryMutAct_9fa48("514")) {
      {}
    } else {
      stryCov_9fa48("514");
      const since = new Date(stryMutAct_9fa48("515") ? Date.now() + windowMs : (stryCov_9fa48("515"), Date.now() - windowMs));
      return this.logRepo.createQueryBuilder(stryMutAct_9fa48("516") ? "" : (stryCov_9fa48("516"), 'log')).where(stryMutAct_9fa48("517") ? "" : (stryCov_9fa48("517"), 'log.userId = :userId'), stryMutAct_9fa48("518") ? {} : (stryCov_9fa48("518"), {
        userId
      })).andWhere(stryMutAct_9fa48("519") ? "" : (stryCov_9fa48("519"), 'log.createdAt > :since'), stryMutAct_9fa48("520") ? {} : (stryCov_9fa48("520"), {
        since
      })).getCount();
    }
  }
}