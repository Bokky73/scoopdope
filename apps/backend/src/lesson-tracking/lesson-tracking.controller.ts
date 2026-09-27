import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { LessonTrackingService } from './lesson-tracking.service';
import {
  StartStudySessionDto,
  EndStudySessionDto,
  HeartbeatStudySessionDto,
} from './dto/study-session.dto';

@ApiTags('lesson-tracking')
@Controller('lesson-tracking')
export class LessonTrackingController {
  constructor(private service: LessonTrackingService) {}

  @Post('sessions/start')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start a study session for a lesson' })
  @ApiBody({ type: StartStudySessionDto })
  @ApiResponse({
    status: 201,
    description: 'Study session started',
    schema: {
      example: {
        id: 'uuid',
        userId: 'uuid',
        lessonId: 'uuid',
        startedAt: '2024-01-01T00:00:00Z',
        durationSeconds: 0,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(201)
  async startSession(
    @CurrentUser() user: any,
    @Body() dto: StartStudySessionDto,
  ) {
    return this.service.startSession(user.id, dto.lessonId, dto.courseId);
  }

  @Post('sessions/end')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'End a study session' })
  @ApiBody({ type: EndStudySessionDto })
  @ApiResponse({
    status: 200,
    description: 'Study session ended',
    schema: {
      example: {
        id: 'uuid',
        durationSeconds: 600,
        endedAt: '2024-01-01T00:10:00Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async endSession(@Body() dto: EndStudySessionDto) {
    return this.service.endSession(dto.sessionId);
  }

  @Post('sessions/heartbeat')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send heartbeat to keep session alive' })
  @ApiBody({ type: HeartbeatStudySessionDto })
  @ApiResponse({ status: 200, description: 'Heartbeat received' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async heartbeat(@Body() dto: HeartbeatStudySessionDto) {
    return this.service.heartbeat(dto.sessionId);
  }

  @Get('lessons/:lessonId/stats')
  @ApiOperation({ summary: 'Get time statistics for a lesson' })
  @ApiResponse({
    status: 200,
    description: 'Lesson time statistics',
    schema: {
      example: {
        lessonId: 'uuid',
        averageTimeSeconds: 1200,
        totalTimeSeconds: 12000,
        studentCount: 10,
        isDifficult: true,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async getLessonStats(@Param('lessonId') lessonId: string) {
    return this.service.getLessonStats(lessonId);
  }

  @Get('courses/:courseId/lesson-stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get time statistics for all lessons in a course' })
  @ApiResponse({
    status: 200,
    description: 'Lesson statistics for course',
    schema: {
      example: {
        data: [
          {
            lessonId: 'uuid',
            title: 'Lesson 1',
            averageTimeSeconds: 1200,
            studentCount: 10,
            isDifficult: true,
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getCourseLessonStats(@Param('courseId') courseId: string) {
    const stats = await this.service.getCourseLessonStats(courseId);
    return { data: stats };
  }

  @Get('courses/:courseId/difficulty-report')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get difficulty report for a course' })
  @ApiResponse({
    status: 200,
    description: 'Difficulty report',
    schema: {
      example: {
        courseId: 'uuid',
        difficultLessons: [
          {
            lessonId: 'uuid',
            title: 'Hard Lesson',
            averageTimeSeconds: 2400,
            studentCount: 10,
          },
        ],
        overallMedianTimeSeconds: 1200,
        recommendedThreshold: 1800,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getDifficultyReport(@Param('courseId') courseId: string) {
    return this.service.getDifficultyReport(courseId);
  }

  @Get('users/:userId/lessons/:lessonId/time')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get total time spent by student on a lesson' })
  @ApiResponse({
    status: 200,
    description: 'Total time in seconds',
    schema: { example: { durationSeconds: 1200 } },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserLessonTime(
    @Param('userId') userId: string,
    @Param('lessonId') lessonId: string,
  ) {
    const durationSeconds = await this.service.getTotalTimeForLesson(userId, lessonId);
    return { durationSeconds };
  }

  @Get('users/:userId/courses/:courseId/time')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get total time spent by student on a course' })
  @ApiResponse({
    status: 200,
    description: 'Total time in seconds',
    schema: { example: { durationSeconds: 12000 } },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserCourseTime(
    @Param('userId') userId: string,
    @Param('courseId') courseId: string,
  ) {
    const durationSeconds = await this.service.getTotalTimeForCourse(userId, courseId);
    return { durationSeconds };
  }
}
