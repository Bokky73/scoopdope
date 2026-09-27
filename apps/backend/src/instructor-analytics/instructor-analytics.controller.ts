import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import {
  InstructorAnalyticsService,
  DateRangeFilter,
} from './instructor-analytics.service';

@ApiTags('instructor-analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1')
export class InstructorAnalyticsController {
  constructor(
    private readonly instructorAnalyticsService: InstructorAnalyticsService,
  ) {}

  /**
   * Get analytics dashboard for all courses by the authenticated instructor.
   * GET /v1/instructor/analytics
   */
  @Get('instructor/analytics')
  @UseGuards(RolesGuard)
  @Roles('instructor', 'admin')
  @ApiOperation({ summary: 'Get analytics dashboard for instructor' })
  @ApiQuery({ name: 'from', required: false, description: 'Start date (ISO 8601)' })
  @ApiQuery({ name: 'to', required: false, description: 'End date (ISO 8601)' })
  @ApiResponse({ status: 200, description: 'Analytics dashboard returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — instructor or admin only' })
  getInstructorDashboard(
    @Request() req: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const filter = this.parseFilter(from, to);
    const instructorId = req.user.id ?? req.user.sub;
    return this.instructorAnalyticsService.getInstructorDashboard(
      instructorId,
      filter,
    );
  }

  /**
   * Get detailed analytics for a specific course (instructor or admin).
   * GET /v1/courses/:id/instructor-analytics
   */
  @Get('courses/:id/instructor-analytics')
  @UseGuards(RolesGuard)
  @Roles('instructor', 'admin')
  @ApiOperation({ summary: 'Get detailed analytics for a course' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiQuery({ name: 'from', required: false, description: 'Start date (ISO 8601)' })
  @ApiQuery({ name: 'to', required: false, description: 'End date (ISO 8601)' })
  @ApiResponse({ status: 200, description: 'Course analytics returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — instructor or admin only' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  getCourseAnalytics(
    @Param('id') courseId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const filter = this.parseFilter(from, to);
    return this.instructorAnalyticsService.getCourseAnalytics(courseId, filter);
  }

  private parseFilter(from?: string, to?: string): DateRangeFilter {
    const filter: DateRangeFilter = {};
    if (from) {
      const d = new Date(from);
      if (isNaN(d.getTime())) throw new BadRequestException('Invalid "from" date');
      filter.from = d;
    }
    if (to) {
      const d = new Date(to);
      if (isNaN(d.getTime())) throw new BadRequestException('Invalid "to" date');
      filter.to = d;
    }
    return filter;
  }
}
