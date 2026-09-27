import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CoursesService } from './courses.service';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/audit-log.entity';
import { EnrollmentsService } from '../enrollments/enrollments.service';

@ApiTags('admin-courses')
@ApiBearerAuth()
@Controller('admin/courses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminCoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly auditService: AuditService,
    private readonly enrollmentsService: EnrollmentsService,
  ) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get all courses with filtering and pagination (admin only)' })
  @ApiResponse({ status: 200, description: 'Paginated courses' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status: draft, pending, published, archived' })
  @ApiQuery({ name: 'instructorId', required: false, description: 'Filter by instructor UUID' })
  async getCourses(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('status') status?: string,
    @Query('instructorId') instructorId?: string,
  ) {
    return this.coursesService.findAllAdmin({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      status,
      instructorId,
    });
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get a course by ID (admin view with full details)' })
  @ApiResponse({ status: 200, description: 'Course details' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getCourse(@Param('id') id: string) {
    const course = await this.coursesService.findOne(id);
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  @Get(':id/stats')
  @Roles('admin')
  @ApiOperation({ summary: 'Get course statistics (enrollments, completions, ratings)' })
  @ApiResponse({ status: 200, description: 'Course statistics' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getCourseStats(@Param('id') id: string) {
    const course = await this.coursesService.findOne(id);
    if (!course) throw new NotFoundException('Course not found');

    const enrollmentCount = await this.enrollmentsService.countByCoursId(id);
    const completionCount = await this.enrollmentsService.countCompletedByCourseId(id);
    const averageRating = await this.coursesService.getAverageRating(id);

    return {
      enrollmentCount,
      completionCount,
      averageRating,
      completionRate: enrollmentCount > 0 ? (completionCount / enrollmentCount) * 100 : 0,
    };
  }

  @Post(':id/approve')
  @Roles('admin')
  @ApiOperation({ summary: 'Approve a pending course for publication' })
  @ApiResponse({ status: 200, description: 'Course approved' })
  @ApiResponse({ status: 400, description: 'Course not in pending status' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async approveCourse(
    @Param('id') id: string,
    @Req() req: { user: { id: string }; ip: string; headers: Record<string, string> },
  ) {
    const course = await this.coursesService.findOne(id);
    if (!course) throw new NotFoundException('Course not found');
    if (course.status !== 'pending') {
      throw new BadRequestException('Only pending courses can be approved');
    }

    const updated = await this.coursesService.update(id, { status: 'published', publishedAt: new Date() });

    await this.auditService.log(
      AuditAction.COURSE_APPROVED,
      req.user.id,
      true,
      {
        resourceType: 'course',
        resourceId: id,
        changes: { status: { from: 'pending', to: 'published' } },
        metadata: { courseTitle: course.title },
        ipAddress: req.ip,
        userAgent: req.headers?.['user-agent'],
      },
    );

    return updated;
  }

  @Post(':id/reject')
  @Roles('admin')
  @ApiOperation({ summary: 'Reject a pending course' })
  @ApiResponse({ status: 200, description: 'Course rejected' })
  @ApiResponse({ status: 400, description: 'Course not in pending status' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async rejectCourse(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Req() req: { user: { id: string }; ip: string; headers: Record<string, string> },
  ) {
    const course = await this.coursesService.findOne(id);
    if (!course) throw new NotFoundException('Course not found');
    if (course.status !== 'pending') {
      throw new BadRequestException('Only pending courses can be rejected');
    }

    const updated = await this.coursesService.update(id, { status: 'draft' });

    await this.auditService.log(
      AuditAction.ADMIN_ACTION,
      req.user.id,
      true,
      {
        resourceType: 'course',
        resourceId: id,
        metadata: { action: 'course_rejected', reason, courseTitle: course.title },
        ipAddress: req.ip,
        userAgent: req.headers?.['user-agent'],
      },
    );

    return updated;
  }

  @Patch(':id/archive')
  @Roles('admin')
  @ApiOperation({ summary: 'Archive a published course' })
  @ApiResponse({ status: 200, description: 'Course archived' })
  @ApiResponse({ status: 400, description: 'Course not in published status' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async archiveCourse(
    @Param('id') id: string,
    @Req() req: { user: { id: string }; ip: string; headers: Record<string, string> },
  ) {
    const course = await this.coursesService.findOne(id);
    if (!course) throw new NotFoundException('Course not found');
    if (course.status !== 'published') {
      throw new BadRequestException('Only published courses can be archived');
    }

    const updated = await this.coursesService.update(id, { status: 'archived' });

    await this.auditService.log(
      AuditAction.COURSE_ARCHIVED,
      req.user.id,
      true,
      {
        resourceType: 'course',
        resourceId: id,
        changes: { status: { from: 'published', to: 'archived' } },
        metadata: { courseTitle: course.title },
        ipAddress: req.ip,
        userAgent: req.headers?.['user-agent'],
      },
    );

    return updated;
  }

  @Patch(':id/unarchive')
  @Roles('admin')
  @ApiOperation({ summary: 'Unarchive an archived course' })
  @ApiResponse({ status: 200, description: 'Course unarchived' })
  @ApiResponse({ status: 400, description: 'Course not in archived status' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async unarchiveCourse(
    @Param('id') id: string,
    @Req() req: { user: { id: string }; ip: string; headers: Record<string, string> },
  ) {
    const course = await this.coursesService.findOne(id);
    if (!course) throw new NotFoundException('Course not found');
    if (course.status !== 'archived') {
      throw new BadRequestException('Only archived courses can be unarchived');
    }

    const updated = await this.coursesService.update(id, { status: 'published' });

    await this.auditService.log(
      AuditAction.COURSE_UNARCHIVED,
      req.user.id,
      true,
      {
        resourceType: 'course',
        resourceId: id,
        changes: { status: { from: 'archived', to: 'published' } },
        metadata: { courseTitle: course.title },
        ipAddress: req.ip,
        userAgent: req.headers?.['user-agent'],
      },
    );

    return updated;
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a course (admin only)' })
  @ApiResponse({ status: 200, description: 'Course deleted' })
  @ApiResponse({ status: 400, description: 'Cannot delete published or pending courses' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async deleteCourse(
    @Param('id') id: string,
    @Req() req: { user: { id: string }; ip: string; headers: Record<string, string> },
  ) {
    const course = await this.coursesService.findOne(id);
    if (!course) throw new NotFoundException('Course not found');

    if (course.status === 'published' || course.status === 'pending') {
      throw new BadRequestException('Cannot delete published or pending courses. Archive first.');
    }

    await this.coursesService.delete(id);

    await this.auditService.log(
      AuditAction.COURSE_DELETED,
      req.user.id,
      true,
      {
        resourceType: 'course',
        resourceId: id,
        metadata: { courseTitle: course.title },
        ipAddress: req.ip,
        userAgent: req.headers?.['user-agent'],
      },
    );

    return { success: true };
  }
}
