import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProgressService } from './progress.service';
import { RecordProgressDto } from './dto/record-progress.dto';

@ApiTags('progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ProgressController {
  constructor(private progressService: ProgressService) {}

  @Post('progress')
  @ApiOperation({ summary: 'Record lesson completion and update on-chain progress' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({ schema: { example: { courseId: 'uuid', lessonId: 'uuid', progressPct: 75 } } })
  @ApiResponse({
    status: 201,
    description: 'Progress recorded',
    schema: { example: { id: 'uuid', courseId: 'uuid', progressPct: 75 } },
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  record(@Request() req: { user: { id: string; stellarPublicKey?: string } }, @Body() dto: RecordProgressDto) {
    return this.progressService.record(req.user.id, dto, req.user.stellarPublicKey ?? '');
  }

  @Get('users/:id/progress')
  @ApiOperation({ summary: 'Get all progress records for a user' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({
    status: 200,
    description: 'List of progress records',
    schema: {
      example: [{ courseId: 'uuid', progressPct: 75, updatedAt: '2024-01-01T00:00:00.000Z' }],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findByUser(@Param('id') id: string) {
    return this.progressService.findByUser(id);
  }

  @Get('courses/:courseId/progress')
  @ApiOperation({ summary: 'Get per-module/per-lesson progress for a course' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not enrolled in this course' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({
    status: 200,
    description: 'Returns course progress broken down by module and lesson',
    schema: {
      example: {
        courseId: 'uuid',
        overall_completion_percentage: 42,
        modules: [{ id: 'uuid', title: 'Module 1', status: 'in_progress', completionPercentage: 50 }],
        lessons: [{ id: 'uuid', title: 'Lesson 1', status: 'completed', last_accessed_at: null }],
        estimatedCompletionTime: { remainingLessons: 3, remainingMinutes: 30, estimatedDaysRemaining: 2 },
        streak: 4,
        lastActivityAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  getCourseProgress(@Param('courseId') courseId: string, @Request() req: { user: { id: string } }) {
    return this.progressService.getCourseProgress(req.user.id, courseId);
  }
}
