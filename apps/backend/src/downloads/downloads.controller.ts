import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DownloadsService } from './downloads.service';

class QueueDownloadDto {
  courseId: string;
  lessonId?: string;
  lessonTitle?: string;
  fileUrl?: string;
  fileSizeBytes?: number;
}

@ApiTags('downloads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/downloads')
export class DownloadsController {
  constructor(private readonly service: DownloadsService) {}

  @Post()
  @ApiOperation({ summary: 'Queue a lesson/course for offline download' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  queue(@Req() req: Request & { user: { id: string } }, @Body() dto: QueueDownloadDto) {
    return this.service.queueDownload(
      req.user.id,
      dto.courseId,
      dto.lessonId,
      dto.lessonTitle,
      dto.fileUrl,
      dto.fileSizeBytes,
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all downloads for the current user' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  list(@Req() req: Request & { user: { id: string } }) {
    return this.service.findByUser(req.user.id);
  }

  @Get('storage')
  @ApiOperation({ summary: 'Get storage usage stats' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  storage(@Req() req: Request & { user: { id: string } }) {
    return this.service.getStorageStats(req.user.id);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Mark a download as completed' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  complete(@Req() req: Request & { user: { id: string } }, @Param('id') id: string) {
    return this.service.markCompleted(id, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a downloaded item' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  remove(@Req() req: Request & { user: { id: string } }, @Param('id') id: string) {
    return this.service.remove(id, req.user.id);
  }
}
