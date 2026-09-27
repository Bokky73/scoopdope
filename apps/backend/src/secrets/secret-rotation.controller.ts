import { Controller, Post, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { SecretRotationService } from './secret-rotation.service';

@ApiTags('secret-rotation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('secrets')
export class SecretRotationController {
  constructor(private readonly rotationService: SecretRotationService) {}

  @Post('api-keys/:id/rotate')
  @ApiOperation({ summary: 'Rotate an API key' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  rotateApiKey(@Request() req: any, @Param('id') id: string) {
    return this.rotationService.rotateApiKey(id, req.user.userId).then((apiKey) => ({ apiKey }));
  }

  @Get('rotation-history')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get secret rotation history (admin only)' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiQuery({ name: 'secretType', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getHistory(@Query('secretType') secretType?: string, @Query('limit') limit?: string) {
    return this.rotationService.getRotationHistory(secretType, limit ? parseInt(limit, 10) : 50);
  }
}
