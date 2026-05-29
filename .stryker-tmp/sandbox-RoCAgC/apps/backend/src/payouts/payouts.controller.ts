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
import { Controller, Post, Get, Param, Body, UseGuards, Query } from '@nestjs/common';
import { PayoutsService } from './payouts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
@Controller('v1/payouts')
export class PayoutsController {
  constructor(private payoutsService: PayoutsService) {}
  @Post('calculate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async calculatePayouts(@Query('startDate')
  startDate: string, @Query('endDate')
  endDate: string) {
    if (stryMutAct_9fa48("5517")) {
      {}
    } else {
      stryCov_9fa48("5517");
      return this.payoutsService.calculatePayouts(new Date(startDate), new Date(endDate));
    }
  }
  @Post(':payoutId/process')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async processPayout(@Param('payoutId')
  payoutId: string) {
    if (stryMutAct_9fa48("5518")) {
      {}
    } else {
      stryCov_9fa48("5518");
      return this.payoutsService.processPayout(payoutId);
    }
  }
  @Get('instructor/:instructorId')
  @UseGuards(JwtAuthGuard)
  async getInstructorPayouts(@Param('instructorId')
  instructorId: string) {
    if (stryMutAct_9fa48("5519")) {
      {}
    } else {
      stryCov_9fa48("5519");
      return this.payoutsService.getInstructorPayouts(instructorId);
    }
  }
  @Get('instructor/:instructorId/stats')
  @UseGuards(JwtAuthGuard)
  async getPayoutStats(@Param('instructorId')
  instructorId: string) {
    if (stryMutAct_9fa48("5520")) {
      {}
    } else {
      stryCov_9fa48("5520");
      return this.payoutsService.getPayoutStats(instructorId);
    }
  }
  @Get('instructor/:instructorId/history')
  @UseGuards(JwtAuthGuard)
  async getPayoutHistory(@Param('instructorId')
  instructorId: string, @Query('limit')
  limit = 10) {
    if (stryMutAct_9fa48("5521")) {
      {}
    } else {
      stryCov_9fa48("5521");
      return this.payoutsService.getPayoutHistory(instructorId, limit);
    }
  }
  @Get('instructor/:instructorId/monthly')
  @UseGuards(JwtAuthGuard)
  async getMonthlyRevenue(@Param('instructorId')
  instructorId: string) {
    if (stryMutAct_9fa48("5522")) {
      {}
    } else {
      stryCov_9fa48("5522");
      return this.payoutsService.getMonthlyRevenue(instructorId);
    }
  }
  @Get('instructor/:instructorId/per-course')
  @UseGuards(JwtAuthGuard)
  async getPerCourseRevenue(@Param('instructorId')
  instructorId: string) {
    if (stryMutAct_9fa48("5523")) {
      {}
    } else {
      stryCov_9fa48("5523");
      return this.payoutsService.getPerCourseRevenue(instructorId);
    }
  }
  @Get('instructor/:instructorId/projection')
  @UseGuards(JwtAuthGuard)
  async getRevenueProjection(@Param('instructorId')
  instructorId: string) {
    if (stryMutAct_9fa48("5524")) {
      {}
    } else {
      stryCov_9fa48("5524");
      return this.payoutsService.getRevenueProjection(instructorId);
    }
  }
}