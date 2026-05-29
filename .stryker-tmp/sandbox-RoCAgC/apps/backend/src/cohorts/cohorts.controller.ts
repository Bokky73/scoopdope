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
import { Controller, Post, Get, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CohortsService } from './cohorts.service';
@Controller('v1/cohorts')
@UseGuards(JwtAuthGuard)
export class CohortsController {
  constructor(private cohortsService: CohortsService) {}
  @Post()
  async createCohort(@Body()
  data: any, @CurrentUser()
  user: any) {
    if (stryMutAct_9fa48("1764")) {
      {}
    } else {
      stryCov_9fa48("1764");
      return this.cohortsService.createCohort(data.courseId, user.id, data);
    }
  }
  @Get(':id')
  async getCohort(@Param('id')
  id: string) {
    if (stryMutAct_9fa48("1765")) {
      {}
    } else {
      stryCov_9fa48("1765");
      return this.cohortsService.getCohort(id);
    }
  }
  @Post(':cohortId/members')
  async addMember(@Param('cohortId')
  cohortId: string, @Body()
  data: any) {
    if (stryMutAct_9fa48("1766")) {
      {}
    } else {
      stryCov_9fa48("1766");
      return this.cohortsService.addMember(cohortId, data.userId);
    }
  }
  @Delete(':cohortId/members/:userId')
  async removeMember(@Param('cohortId')
  cohortId: string, @Param('userId')
  userId: string) {
    if (stryMutAct_9fa48("1767")) {
      {}
    } else {
      stryCov_9fa48("1767");
      return this.cohortsService.removeMember(cohortId, userId);
    }
  }
  @Post(':cohortId/progress')
  async updateProgress(@Param('cohortId')
  cohortId: string, @Body()
  data: any) {
    if (stryMutAct_9fa48("1768")) {
      {}
    } else {
      stryCov_9fa48("1768");
      return this.cohortsService.updateMemberProgress(cohortId, data.userId, data.progressPercentage);
    }
  }
  @Get(':cohortId/progress')
  async getCohortProgress(@Param('cohortId')
  cohortId: string) {
    if (stryMutAct_9fa48("1769")) {
      {}
    } else {
      stryCov_9fa48("1769");
      return this.cohortsService.getCohortProgress(cohortId);
    }
  }
  @Get('course/:courseId')
  async getCohortsByCourse(@Param('courseId')
  courseId: string) {
    if (stryMutAct_9fa48("1770")) {
      {}
    } else {
      stryCov_9fa48("1770");
      return this.cohortsService.getCohortsByCourse(courseId);
    }
  }
}