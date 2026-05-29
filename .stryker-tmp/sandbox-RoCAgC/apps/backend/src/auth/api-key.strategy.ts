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
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { Repository } from 'typeorm';
import { ApiKey } from './api-key.entity';
import * as crypto from 'crypto';
@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy, stryMutAct_9fa48("708") ? "" : (stryCov_9fa48("708"), 'api-key')) {
  constructor(@InjectRepository(ApiKey)
  private apiKeyRepo: Repository<ApiKey>) {
    super(stryMutAct_9fa48("709") ? {} : (stryCov_9fa48("709"), {
      header: stryMutAct_9fa48("710") ? "" : (stryCov_9fa48("710"), 'X-API-KEY'),
      prefix: stryMutAct_9fa48("711") ? "Stryker was here!" : (stryCov_9fa48("711"), '')
    }), stryMutAct_9fa48("712") ? true : (stryCov_9fa48("712"), false),
    // change to false if we don't need req to be passed to verify
    async (apiKey: string, done: (error: Error | null, user?: any) => void) => {
      if (stryMutAct_9fa48("713")) {
        {}
      } else {
        stryCov_9fa48("713");
        const hash = crypto.createHash(stryMutAct_9fa48("714") ? "" : (stryCov_9fa48("714"), 'sha256')).update(apiKey).digest(stryMutAct_9fa48("715") ? "" : (stryCov_9fa48("715"), 'hex'));
        const key = await this.apiKeyRepo.findOne(stryMutAct_9fa48("716") ? {} : (stryCov_9fa48("716"), {
          where: stryMutAct_9fa48("717") ? {} : (stryCov_9fa48("717"), {
            keyHash: hash,
            isActive: stryMutAct_9fa48("718") ? false : (stryCov_9fa48("718"), true)
          }),
          relations: stryMutAct_9fa48("719") ? [] : (stryCov_9fa48("719"), [stryMutAct_9fa48("720") ? "" : (stryCov_9fa48("720"), 'user')])
        }));
        if (stryMutAct_9fa48("723") ? false : stryMutAct_9fa48("722") ? true : stryMutAct_9fa48("721") ? key : (stryCov_9fa48("721", "722", "723"), !key)) {
          if (stryMutAct_9fa48("724")) {
            {}
          } else {
            stryCov_9fa48("724");
            return done(new UnauthorizedException(), null);
          }
        }

        // Update lastUsedAt in the background
        this.apiKeyRepo.update(key.id, stryMutAct_9fa48("725") ? {} : (stryCov_9fa48("725"), {
          lastUsedAt: new Date()
        })).catch(() => {});
        return done(null, key.user);
      }
    });
  }
}