import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BatchQueueService } from './batch.queue.service';
import { BatchService, BatchPayloadItem } from './batch.service';

@ApiTags('batch')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('batch')
export class BatchController {
  constructor(
    private readonly batchService: BatchService,
    private readonly batchQueueService: BatchQueueService,
  ) {}

  @Post('users')
  @ApiOperation({ summary: 'Bulk user operations (update, ban, unban, changeRole, delete)' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({
    schema: {
      example: {
        operations: [
          { action: 'ban', userId: 'uuid' },
          { action: 'changeRole', userId: 'uuid', role: 'instructor' },
        ],
      },
    },
  })
  batchUsers(
    @Body('operations') operations: BatchPayloadItem[],
    @Request() req: { user: { id: string } },
  ) {
    return this.batchQueueService.createUserBatch(operations, req.user.id);
  }

  @Post('courses')
  @ApiOperation({ summary: 'Bulk course operations (create, update, delete)' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({
    schema: {
      example: {
        operations: [
          { action: 'update', courseId: 'uuid', isPublished: false },
          { action: 'delete', courseId: 'uuid' },
        ],
      },
    },
  })
  batchCourses(
    @Body('operations') operations: BatchPayloadItem[],
    @Request() req: { user: { id: string } },
  ) {
    return this.batchQueueService.createCourseBatch(operations, req.user.id);
  }

  @Get('jobs')
  @ApiOperation({ summary: 'List batch jobs' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiQuery({ name: 'type', required: false, enum: ['users', 'courses'] })
  listJobs(@Query('type') type?: string) {
    return this.batchService.listJobs(type);
  }

  @Get('jobs/:jobId')
  @ApiOperation({ summary: 'Get batch job status' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  getJobStatus(@Param('jobId') jobId: string) {
    return this.batchService.getJobStatus(jobId);
  }
}
