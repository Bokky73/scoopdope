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
import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { StellarService } from '../stellar/stellar.service';
import { MetricsService } from '../metrics/metrics.service';
type LeaderboardEntry = {
  userId: string;
  username: string | null;
  email: string;
  stellarPublicKey: string;
  balance: string;
};
@Injectable()
export class LeaderboardService {
  private readonly cacheKey = stryMutAct_9fa48("4096") ? "" : (stryCov_9fa48("4096"), 'leaderboard:top50');
  /** 1-minute TTL in milliseconds */
  private readonly cacheTtlMs = 60_000;
  constructor(@InjectRepository(User)
  private readonly userRepo: Repository<User>, private readonly stellarService: StellarService, @Inject(CACHE_MANAGER)
  private readonly cacheManager: Cache, private readonly metricsService: MetricsService) {}
  async getTopUsers() {
    if (stryMutAct_9fa48("4097")) {
      {}
    } else {
      stryCov_9fa48("4097");
      const cached = await this.cacheManager.get<LeaderboardEntry[]>(this.cacheKey);
      if (stryMutAct_9fa48("4099") ? false : stryMutAct_9fa48("4098") ? true : (stryCov_9fa48("4098", "4099"), cached)) {
        if (stryMutAct_9fa48("4100")) {
          {}
        } else {
          stryCov_9fa48("4100");
          this.metricsService.incrementCacheHit(stryMutAct_9fa48("4101") ? "" : (stryCov_9fa48("4101"), 'leaderboard'));
          return cached;
        }
      }
      this.metricsService.incrementCacheMiss(stryMutAct_9fa48("4102") ? "" : (stryCov_9fa48("4102"), 'leaderboard'));
      const users = await this.userRepo.find(stryMutAct_9fa48("4103") ? {} : (stryCov_9fa48("4103"), {
        where: {},
        order: stryMutAct_9fa48("4104") ? {} : (stryCov_9fa48("4104"), {
          createdAt: stryMutAct_9fa48("4105") ? "" : (stryCov_9fa48("4105"), 'DESC')
        })
      }));
      const walletUsers = stryMutAct_9fa48("4106") ? users : (stryCov_9fa48("4106"), users.filter(stryMutAct_9fa48("4107") ? () => undefined : (stryCov_9fa48("4107"), user => stryMutAct_9fa48("4110") ? Boolean(user.stellarPublicKey) || !user.deletedAt : stryMutAct_9fa48("4109") ? false : stryMutAct_9fa48("4108") ? true : (stryCov_9fa48("4108", "4109", "4110"), Boolean(user.stellarPublicKey) && (stryMutAct_9fa48("4111") ? user.deletedAt : (stryCov_9fa48("4111"), !user.deletedAt))))));
      const balances = await Promise.all(walletUsers.map(async user => {
        if (stryMutAct_9fa48("4112")) {
          {}
        } else {
          stryCov_9fa48("4112");
          try {
            if (stryMutAct_9fa48("4113")) {
              {}
            } else {
              stryCov_9fa48("4113");
              const balance = await this.stellarService.getTokenBalance(user.stellarPublicKey);
              return stryMutAct_9fa48("4114") ? {} : (stryCov_9fa48("4114"), {
                userId: user.id,
                username: stryMutAct_9fa48("4115") ? user.username && null : (stryCov_9fa48("4115"), user.username ?? null),
                email: user.email,
                stellarPublicKey: user.stellarPublicKey,
                balance
              });
            }
          } catch {
            if (stryMutAct_9fa48("4116")) {
              {}
            } else {
              stryCov_9fa48("4116");
              return stryMutAct_9fa48("4117") ? {} : (stryCov_9fa48("4117"), {
                userId: user.id,
                username: stryMutAct_9fa48("4118") ? user.username && null : (stryCov_9fa48("4118"), user.username ?? null),
                email: user.email,
                stellarPublicKey: user.stellarPublicKey,
                balance: stryMutAct_9fa48("4119") ? "" : (stryCov_9fa48("4119"), '0')
              });
            }
          }
        }
      }));
      const leaderboard = stryMutAct_9fa48("4121") ? balances.slice(0, 50) : stryMutAct_9fa48("4120") ? balances.sort((a, b) => {
        const left = BigInt(a.balance);
        const right = BigInt(b.balance);
        if (left === right) {
          return a.email.localeCompare(b.email);
        }
        return right > left ? 1 : -1;
      }) : (stryCov_9fa48("4120", "4121"), balances.sort((a, b) => {
        if (stryMutAct_9fa48("4122")) {
          {}
        } else {
          stryCov_9fa48("4122");
          const left = BigInt(a.balance);
          const right = BigInt(b.balance);
          if (stryMutAct_9fa48("4125") ? left !== right : stryMutAct_9fa48("4124") ? false : stryMutAct_9fa48("4123") ? true : (stryCov_9fa48("4123", "4124", "4125"), left === right)) {
            if (stryMutAct_9fa48("4126")) {
              {}
            } else {
              stryCov_9fa48("4126");
              return a.email.localeCompare(b.email);
            }
          }
          return (stryMutAct_9fa48("4130") ? right <= left : stryMutAct_9fa48("4129") ? right >= left : stryMutAct_9fa48("4128") ? false : stryMutAct_9fa48("4127") ? true : (stryCov_9fa48("4127", "4128", "4129", "4130"), right > left)) ? 1 : stryMutAct_9fa48("4131") ? +1 : (stryCov_9fa48("4131"), -1);
        }
      }).slice(0, 50));
      await this.cacheManager.set(this.cacheKey, leaderboard, this.cacheTtlMs);
      return leaderboard;
    }
  }
}