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
import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CourseVersioningService } from './course-versioning.service';
@ApiTags('course-versions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('courses/:courseId/versions')
export class CourseVersioningController {
  constructor(private readonly versioningService: CourseVersioningService) {}
  @Post()
  @Roles('admin', 'instructor')
  @ApiOperation({
    summary: 'Create a new version snapshot of a course'
  })
  createVersion(@Param('courseId')
  courseId: string, @Body('changeNote')
  changeNote: string, @Request()
  req: {
    user: {
      id: string;
    };
  }) {
    if (stryMutAct_9fa48("2341")) {
      {}
    } else {
      stryCov_9fa48("2341");
      return this.versioningService.createVersion(courseId, changeNote, req.user.id);
    }
  }
  @Get()
  @Roles('admin', 'instructor')
  @ApiOperation({
    summary: 'List all versions of a course'
  })
  listVersions(@Param('courseId')
  courseId: string) {
    if (stryMutAct_9fa48("2342")) {
      {}
    } else {
      stryCov_9fa48("2342");
      return this.versioningService.listVersions(courseId);
    }
  }
  @Get('diff')
  @Roles('admin', 'instructor')
  @ApiOperation({
    summary: 'Diff two versions of a course'
  })
  @ApiQuery({
    name: 'from',
    required: true
  })
  @ApiQuery({
    name: 'to',
    required: true
  })
  diffVersions(@Param('courseId')
  courseId: string, @Query('from')
  from: string, @Query('to')
  to: string) {
    if (stryMutAct_9fa48("2343")) {
      {}
    } else {
      stryCov_9fa48("2343");
      return this.versioningService.diffVersions(courseId, from, to);
    }
  }
  @Get(':versionId')
  @Roles('admin', 'instructor')
  @ApiOperation({
    summary: 'Get a specific version snapshot'
  })
  getVersion(@Param('courseId')
  courseId: string, @Param('versionId')
  versionId: string) {
    if (stryMutAct_9fa48("2344")) {
      {}
    } else {
      stryCov_9fa48("2344");
      return this.versioningService.getVersion(courseId, versionId);
    }
  }
  @Post(':versionId/rollback')
  @Roles('admin')
  @ApiOperation({
    summary: 'Rollback course to a previous version'
  })
  rollback(@Param('courseId')
  courseId: string, @Param('versionId')
  versionId: string) {
    if (stryMutAct_9fa48("2345")) {
      {}
    } else {
      stryCov_9fa48("2345");
      return this.versioningService.rollback(courseId, versionId);
    }
  }
}