import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SurveysService } from './surveys.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('surveys')
@ApiBearerAuth()
@Controller('v1/surveys')
@UseGuards(JwtAuthGuard)
export class SurveysController {
  constructor(private surveysService: SurveysService) {}

  @Post()
  @ApiOperation({ summary: 'Create a survey' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  async createSurvey(
    @Body()
    body: {
      courseId: string;
      title: string;
      description: string;
      triggerType: 'completion' | 'milestone';
      triggerMilestone?: number;
      allowAnonymous?: boolean;
    },
  ) {
    return this.surveysService.createSurvey(
      body.courseId,
      body.title,
      body.description,
      body.triggerType,
      body.triggerMilestone,
      body.allowAnonymous,
    );
  }

  @Post(':surveyId/questions')
  @ApiOperation({ summary: 'Add a question to a survey' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  async addQuestion(
    @Param('surveyId') surveyId: string,
    @Body()
    body: {
      text: string;
      type: 'rating' | 'text' | 'mcq';
      order: number;
      options?: string[];
      required?: boolean;
    },
  ) {
    return this.surveysService.addQuestion(
      surveyId,
      body.text,
      body.type,
      body.order,
      body.options,
      body.required,
    );
  }

  @Post(':surveyId/responses')
  @ApiOperation({ summary: 'Submit a survey response' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async submitResponse(
    @Request() req: { user: { id: string } },
    @Param('surveyId') surveyId: string,
    @Body() body: { answers: Record<string, string | number>; isAnonymous?: boolean },
  ) {
    return this.surveysService.submitResponse(surveyId, req.user.id, body.answers, body.isAnonymous);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get surveys for a course' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getSurveysByCourse(@Param('courseId') courseId: string) {
    return this.surveysService.getSurveyByCourse(courseId);
  }

  @Get(':surveyId/responses')
  @ApiOperation({ summary: 'Get survey responses' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  async getResponses(@Param('surveyId') surveyId: string) {
    return this.surveysService.getResponsesForSurvey(surveyId);
  }

  @Get(':surveyId/analytics')
  @ApiOperation({ summary: 'Get survey analytics' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  async getAnalytics(@Param('surveyId') surveyId: string) {
    return this.surveysService.getAnalytics(surveyId);
  }

  @Get('instructor/:instructorId/aggregate')
  @ApiOperation({ summary: 'Get instructor survey aggregate' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  async getInstructorAggregate(@Param('instructorId') instructorId: string) {
    return this.surveysService.getInstructorSurveyAggregate(instructorId);
  }
}
