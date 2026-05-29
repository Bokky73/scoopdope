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
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiUsageService } from './api-usage.service';
@ApiTags('api-usage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('api-usage')
export class ApiUsageController {
  constructor(private readonly apiUsageService: ApiUsageService) {}
  @Get('dashboard')
  @ApiOperation({
    summary: 'Admin dashboard: aggregated API usage stats'
  })
  @ApiQuery({
    name: 'from',
    required: false,
    description: 'ISO date (default: 7 days ago)'
  })
  @ApiQuery({
    name: 'to',
    required: false,
    description: 'ISO date (default: now)'
  })
  getDashboard(@Query('from')
  from?: string, @Query('to')
  to?: string) {
    if (stryMutAct_9fa48("409")) {
      {}
    } else {
      stryCov_9fa48("409");
      const toDate = to ? new Date(to) : new Date();
      const fromDate = from ? new Date(from) : new Date(stryMutAct_9fa48("410") ? Date.now() + 7 * 86400_000 : (stryCov_9fa48("410"), Date.now() - (stryMutAct_9fa48("411") ? 7 / 86400_000 : (stryCov_9fa48("411"), 7 * 86400_000))));
      return this.apiUsageService.getDashboard(fromDate, toDate);
    }
  }
  @Get('by-endpoint')
  @ApiOperation({
    summary: 'Usage aggregated by endpoint'
  })
  @ApiQuery({
    name: 'from',
    required: false
  })
  @ApiQuery({
    name: 'to',
    required: false
  })
  byEndpoint(@Query('from')
  from?: string, @Query('to')
  to?: string) {
    if (stryMutAct_9fa48("412")) {
      {}
    } else {
      stryCov_9fa48("412");
      const toDate = to ? new Date(to) : new Date();
      const fromDate = from ? new Date(from) : new Date(stryMutAct_9fa48("413") ? Date.now() + 7 * 86400_000 : (stryCov_9fa48("413"), Date.now() - (stryMutAct_9fa48("414") ? 7 / 86400_000 : (stryCov_9fa48("414"), 7 * 86400_000))));
      return this.apiUsageService.getAggregatedByEndpoint(fromDate, toDate);
    }
  }
  @Get('by-user')
  @ApiOperation({
    summary: 'Usage aggregated by user'
  })
  @ApiQuery({
    name: 'from',
    required: false
  })
  @ApiQuery({
    name: 'to',
    required: false
  })
  byUser(@Query('from')
  from?: string, @Query('to')
  to?: string) {
    if (stryMutAct_9fa48("415")) {
      {}
    } else {
      stryCov_9fa48("415");
      const toDate = to ? new Date(to) : new Date();
      const fromDate = from ? new Date(from) : new Date(stryMutAct_9fa48("416") ? Date.now() + 7 * 86400_000 : (stryCov_9fa48("416"), Date.now() - (stryMutAct_9fa48("417") ? 7 / 86400_000 : (stryCov_9fa48("417"), 7 * 86400_000))));
      return this.apiUsageService.getAggregatedByUser(fromDate, toDate);
    }
  }
  @Get('by-time')
  @ApiOperation({
    summary: 'Usage aggregated by time period'
  })
  @ApiQuery({
    name: 'from',
    required: false
  })
  @ApiQuery({
    name: 'to',
    required: false
  })
  @ApiQuery({
    name: 'granularity',
    required: false,
    enum: ['hour', 'day']
  })
  byTime(@Query('from')
  from?: string, @Query('to')
  to?: string, @Query('granularity')
  granularity?: 'hour' | 'day') {
    if (stryMutAct_9fa48("418")) {
      {}
    } else {
      stryCov_9fa48("418");
      const toDate = to ? new Date(to) : new Date();
      const fromDate = from ? new Date(from) : new Date(stryMutAct_9fa48("419") ? Date.now() + 7 * 86400_000 : (stryCov_9fa48("419"), Date.now() - (stryMutAct_9fa48("420") ? 7 / 86400_000 : (stryCov_9fa48("420"), 7 * 86400_000))));
      return this.apiUsageService.getAggregatedByTime(fromDate, toDate, stryMutAct_9fa48("421") ? granularity && 'hour' : (stryCov_9fa48("421"), granularity ?? (stryMutAct_9fa48("422") ? "" : (stryCov_9fa48("422"), 'hour'))));
    }
  }
  @Get('alerts')
  @ApiOperation({
    summary: 'Check for usage anomaly alerts (requests per minute)'
  })
  @ApiQuery({
    name: 'threshold',
    required: false,
    type: Number
  })
  checkAlerts(@Query('threshold')
  threshold?: string) {
    if (stryMutAct_9fa48("423")) {
      {}
    } else {
      stryCov_9fa48("423");
      return this.apiUsageService.checkUsageAlerts(threshold ? Number(threshold) : 100);
    }
  }
}