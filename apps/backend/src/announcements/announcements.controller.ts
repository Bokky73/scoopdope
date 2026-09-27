import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { AnnouncementQueryDto } from './dto/announcement-query.dto';

@ApiTags('courses / announcements')
@Controller('v1/courses/:courseId/announcements')
export class AnnouncementsController {
  constructor(private readonly service: AnnouncementsService) {}

  /**
   * Create an announcement for a course (instructor only)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a course announcement (instructor only)' })
  @ApiResponse({
    status: 201,
    description: 'Announcement created successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        courseId: '550e8400-e29b-41d4-a716-446655440001',
        instructorId: '550e8400-e29b-41d4-a716-446655440002',
        title: 'Course Update',
        content: 'Module 3 is now available',
        createdAt: '2024-01-15T10:00:00Z',
        instructor: {
          id: '550e8400-e29b-41d4-a716-446655440002',
          email: 'instructor@example.com',
          username: 'instructor',
          avatar: null,
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the course instructor' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  create(@Request() req: { user: { id: string } }, @Body() dto: CreateAnnouncementDto) {
    return this.service.create(req.user.id, dto.courseId, dto.title, dto.body);
  }

  /**
   * Get all announcements for a course (paginated and sorted)
   */
  @Get()
  @ApiOperation({ summary: 'List announcements for a course' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated and sorted announcements',
    schema: {
      example: {
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            courseId: '550e8400-e29b-41d4-a716-446655440001',
            instructorId: '550e8400-e29b-41d4-a716-446655440002',
            title: 'Course Update',
            content: 'Module 3 is now available',
            createdAt: '2024-01-15T10:00:00Z',
            instructor: {
              id: '550e8400-e29b-41d4-a716-446655440002',
              email: 'instructor@example.com',
              username: 'instructor',
              avatar: null,
            },
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async list(@Param('courseId') courseId: string, @Query() query: AnnouncementQueryDto) {
    return this.service.findByCourse(courseId, query);
  }

  /**
   * Get a single announcement by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a single announcement by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns a single announcement',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        courseId: '550e8400-e29b-41d4-a716-446655440001',
        instructorId: '550e8400-e29b-41d4-a716-446655440002',
        title: 'Course Update',
        content: 'Module 3 is now available',
        createdAt: '2024-01-15T10:00:00Z',
        instructor: {
          id: '550e8400-e29b-41d4-a716-446655440002',
          email: 'instructor@example.com',
          username: 'instructor',
          avatar: null,
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Announcement not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  /**
   * Delete an announcement (instructor only)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an announcement (instructor only)' })
  @ApiResponse({ status: 204, description: 'Announcement deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the announcement owner' })
  @ApiResponse({ status: 404, description: 'Announcement not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  remove(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.service.remove(id, req.user.id);
  }
}
