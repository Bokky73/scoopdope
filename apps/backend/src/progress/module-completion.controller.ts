import {
  Controller,
  Post,
  Get,
  Param,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ModuleCompletionService } from './module-completion.service';

@ApiTags('module-completions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ModuleCompletionController {
  constructor(private readonly service: ModuleCompletionService) {}

  /**
   * POST /v1/modules/:moduleId/complete
   *
   * Mark a module as complete for the authenticated student.
   *
   * - 201 Created  – first time the module is completed
   * - 200 OK       – module was already completed (idempotent)
   * - 400          – not all lessons in the module are completed yet
   * - 403          – student not enrolled in the course
   * - 404          – module not found
   */
  @Post('modules/:moduleId/complete')
  @ApiOperation({
    summary: 'Mark a module as complete',
    description:
      'Records module completion for the authenticated student after verifying ' +
      'that all lessons in the module are completed. ' +
      'First completion returns 201; subsequent calls are idempotent and return 200.',
  })
  @ApiParam({ name: 'moduleId', description: 'UUID of the module to complete' })
  @ApiResponse({
    status: 201,
    description: 'Module marked as complete (first completion)',
    schema: {
      example: {
        completion: {
          id: 'uuid',
          userId: 'uuid',
          moduleId: 'uuid',
          courseId: 'uuid',
          completedAt: '2026-08-30T10:00:00.000Z',
        },
        courseProgressPct: 50,
        message: 'Module completed',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Module was already completed (idempotent)',
    schema: {
      example: {
        completion: {
          id: 'uuid',
          userId: 'uuid',
          moduleId: 'uuid',
          courseId: 'uuid',
          completedAt: '2026-08-30T10:00:00.000Z',
        },
        courseProgressPct: 50,
        message: 'Module already completed',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Not all lessons in the module are completed yet',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized – JWT required' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden – student not enrolled in the course',
  })
  @ApiResponse({ status: 404, description: 'Module not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async complete(
    @Param('moduleId') moduleId: string,
    @Request() req,
    @Res() res: Response,
  ) {
    const result = await this.service.completeModule(req.user.id, moduleId);

    const statusCode = result.created ? HttpStatus.CREATED : HttpStatus.OK;
    return res.status(statusCode).json({
      completion: result.completion,
      courseProgressPct: result.courseProgressPct,
      message: result.created ? 'Module completed' : 'Module already completed',
    });
  }

  /**
   * GET /v1/courses/:courseId/modules/completions
   *
   * Get the authenticated student's module completions for a given course.
   */
  @Get('courses/:courseId/modules/completions')
  @ApiOperation({
    summary: "Get student's module completions for a course",
    description: 'Returns all module completion records for the authenticated student in a course.',
  })
  @ApiParam({ name: 'courseId', description: 'UUID of the course' })
  @ApiResponse({
    status: 200,
    description: 'List of module completions',
    schema: {
      example: [
        {
          id: 'uuid',
          moduleId: 'uuid',
          courseId: 'uuid',
          completedAt: '2026-08-30T10:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  getCompletions(
    @Param('courseId') courseId: string,
    @Request() req,
  ) {
    return this.service.getByUserAndCourse(req.user.id, courseId);
  }
}
