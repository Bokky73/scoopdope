import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StudySessionsService } from './study-sessions.service';
import { CreateStudySessionDto } from './dto/create-study-session.dto';

@ApiTags('study-sessions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('v1/study-sessions')
export class StudySessionsController {
  constructor(private readonly service: StudySessionsService) {}

  /**
   * Called by the frontend when a study timer stops (tab blur, page unload, or manual stop).
   * The client sends the elapsed duration in seconds.
   */
  @Post()
  @ApiOperation({ summary: 'Record a completed study session' })
  @ApiResponse({ status: 201, description: 'Session recorded' })
  @ApiResponse({ status: 400, description: 'Invalid duration' })
  create(@Request() req: any, @Body() dto: CreateStudySessionDto) {
    return this.service.create(req.user.id, dto);
  }

  /**
   * Returns aggregated study stats for the authenticated user.
   * Used by #883 User Activity Dashboard.
   */
  @Get('me/stats')
  @ApiOperation({ summary: 'Get study time stats for the current user' })
  @ApiResponse({ status: 200, description: 'Study stats returned' })
  getMyStats(@Request() req: any) {
    return this.service.getStatsForUser(req.user.id);
  }

  /**
   * Returns study time for the current user in a specific course.
   */
  @Get('me/courses/:courseId')
  @ApiOperation({ summary: 'Get study time for current user in a course' })
  @ApiResponse({ status: 200, description: 'Course study time returned' })
  getMyCourseTime(@Request() req: any, @Param('courseId') courseId: string) {
    return this.service.getCourseTimeForUser(req.user.id, courseId);
  }
}
