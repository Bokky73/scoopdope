import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BookmarksService } from './bookmarks.service';

@ApiTags('bookmarks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  /**
   * Toggle bookmark on a lesson (add if not bookmarked, remove if already bookmarked).
   * POST /v1/lessons/:id/bookmark
   */
  @Post('lessons/:id/bookmark')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle bookmark on a lesson' })
  @ApiParam({ name: 'id', description: 'Lesson ID' })
  @ApiResponse({ status: 200, description: 'Bookmark toggled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async toggleBookmark(@Param('id') lessonId: string, @Request() req: any) {
    const userId = req.user.id ?? req.user.sub;
    return this.bookmarksService.toggleBookmark(userId, lessonId);
  }

  /**
   * Explicitly add a bookmark.
   * POST /v1/lessons/:id/bookmark/add
   */
  @Post('lessons/:id/bookmark/add')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bookmark a lesson' })
  @ApiParam({ name: 'id', description: 'Lesson ID' })
  @ApiResponse({ status: 201, description: 'Lesson bookmarked' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async addBookmark(@Param('id') lessonId: string, @Request() req: any) {
    const userId = req.user.id ?? req.user.sub;
    return this.bookmarksService.addBookmark(userId, lessonId);
  }

  /**
   * Remove a bookmark.
   * DELETE /v1/lessons/:id/bookmark
   */
  @Delete('lessons/:id/bookmark')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove bookmark from a lesson' })
  @ApiParam({ name: 'id', description: 'Lesson ID' })
  @ApiResponse({ status: 204, description: 'Bookmark removed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Bookmark not found' })
  async removeBookmark(@Param('id') lessonId: string, @Request() req: any) {
    const userId = req.user.id ?? req.user.sub;
    await this.bookmarksService.removeBookmark(userId, lessonId);
  }

  /**
   * Get bookmark status for a lesson.
   * GET /v1/lessons/:id/bookmark
   */
  @Get('lessons/:id/bookmark')
  @ApiOperation({ summary: 'Get bookmark status for a lesson' })
  @ApiParam({ name: 'id', description: 'Lesson ID' })
  @ApiResponse({ status: 200, description: 'Bookmark status returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getBookmarkStatus(@Param('id') lessonId: string, @Request() req: any) {
    const userId = req.user.id ?? req.user.sub;
    const bookmarked = await this.bookmarksService.isBookmarked(userId, lessonId);
    return { bookmarked };
  }

  /**
   * Get all bookmarks for the current user (dashboard endpoint).
   * GET /v1/bookmarks
   */
  @Get('bookmarks')
  @ApiOperation({ summary: 'Get all bookmarked lessons for the current user' })
  @ApiResponse({ status: 200, description: 'Bookmarks list returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyBookmarks(@Request() req: any) {
    const userId = req.user.id ?? req.user.sub;
    const [bookmarks, count] = await Promise.all([
      this.bookmarksService.getUserBookmarks(userId),
      this.bookmarksService.getBookmarkCount(userId),
    ]);
    return { count, bookmarks };
  }
}
