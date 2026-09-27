import { Controller, Post, Get, Body, Param, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { CdnService } from './cdn.service';
import { ContentType } from './cdn-asset.entity';
import { ApiResponse } from '@nestjs/swagger';

/** Allowed MIME types for image assets */
const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
]);

/** 2 MB in bytes */
const IMAGE_MAX_BYTES = 2 * 1024 * 1024;

@Controller('v1/cdn')
@UseGuards(JwtAuthGuard)
export class CdnController {
  constructor(private cdnService: CdnService) {}

  @Post('upload')
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async uploadAsset(
    @Body() data: { lessonId?: string; fileName?: string; originalName?: string; mimeType?: string; contentType?: ContentType; fileSize?: number; isPrivate?: boolean },
    @CurrentUser() user: { id: string },
  ) {
    const mimeType = data.mimeType ?? 'application/octet-stream';
    const fileSize = data.fileSize ?? 0;

    // Validate image uploads: 2 MB limit and allowed MIME types
    if (data.contentType === ContentType.IMAGE) {
      if (!IMAGE_MIME_TYPES.has(mimeType)) {
        throw new BadRequestException(
          `Unsupported image MIME type "${mimeType}". Allowed types: ${[...IMAGE_MIME_TYPES].join(', ')}`,
        );
      }
      if (fileSize > IMAGE_MAX_BYTES) {
        throw new BadRequestException(
          `Image file exceeds the 2 MB size limit (received ${(fileSize / 1024 / 1024).toFixed(2)} MB).`,
        );
      }
    }

    return this.cdnService.uploadAsset({
      lessonId: data.lessonId,
      fileName: data.fileName ?? 'upload',
      originalName: data.originalName ?? data.fileName ?? 'upload',
      mimeType,
      contentType: data.contentType ?? ContentType.DOCUMENT,
      fileSize,
      uploadedByUserId: user.id,
      isPrivate: data.isPrivate ?? true,
    });
  }

  @Get(':assetId/signed-url')
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getSignedUrl(
    @Param('assetId') assetId: string,
    @Query('expirationMinutes') expirationMinutes?: string,
  ) {
    const signedUrl = await this.cdnService.generateSignedUrl(
      assetId,
      expirationMinutes ? parseInt(expirationMinutes, 10) : 60,
    );
    return { signedUrl };
  }

  @Post(':assetId/transcode')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async markTranscoded(@Param('assetId') assetId: string, @Body() data: { bitrates?: number[]; thumbnailUrl?: string }) {
    return this.cdnService.markAsTranscoded(assetId, data.bitrates?.map(String) ?? [], data.thumbnailUrl);
  }

  @Post(':assetId/invalidate')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async invalidateCache(@Param('assetId') assetId: string) {
    return this.cdnService.invalidateCache(assetId);
  }

  @Get('lesson/:lessonId')
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getLessonAssets(@Param('lessonId') lessonId: string) {
    return this.cdnService.getLessonAssets(lessonId);
  }

  @Get(':assetId')
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAsset(@Param('assetId') assetId: string) {
    return this.cdnService.getAsset(assetId);
  }
}
