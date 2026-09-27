import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Header,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CoursesService } from './courses.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CourseQueryDto } from './dto/course-query.dto';
import { ScheduleCourseDto } from './dto/schedule-course.dto';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/audit-log.entity';
import { CourseStatus } from './course.entity';

/** Allowed MIME types for course thumbnails */
const THUMBNAIL_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
]);

/** 2 MB in bytes */
const THUMBNAIL_MAX_BYTES = 2 * 1024 * 1024;

@ApiTags('courses')
@Controller('v1/courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  @ApiOperation({ summary: 'Get all published courses' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by title or description (ILIKE)',
  })
  @ApiQuery({
    name: 'level',
    required: false,
    enum: ['beginner', 'intermediate', 'advanced'],
    description: 'Filter by level',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by course category',
  })
  @ApiQuery({
    name: 'language',
    required: false,
    description: 'Filter by BCP-47 language code (e.g. "en", "es", "fr", "ar")',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'Filter by category UUID',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by category slug (e.g. "blockchain")',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Results per page (default: 20)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated published courses',
    schema: { example: { data: [], total: 0, page: 1, limit: 20 } },
  })
  findAll(@Query() query: CourseQueryDto = {}) {
    return this.coursesService.findAll(query);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search published courses by title and description' })
  @ApiQuery({ name: 'q', required: false, description: 'Search query; empty returns all courses' })
  @ApiResponse({ status: 200, description: 'Ranked, paginated course search results' })
  search(@Query() query: CourseQueryDto) {
    return this.coursesService.search(query.q ?? query.search ?? '', query.page, query.limit);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get a course by ID' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({
    status: 200,
    description: 'Returns a single course',
    schema: { example: { data: {}, statusCode: 200, timestamp: '2024-01-01T00:00:00.000Z' } },
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found, or not visible to the requester (draft/pending courses)',
  })
  findOne(
    @Param('id') id: string,
    @Request() req: { user?: { id: string; role: string } },
  ) {
    return this.coursesService.findOneForViewer(id, req.user);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({
    schema: {
      example: {
        title: 'Intro to Stellar',
        description: 'Learn Stellar basics',
        level: 'beginner',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Course created successfully',
    schema: { example: { data: {}, statusCode: 201, timestamp: '2024-01-01T00:00:00.000Z' } },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  create(@Body() data: any) {
    return this.coursesService.create(data);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a course' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({ schema: { example: { title: 'Updated title', description: 'Updated description' } } })
  @ApiResponse({
    status: 200,
    description: 'Course updated successfully',
    schema: { example: { data: {}, statusCode: 200, timestamp: '2024-01-01T00:00:00.000Z' } },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.coursesService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a course' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({
    status: 200,
    description: 'Course deleted successfully',
    schema: { example: { data: {}, statusCode: 200, timestamp: '2024-01-01T00:00:00.000Z' } },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  delete(@Param('id') id: string) {
    return this.coursesService.delete(id);
  }

  @Post(':id/schedule')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Schedule a course for future publication' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({ type: ScheduleCourseDto })
  @ApiResponse({ status: 200, description: 'Course scheduled' })
  @ApiResponse({ status: 400, description: 'scheduledAt must be in the future' })
  schedule(@Param('id') id: string, @Body() dto: ScheduleCourseDto) {
    const scheduledAt = resolveScheduledAt(dto.scheduledAt, dto.timezone);
    return this.coursesService.scheduleCourse(id, scheduledAt);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Immediately publish a course' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 200, description: 'Course published' })
  publishNow(@Param('id') id: string) {
    return this.coursesService.publishNow(id);
  }

  @Put(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Submit a draft course for admin review (DRAFT -> PENDING_REVIEW)',
  })
  @ApiResponse({ status: 200, description: 'Course moved to PENDING_REVIEW' })
  @ApiResponse({
    status: 400,
    description: 'Course is not a draft, or is missing title/description/modules',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the course owner' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  submitForReview(
    @Param('id') id: string,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.coursesService.submitForReview(id, req.user);
  }

  @Put(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Approve a course pending review and publish it (PENDING_REVIEW -> PUBLISHED)',
  })
  @ApiResponse({ status: 200, description: 'Course published' })
  @ApiResponse({
    status: 400,
    description: 'Course is not pending review, or is missing title/description/modules',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  approve(@Param('id') id: string) {
    return this.coursesService.approveCourse(id);
  }

  @Put(':id/archive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Archive a published course (PUBLISHED -> ARCHIVED)' })
  @ApiResponse({ status: 200, description: 'Course archived' })
  @ApiResponse({ status: 400, description: 'Course is not currently published' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the course owner' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  archive(
    @Param('id') id: string,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.coursesService.archiveCourse(id, req.user);
  }
}

/**
 * Converts an ISO datetime string to a UTC Date, optionally interpreting it
 * in the given IANA timezone (e.g. "America/New_York").
 *
 * If the input already carries a UTC offset (e.g. "2026-05-01T10:00:00-05:00")
 * the timezone parameter is ignored — the offset in the string takes precedence.
 */
function resolveScheduledAt(isoString: string, timezone?: string): Date {
  // If the string already has an explicit offset, parse it directly.
  if (/[+-]\d{2}:\d{2}$|Z$/.test(isoString)) {
    return new Date(isoString);
  }

  if (!timezone) {
    return new Date(isoString);
  }

  // Use Intl to find the UTC offset for the given timezone at the requested moment.
  const naive = new Date(isoString);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  // Re-parse the formatted local time back to UTC via the offset trick.
  const parts = formatter.formatToParts(naive);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const localDate = new Date(
    Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second')),
  );
  const offsetMs = localDate.getTime() - naive.getTime();
  return new Date(naive.getTime() - offsetMs);
}

/**
 * Admin-only course management controller.
 * Handles listing all courses (regardless of status), approval, archive/unarchive, and deletion.
 */
@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/courses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminCoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'List all courses (admin — all statuses, with filters)' })
  @ApiResponse({ status: 200, description: 'Paginated list of courses' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiQuery({ name: 'status', required: false, enum: CourseStatus })
  @ApiQuery({ name: 'instructorId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAllAdmin(
    @Query('status') status?: string,
    @Query('instructorId') instructorId?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.coursesService.findAllAdmin({
      status: status as CourseStatus | undefined,
      instructorId,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Post(':id/approve')
  @Roles('admin')
  @ApiOperation({ summary: 'Approve a pending course (publishes it)' })
  @ApiResponse({ status: 200, description: 'Course approved and published' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async approveCourse(
    @Param('id') id: string,
    @Req() req: { user: { id: string }; ip: string; headers: Record<string, string> },
  ) {
    const course = await this.coursesService.approveCourse(id);

    await this.auditService.log(
      AuditAction.COURSE_APPROVED,
      req.user.id,
      true,
      {
        resourceType: 'course',
        resourceId: id,
        changes: { status: { from: CourseStatus.PENDING, to: CourseStatus.PUBLISHED } },
        metadata: { courseTitle: course.title },
        ipAddress: req.ip,
        userAgent: req.headers?.['user-agent'],
      },
    );

    return course;
  }

  @Post(':id/archive')
  @Roles('admin')
  @ApiOperation({ summary: 'Archive a course' })
  @ApiResponse({ status: 200, description: 'Course archived' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async archiveCourse(
    @Param('id') id: string,
    @Req() req: { user: { id: string }; ip: string; headers: Record<string, string> },
  ) {
    const { course, previousStatus } = await this.coursesService.archiveCourse(id);

    await this.auditService.log(
      AuditAction.COURSE_ARCHIVED,
      req.user.id,
      true,
      {
        resourceType: 'course',
        resourceId: id,
        changes: { status: { from: previousStatus, to: CourseStatus.ARCHIVED } },
        metadata: { courseTitle: course.title },
        ipAddress: req.ip,
        userAgent: req.headers?.['user-agent'],
      },
    );

    return course;
  }

  @Post(':id/unarchive')
  @Roles('admin')
  @ApiOperation({ summary: 'Unarchive a course (restores to published)' })
  @ApiResponse({ status: 200, description: 'Course unarchived' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async unarchiveCourse(
    @Param('id') id: string,
    @Req() req: { user: { id: string }; ip: string; headers: Record<string, string> },
  ) {
    const course = await this.coursesService.unarchiveCourse(id);

    await this.auditService.log(
      AuditAction.COURSE_UNARCHIVED,
      req.user.id,
      true,
      {
        resourceType: 'course',
        resourceId: id,
        changes: { status: { from: CourseStatus.ARCHIVED, to: CourseStatus.PUBLISHED } },
        metadata: { courseTitle: course.title },
        ipAddress: req.ip,
        userAgent: req.headers?.['user-agent'],
      },
    );

    return course;
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Permanently delete a course (admin only)' })
  @ApiResponse({ status: 200, description: 'Course deleted' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteCourse(
    @Param('id') id: string,
    @Req() req: { user: { id: string }; ip: string; headers: Record<string, string> },
  ) {
    const course = await this.coursesService.findOneAdmin(id);
    const result = await this.coursesService.delete(id);

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

    return result;
  }
}
