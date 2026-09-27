import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { MigrationRunnerService } from './migration-runner.service';
import { NonProductionGuard } from './non-production.guard';

/**
 * Exposes database migration management endpoints intended exclusively for use
 * by platform administrators in non-production environments (local development
 * and staging).
 *
 * **Security model**
 * - Every endpoint requires a valid JWT (`JwtAuthGuard`).
 * - The `RolesGuard` further restricts access to users whose `role` field
 *   equals `"admin"`. Students, instructors, or any other role receive HTTP 403.
 * - The `NonProductionGuard` rejects all requests when `NODE_ENV === "production"`.
 *   In production, migrations must be executed via the TypeORM CLI as part of a
 *   controlled deployment pipeline, never through this HTTP API.
 *
 * **Intended workflow**
 * 1. Deploy a new build to staging / local.
 * 2. An admin calls `GET /database/migrations` to review pending migrations.
 * 3. An admin calls `POST /database/migrations/run` to apply them.
 * 4. If a migration must be rolled back, an admin calls
 *    `POST /database/migrations/revert` — this reverts only the *most recently
 *    applied* migration, so it should be used with caution.
 */
@ApiTags('database')
@ApiBearerAuth()
@Controller('database')
@UseGuards(JwtAuthGuard, RolesGuard, NonProductionGuard)
@Roles('admin')
export class DatabaseController {
  constructor(private readonly migrationRunner: MigrationRunnerService) {}

  // ---------------------------------------------------------------------------
  // Run migrations
  // ---------------------------------------------------------------------------

  @Post('migrations/run')
  @ApiOperation({
    summary: 'Run all pending migrations',
    description:
      'Applies every pending TypeORM migration in timestamp order. ' +
      'Returns the list of executed migration names together with the total ' +
      'duration. ' +
      '**Admin-only. Disabled in production.**',
  })
  @ApiResponse({
    status: 201,
    description: 'Pending migrations executed successfully.',
    schema: {
      example: {
        success: true,
        executed: ['InitialMigration1700000000000'],
        migrations: [
          {
            id: 1,
            timestamp: 1700000000000,
            name: 'InitialMigration1700000000000',
            executedAt: '2024-01-01T00:00:00.000Z',
            status: 'executed',
          },
        ],
        durationMs: 42,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT.' })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden — caller does not have the admin role, or the server is ' +
      'running in production.',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 200, description: 'Migrations executed successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden (admin only)' })
  async runMigrations() {
    return this.migrationRunner.run();
  }

  // ---------------------------------------------------------------------------
  // Revert last migration
  // ---------------------------------------------------------------------------

  @Post('migrations/revert')
  @ApiOperation({
    summary: 'Revert the last applied migration',
    description:
      'Calls `undoLastMigration()` on the active TypeORM DataSource, which ' +
      'executes the `down()` method of the most recently applied migration. ' +
      'Only one migration is reverted per call. ' +
      '**Use with caution** — reverting a migration that drops columns or ' +
      'tables may cause data loss. ' +
      '**Admin-only. Disabled in production.**',
  })
  @ApiResponse({
    status: 201,
    description: 'Last migration reverted successfully.',
    schema: {
      example: {
        success: true,
        executed: [],
        migrations: [],
        durationMs: 18,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT.' })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden — caller does not have the admin role, or the server is ' +
      'running in production.',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 200, description: 'Migration reverted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden (admin only)' })
  async revertMigration() {
    return this.migrationRunner.revert();
  }

  // ---------------------------------------------------------------------------
  // Get migration status
  // ---------------------------------------------------------------------------

  @Get('migrations')
  @ApiOperation({
    summary: 'List migration status',
    description:
      'Returns a merged, timestamp-sorted list of all known migrations. ' +
      'Each entry includes its execution timestamp (when it was applied), or ' +
      'is marked as `"pending"` if it has not yet been run. ' +
      '**Admin-only. Disabled in production.**',
  })
  @ApiResponse({
    status: 200,
    description: 'Migration status retrieved successfully.',
    schema: {
      example: [
        {
          id: 1,
          timestamp: 1700000000000,
          name: 'InitialMigration1700000000000',
          executedAt: '2024-01-01T00:00:00.000Z',
          status: 'executed',
        },
        {
          id: -1,
          timestamp: 1710000000000,
          name: 'AddForums1710000000000',
          status: 'pending',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT.' })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden — caller does not have the admin role, or the server is ' +
      'running in production.',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 200, description: 'Migration status retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden (admin only)' })
  async getMigrationStatus() {
    return this.migrationRunner.getStatus();
  }
}
