import { Body, Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EnrollmentsService } from './enrollments.service';

const ENROLLMENT_COUNT_TTL_MS = 60_000;

@ApiTags('enrollments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class EnrollmentsController {
  private enrollmentCountCache = new Map<
    string,
    { value: number; expiresAt: number }
  >();

  constructor(private enrollmentsService: EnrollmentsService) {}

  @Post('courses/:id/enroll')
  @ApiOperation({ summary: 'Enroll the current user in a course' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({
    status: 201,
    description: 'Enrolled successfully',
    schema: {
      example: {
        id: 'uuid',
        userId: 'uuid',
        courseId: 'uuid',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Prerequisites not completed' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 409, description: 'Already enrolled' })
  enroll(
    @Param('id') courseId: string,
    @Request() req: { user: { id: string; role: string } },
    @Body('adminOverride') adminOverride?: boolean,
  ) {
    const isAdmin = req.user.role === 'admin';
    return this.enrollmentsService.enroll(req.user.id, courseId, isAdmin && !!adminOverride);
  }

  @Post('enrollments')
  @ApiOperation({ summary: 'Enroll the current user in a course (by body courseId)' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 201, description: 'Enrolled successfully' })
  @ApiResponse({ status: 403, description: 'Prerequisites not completed' })
  @ApiResponse({ status: 409, description: 'Already enrolled' })
  enrollByBody(
    @Body('courseId') courseId: string,
    @Request() req: { user: { id: string; role: string } },
  ) {
    const isAdmin = req.user.role === 'admin';
    return this.enrollmentsService.enroll(req.user.id, courseId, false);
  }

  @Delete('courses/:id/enroll')
  @ApiOperation({ summary: 'Unenroll the current user from a course' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 200, description: 'Unenrolled successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  unenroll(@Param('id') courseId: string, @Request() req: { user: { id: string } }) {
    return this.enrollmentsService.unenroll(req.user.id, courseId);
  }

  @Get('users/:id/enrollments')
  @ApiOperation({ summary: 'Get all enrollments for a user' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({
    status: 200,
    description: 'List of enrollments',
    schema: { example: [{ id: 'uuid', courseId: 'uuid', createdAt: '2024-01-01T00:00:00.000Z' }] },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getUserEnrollments(@Param('id') userId: string) {
    return this.enrollmentsService.findByUser(userId);
  }

  @Get('courses/:id/enrollments/count')
  @ApiOperation({ summary: 'Get the enrollment count for a course' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({
    status: 200,
    description: 'Enrollment count for the course',
    schema: { example: { count: 42 } },
  })
  async getEnrollmentCount(@Param('id') courseId: string) {
    const cached = this.enrollmentCountCache.get(courseId);
    if (cached && cached.expiresAt > Date.now()) {
      return { count: cached.value };
    }

    const count = await this.enrollmentsService.countByCourse(courseId);
    this.enrollmentCountCache.set(courseId, {
      value: count,
      expiresAt: Date.now() + ENROLLMENT_COUNT_TTL_MS,
    });
    return { count };
  }

  @Post('courses/:id/enroll/upgrade-version')
  @ApiOperation({ summary: 'Upgrade enrollment to the latest course version' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 200, description: 'Enrollment upgraded to latest version' })
  @ApiResponse({ status: 404, description: 'Enrollment or version not found' })
  upgradeVersion(
    @Param('id') courseId: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.enrollmentsService.upgradeVersion(req.user.id, courseId);
  }
}
