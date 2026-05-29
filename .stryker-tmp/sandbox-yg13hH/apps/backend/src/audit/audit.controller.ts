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
import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AuditService } from './audit.service';
@ApiTags('audit')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}
  @Get()
  @Roles('admin')
  @ApiOperation({
    summary: 'Get audit logs (admin only)'
  })
  @ApiQuery({
    name: 'userId',
    required: false
  })
  @ApiQuery({
    name: 'action',
    required: false
  })
  @ApiQuery({
    name: 'startDate',
    required: false
  })
  @ApiQuery({
    name: 'endDate',
    required: false
  })
  @ApiQuery({
    name: 'limit',
    required: false
  })
  getLogs(@Query('userId')
  userId?: string, @Query('action')
  action?: string, @Query('startDate')
  startDate?: string, @Query('endDate')
  endDate?: string, @Query('limit')
  limit?: string) {
    if (stryMutAct_9fa48("660")) {
      {}
    } else {
      stryCov_9fa48("660");
      return this.auditService.getLogs(stryMutAct_9fa48("661") ? {} : (stryCov_9fa48("661"), {
        userId,
        action,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        limit: limit ? parseInt(limit, 10) : 100
      }));
    }
  }
  @Get('me')
  @ApiOperation({
    summary: 'Get my audit logs'
  })
  getMyLogs(@Request()
  req: any) {
    if (stryMutAct_9fa48("662")) {
      {}
    } else {
      stryCov_9fa48("662");
      return this.auditService.getLogs(stryMutAct_9fa48("663") ? {} : (stryCov_9fa48("663"), {
        userId: req.user.userId,
        limit: 50
      }));
    }
  }
}