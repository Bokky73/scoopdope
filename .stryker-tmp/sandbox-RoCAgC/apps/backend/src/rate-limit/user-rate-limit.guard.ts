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
import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { UserRateLimitService } from './user-rate-limit.service';
@Injectable()
export class UserRateLimitGuard implements CanActivate {
  constructor(private rateLimitService: UserRateLimitService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (stryMutAct_9fa48("5852")) {
      {}
    } else {
      stryCov_9fa48("5852");
      const request = context.switchToHttp().getRequest();
      const response = context.switchToHttp().getResponse();

      // Skip rate limiting for trusted clients
      if (stryMutAct_9fa48("5855") ? request.user.isTrusted : stryMutAct_9fa48("5854") ? false : stryMutAct_9fa48("5853") ? true : (stryCov_9fa48("5853", "5854", "5855"), request.user?.isTrusted)) {
        if (stryMutAct_9fa48("5856")) {
          {}
        } else {
          stryCov_9fa48("5856");
          return stryMutAct_9fa48("5857") ? false : (stryCov_9fa48("5857"), true);
        }
      }

      // Skip if no user (public endpoints)
      if (stryMutAct_9fa48("5860") ? false : stryMutAct_9fa48("5859") ? true : stryMutAct_9fa48("5858") ? request.user?.id : (stryCov_9fa48("5858", "5859", "5860"), !(stryMutAct_9fa48("5861") ? request.user.id : (stryCov_9fa48("5861"), request.user?.id)))) {
        if (stryMutAct_9fa48("5862")) {
          {}
        } else {
          stryCov_9fa48("5862");
          return stryMutAct_9fa48("5863") ? false : (stryCov_9fa48("5863"), true);
        }
      }
      const userId = request.user.id;
      const role = stryMutAct_9fa48("5866") ? request.user.role && 'GUEST' : stryMutAct_9fa48("5865") ? false : stryMutAct_9fa48("5864") ? true : (stryCov_9fa48("5864", "5865", "5866"), request.user.role || (stryMutAct_9fa48("5867") ? "" : (stryCov_9fa48("5867"), 'GUEST')));
      const allowed = await this.rateLimitService.checkRateLimit(userId, role);
      if (stryMutAct_9fa48("5870") ? false : stryMutAct_9fa48("5869") ? true : stryMutAct_9fa48("5868") ? allowed : (stryCov_9fa48("5868", "5869", "5870"), !allowed)) {
        if (stryMutAct_9fa48("5871")) {
          {}
        } else {
          stryCov_9fa48("5871");
          const status = await this.rateLimitService.getRateLimitStatus(userId, role);
          response.set(stryMutAct_9fa48("5872") ? {} : (stryCov_9fa48("5872"), {
            'X-RateLimit-Limit': status.limit.toString(),
            'X-RateLimit-Remaining': status.remaining.toString(),
            'X-RateLimit-Reset': status.resetTime.toISOString()
          }));
          throw new HttpException(stryMutAct_9fa48("5873") ? {} : (stryCov_9fa48("5873"), {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: stryMutAct_9fa48("5874") ? "" : (stryCov_9fa48("5874"), 'Rate limit exceeded'),
            retryAfter: status.resetTime
          }), HttpStatus.TOO_MANY_REQUESTS, stryMutAct_9fa48("5875") ? {} : (stryCov_9fa48("5875"), {
            cause: new Error(stryMutAct_9fa48("5876") ? "" : (stryCov_9fa48("5876"), 'Rate limit exceeded'))
          }));
        }
      }
      const status = await this.rateLimitService.getRateLimitStatus(userId, role);
      response.set(stryMutAct_9fa48("5877") ? {} : (stryCov_9fa48("5877"), {
        'X-RateLimit-Limit': status.limit.toString(),
        'X-RateLimit-Remaining': status.remaining.toString(),
        'X-RateLimit-Reset': status.resetTime.toISOString()
      }));
      return stryMutAct_9fa48("5878") ? false : (stryCov_9fa48("5878"), true);
    }
  }
}