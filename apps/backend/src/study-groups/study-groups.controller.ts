import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Request,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { StudyGroupsService } from './study-groups.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class CreateStudyGroupDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

@ApiTags('study-groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class StudyGroupsController {
  constructor(private studyGroupsService: StudyGroupsService) {}

  /**
   * GET /v1/courses/:courseId/study-groups
   * Returns all study groups for the given course (with member counts).
   */
  @Get('courses/:courseId/study-groups')
  @ApiOperation({ summary: 'List study groups for a course' })
  @ApiParam({ name: 'courseId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Array of study groups with member counts' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByCourse(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.studyGroupsService.findByCourse(courseId);
  }

  /**
   * GET /v1/study-groups/:id
   * Returns a single study group with its full member list.
   */
  @Get('study-groups/:id')
  @ApiOperation({ summary: 'Get a study group by ID (includes member list)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Study group detail with members' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Study group not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.studyGroupsService.findOne(id);
  }

  /**
   * POST /v1/study-groups
   * Create a new study group within a course. Requires courseId in the body.
   * The authenticated user becomes the creator and is auto-joined.
   */
  @Post('study-groups')
  @ApiOperation({ summary: 'Create a study group for a course' })
  @ApiBody({
    schema: {
      example: {
        courseId: 'uuid',
        name: 'Stellar Builders',
        description: 'Weekly sessions on Soroban smart contracts',
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Study group created; creator auto-joined' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Request() req,
    @Body() body: CreateStudyGroupDto & { courseId: string },
  ) {
    return this.studyGroupsService.create(body.courseId, req.user.id, body);
  }

  /**
   * POST /v1/study-groups/:id/join
   */
  @Post('study-groups/:id/join')
  @ApiOperation({ summary: 'Join a study group' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Joined the study group' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Study group not found' })
  @ApiResponse({ status: 409, description: 'Already a member' })
  join(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.studyGroupsService.join(id, req.user.id);
  }

  /**
   * DELETE /v1/study-groups/:id/leave
   */
  @Delete('study-groups/:id/leave')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Leave a study group' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Left the study group' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not a member / group not found' })
  leave(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.studyGroupsService.leave(id, req.user.id);
  }

  /**
   * DELETE /v1/study-groups/:id
   * Creator-only; group must be empty (only creator left).
   */
  @Delete('study-groups/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an empty study group (creator only)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Study group deleted' })
  @ApiResponse({ status: 400, description: 'Group still has members' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Only the creator can delete' })
  @ApiResponse({ status: 404, description: 'Study group not found' })
  delete(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.studyGroupsService.delete(id, req.user.id);
  }

  /**
   * GET /v1/study-groups/:id/members
   */
  @Get('study-groups/:id/members')
  @ApiOperation({ summary: 'Get all members of a study group' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Array of study group members' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Study group not found' })
  getMembers(@Param('id', ParseUUIDPipe) id: string) {
    return this.studyGroupsService.getMembers(id);
  }
}
