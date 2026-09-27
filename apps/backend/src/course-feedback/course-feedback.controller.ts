import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CourseFeedbackService } from './course-feedback.service';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';

@ApiTags('course-feedback')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1')
export class CourseFeedbackController {
  constructor(
    private readonly courseFeedbackService: CourseFeedbackService,
  ) {}

  /**
   * Submit feedback for a completed course.
   * POST /v1/courses/:id/feedback
   */
  @Post('courses/:id/feedback')
  @ApiOperation({ summary: 'Submit feedback for a completed course' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({ status: 201, description: 'Feedback submitted' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not enrolled or course not completed' })
  @ApiResponse({ status: 409, description: 'Feedback already submitted' })
  async submitFeedback(
    @Param('id') courseId: string,
    @Body() dto: SubmitFeedbackDto,
    @Request() req: any,
  ) {
    const userId = req.user.id ?? req.user.sub;
    return this.courseFeedbackService.submitFeedback(userId, courseId, dto);
  }

  /**
   * Get feedback summary (averages + trend) for a course.
   * Accessible by instructors and admins.
   * GET /v1/courses/:id/feedback-summary
   */
  @Get('courses/:id/feedback-summary')
  @UseGuards(RolesGuard)
  @Roles('instructor', 'admin')
  @ApiOperation({ summary: 'Get feedback summary for a course' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({ status: 200, description: 'Summary returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Instructor or admin only' })
  async getFeedbackSummary(@Param('id') courseId: string) {
    return this.courseFeedbackService.getFeedbackSummary(courseId);
  }

  /**
   * Get all individual feedback responses for a course.
   * GET /v1/courses/:id/feedback
   */
  @Get('courses/:id/feedback')
  @UseGuards(RolesGuard)
  @Roles('instructor', 'admin')
  @ApiOperation({ summary: 'Get all feedback responses for a course' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({ status: 200, description: 'Feedback responses returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Instructor or admin only' })
  async getFeedbackResponses(@Param('id') courseId: string) {
    return this.courseFeedbackService.getFeedbackResponses(courseId);
  }

  /**
   * Download all feedback as JSON (for CSV export use case).
   * GET /v1/courses/:id/feedback/export
   */
  @Get('courses/:id/feedback/export')
  @UseGuards(RolesGuard)
  @Roles('instructor', 'admin')
  @ApiOperation({ summary: 'Export feedback report as JSON' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({ status: 200, description: 'Feedback report downloaded' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Instructor or admin only' })
  async exportFeedback(
    @Param('id') courseId: string,
    @Res() res: Response,
  ) {
    const data = await this.courseFeedbackService.exportFeedback(courseId);
    const filename = `feedback-${courseId}-${new Date().toISOString().slice(0, 10)}.json`;
    res
      .status(HttpStatus.OK)
      .header('Content-Type', 'application/json')
      .header('Content-Disposition', `attachment; filename="${filename}"`)
      .json(data);
  }
}
