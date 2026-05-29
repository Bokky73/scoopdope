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
import { Body, Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PrerequisitesService } from './prerequisites.service';
@ApiTags('course-prerequisites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('courses/:courseId/prerequisites')
export class PrerequisitesController {
  constructor(private readonly prereqService: PrerequisitesService) {}
  @Get()
  @Roles('admin', 'instructor', 'student')
  @ApiOperation({
    summary: 'List prerequisites for a course'
  })
  getPrerequisites(@Param('courseId')
  courseId: string) {
    if (stryMutAct_9fa48("2826")) {
      {}
    } else {
      stryCov_9fa48("2826");
      return this.prereqService.getPrerequisites(courseId);
    }
  }
  @Get('chain')
  @Roles('admin', 'instructor', 'student')
  @ApiOperation({
    summary: 'Get full prerequisite chain for visualization'
  })
  getChain(@Param('courseId')
  courseId: string) {
    if (stryMutAct_9fa48("2827")) {
      {}
    } else {
      stryCov_9fa48("2827");
      return this.prereqService.getPrerequisiteChain(courseId);
    }
  }
  @Get('status')
  @Roles('admin', 'instructor', 'student')
  @ApiOperation({
    summary: 'Get prerequisite completion status for the current user'
  })
  getStatus(@Param('courseId')
  courseId: string, @Request()
  req: {
    user: {
      id: string;
    };
  }) {
    if (stryMutAct_9fa48("2828")) {
      {}
    } else {
      stryCov_9fa48("2828");
      return this.prereqService.getPrerequisiteStatus(courseId, req.user.id);
    }
  }
  @Post()
  @Roles('admin', 'instructor')
  @ApiOperation({
    summary: 'Add a prerequisite to a course'
  })
  addPrerequisite(@Param('courseId')
  courseId: string, @Body('prerequisiteId')
  prerequisiteId: string) {
    if (stryMutAct_9fa48("2829")) {
      {}
    } else {
      stryCov_9fa48("2829");
      return this.prereqService.addPrerequisite(courseId, prerequisiteId);
    }
  }
  @Delete(':prerequisiteId')
  @Roles('admin', 'instructor')
  @ApiOperation({
    summary: 'Remove a prerequisite from a course'
  })
  removePrerequisite(@Param('courseId')
  courseId: string, @Param('prerequisiteId')
  prerequisiteId: string) {
    if (stryMutAct_9fa48("2830")) {
      {}
    } else {
      stryCov_9fa48("2830");
      return this.prereqService.removePrerequisite(courseId, prerequisiteId);
    }
  }
  @Post('validate/:userId')
  @Roles('admin')
  @ApiOperation({
    summary: 'Check if a user satisfies prerequisites (admin can override)'
  })
  validatePrerequisites(@Param('courseId')
  courseId: string, @Param('userId')
  userId: string, @Body('adminOverride')
  adminOverride?: boolean) {
    if (stryMutAct_9fa48("2831")) {
      {}
    } else {
      stryCov_9fa48("2831");
      return this.prereqService.validatePrerequisites(userId, courseId, stryMutAct_9fa48("2832") ? adminOverride && false : (stryCov_9fa48("2832"), adminOverride ?? (stryMutAct_9fa48("2833") ? true : (stryCov_9fa48("2833"), false))));
    }
  }
}