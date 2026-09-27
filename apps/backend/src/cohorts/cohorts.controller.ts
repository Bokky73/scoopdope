import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { CohortsService } from './cohorts.service';
import { CreateCohortDto } from './dto/create-cohort.dto';
import { AddMemberDto } from './dto/add-member.dto';

@ApiTags('cohorts')
@Controller('cohorts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CohortsController {
  constructor(private cohortsService: CohortsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  @ApiOperation({ summary: 'Create a new cohort (admin/instructor only)' })
  @ApiResponse({ status: 201, description: 'Cohort created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createCohort(
    @Body() data: CreateCohortDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.cohortsService.createCohort(user.id, data);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'List all cohorts (admin only)' })
  @ApiResponse({ status: 200, description: 'Returns all cohorts' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async listAll() {
    return this.cohortsService.findAll();
  }

  // NOTE: 'me' must come before ':id' to avoid being matched as a param
  @Get('me')
  @ApiOperation({ summary: 'Get cohorts the current user belongs to (student view)' })
  @ApiResponse({ status: 200, description: 'Returns cohort memberships for the current user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getMyCohorts(@CurrentUser() user: { id: string }) {
    return this.cohortsService.getStudentCohorts(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cohort by ID with members' })
  @ApiResponse({ status: 200, description: 'Returns cohort with member list' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Cohort not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getCohort(@Param('id') id: string) {
    return this.cohortsService.getCohort(id);
  }

  @Post(':cohortId/members')
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  @ApiOperation({ summary: 'Add a student to cohort (admin/instructor only)' })
  @ApiResponse({ status: 201, description: 'Member added' })
  @ApiResponse({ status: 400, description: 'Cohort is full or bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Cohort not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async addMember(
    @Param('cohortId') cohortId: string,
    @Body() data: AddMemberDto,
  ) {
    return this.cohortsService.addMember(cohortId, data.userId);
  }

  @Delete(':cohortId/members/:userId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  @ApiOperation({ summary: 'Remove a student from cohort (admin/instructor only)' })
  @ApiResponse({ status: 200, description: 'Member removed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async removeMember(
    @Param('cohortId') cohortId: string,
    @Param('userId') userId: string,
  ) {
    return this.cohortsService.removeMember(cohortId, userId);
  }

  @Get(':cohortId/progress')
  @ApiOperation({ summary: 'Get cohort member progress summary' })
  @ApiResponse({ status: 200, description: 'Returns average progress and per-member progress' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Cohort not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getCohortProgress(@Param('cohortId') cohortId: string) {
    return this.cohortsService.getCohortProgress(cohortId);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get cohorts for a course' })
  @ApiResponse({ status: 200, description: 'Returns cohorts for the given course' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getCohortsByCourse(@Param('courseId') courseId: string) {
    return this.cohortsService.getCohortsByCourse(courseId);
  }

  @Get(':id/analytics/export')
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  @ApiOperation({ summary: 'Export cohort analytics as CSV (admin/instructor only)' })
  @ApiResponse({ status: 200, description: 'CSV file download' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Cohort not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async exportAnalytics(@Param('id') id: string, @Res() res: Response) {
    const csv = await this.cohortsService.exportAnalyticsAsCsv(id);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="cohort-${id}-analytics.csv"`);
    return res.send(csv);
  }
}
