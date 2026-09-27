import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ModulesService } from './modules.service';
import { LessonsService } from './lessons.service';
import { TranscribeService } from './transcribe.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { CourseModule } from './course-module.entity';

@ApiTags('modules')
@Controller()
export class ModulesController {
  constructor(
    private modulesService: ModulesService,
    private lessonsService: LessonsService,
    private transcribeService: TranscribeService
  ) {}

  // ── Modules ──────────────────────────────────────────────────────────────

  @Get('courses/:courseId/modules')
  @ApiOperation({ summary: 'Get all modules for a course' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({
    status: 200,
    description: 'List of modules',
    schema: { example: [{ id: 'uuid', title: 'Module 1', order: 1 }] },
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  getModules(@Param('courseId') courseId: string) {
    return this.modulesService.findByCourse(courseId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  @Post('courses/:courseId/modules')
  @ApiOperation({ summary: 'Create a module in a course' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({ schema: { example: { title: 'Module 1', description: 'Intro module', order: 1 } } })
  @ApiResponse({
    status: 201,
    description: 'Module created',
    schema: { example: { id: 'uuid', title: 'Module 1' } },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  createModule(@Param('courseId') courseId: string, @Body() dto: CreateModuleDto) {
    const payload: Partial<CourseModule> = {
      ...dto,
      releaseDate: dto.releaseDate ? new Date(dto.releaseDate) : undefined,
    };
    return this.modulesService.create(courseId, payload);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  @Patch('modules/:id')
  @ApiOperation({ summary: 'Update a module' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({ schema: { example: { title: 'Updated title', order: 2 } } })
  @ApiResponse({ status: 200, description: 'Module updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Module not found' })
  updateModule(@Param('id') id: string, @Body() dto: Partial<CreateModuleDto>) {
    const payload: Partial<CourseModule> = {
      ...dto,
      releaseDate: dto.releaseDate ? new Date(dto.releaseDate) : undefined,
    };
    return this.modulesService.update(id, payload);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  @Delete('modules/:id')
  @ApiOperation({ summary: 'Delete a module' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 200, description: 'Module deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Module not found' })
  deleteModule(@Param('id') id: string) {
    return this.modulesService.remove(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('modules/:id/unlock')
  @ApiOperation({
    summary: 'Admin override: unlock a module immediately by clearing its release date',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({
    status: 200,
    description: 'Module unlocked',
    schema: { example: { id: 'uuid', title: 'Module 1', isLocked: false } },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Module not found' })
  unlockModule(@Param('id') id: string) {
    return this.modulesService.unlockNow(id);
  }

  // ── Lessons ───────────────────────────────────────────────────────────────

  @Get('modules/:moduleId/lessons')
  @ApiOperation({ summary: 'Get all lessons for a module' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({
    status: 200,
    description: 'List of lessons',
    schema: { example: [{ id: 'uuid', title: 'Lesson 1', order: 1 }] },
  })
  @ApiResponse({ status: 404, description: 'Module not found' })
  getLessons(@Param('moduleId') moduleId: string) {
    return this.lessonsService.findByModule(moduleId);
  }

  @Get('lessons/:id')
  @ApiOperation({ summary: 'Get a lesson by id' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 200, description: 'Lesson found' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  getLesson(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  @Post('modules/:moduleId/lessons')
  @ApiOperation({ summary: 'Create a lesson in a module' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({ schema: { example: { title: 'Lesson 1', content: 'Content here', order: 1 } } })
  @ApiResponse({
    status: 201,
    description: 'Lesson created',
    schema: { example: { id: 'uuid', title: 'Lesson 1' } },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  createLesson(@Param('moduleId') moduleId: string, @Body() dto: CreateLessonDto) {
    return this.lessonsService.create(moduleId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  @Patch('lessons/:id')
  @ApiOperation({ summary: 'Update a lesson' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({ schema: { example: { title: 'Updated title', content: 'New content' } } })
  @ApiResponse({ status: 200, description: 'Lesson updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  updateLesson(@Param('id') id: string, @Body() dto: Partial<CreateLessonDto>) {
    return this.lessonsService.update(id, dto);
  }

  /**
   * PATCH /v1/lessons/:lessonId
   * Update lesson content with HTML sanitization and learning objectives.
   * Requires instructor role and course ownership validation.
   * 
   * Acceptance Criteria:
   * - Endpoint requires INSTRUCTOR role
   * - Nonexistent lesson returns 404
   * - Non-course instructor receives 403 Forbidden
   * - Content required and validated (min 10 chars)
   * - HTML is sanitized (no script tags)
   * - Learning objectives array stored
   * - Duration is numeric and positive
   * - Response includes updated_at timestamp
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  @Patch('v1/lessons/:lessonId')
  @ApiOperation({
    summary: 'Update lesson content with sanitization',
    description: 'Add or update lesson content, learning objectives, and duration. Instructor must teach the course containing the lesson.',
  })
  @ApiBody({
    type: UpdateLessonContentDto,
    description: 'Lesson content update payload',
    examples: {
      example1: {
        summary: 'Update content with learning objectives',
        value: {
          content: '<p>This is the lesson <strong>content</strong> with some HTML formatting.</p>',
          learningObjectives: [
            'Understand the basics of blockchain',
            'Implement a simple smart contract',
          ],
          estimatedDurationMinutes: 45,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Lesson content updated successfully',
    schema: {
      example: {
        id: 'uuid',
        moduleId: 'uuid',
        title: 'Lesson Title',
        content: '<p>Updated content</p>',
        learningObjectives: ['Objective 1', 'Objective 2'],
        durationMinutes: 45,
        videoUrl: null,
        order: 0,
        createdAt: '2025-01-15T10:30:00Z',
        updatedAt: '2025-01-15T11:45:00Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation failed - content must be at least 10 characters' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 403, description: 'Forbidden - Instructor does not teach this course' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateLessonContent(
    @Param('lessonId') lessonId: string,
    @Body() dto: UpdateLessonContentDto,
    @Request() req: any,
  ) {
    const instructorId = req.user.id;
    
    return this.lessonsService.updateContent(lessonId, instructorId, {
      content: dto.content,
      learningObjectives: dto.learningObjectives,
      durationMinutes: dto.estimatedDurationMinutes,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  @Delete('lessons/:id')
  @ApiOperation({ summary: 'Delete a lesson' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 200, description: 'Lesson deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  deleteLesson(@Param('id') id: string) {
    return this.lessonsService.remove(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  @Patch('modules/:moduleId/lessons/reorder')
  @ApiOperation({ summary: 'Reorder lessons within a module' })
  @ApiResponse({ status: 400, description: 'Bad request (invalid IDs or format)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Module or lesson not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({
    type: ReorderLessonsDto,
    description: 'Array of lesson IDs in desired order',
    examples: {
      example1: {
        value: {
          lessonIds: [
            'a1b2c3d4-e5f6-4g7h-8i9j-0k1l2m3n4o5p',
            'b2c3d4e5-f6g7-4h8i-9j0k-1l2m3n4o5p6q',
            'c3d4e5f6-g7h8-4i9j-0k1l-2m3n4o5p6q7r',
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Lessons reordered successfully',
    schema: {
      example: [
        { id: 'uuid-1', title: 'Lesson 1', order: 0 },
        { id: 'uuid-2', title: 'Lesson 2', order: 1 },
        { id: 'uuid-3', title: 'Lesson 3', order: 2 },
      ],
    },
  })
  reorderLessons(@Param('moduleId') moduleId: string, @Body() dto: ReorderLessonsDto) {
    return this.lessonsService.reorder(moduleId, dto.lessonIds);
  }

  @Get('lessons/:id/transcript/srt')
  @ApiOperation({ summary: 'Download lesson transcript as SRT' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async downloadSrt(@Param('id') id: string, @Res() res: Response) {
    const lesson = await this.lessonsService.findOne(id);
    if (!lesson || !lesson.transcriptSrt) throw new NotFoundException('Transcript not found');

    res.set({
      'Content-Type': 'text/plain',
      'Content-Disposition': `attachment; filename="lesson-${id}.srt"`,
    });
    res.send(lesson.transcriptSrt);
  }

  @Get('lessons/:id/transcript/pdf')
  @ApiOperation({ summary: 'Download lesson transcript as PDF' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const lesson = await this.lessonsService.findOne(id);
    if (!lesson || !lesson.transcript) throw new NotFoundException('Transcript not found');

    const pdfBuffer = this.transcribeService.generateTranscriptPdf(lesson);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="lesson-${id}.pdf"`,
    });
    res.send(pdfBuffer);
  }
}
