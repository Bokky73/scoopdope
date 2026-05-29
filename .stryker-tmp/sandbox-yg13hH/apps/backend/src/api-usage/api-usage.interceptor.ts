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
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { ApiUsageService } from './api-usage.service';
@Injectable()
export class ApiUsageInterceptor implements NestInterceptor {
  constructor(private readonly apiUsageService: ApiUsageService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (stryMutAct_9fa48("424")) {
      {}
    } else {
      stryCov_9fa48("424");
      const req = context.switchToHttp().getRequest();
      const start = Date.now();
      return next.handle().pipe(tap(stryMutAct_9fa48("425") ? {} : (stryCov_9fa48("425"), {
        next: stryMutAct_9fa48("426") ? () => undefined : (stryCov_9fa48("426"), () => this.record(context, req, start)),
        error: stryMutAct_9fa48("427") ? () => undefined : (stryCov_9fa48("427"), () => this.record(context, req, start))
      })));
    }
  }
  private record(context: ExecutionContext, req: any, start: number): void {
    if (stryMutAct_9fa48("428")) {
      {}
    } else {
      stryCov_9fa48("428");
      const res = context.switchToHttp().getResponse();
      const responseTimeMs = stryMutAct_9fa48("429") ? Date.now() + start : (stryCov_9fa48("429"), Date.now() - start);
      this.apiUsageService.log(stryMutAct_9fa48("430") ? {} : (stryCov_9fa48("430"), {
        endpoint: stryMutAct_9fa48("431") ? req.route?.path && req.url : (stryCov_9fa48("431"), (stryMutAct_9fa48("432") ? req.route.path : (stryCov_9fa48("432"), req.route?.path)) ?? req.url),
        method: req.method,
        userId: stryMutAct_9fa48("433") ? req.user?.id && null : (stryCov_9fa48("433"), (stryMutAct_9fa48("434") ? req.user.id : (stryCov_9fa48("434"), req.user?.id)) ?? null),
        ip: req.ip,
        statusCode: res.statusCode,
        responseTimeMs,
        userAgent: stryMutAct_9fa48("435") ? req.headers?.['user-agent'] && null : (stryCov_9fa48("435"), (stryMutAct_9fa48("436") ? req.headers['user-agent'] : (stryCov_9fa48("436"), req.headers?.[stryMutAct_9fa48("437") ? "" : (stryCov_9fa48("437"), 'user-agent')])) ?? null)
      })).catch(() => {}); // fire-and-forget, never block the response
    }
  }
}