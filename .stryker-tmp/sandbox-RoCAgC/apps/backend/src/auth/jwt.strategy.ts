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
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService, private configService: ConfigService) {
    super(stryMutAct_9fa48("1241") ? {} : (stryCov_9fa48("1241"), {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: stryMutAct_9fa48("1242") ? true : (stryCov_9fa48("1242"), false),
      secretOrKey: configService.get<string>(stryMutAct_9fa48("1243") ? "" : (stryCov_9fa48("1243"), 'jwt.secret'))
    }));
  }
  async validate(payload: {
    sub: string;
    email: string;
  }) {
    if (stryMutAct_9fa48("1244")) {
      {}
    } else {
      stryCov_9fa48("1244");
      const user = await this.usersService.findById(payload.sub);
      return stryMutAct_9fa48("1245") ? {} : (stryCov_9fa48("1245"), {
        id: payload.sub,
        email: payload.email,
        role: stryMutAct_9fa48("1248") ? user?.role && 'student' : stryMutAct_9fa48("1247") ? false : stryMutAct_9fa48("1246") ? true : (stryCov_9fa48("1246", "1247", "1248"), (stryMutAct_9fa48("1249") ? user.role : (stryCov_9fa48("1249"), user?.role)) || (stryMutAct_9fa48("1250") ? "" : (stryCov_9fa48("1250"), 'student')))
      });
    }
  }
}