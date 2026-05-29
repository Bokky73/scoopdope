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
import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject } from '@nestjs/common';
@Injectable({
  scope: Scope.TRANSIENT
})
export class CustomLoggerService implements LoggerService {
  private context?: string;
  constructor(@Inject(WINSTON_MODULE_PROVIDER)
  private readonly logger: Logger) {}
  setContext(context: string): void {
    if (stryMutAct_9fa48("1942")) {
      {}
    } else {
      stryCov_9fa48("1942");
      this.context = context;
    }
  }
  log(message: any, context?: string): void {
    if (stryMutAct_9fa48("1943")) {
      {}
    } else {
      stryCov_9fa48("1943");
      this.logger.info(message, stryMutAct_9fa48("1944") ? {} : (stryCov_9fa48("1944"), {
        context: stryMutAct_9fa48("1947") ? context && this.context : stryMutAct_9fa48("1946") ? false : stryMutAct_9fa48("1945") ? true : (stryCov_9fa48("1945", "1946", "1947"), context || this.context)
      }));
    }
  }
  error(message: any, trace?: string, context?: string): void {
    if (stryMutAct_9fa48("1948")) {
      {}
    } else {
      stryCov_9fa48("1948");
      this.logger.error(message, stryMutAct_9fa48("1949") ? {} : (stryCov_9fa48("1949"), {
        context: stryMutAct_9fa48("1952") ? context && this.context : stryMutAct_9fa48("1951") ? false : stryMutAct_9fa48("1950") ? true : (stryCov_9fa48("1950", "1951", "1952"), context || this.context),
        trace
      }));
    }
  }
  warn(message: any, context?: string): void {
    if (stryMutAct_9fa48("1953")) {
      {}
    } else {
      stryCov_9fa48("1953");
      this.logger.warn(message, stryMutAct_9fa48("1954") ? {} : (stryCov_9fa48("1954"), {
        context: stryMutAct_9fa48("1957") ? context && this.context : stryMutAct_9fa48("1956") ? false : stryMutAct_9fa48("1955") ? true : (stryCov_9fa48("1955", "1956", "1957"), context || this.context)
      }));
    }
  }
  debug(message: any, context?: string): void {
    if (stryMutAct_9fa48("1958")) {
      {}
    } else {
      stryCov_9fa48("1958");
      this.logger.debug(message, stryMutAct_9fa48("1959") ? {} : (stryCov_9fa48("1959"), {
        context: stryMutAct_9fa48("1962") ? context && this.context : stryMutAct_9fa48("1961") ? false : stryMutAct_9fa48("1960") ? true : (stryCov_9fa48("1960", "1961", "1962"), context || this.context)
      }));
    }
  }
  verbose(message: any, context?: string): void {
    if (stryMutAct_9fa48("1963")) {
      {}
    } else {
      stryCov_9fa48("1963");
      this.logger.verbose(message, stryMutAct_9fa48("1964") ? {} : (stryCov_9fa48("1964"), {
        context: stryMutAct_9fa48("1967") ? context && this.context : stryMutAct_9fa48("1966") ? false : stryMutAct_9fa48("1965") ? true : (stryCov_9fa48("1965", "1966", "1967"), context || this.context)
      }));
    }
  }

  // Additional Winston-specific methods
  info(message: any, context?: string): void {
    if (stryMutAct_9fa48("1968")) {
      {}
    } else {
      stryCov_9fa48("1968");
      this.logger.info(message, stryMutAct_9fa48("1969") ? {} : (stryCov_9fa48("1969"), {
        context: stryMutAct_9fa48("1972") ? context && this.context : stryMutAct_9fa48("1971") ? false : stryMutAct_9fa48("1970") ? true : (stryCov_9fa48("1970", "1971", "1972"), context || this.context)
      }));
    }
  }

  // Create child logger with context
  child(context: string): CustomLoggerService {
    if (stryMutAct_9fa48("1973")) {
      {}
    } else {
      stryCov_9fa48("1973");
      const childLogger = new CustomLoggerService(this.logger);
      childLogger.setContext(context);
      return childLogger;
    }
  }
}