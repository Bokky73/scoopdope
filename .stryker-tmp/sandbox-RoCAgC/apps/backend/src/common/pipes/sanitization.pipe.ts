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
import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import sanitizeHtml from 'sanitize-html';
@Injectable()
export class SanitizationPipe implements PipeTransform {
  async transform(value: any) {
    if (stryMutAct_9fa48("1974")) {
      {}
    } else {
      stryCov_9fa48("1974");
      if (stryMutAct_9fa48("1977") ? !value && typeof value !== 'object' : stryMutAct_9fa48("1976") ? false : stryMutAct_9fa48("1975") ? true : (stryCov_9fa48("1975", "1976", "1977"), (stryMutAct_9fa48("1978") ? value : (stryCov_9fa48("1978"), !value)) || (stryMutAct_9fa48("1980") ? typeof value === 'object' : stryMutAct_9fa48("1979") ? false : (stryCov_9fa48("1979", "1980"), typeof value !== (stryMutAct_9fa48("1981") ? "" : (stryCov_9fa48("1981"), 'object')))))) {
        if (stryMutAct_9fa48("1982")) {
          {}
        } else {
          stryCov_9fa48("1982");
          return value;
        }
      }

      // Recursively sanitize string values
      const sanitized = this.sanitizeObject(value);
      return sanitized;
    }
  }
  private sanitizeObject(obj: any): any {
    if (stryMutAct_9fa48("1983")) {
      {}
    } else {
      stryCov_9fa48("1983");
      if (stryMutAct_9fa48("1986") ? typeof obj !== 'string' : stryMutAct_9fa48("1985") ? false : stryMutAct_9fa48("1984") ? true : (stryCov_9fa48("1984", "1985", "1986"), typeof obj === (stryMutAct_9fa48("1987") ? "" : (stryCov_9fa48("1987"), 'string')))) {
        if (stryMutAct_9fa48("1988")) {
          {}
        } else {
          stryCov_9fa48("1988");
          return this.sanitizeString(obj);
        }
      }
      if (stryMutAct_9fa48("1990") ? false : stryMutAct_9fa48("1989") ? true : (stryCov_9fa48("1989", "1990"), Array.isArray(obj))) {
        if (stryMutAct_9fa48("1991")) {
          {}
        } else {
          stryCov_9fa48("1991");
          return obj.map(stryMutAct_9fa48("1992") ? () => undefined : (stryCov_9fa48("1992"), item => this.sanitizeObject(item)));
        }
      }
      if (stryMutAct_9fa48("1995") ? obj !== null || typeof obj === 'object' : stryMutAct_9fa48("1994") ? false : stryMutAct_9fa48("1993") ? true : (stryCov_9fa48("1993", "1994", "1995"), (stryMutAct_9fa48("1997") ? obj === null : stryMutAct_9fa48("1996") ? true : (stryCov_9fa48("1996", "1997"), obj !== null)) && (stryMutAct_9fa48("1999") ? typeof obj !== 'object' : stryMutAct_9fa48("1998") ? true : (stryCov_9fa48("1998", "1999"), typeof obj === (stryMutAct_9fa48("2000") ? "" : (stryCov_9fa48("2000"), 'object')))))) {
        if (stryMutAct_9fa48("2001")) {
          {}
        } else {
          stryCov_9fa48("2001");
          const sanitized: any = {};
          for (const key in obj) {
            if (stryMutAct_9fa48("2002")) {
              {}
            } else {
              stryCov_9fa48("2002");
              if (stryMutAct_9fa48("2004") ? false : stryMutAct_9fa48("2003") ? true : (stryCov_9fa48("2003", "2004"), Object.prototype.hasOwnProperty.call(obj, key))) {
                if (stryMutAct_9fa48("2005")) {
                  {}
                } else {
                  stryCov_9fa48("2005");
                  sanitized[key] = this.sanitizeObject(obj[key]);
                }
              }
            }
          }
          return sanitized;
        }
      }
      return obj;
    }
  }
  private sanitizeString(str: string): string {
    if (stryMutAct_9fa48("2006")) {
      {}
    } else {
      stryCov_9fa48("2006");
      if (stryMutAct_9fa48("2009") ? typeof str === 'string' : stryMutAct_9fa48("2008") ? false : stryMutAct_9fa48("2007") ? true : (stryCov_9fa48("2007", "2008", "2009"), typeof str !== (stryMutAct_9fa48("2010") ? "" : (stryCov_9fa48("2010"), 'string')))) {
        if (stryMutAct_9fa48("2011")) {
          {}
        } else {
          stryCov_9fa48("2011");
          return str;
        }
      }

      // Remove null bytes
      str = str.replace(/\0/g, stryMutAct_9fa48("2012") ? "Stryker was here!" : (stryCov_9fa48("2012"), ''));

      // Trim whitespace
      str = stryMutAct_9fa48("2013") ? str : (stryCov_9fa48("2013"), str.trim());

      // Sanitize HTML
      str = sanitizeHtml(str, stryMutAct_9fa48("2014") ? {} : (stryCov_9fa48("2014"), {
        allowedTags: stryMutAct_9fa48("2015") ? ["Stryker was here"] : (stryCov_9fa48("2015"), []),
        allowedAttributes: {}
      }));
      return str;
    }
  }
}