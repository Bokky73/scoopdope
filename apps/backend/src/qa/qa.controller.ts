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
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { QaService } from './qa.service';

class AskQuestionDto {
  courseId: string;
  body: string;
  timestampSeconds?: number;
  instructorId?: string;
}

class AnswerQuestionDto {
  answer: string;
}

@ApiTags('qa')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/qa')
export class QaController {
  constructor(private readonly service: QaService) {}

  @Post()
  @ApiOperation({ summary: 'Ask a question in a course' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  ask(@Request() req: { user: { id: string } }, @Body() dto: AskQuestionDto) {
    return this.service.ask(
      req.user.id,
      dto.courseId,
      dto.body,
      dto.timestampSeconds,
      dto.instructorId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'List questions for a course' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  list(@Query('courseId') courseId: string) {
    return this.service.findByCourse(courseId);
  }

  @Patch(':id/answer')
  @ApiOperation({ summary: 'Answer a question (instructor)' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  answer(@Request() req: { user: { id: string } }, @Param('id') id: string, @Body() dto: AnswerQuestionDto) {
    return this.service.answer(id, req.user.id, dto.answer);
  }

  @Patch(':id/upvote')
  @ApiOperation({ summary: 'Upvote a question' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  upvote(@Param('id') id: string) {
    return this.service.upvote(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete own question' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  remove(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.service.remove(id, req.user.id);
  }
}
