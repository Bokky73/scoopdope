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
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    if (stryMutAct_9fa48("1899")) {
      {}
    } else {
      stryCov_9fa48("1899");
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
      const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      const message = exception instanceof HttpException ? exception.getResponse() : stryMutAct_9fa48("1900") ? "" : (stryCov_9fa48("1900"), 'Internal server error');
      const errorResponse = stryMutAct_9fa48("1901") ? {} : (stryCov_9fa48("1901"), {
        statusCode: status,
        message: (stryMutAct_9fa48("1904") ? typeof message !== 'string' : stryMutAct_9fa48("1903") ? false : stryMutAct_9fa48("1902") ? true : (stryCov_9fa48("1902", "1903", "1904"), typeof message === (stryMutAct_9fa48("1905") ? "" : (stryCov_9fa48("1905"), 'string')))) ? message : stryMutAct_9fa48("1908") ? (message as any).message && message : stryMutAct_9fa48("1907") ? false : stryMutAct_9fa48("1906") ? true : (stryCov_9fa48("1906", "1907", "1908"), (message as any).message || message),
        timestamp: new Date().toISOString(),
        path: request.url
      });
      response.status(status).json(errorResponse);
    }
  }
}