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
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from '../users/users.service';
@ApiTags('streaks')
@ApiBearerAuth()
@Controller('streaks')
export class StreaksController {
  constructor(private readonly usersService: UsersService) {}
  @UseGuards(JwtAuthGuard)
  @Get('current')
  @ApiOperation({
    summary: 'Get current user streak info'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns streak info',
    schema: {
      example: {
        currentStreak: 5,
        longestStreak: 12,
        lastActivityAt: '2024-01-01T12:00:00.000Z'
      }
    }
  })
  async getCurrentStreak(@Request()
  req: {
    user: {
      id: string;
    };
  }) {
    if (stryMutAct_9fa48("6740")) {
      {}
    } else {
      stryCov_9fa48("6740");
      const user = await this.usersService.findById(req.user.id);
      return stryMutAct_9fa48("6741") ? {} : (stryCov_9fa48("6741"), {
        currentStreak: stryMutAct_9fa48("6742") ? user?.currentStreak && 0 : (stryCov_9fa48("6742"), (stryMutAct_9fa48("6743") ? user.currentStreak : (stryCov_9fa48("6743"), user?.currentStreak)) ?? 0),
        longestStreak: stryMutAct_9fa48("6744") ? user?.longestStreak && 0 : (stryCov_9fa48("6744"), (stryMutAct_9fa48("6745") ? user.longestStreak : (stryCov_9fa48("6745"), user?.longestStreak)) ?? 0),
        lastActivityAt: stryMutAct_9fa48("6746") ? user?.lastActivityAt && null : (stryCov_9fa48("6746"), (stryMutAct_9fa48("6747") ? user.lastActivityAt : (stryCov_9fa48("6747"), user?.lastActivityAt)) ?? null)
      });
    }
  }
}