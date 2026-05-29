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
import { Injectable, PipeTransform, BadRequestException, ArgumentMetadata } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SanitizationPipe } from './sanitization.pipe';
@Injectable()
export class ValidateAndSanitizePipe implements PipeTransform {
  private sanitizationPipe = new SanitizationPipe();
  async transform(value: any, metadata: ArgumentMetadata) {
    if (stryMutAct_9fa48("2016")) {
      {}
    } else {
      stryCov_9fa48("2016");
      // First sanitize
      const sanitized = await this.sanitizationPipe.transform(value);

      // Then validate if DTO class is provided
      if (stryMutAct_9fa48("2019") ? !metadata.type && metadata.type === 'custom' : stryMutAct_9fa48("2018") ? false : stryMutAct_9fa48("2017") ? true : (stryCov_9fa48("2017", "2018", "2019"), (stryMutAct_9fa48("2020") ? metadata.type : (stryCov_9fa48("2020"), !metadata.type)) || (stryMutAct_9fa48("2022") ? metadata.type !== 'custom' : stryMutAct_9fa48("2021") ? false : (stryCov_9fa48("2021", "2022"), metadata.type === (stryMutAct_9fa48("2023") ? "" : (stryCov_9fa48("2023"), 'custom')))))) {
        if (stryMutAct_9fa48("2024")) {
          {}
        } else {
          stryCov_9fa48("2024");
          return sanitized;
        }
      }
      const object = plainToInstance(metadata.metatype, sanitized);
      const errors = await validate(object, stryMutAct_9fa48("2025") ? {} : (stryCov_9fa48("2025"), {
        skipMissingProperties: stryMutAct_9fa48("2026") ? true : (stryCov_9fa48("2026"), false),
        whitelist: stryMutAct_9fa48("2027") ? false : (stryCov_9fa48("2027"), true),
        forbidNonWhitelisted: stryMutAct_9fa48("2028") ? false : (stryCov_9fa48("2028"), true)
      }));
      if (stryMutAct_9fa48("2032") ? errors.length <= 0 : stryMutAct_9fa48("2031") ? errors.length >= 0 : stryMutAct_9fa48("2030") ? false : stryMutAct_9fa48("2029") ? true : (stryCov_9fa48("2029", "2030", "2031", "2032"), errors.length > 0)) {
        if (stryMutAct_9fa48("2033")) {
          {}
        } else {
          stryCov_9fa48("2033");
          const messages = errors.map(error => {
            if (stryMutAct_9fa48("2034")) {
              {}
            } else {
              stryCov_9fa48("2034");
              const constraints = Object.values(stryMutAct_9fa48("2037") ? error.constraints && {} : stryMutAct_9fa48("2036") ? false : stryMutAct_9fa48("2035") ? true : (stryCov_9fa48("2035", "2036", "2037"), error.constraints || {}));
              return stryMutAct_9fa48("2038") ? `` : (stryCov_9fa48("2038"), `${error.property}: ${constraints.join(stryMutAct_9fa48("2039") ? "" : (stryCov_9fa48("2039"), ', '))}`);
            }
          }).join(stryMutAct_9fa48("2040") ? "" : (stryCov_9fa48("2040"), '; '));
          throw new BadRequestException(stryMutAct_9fa48("2041") ? {} : (stryCov_9fa48("2041"), {
            statusCode: 400,
            message: stryMutAct_9fa48("2042") ? "" : (stryCov_9fa48("2042"), 'Validation failed'),
            errors: messages
          }));
        }
      }
      return object;
    }
  }
}