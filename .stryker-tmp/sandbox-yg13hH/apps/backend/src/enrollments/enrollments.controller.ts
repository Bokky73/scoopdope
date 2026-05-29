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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EnrollmentsService } from './enrollments.service';
@ApiTags('enrollments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class EnrollmentsController {
  constructor(private enrollmentsService: EnrollmentsService) {}
  @Post('courses/:id/enroll')
  @ApiOperation({
    summary: 'Enroll the current user in a course'
  })
  @ApiResponse({
    status: 201,
    description: 'Enrolled successfully',
    schema: {
      example: {
        id: 'uuid',
        userId: 'uuid',
        courseId: 'uuid',
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @ApiResponse({
    status: 403,
    description: 'Prerequisites not completed'
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found'
  })
  @ApiResponse({
    status: 409,
    description: 'Already enrolled'
  })
  enroll(@Param('id')
  courseId: string, @Request()
  req: {
    user: {
      id: string;
      role: string;
    };
  }, @Body('adminOverride')
  adminOverride?: boolean) {
    if (stryMutAct_9fa48("3514")) {
      {}
    } else {
      stryCov_9fa48("3514");
      const isAdmin = stryMutAct_9fa48("3517") ? req.user.role !== 'admin' : stryMutAct_9fa48("3516") ? false : stryMutAct_9fa48("3515") ? true : (stryCov_9fa48("3515", "3516", "3517"), req.user.role === (stryMutAct_9fa48("3518") ? "" : (stryCov_9fa48("3518"), 'admin')));
      return this.enrollmentsService.enroll(req.user.id, courseId, stryMutAct_9fa48("3521") ? isAdmin || !!adminOverride : stryMutAct_9fa48("3520") ? false : stryMutAct_9fa48("3519") ? true : (stryCov_9fa48("3519", "3520", "3521"), isAdmin && (stryMutAct_9fa48("3522") ? !adminOverride : (stryCov_9fa48("3522"), !(stryMutAct_9fa48("3523") ? adminOverride : (stryCov_9fa48("3523"), !adminOverride))))));
    }
  }
  @Post('enrollments')
  @ApiOperation({
    summary: 'Enroll the current user in a course (by body courseId)'
  })
  @ApiResponse({
    status: 201,
    description: 'Enrolled successfully'
  })
  @ApiResponse({
    status: 403,
    description: 'Prerequisites not completed'
  })
  @ApiResponse({
    status: 409,
    description: 'Already enrolled'
  })
  enrollByBody(@Body('courseId')
  courseId: string, @Request()
  req: {
    user: {
      id: string;
      role: string;
    };
  }) {
    if (stryMutAct_9fa48("3524")) {
      {}
    } else {
      stryCov_9fa48("3524");
      const isAdmin = stryMutAct_9fa48("3527") ? req.user.role !== 'admin' : stryMutAct_9fa48("3526") ? false : stryMutAct_9fa48("3525") ? true : (stryCov_9fa48("3525", "3526", "3527"), req.user.role === (stryMutAct_9fa48("3528") ? "" : (stryCov_9fa48("3528"), 'admin')));
      return this.enrollmentsService.enroll(req.user.id, courseId, stryMutAct_9fa48("3529") ? true : (stryCov_9fa48("3529"), false));
    }
  }
  @Delete('courses/:id/enroll')
  @ApiOperation({
    summary: 'Unenroll the current user from a course'
  })
  @ApiResponse({
    status: 200,
    description: 'Unenrolled successfully'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @ApiResponse({
    status: 404,
    description: 'Enrollment not found'
  })
  unenroll(@Param('id')
  courseId: string, @Request()
  req: {
    user: {
      id: string;
    };
  }) {
    if (stryMutAct_9fa48("3530")) {
      {}
    } else {
      stryCov_9fa48("3530");
      return this.enrollmentsService.unenroll(req.user.id, courseId);
    }
  }
  @Get('users/:id/enrollments')
  @ApiOperation({
    summary: 'Get all enrollments for a user'
  })
  @ApiResponse({
    status: 200,
    description: 'List of enrollments',
    schema: {
      example: [{
        id: 'uuid',
        courseId: 'uuid',
        createdAt: '2024-01-01T00:00:00.000Z'
      }]
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  getUserEnrollments(@Param('id')
  userId: string) {
    if (stryMutAct_9fa48("3531")) {
      {}
    } else {
      stryCov_9fa48("3531");
      return this.enrollmentsService.findByUser(userId);
    }
  }
  @Post('courses/:id/enroll/upgrade-version')
  @ApiOperation({
    summary: 'Upgrade enrollment to the latest course version'
  })
  @ApiResponse({
    status: 200,
    description: 'Enrollment upgraded to latest version'
  })
  @ApiResponse({
    status: 404,
    description: 'Enrollment or version not found'
  })
  upgradeVersion(@Param('id')
  courseId: string, @Request()
  req: {
    user: {
      id: string;
    };
  }) {
    if (stryMutAct_9fa48("3532")) {
      {}
    } else {
      stryCov_9fa48("3532");
      return this.enrollmentsService.upgradeVersion(req.user.id, courseId);
    }
  }
}