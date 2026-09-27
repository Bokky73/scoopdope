import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RecommendationsService } from './recommendations.service';
import { LearningPathService } from './learning-path.service';
import { LearningPathRequest, LearningPathResponse } from './learning-path.types';

@ApiTags('recommendations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/recommendations')
export class RecommendationsController {
  constructor(
    private readonly service: RecommendationsService,
    private readonly learningPath: LearningPathService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get personalized course recommendations' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecommendations(
    @Request() req: any,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const capped = Math.min(limit, 50);
    const recommendations = await this.service.getRecommendations(
      req.user.userId,
      capped,
    );
    return {
      data: recommendations,
      total: recommendations.length,
      limit: capped,
    };
  }

  @Post('learning-path')
  @ApiOperation({
    summary:
      'Course difficulty progression: recommended next courses, learning path, and completion %',
  })
  @ApiResponse({ status: 200, description: 'Learning path recommendations' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getLearningPath(
    @Body() body: LearningPathRequest,
  ): Promise<LearningPathResponse> {
    return this.learningPath.getRecommendations(body);
  }
}
