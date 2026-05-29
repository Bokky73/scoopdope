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
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UserRole } from '../users/entities/user.entity';
export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}
export const RATE_LIMIT_CONFIGS: Record<UserRole, RateLimitConfig> = stryMutAct_9fa48("5879") ? {} : (stryCov_9fa48("5879"), {
  [UserRole.ADMIN]: stryMutAct_9fa48("5880") ? {} : (stryCov_9fa48("5880"), {
    limit: 10000,
    windowMs: 60000
  }),
  [UserRole.INSTRUCTOR]: stryMutAct_9fa48("5881") ? {} : (stryCov_9fa48("5881"), {
    limit: 5000,
    windowMs: 60000
  }),
  [UserRole.STUDENT]: stryMutAct_9fa48("5882") ? {} : (stryCov_9fa48("5882"), {
    limit: 1000,
    windowMs: 60000
  }),
  [UserRole.GUEST]: stryMutAct_9fa48("5883") ? {} : (stryCov_9fa48("5883"), {
    limit: 100,
    windowMs: 60000
  })
});
@Injectable()
export class UserRateLimitService {
  constructor(@Inject(CACHE_MANAGER)
  private cacheManager: Cache) {}
  async checkRateLimit(userId: string, role: UserRole): Promise<boolean> {
    if (stryMutAct_9fa48("5884")) {
      {}
    } else {
      stryCov_9fa48("5884");
      const config = RATE_LIMIT_CONFIGS[role];
      const key = stryMutAct_9fa48("5885") ? `` : (stryCov_9fa48("5885"), `rate-limit:${userId}`);
      const current = await this.cacheManager.get<number>(key);
      const count = stryMutAct_9fa48("5886") ? (current || 0) - 1 : (stryCov_9fa48("5886"), (stryMutAct_9fa48("5889") ? current && 0 : stryMutAct_9fa48("5888") ? false : stryMutAct_9fa48("5887") ? true : (stryCov_9fa48("5887", "5888", "5889"), current || 0)) + 1);
      if (stryMutAct_9fa48("5893") ? count <= config.limit : stryMutAct_9fa48("5892") ? count >= config.limit : stryMutAct_9fa48("5891") ? false : stryMutAct_9fa48("5890") ? true : (stryCov_9fa48("5890", "5891", "5892", "5893"), count > config.limit)) {
        if (stryMutAct_9fa48("5894")) {
          {}
        } else {
          stryCov_9fa48("5894");
          return stryMutAct_9fa48("5895") ? true : (stryCov_9fa48("5895"), false);
        }
      }
      await this.cacheManager.set(key, count, config.windowMs);
      return stryMutAct_9fa48("5896") ? false : (stryCov_9fa48("5896"), true);
    }
  }
  async getRateLimitStatus(userId: string, role: UserRole) {
    if (stryMutAct_9fa48("5897")) {
      {}
    } else {
      stryCov_9fa48("5897");
      const config = RATE_LIMIT_CONFIGS[role];
      const key = stryMutAct_9fa48("5898") ? `` : (stryCov_9fa48("5898"), `rate-limit:${userId}`);
      const current = await this.cacheManager.get<number>(key);
      const count = stryMutAct_9fa48("5901") ? current && 0 : stryMutAct_9fa48("5900") ? false : stryMutAct_9fa48("5899") ? true : (stryCov_9fa48("5899", "5900", "5901"), current || 0);
      return stryMutAct_9fa48("5902") ? {} : (stryCov_9fa48("5902"), {
        limit: config.limit,
        current: count,
        remaining: stryMutAct_9fa48("5903") ? Math.min(0, config.limit - count) : (stryCov_9fa48("5903"), Math.max(0, stryMutAct_9fa48("5904") ? config.limit + count : (stryCov_9fa48("5904"), config.limit - count))),
        resetTime: new Date(stryMutAct_9fa48("5905") ? Date.now() - config.windowMs : (stryCov_9fa48("5905"), Date.now() + config.windowMs))
      });
    }
  }
  async resetUserLimit(userId: string): Promise<void> {
    if (stryMutAct_9fa48("5906")) {
      {}
    } else {
      stryCov_9fa48("5906");
      const key = stryMutAct_9fa48("5907") ? `` : (stryCov_9fa48("5907"), `rate-limit:${userId}`);
      await this.cacheManager.del(key);
    }
  }
  async isTrustedClient(clientId: string): Promise<boolean> {
    if (stryMutAct_9fa48("5908")) {
      {}
    } else {
      stryCov_9fa48("5908");
      const key = stryMutAct_9fa48("5909") ? `` : (stryCov_9fa48("5909"), `trusted-client:${clientId}`);
      return stryMutAct_9fa48("5910") ? !(await this.cacheManager.get(key)) : (stryCov_9fa48("5910"), !(stryMutAct_9fa48("5911") ? await this.cacheManager.get(key) : (stryCov_9fa48("5911"), !(await this.cacheManager.get(key)))));
    }
  }
  async addTrustedClient(clientId: string, ttlMs: number = 86400000): Promise<void> {
    if (stryMutAct_9fa48("5912")) {
      {}
    } else {
      stryCov_9fa48("5912");
      const key = stryMutAct_9fa48("5913") ? `` : (stryCov_9fa48("5913"), `trusted-client:${clientId}`);
      await this.cacheManager.set(key, stryMutAct_9fa48("5914") ? false : (stryCov_9fa48("5914"), true), ttlMs);
    }
  }
  async removeTrustedClient(clientId: string): Promise<void> {
    if (stryMutAct_9fa48("5915")) {
      {}
    } else {
      stryCov_9fa48("5915");
      const key = stryMutAct_9fa48("5916") ? `` : (stryCov_9fa48("5916"), `trusted-client:${clientId}`);
      await this.cacheManager.del(key);
    }
  }
}