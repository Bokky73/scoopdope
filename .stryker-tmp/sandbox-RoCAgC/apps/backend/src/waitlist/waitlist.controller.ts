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
import { Controller, Post, Delete, Get, Param, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { WaitlistService } from './waitlist.service';
@ApiTags('waitlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  // ── Student endpoints ──────────────────────────────────────────────────────

  @Post('courses/:id/waitlist')
  @ApiOperation({
    summary: 'Join the waitlist for a full course'
  })
  @ApiResponse({
    status: 201,
    description: 'Joined waitlist successfully'
  })
  @ApiResponse({
    status: 400,
    description: 'Course has available spots or not available'
  })
  @ApiResponse({
    status: 409,
    description: 'Already enrolled or on waitlist'
  })
  join(@Param('id')
  courseId: string, @Request()
  req: {
    user: {
      id: string;
    };
  }) {
    if (stryMutAct_9fa48("7347")) {
      {}
    } else {
      stryCov_9fa48("7347");
      return this.waitlistService.join(req.user.id, courseId);
    }
  }
  @Delete('courses/:id/waitlist')
  @ApiOperation({
    summary: 'Leave the waitlist for a course'
  })
  @ApiResponse({
    status: 200,
    description: 'Left waitlist successfully'
  })
  @ApiResponse({
    status: 404,
    description: 'Not on waitlist'
  })
  leave(@Param('id')
  courseId: string, @Request()
  req: {
    user: {
      id: string;
    };
  }) {
    if (stryMutAct_9fa48("7348")) {
      {}
    } else {
      stryCov_9fa48("7348");
      return this.waitlistService.leave(req.user.id, courseId);
    }
  }
  @Get('courses/:id/waitlist/position')
  @ApiOperation({
    summary: "Get the current user's waitlist position for a course"
  })
  @ApiResponse({
    status: 200,
    description: 'Position (null if not on waitlist)'
  })
  async getPosition(@Param('id')
  courseId: string, @Request()
  req: {
    user: {
      id: string;
    };
  }) {
    if (stryMutAct_9fa48("7349")) {
      {}
    } else {
      stryCov_9fa48("7349");
      const position = await this.waitlistService.getPosition(req.user.id, courseId);
      const total = await this.waitlistService.getWaitlistCount(courseId);
      return stryMutAct_9fa48("7350") ? {} : (stryCov_9fa48("7350"), {
        position,
        total
      });
    }
  }
  @Get('users/me/waitlist')
  @ApiOperation({
    summary: "Get all courses the current user is waitlisted for"
  })
  @ApiResponse({
    status: 200,
    description: 'List of waitlist entries with course details'
  })
  getMyWaitlist(@Request()
  req: {
    user: {
      id: string;
    };
  }) {
    if (stryMutAct_9fa48("7351")) {
      {}
    } else {
      stryCov_9fa48("7351");
      return this.waitlistService.listForUser(req.user.id);
    }
  }

  // ── Admin endpoints ────────────────────────────────────────────────────────

  @Get('admin/courses/:id/waitlist')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Admin: list all waitlist entries for a course'
  })
  @ApiResponse({
    status: 200,
    description: 'Ordered list of waitlist entries'
  })
  adminList(@Param('id')
  courseId: string) {
    if (stryMutAct_9fa48("7352")) {
      {}
    } else {
      stryCov_9fa48("7352");
      return this.waitlistService.listForCourse(courseId);
    }
  }
  @Delete('admin/courses/:courseId/waitlist/:userId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Admin: remove a user from a course waitlist'
  })
  @ApiResponse({
    status: 200,
    description: 'User removed from waitlist'
  })
  adminRemove(@Param('courseId')
  courseId: string, @Param('userId')
  userId: string) {
    if (stryMutAct_9fa48("7353")) {
      {}
    } else {
      stryCov_9fa48("7353");
      return this.waitlistService.adminRemove(courseId, userId);
    }
  }
  @Post('admin/courses/:id/waitlist/promote')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Admin: manually trigger promotion of next waitlisted student'
  })
  @ApiResponse({
    status: 200,
    description: 'Next student promoted (if spot available)'
  })
  adminPromote(@Param('id')
  courseId: string) {
    if (stryMutAct_9fa48("7354")) {
      {}
    } else {
      stryCov_9fa48("7354");
      return this.waitlistService.promoteNext(courseId);
    }
  }
}