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
import { CustomLoggerService } from './logger.service';

/**
 * Example service demonstrating how to use the Winston logger
 * This file shows the proper way to inject and use the logger in services
 */
@Injectable()
export class ExampleService {
  private readonly logger = new CustomLoggerService(null as any);
  constructor() {
    if (stryMutAct_9fa48("1930")) {
      {}
    } else {
      stryCov_9fa48("1930");
      this.logger.setContext(stryMutAct_9fa48("1931") ? "" : (stryCov_9fa48("1931"), 'ExampleService'));
    }
  }
  async exampleMethod() {
    if (stryMutAct_9fa48("1932")) {
      {}
    } else {
      stryCov_9fa48("1932");
      // Different log levels
      this.logger.debug(stryMutAct_9fa48("1933") ? "" : (stryCov_9fa48("1933"), 'Debug message with context'));
      this.logger.info(stryMutAct_9fa48("1934") ? "" : (stryCov_9fa48("1934"), 'Info message - operation started'));
      this.logger.warn(stryMutAct_9fa48("1935") ? "" : (stryCov_9fa48("1935"), 'Warning message - something might be wrong'));
      try {
        if (stryMutAct_9fa48("1936")) {
          {}
        } else {
          stryCov_9fa48("1936");
          // Simulate some operation
          throw new Error(stryMutAct_9fa48("1937") ? "" : (stryCov_9fa48("1937"), 'Example error for demonstration'));
        }
      } catch (error) {
        if (stryMutAct_9fa48("1938")) {
          {}
        } else {
          stryCov_9fa48("1938");
          this.logger.error(stryMutAct_9fa48("1939") ? "" : (stryCov_9fa48("1939"), 'Error occurred in example method'), error.stack);
        }
      }

      // Using child logger for specific context
      const childLogger = this.logger.child(stryMutAct_9fa48("1940") ? "" : (stryCov_9fa48("1940"), 'ChildContext'));
      childLogger.info(stryMutAct_9fa48("1941") ? "" : (stryCov_9fa48("1941"), 'Message from child logger'));
    }
  }
}