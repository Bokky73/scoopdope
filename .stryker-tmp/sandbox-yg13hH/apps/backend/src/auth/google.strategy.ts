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
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
export interface GoogleProfile {
  id: string;
  email: string;
  displayName: string;
  picture: string;
}
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, stryMutAct_9fa48("1219") ? "" : (stryCov_9fa48("1219"), 'google')) {
  constructor(private configService: ConfigService) {
    super(stryMutAct_9fa48("1220") ? {} : (stryCov_9fa48("1220"), {
      clientID: configService.get<string>(stryMutAct_9fa48("1221") ? "" : (stryCov_9fa48("1221"), 'google.clientId')),
      clientSecret: configService.get<string>(stryMutAct_9fa48("1222") ? "" : (stryCov_9fa48("1222"), 'google.clientSecret')),
      callbackURL: configService.get<string>(stryMutAct_9fa48("1223") ? "" : (stryCov_9fa48("1223"), 'google.callbackUrl')),
      scope: stryMutAct_9fa48("1224") ? [] : (stryCov_9fa48("1224"), [stryMutAct_9fa48("1225") ? "" : (stryCov_9fa48("1225"), 'email'), stryMutAct_9fa48("1226") ? "" : (stryCov_9fa48("1226"), 'profile')])
    }));
  }
  validate(_accessToken: string, _refreshToken: string, profile: any, done: VerifyCallback) {
    if (stryMutAct_9fa48("1227")) {
      {}
    } else {
      stryCov_9fa48("1227");
      const googleProfile: GoogleProfile = stryMutAct_9fa48("1228") ? {} : (stryCov_9fa48("1228"), {
        id: profile.id,
        email: stryMutAct_9fa48("1230") ? profile.emails[0]?.value : stryMutAct_9fa48("1229") ? profile.emails?.[0].value : (stryCov_9fa48("1229", "1230"), profile.emails?.[0]?.value),
        displayName: profile.displayName,
        picture: stryMutAct_9fa48("1232") ? profile.photos[0]?.value : stryMutAct_9fa48("1231") ? profile.photos?.[0].value : (stryCov_9fa48("1231", "1232"), profile.photos?.[0]?.value)
      });
      done(null, googleProfile);
    }
  }
}