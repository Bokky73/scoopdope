import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdaptiveLearningService } from './adaptive-learning.service';

@ApiTags('adaptive-learning')
@Controller('adaptive-learning')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdaptiveLearningController {
  constructor(private readonly service: AdaptiveLearningService) {}

  @Post('record')
  @ApiOperation({ summary: 'Record quiz result and update difficulty' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  recordResult(
    @Request() req: { user: { id: string } },
    @Body() body: { topicId: string; score: number },
  ) {
    return this.service.recordQuizResult(req.user.id, body.topicId, body.score);
  }

  @Get('recommendations')
  @ApiOperation({ summary: 'Get remedial content recommendations for weak topics' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  getRecommendations(@Request() req: { user: { id: string } }) {
    return this.service.getRecommendations(req.user.id);
  }

  @Get('performance')
  @ApiOperation({ summary: 'Get student performance across all topics' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  getPerformance(@Request() req: { user: { id: string } }) {
    return this.service.getPerformance(req.user.id);
  }

  @Get('ab-test/:experiment')
  @ApiOperation({ summary: 'Get or assign A/B test variant for current user' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  getVariant(@Request() req: { user: { id: string } }, @Param('experiment') experiment: string) {
    return this.service.getOrAssignVariant(req.user.id, experiment);
  }

  @Post('ab-test/:experiment/outcome')
  @ApiOperation({ summary: 'Record A/B test outcome score' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  recordOutcome(
    @Request() req: { user: { id: string } },
    @Param('experiment') experiment: string,
    @Body() body: { score: number },
  ) {
    return this.service.recordAbOutcome(req.user.id, experiment, body.score);
  }

  @Get('ab-test/:experiment/results')
  @ApiOperation({ summary: 'Get A/B test aggregate results' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  getAbResults(@Param('experiment') experiment: string) {
    return this.service.getAbTestResults(experiment);
  }
}
