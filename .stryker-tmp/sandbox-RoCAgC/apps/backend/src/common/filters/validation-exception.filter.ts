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
import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    if (stryMutAct_9fa48("1909")) {
      {}
    } else {
      stryCov_9fa48("1909");
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      let message = stryMutAct_9fa48("1910") ? "" : (stryCov_9fa48("1910"), 'Bad Request');
      let errors: any = null;
      if (stryMutAct_9fa48("1913") ? typeof exceptionResponse === 'object' || exceptionResponse !== null : stryMutAct_9fa48("1912") ? false : stryMutAct_9fa48("1911") ? true : (stryCov_9fa48("1911", "1912", "1913"), (stryMutAct_9fa48("1915") ? typeof exceptionResponse !== 'object' : stryMutAct_9fa48("1914") ? true : (stryCov_9fa48("1914", "1915"), typeof exceptionResponse === (stryMutAct_9fa48("1916") ? "" : (stryCov_9fa48("1916"), 'object')))) && (stryMutAct_9fa48("1918") ? exceptionResponse === null : stryMutAct_9fa48("1917") ? true : (stryCov_9fa48("1917", "1918"), exceptionResponse !== null)))) {
        if (stryMutAct_9fa48("1919")) {
          {}
        } else {
          stryCov_9fa48("1919");
          const response = exceptionResponse as any;
          message = stryMutAct_9fa48("1922") ? response.message && message : stryMutAct_9fa48("1921") ? false : stryMutAct_9fa48("1920") ? true : (stryCov_9fa48("1920", "1921", "1922"), response.message || message);
          errors = stryMutAct_9fa48("1925") ? response.errors && response.error : stryMutAct_9fa48("1924") ? false : stryMutAct_9fa48("1923") ? true : (stryCov_9fa48("1923", "1924", "1925"), response.errors || response.error);
        }
      }
      response.status(status).json(stryMutAct_9fa48("1926") ? {} : (stryCov_9fa48("1926"), {
        statusCode: status,
        message,
        errors,
        timestamp: new Date().toISOString()
      }));
    }
  }
}