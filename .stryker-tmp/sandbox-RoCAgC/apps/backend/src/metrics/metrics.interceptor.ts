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
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from './metrics.service';
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (stryMutAct_9fa48("4521")) {
      {}
    } else {
      stryCov_9fa48("4521");
      const request = context.switchToHttp().getRequest();
      const response = context.switchToHttp().getResponse();
      return next.handle().pipe(tap(() => {
        if (stryMutAct_9fa48("4522")) {
          {}
        } else {
          stryCov_9fa48("4522");
          this.metricsService.incrementHttpRequests(request.method, stryMutAct_9fa48("4525") ? request.route?.path && request.url : stryMutAct_9fa48("4524") ? false : stryMutAct_9fa48("4523") ? true : (stryCov_9fa48("4523", "4524", "4525"), (stryMutAct_9fa48("4526") ? request.route.path : (stryCov_9fa48("4526"), request.route?.path)) || request.url), response.statusCode);
        }
      }));
    }
  }
}