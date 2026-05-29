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
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { LiveSessionsService } from './live-sessions.service';
import { CreateLiveSessionDto, UpdateLiveSessionDto } from './live-session.dto';
@ApiTags('live-sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/cohorts/:cohortId/live-sessions')
export class LiveSessionsController {
  constructor(private service: LiveSessionsService) {}
  @Get()
  @ApiOperation({
    summary: 'List live sessions for a cohort'
  })
  list(@Param('cohortId')
  cohortId: string) {
    if (stryMutAct_9fa48("4242")) {
      {}
    } else {
      stryCov_9fa48("4242");
      return this.service.findByCohort(cohortId);
    }
  }
  @Post()
  @UseGuards(RolesGuard)
  @Roles('instructor', 'admin')
  @ApiOperation({
    summary: 'Schedule a live session'
  })
  create(@Param('cohortId')
  cohortId: string, @Body()
  dto: CreateLiveSessionDto, @CurrentUser()
  user: any) {
    if (stryMutAct_9fa48("4243")) {
      {}
    } else {
      stryCov_9fa48("4243");
      return this.service.create(cohortId, user.id, dto);
    }
  }
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('instructor', 'admin')
  @ApiOperation({
    summary: 'Update a live session'
  })
  update(@Param('id')
  id: string, @Body()
  dto: UpdateLiveSessionDto, @CurrentUser()
  user: any) {
    if (stryMutAct_9fa48("4244")) {
      {}
    } else {
      stryCov_9fa48("4244");
      return this.service.update(id, user.id, dto);
    }
  }
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('instructor', 'admin')
  @ApiOperation({
    summary: 'Cancel a live session'
  })
  cancel(@Param('id')
  id: string, @CurrentUser()
  user: any) {
    if (stryMutAct_9fa48("4245")) {
      {}
    } else {
      stryCov_9fa48("4245");
      return this.service.cancel(id, user.id);
    }
  }
}