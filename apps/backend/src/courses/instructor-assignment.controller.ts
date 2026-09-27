import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { InstructorAssignmentService } from './instructor-assignment.service';

@ApiTags('instructor-assignments')
@Controller()
export class InstructorAssignmentController {
  constructor(private readonly service: InstructorAssignmentService) {}

  /**
   * POST /v1/courses/:courseId/instructors/:instructorId
   *
   * Assign an instructor to a course. Admin-only.
   */
  @Post('courses/:courseId/instructors/:instructorId')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Assign an instructor to a course',
    description:
      'Creates a teaching relationship between an instructor user and a course. ' +
      'The target user must have the instructor role. ' +
      'Requires ADMIN role.',
  })
  @ApiParam({ name: 'courseId', description: 'UUID of the course' })
  @ApiParam({ name: 'instructorId', description: 'UUID of the instructor user' })
  @ApiResponse({
    status: 201,
    description: 'Instructor successfully assigned',
    schema: {
      example: {
        id: 'uuid',
        courseId: 'uuid',
        instructorId: 'uuid',
        assignedAt: '2026-08-30T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'User does not have instructor role' })
  @ApiResponse({ status: 401, description: 'Unauthorized – JWT required' })
  @ApiResponse({ status: 403, description: 'Forbidden – ADMIN role required' })
  @ApiResponse({ status: 404, description: 'Course or instructor not found' })
  @ApiResponse({ status: 409, description: 'Instructor already assigned to this course' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  assign(
    @Param('courseId') courseId: string,
    @Param('instructorId') instructorId: string,
  ) {
    return this.service.assign(courseId, instructorId);
  }

  /**
   * DELETE /v1/courses/:courseId/instructors/:instructorId
   *
   * Remove an instructor from a course. Admin-only.
   */
  @Delete('courses/:courseId/instructors/:instructorId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remove an instructor from a course',
    description: 'Removes the teaching relationship. Requires ADMIN role.',
  })
  @ApiParam({ name: 'courseId', description: 'UUID of the course' })
  @ApiParam({ name: 'instructorId', description: 'UUID of the instructor user' })
  @ApiResponse({ status: 204, description: 'Instructor successfully removed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden – ADMIN role required' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async unassign(
    @Param('courseId') courseId: string,
    @Param('instructorId') instructorId: string,
  ) {
    await this.service.unassign(courseId, instructorId);
  }

  /**
   * GET /v1/courses/:courseId/instructors
   *
   * List all instructors assigned to a course. Admin-only.
   */
  @Get('courses/:courseId/instructors')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List instructors assigned to a course',
    description: 'Returns all instructor assignments for the given course. Requires ADMIN role.',
  })
  @ApiParam({ name: 'courseId', description: 'UUID of the course' })
  @ApiResponse({ status: 200, description: 'List of instructor assignments' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden – ADMIN role required' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  listByCourse(@Param('courseId') courseId: string) {
    return this.service.listByCourse(courseId);
  }

  /**
   * GET /v1/instructors/:id/courses
   *
   * List all courses assigned to an instructor.
   * Accessible by admins and the instructor themselves.
   */
  @Get('instructors/:id/courses')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  @ApiBearerAuth()
  @ApiOperation({
    summary: "List instructor's assigned courses",
    description:
      'Returns all courses the instructor is assigned to teach. ' +
      'Accessible by admins and instructors.',
  })
  @ApiParam({ name: 'id', description: 'UUID of the instructor user' })
  @ApiResponse({
    status: 200,
    description: "List of instructor's course assignments",
    schema: {
      example: [
        {
          id: 'uuid',
          courseId: 'uuid',
          instructorId: 'uuid',
          assignedAt: '2026-08-30T10:00:00.000Z',
          course: {
            id: 'uuid',
            title: 'Intro to Stellar',
            status: 'published',
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Instructor not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  listByInstructor(@Param('id') id: string) {
    return this.service.listByInstructor(id);
  }
}
