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
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    if (stryMutAct_9fa48("1253")) {
      {}
    } else {
      stryCov_9fa48("1253");
      const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, stryMutAct_9fa48("1254") ? [] : (stryCov_9fa48("1254"), [context.getHandler(), context.getClass()]));
      if (stryMutAct_9fa48("1257") ? !requiredRoles && requiredRoles.length === 0 : stryMutAct_9fa48("1256") ? false : stryMutAct_9fa48("1255") ? true : (stryCov_9fa48("1255", "1256", "1257"), (stryMutAct_9fa48("1258") ? requiredRoles : (stryCov_9fa48("1258"), !requiredRoles)) || (stryMutAct_9fa48("1260") ? requiredRoles.length !== 0 : stryMutAct_9fa48("1259") ? false : (stryCov_9fa48("1259", "1260"), requiredRoles.length === 0)))) {
        if (stryMutAct_9fa48("1261")) {
          {}
        } else {
          stryCov_9fa48("1261");
          return stryMutAct_9fa48("1262") ? false : (stryCov_9fa48("1262"), true);
        }
      }
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      if (stryMutAct_9fa48("1265") ? !user && !user.role : stryMutAct_9fa48("1264") ? false : stryMutAct_9fa48("1263") ? true : (stryCov_9fa48("1263", "1264", "1265"), (stryMutAct_9fa48("1266") ? user : (stryCov_9fa48("1266"), !user)) || (stryMutAct_9fa48("1267") ? user.role : (stryCov_9fa48("1267"), !user.role)))) return stryMutAct_9fa48("1268") ? true : (stryCov_9fa48("1268"), false);
      return requiredRoles.includes(user.role);
    }
  }
}