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
  Header,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
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
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CourseQueryDto } from './dto/course-query.dto';
import { ScheduleCourseDto } from './dto/schedule-course.dto';

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
@Controller('courses')
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
    name: 'language',
    required: false,
    description: 'Filter by BCP-47 language code (e.g. "en", "es", "fr", "ar")',
  })
  @ApiQuery({
    name: 'tags',
    required: false,
    isArray: true,
    description: 'Filter by tags (comma-separated or repeated). Courses must match ALL provided tags.',
    example: 'defi,nft',
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
  findAll(@Query() query: CourseQueryDto) {
    return this.coursesService.findAll(query);
  }

  @Get(':id')
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
  @ApiResponse({ status: 404, description: 'Course not found' })
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
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

  @Post(':id/thumbnail')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a thumbnail image for a course (max 2 MB, image files only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Thumbnail image file (JPEG, PNG, GIF, WebP, SVG). Max 2 MB.',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 200, description: 'Thumbnail URL saved to the course record' })
  @ApiResponse({ status: 400, description: 'File missing, too large, or not an image' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: THUMBNAIL_MAX_BYTES },
      fileFilter: (_req, file, cb) => {
        if (THUMBNAIL_MIME_TYPES.has(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              `Unsupported file type "${file.mimetype}". Allowed types: ${[...THUMBNAIL_MIME_TYPES].join(', ')}`,
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadThumbnail(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded. Provide a "file" field in the form data.');
    }

    if (file.size > THUMBNAIL_MAX_BYTES) {
      throw new BadRequestException(
        `File exceeds the 2 MB size limit (received ${(file.size / 1024 / 1024).toFixed(2)} MB).`,
      );
    }

    // In production this buffer would be streamed to S3/CDN and a URL returned.
    // For now we store a data URI so the endpoint is immediately functional
    // without external storage dependencies.
    const base64 = file.buffer.toString('base64');
    const thumbnailUrl = `data:${file.mimetype};base64,${base64}`;

    const updated = await this.coursesService.update(id, { thumbnailUrl });
    return { thumbnailUrl: updated.thumbnailUrl };
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
