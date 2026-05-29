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
import { Controller, Post, Get, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AccessControlService } from './access-control.service';
import { AccessRole } from './course-access-control.entity';
@Controller('v1/access-control')
@UseGuards(JwtAuthGuard)
export class AccessControlController {
  constructor(private accessControlService: AccessControlService) {}
  @Post('grant')
  async grantAccess(@Body()
  data: any) {
    if (stryMutAct_9fa48("0")) {
      {}
    } else {
      stryCov_9fa48("0");
      return this.accessControlService.grantAccess(data.courseId, data.userId, data.role as AccessRole, data.subscriptionExpiryDate, data.allowedIpAddresses);
    }
  }
  @Post('check')
  async checkAccess(@Body()
  data: any, @Req()
  req: any) {
    if (stryMutAct_9fa48("1")) {
      {}
    } else {
      stryCov_9fa48("1");
      const ipAddress = stryMutAct_9fa48("4") ? req.ip && req.connection.remoteAddress : stryMutAct_9fa48("3") ? false : stryMutAct_9fa48("2") ? true : (stryCov_9fa48("2", "3", "4"), req.ip || req.connection.remoteAddress);
      return this.accessControlService.checkAccess(data.courseId, data.userId, ipAddress);
    }
  }
  @Delete(':courseId/users/:userId')
  async revokeAccess(@Param('courseId')
  courseId: string, @Param('userId')
  userId: string) {
    if (stryMutAct_9fa48("5")) {
      {}
    } else {
      stryCov_9fa48("5");
      return this.accessControlService.revokeAccess(courseId, userId);
    }
  }
  @Post(':courseId/users/:userId/subscription')
  async updateSubscription(@Param('courseId')
  courseId: string, @Param('userId')
  userId: string, @Body()
  data: any) {
    if (stryMutAct_9fa48("6")) {
      {}
    } else {
      stryCov_9fa48("6");
      return this.accessControlService.updateSubscription(courseId, userId, data.expiryDate);
    }
  }
  @Get(':courseId/logs')
  async getAccessLogs(@Param('courseId')
  courseId: string, @Body()
  data?: any) {
    if (stryMutAct_9fa48("7")) {
      {}
    } else {
      stryCov_9fa48("7");
      return this.accessControlService.getAccessLogs(courseId, stryMutAct_9fa48("8") ? data.userId : (stryCov_9fa48("8"), data?.userId), stryMutAct_9fa48("11") ? data?.days && 30 : stryMutAct_9fa48("10") ? false : stryMutAct_9fa48("9") ? true : (stryCov_9fa48("9", "10", "11"), (stryMutAct_9fa48("12") ? data.days : (stryCov_9fa48("12"), data?.days)) || 30));
    }
  }
  @Get(':courseId/users/:userId')
  async getAccessControl(@Param('courseId')
  courseId: string, @Param('userId')
  userId: string) {
    if (stryMutAct_9fa48("13")) {
      {}
    } else {
      stryCov_9fa48("13");
      return this.accessControlService.getAccessControl(courseId, userId);
    }
  }
  @Get(':courseId/users')
  async getCourseAccessList(@Param('courseId')
  courseId: string) {
    if (stryMutAct_9fa48("14")) {
      {}
    } else {
      stryCov_9fa48("14");
      return this.accessControlService.getCourseAccessList(courseId);
    }
  }
}