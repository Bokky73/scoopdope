import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { QuizzesService } from './quizzes.service';

@ApiTags('quizzes')
@ApiBearerAuth()
@Controller('v1/quizzes')
@UseGuards(JwtAuthGuard)
export class QuizzesController {
  constructor(private quizzesService: QuizzesService) {}

  @Post(':lessonId')
  @ApiOperation({ summary: 'Create a quiz for a lesson' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createQuiz(@Param('lessonId') lessonId: string, @Body() data: any) {
    return this.quizzesService.createQuiz(lessonId, data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a quiz by ID' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getQuiz(@Param('id') id: string) {
    return this.quizzesService.getQuiz(id);
  }

  @Post(':quizId/questions')
  @ApiOperation({ summary: 'Add a question to a quiz' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async addQuestion(@Param('quizId') quizId: string, @Body() data: any) {
    return this.quizzesService.addQuestion(quizId, data);
  }

  @Post('questions/:questionId/answers')
  @ApiOperation({ summary: 'Add an answer to a quiz question' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async addAnswer(@Param('questionId') questionId: string, @Body() data: any) {
    return this.quizzesService.addAnswer(questionId, data);
  }

  @Post(':quizId/submit')
  @ApiOperation({ summary: 'Submit a quiz attempt' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async submitAttempt(
    @Param('quizId') quizId: string,
    @Body() data: any,
    @CurrentUser() user: any,
  ) {
    return this.quizzesService.submitAttempt(quizId, user.id, data.answers);
  }

  @Post(':attemptId/grade')
  @ApiOperation({ summary: 'Grade an essay question' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async gradeEssay(
    @Param('attemptId') attemptId: string,
    @Body() data: any,
  ) {
    return this.quizzesService.gradeEssay(
      attemptId,
      data.questionId,
      data.points,
      data.feedback,
    );
  }

  @Get(':quizId/attempts')
  @ApiOperation({ summary: 'Get attempts for a quiz' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAttempts(@Param('quizId') quizId: string, @CurrentUser() user: any) {
    return this.quizzesService.getAttempts(quizId, user.id);
  }
}
