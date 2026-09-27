import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  UseGuards,
  HttpCode,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { QueryPerformanceService, QueryLog, QueryMetrics } from '../services/query-performance.service';
import { QueryAlertService, Alert } from '../services/query-alert.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { IsAdminGuard } from '../../common/guards/is-admin.guard';

@ApiTags('Monitoring - Query Performance')
@Controller('monitoring/queries')
@UseGuards(JwtAuthGuard, IsAdminGuard)
@ApiBearerAuth()
export class MonitoringQueryController {
  private readonly logger = new Logger(MonitoringQueryController.name);

  constructor(
    private queryPerformanceService: QueryPerformanceService,
    private queryAlertService: QueryAlertService,
  ) {}

  /**
   * Get query performance metrics
   */
  @Get('metrics')
  @ApiOperation({
    summary: 'Get query performance metrics',
    description:
      'Returns aggregated query performance metrics including slow queries, averages, and percentiles',
  })
  @ApiResponse({
    status: 200,
    description: 'Query metrics',
    schema: {
      example: {
        totalQueries: 1500,
        slowQueries: 45,
        criticalQueries: 12,
        averageResponseTime: 150,
        p95ResponseTime: 3500,
        p99ResponseTime: 7500,
      },
    },
  })
  getMetrics(): QueryMetrics {
    return this.queryPerformanceService.getMetrics();
  }

  /**
   * Get recent slow queries
   */
  @Get('slow')
  @ApiOperation({
    summary: 'Get recent slow queries',
    description: 'Returns the most recent slow queries with details',
  })
  @ApiResponse({
    status: 200,
    description: 'List of slow queries',
    schema: {
      example: [
        {
          timestamp: '2024-01-15T10:30:00Z',
          duration: 2500,
          query: "SELECT * FROM users WHERE id = $1",
          parameters: ['123'],
          status: 'slow',
          context: 'user.service',
        },
      ],
    },
  })
  getSlowQueries(@Query('limit') limit: number = 50): QueryLog[] {
    return this.queryPerformanceService.getRecentSlowQueries(Math.min(limit, 200));
  }

  /**
   * Get critical queries
   */
  @Get('critical')
  @ApiOperation({
    summary: 'Get critical queries (>5000ms)',
    description: 'Returns queries that exceeded the critical threshold',
  })
  @ApiResponse({
    status: 200,
    description: 'List of critical queries',
  })
  getCriticalQueries(@Query('limit') limit: number = 50): QueryLog[] {
    return this.queryPerformanceService
      .getQueriesByStatus('critical')
      .slice(-Math.min(limit, 200));
  }

  /**
   * Get slow query threshold
   */
  @Get('config/threshold')
  @ApiOperation({
    summary: 'Get slow query threshold configuration',
    description: 'Returns the current slow query threshold in milliseconds',
  })
  @ApiResponse({
    status: 200,
    description: 'Threshold configuration',
    schema: {
      example: {
        slowQueryThreshold: 1000,
        criticalQueryThreshold: 5000,
      },
    },
  })
  getThresholdConfig() {
    return {
      slowQueryThreshold: this.queryPerformanceService.getSlowQueryThreshold(),
      criticalQueryThreshold: this.queryPerformanceService.getCriticalQueryThreshold(),
    };
  }

  /**
   * Clear in-memory query logs
   */
  @Post('logs/clear')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Clear in-memory query logs',
    description: 'Clears all in-memory slow query logs (file logs are retained)',
  })
  @ApiResponse({
    status: 204,
    description: 'Logs cleared successfully',
  })
  clearLogs(): void {
    this.queryPerformanceService.clearLogs();
    this.logger.log('Query logs cleared via API');
  }

  /**
   * Get alerts
   */
  @Get('alerts')
  @ApiOperation({
    summary: 'Get query performance alerts',
    description: 'Returns alerts for queries exceeding critical threshold',
  })
  @ApiResponse({
    status: 200,
    description: 'List of alerts',
  })
  getAlerts(@Query('limit') limit: number = 50): Alert[] {
    return this.queryAlertService.getAllAlerts(Math.min(limit, 200));
  }

  /**
   * Get active alerts
   */
  @Get('alerts/active')
  @ApiOperation({
    summary: 'Get active (unacknowledged) alerts',
    description: 'Returns only unacknowledged alerts',
  })
  @ApiResponse({
    status: 200,
    description: 'List of active alerts',
  })
  getActiveAlerts(): Alert[] {
    return this.queryAlertService.getActiveAlerts();
  }

  /**
   * Get alert statistics
   */
  @Get('alerts/stats')
  @ApiOperation({
    summary: 'Get alert statistics',
    description: 'Returns alert statistics including counts by severity and time period',
  })
  @ApiResponse({
    status: 200,
    description: 'Alert statistics',
    schema: {
      example: {
        total: 150,
        active: 12,
        last24h: 45,
        last1h: 3,
        criticalCount: 10,
        warningCount: 140,
      },
    },
  })
  getAlertStats() {
    return this.queryAlertService.getAlertStats();
  }

  /**
   * Acknowledge an alert
   */
  @Post('alerts/:alertId/acknowledge')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Acknowledge an alert',
    description: 'Mark an alert as acknowledged',
  })
  @ApiResponse({
    status: 204,
    description: 'Alert acknowledged',
  })
  acknowledgeAlert(@Param('alertId') alertId: string): void {
    this.queryAlertService.acknowledgeAlert(alertId);
  }

  /**
   * Clear all alerts
   */
  @Post('alerts/clear')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Clear all alerts',
    description: 'Removes all stored alerts',
  })
  @ApiResponse({
    status: 204,
    description: 'Alerts cleared',
  })
  clearAlerts(): void {
    this.queryAlertService.clearAlerts();
  }

  /**
   * Clear acknowledged alerts
   */
  @Post('alerts/clear-acknowledged')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Clear acknowledged alerts',
    description: 'Removes only acknowledged alerts',
  })
  @ApiResponse({
    status: 204,
    description: 'Acknowledged alerts cleared',
  })
  clearAcknowledgedAlerts(): void {
    this.queryAlertService.clearAcknowledgedAlerts();
  }
}
