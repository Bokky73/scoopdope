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
import { Controller, Post, Get, Patch, UseGuards, Body, Param } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
@Controller('v1/reminders')
export class RemindersController {
  constructor(private remindersService: RemindersService) {}
  @Post('send-inactive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async sendInactiveReminders() {
    if (stryMutAct_9fa48("6036")) {
      {}
    } else {
      stryCov_9fa48("6036");
      await this.remindersService.sendInactiveReminders();
      return stryMutAct_9fa48("6037") ? {} : (stryCov_9fa48("6037"), {
        message: stryMutAct_9fa48("6038") ? "" : (stryCov_9fa48("6038"), 'Reminders sent successfully')
      });
    }
  }
  @Post(':userId/:courseId')
  @UseGuards(JwtAuthGuard)
  async createReminder(@Param('userId')
  userId: string, @Param('courseId')
  courseId: string) {
    if (stryMutAct_9fa48("6039")) {
      {}
    } else {
      stryCov_9fa48("6039");
      return this.remindersService.createReminder(userId, courseId);
    }
  }
  @Patch(':userId/:courseId/disable')
  @UseGuards(JwtAuthGuard)
  async disableReminder(@Param('userId')
  userId: string, @Param('courseId')
  courseId: string) {
    if (stryMutAct_9fa48("6040")) {
      {}
    } else {
      stryCov_9fa48("6040");
      await this.remindersService.disableReminder(userId, courseId);
      return stryMutAct_9fa48("6041") ? {} : (stryCov_9fa48("6041"), {
        message: stryMutAct_9fa48("6042") ? "" : (stryCov_9fa48("6042"), 'Reminder disabled')
      });
    }
  }
  @Patch(':userId/:courseId/enable')
  @UseGuards(JwtAuthGuard)
  async enableReminder(@Param('userId')
  userId: string, @Param('courseId')
  courseId: string) {
    if (stryMutAct_9fa48("6043")) {
      {}
    } else {
      stryCov_9fa48("6043");
      await this.remindersService.enableReminder(userId, courseId);
      return stryMutAct_9fa48("6044") ? {} : (stryCov_9fa48("6044"), {
        message: stryMutAct_9fa48("6045") ? "" : (stryCov_9fa48("6045"), 'Reminder enabled')
      });
    }
  }
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getReminderStats() {
    if (stryMutAct_9fa48("6046")) {
      {}
    } else {
      stryCov_9fa48("6046");
      return this.remindersService.getReminderStats();
    }
  }
}