import { Controller, Get, Query, UseGuards, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Admin dashboard: aggregated API usage stats' })
  @ApiQuery({ name: 'from', required: false, description: 'ISO date (default: 7 days ago)' })
  @ApiQuery({ name: 'to', required: false, description: 'ISO date (default: now)' })
  getDashboard(@Query('from') from?: string, @Query('to') to?: string) {
    const toDate = to ? new Date(to) : new Date();
    const fromDate = from ? new Date(from) : new Date(Date.now() - 7 * 86400_000);
    return this.apiUsageService.getDashboard(fromDate, toDate);
  }

  @Get('by-endpoint')
  @ApiOperation({ summary: 'Usage aggregated by endpoint' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  byEndpoint(@Query('from') from?: string, @Query('to') to?: string) {
    const toDate = to ? new Date(to) : new Date();
    const fromDate = from ? new Date(from) : new Date(Date.now() - 7 * 86400_000);
    return this.apiUsageService.getAggregatedByEndpoint(fromDate, toDate);
  }

  @Get('by-user')
  @ApiOperation({ summary: 'Usage aggregated by user' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  byUser(@Query('from') from?: string, @Query('to') to?: string) {
    const toDate = to ? new Date(to) : new Date();
    const fromDate = from ? new Date(from) : new Date(Date.now() - 7 * 86400_000);
    return this.apiUsageService.getAggregatedByUser(fromDate, toDate);
  }

  @Get('by-time')
  @ApiOperation({ summary: 'Usage aggregated by time period' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'granularity', required: false, enum: ['hour', 'day'] })
  byTime(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('granularity') granularity?: 'hour' | 'day',
  ) {
    const toDate = to ? new Date(to) : new Date();
    const fromDate = from ? new Date(from) : new Date(Date.now() - 7 * 86400_000);
    return this.apiUsageService.getAggregatedByTime(fromDate, toDate, granularity ?? 'hour');
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Check for usage anomaly alerts (requests per minute)' })
  @ApiQuery({ name: 'threshold', required: false, type: Number })
  checkAlerts(@Query('threshold') threshold?: string) {
    return this.apiUsageService.checkUsageAlerts(threshold ? Number(threshold) : 100);
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'Platform usage statistics: totals, percentiles, active users, top endpoints, daily trend',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Number of days to aggregate (default 30, max 90)',
  })
  @ApiResponse({
    status: 200,
    description: 'Aggregated platform usage statistics for the requested period',
  })
  getStatistics(
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    const clamped = Math.min(Math.max(days, 1), 90);
    return this.apiUsageService.getStatistics(clamped);
  }
}
