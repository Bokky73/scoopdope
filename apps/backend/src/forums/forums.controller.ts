import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { ForumsService } from './forums.service';
import { VoteDirection } from './forum-vote.entity';
import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class VoteDto {
  @ApiProperty({ enum: ['up', 'down', 'remove'] })
  @IsIn(['up', 'down', 'remove'])
  direction: VoteDirection | 'remove';
}

@ApiTags('forums')
@Controller()
export class ForumsController {
  constructor(private readonly forumsService: ForumsService) {}

  @Get('forums/threads')
  @ApiOperation({ summary: 'List all forum threads with pagination' })
  @ApiResponse({ status: 200, description: 'Returns paginated forum threads' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  listThreads(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('courseId') courseId?: string,
  ) {
    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    return this.forumsService.findThreads(parsedPage, parsedLimit, courseId);
  }

  @Get('courses/:id/posts')
  @ApiOperation({ summary: 'Get forum posts for a course' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 200, description: 'Returns course forum posts' })
  findByCourse(@Param('id') courseId: string) {
    return this.forumsService.findPostsByCourse(courseId);
  }

  @Get('forums/threads')
  @ApiOperation({ summary: 'List all forum threads across courses with pagination' })
  @ApiResponse({ status: 200, description: 'Returns paginated list of forum threads' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  findThreads(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('courseId') courseId?: string,
  ) {
    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    return this.forumsService.findThreads(parsedPage, parsedLimit, courseId);
  }

  @Get('forums/threads/:id')
  @ApiOperation({ summary: 'Get a forum thread with paginated replies' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 200, description: 'Returns thread with paginated replies' })
  getThread(
    @Param('id') threadId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    return this.forumsService.getThread(threadId, parsedPage, parsedLimit);
  }

  @Post('courses/:id/posts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a forum post for a course' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 201, description: 'Forum post created successfully' })
  createPost(
    @Param('id') courseId: string,
    @Request() req: { user: { id: string; role: string } },
    @Body() dto: CreatePostDto
  ) {
    return this.forumsService.createPost(courseId, req.user.id, req.user.role, dto);
  }

  @Post('posts/:id/replies')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reply to a forum post' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 201, description: 'Reply created successfully' })
  createReply(
    @Param('id') postId: string,
    @Request() req: { user: { id: string; role: string } },
    @Body() dto: CreateReplyDto
  ) {
    return this.forumsService.createReply(postId, req.user.id, req.user.role, dto);
  }

  @Post('posts/:id/vote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upvote, downvote, or remove vote on a post' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 200, description: 'Vote recorded, returns updated post' })
  votePost(
    @Param('id') postId: string,
    @Request() req: { user: { id: string } },
    @Body() dto: VoteDto
  ) {
    return this.forumsService.votePost(postId, req.user.id, dto.direction);
  }

  @Post('replies/:id/vote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upvote, downvote, or remove vote on a reply' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 200, description: 'Vote recorded, returns updated reply' })
  voteReply(
    @Param('id') replyId: string,
    @Request() req: { user: { id: string } },
    @Body() dto: VoteDto
  ) {
    return this.forumsService.voteReply(replyId, req.user.id, dto.direction);
  }
}
