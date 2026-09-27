import {
  Controller,
  Get,
  Inject,
  VERSION_NEUTRAL,
  HttpCode,
  HttpStatus,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * GET /health
   *
   * Primary health check endpoint for load balancers and monitoring systems.
   * Tests database and Redis connectivity.
   * - Returns 200 with status:"ok" when all critical services are healthy.
   * - Returns 503 with status:"error" when any critical dependency is down.
   * - Does NOT require authentication.
   */
  @Get()
  @ApiOperation({
    summary: 'Health check',
    description:
      'Returns health status of the application. Checks database and Redis connectivity. ' +
      'Returns 200 when all services are healthy, 503 when any critical dependency is down. ' +
      'No authentication required.',
  })
  @ApiResponse({
    status: 200,
    description: 'All services healthy',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2026-08-30T10:00:00.000Z',
        checks: {
          database: { status: 'up' },
          redis: { status: 'up' },
          memory_heap: { status: 'up' },
          memory_rss: { status: 'up' },
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'One or more services unhealthy',
    schema: {
      example: {
        status: 'error',
        timestamp: '2026-08-30T10:00:00.000Z',
        checks: {
          database: { status: 'down', message: 'Database unreachable' },
          redis: { status: 'up' },
        },
      },
    },
  })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @HttpCode(HttpStatus.OK)
  async check() {
    this.logger.debug('Performing health check', { context: 'HealthController' });

    const result = await this.healthService.checkFull();

    this.logger.info('Health check completed', {
      context: 'HealthController',
      status: result.status,
    });

    // Return 503 when critical services are down so load balancers can route away
    if (result.status === 'error') {
      throw new ServiceUnavailableException(result);
    }

    return result;
  }

  /**
   * GET /health/live
   *
   * Liveness probe — lightweight check that the process is alive.
   * Used by Kubernetes/Docker to know if the container should be restarted.
   */
  @Get('live')
  @ApiOperation({
    summary: 'Liveness probe',
    description:
      'Lightweight probe for container orchestrators. Returns 200 if the process is alive ' +
      'and not shutting down. Does NOT check external dependencies.',
  })
  @ApiResponse({ status: 200, description: 'Process is alive' })
  @ApiResponse({ status: 503, description: 'Process is shutting down' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async checkLiveness() {
    const result = await this.healthService.checkLiveness();
    if (result.status === 'error') {
      throw new ServiceUnavailableException(result);
    }
    return result;
  }

  /**
   * GET /health/ready
   *
   * Readiness probe — checks whether the app can serve traffic.
   * Used by Kubernetes/load balancers to decide whether to route requests here.
   */
  @Get('ready')
  @ApiOperation({
    summary: 'Readiness probe',
    description:
      'Readiness probe for load balancers and container orchestrators. Checks if the ' +
      'application can serve traffic (DB, Redis).',
  })
  @ApiResponse({ status: 200, description: 'Application is ready to serve traffic' })
  @ApiResponse({ status: 503, description: 'Application is not ready' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async checkReadiness() {
    const result = await this.healthService.checkReadiness();
    if (result.status === 'error') {
      throw new ServiceUnavailableException(result);
    }
    return result;
  }

  /**
   * GET /health/startup
   *
   * Startup probe — confirms the application has fully initialized.
   */
  @Get('startup')
  @ApiOperation({
    summary: 'Startup probe',
    description:
      'Startup probe for container orchestrators. Returns 200 once the application has ' +
      'initialized successfully.',
  })
  @ApiResponse({ status: 200, description: 'Application started successfully' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async checkStartup() {
    return this.healthService.checkStartup();
  }

  /** GET /health/environment — blue/green deployment info for load balancer */
  @Get('environment')
  @ApiOperation({
    summary: 'Environment info',
    description: 'Returns blue/green deployment environment information for load balancer integration.',
  })
  @ApiResponse({ status: 200, description: 'Environment information retrieved' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async checkEnvironment() {
    return this.healthService.getEnvironmentInfo();
  }

  /** GET /health/version — app version, uptime, system info */
  @Get('version')
  @ApiOperation({
    summary: 'Version info',
    description: 'Returns application version, uptime, and system information for monitoring.',
  })
  @ApiResponse({ status: 200, description: 'Version information retrieved' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async checkVersion() {
    return this.healthService.getSystemInfo();
  }
}
