import { Controller, Get, Post, Patch, Delete, Body, Param, Headers, UseGuards, Request, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiHeader, ApiResponse } from '@nestjs/swagger';
import { IsUrl, IsArray, IsString, IsBoolean, IsOptional } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WebhooksService } from './webhooks.service';

class CreateWebhookDto {
  @IsUrl() url: string;
  @IsArray() @IsString({ each: true }) events: string[];
}

class UpdateWebhookDto {
  @IsOptional() @IsUrl() url?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) events?: string[];
  @IsOptional() @IsBoolean() isActive?: boolean;
}

class VerifySignatureDto {
  @IsString() webhookId: string;
  @IsString() body: string;
  @IsString() signature: string;
  @IsOptional() @IsString() timestamp?: string;
}

@ApiTags('webhooks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/webhooks')
export class WebhooksController {
  constructor(private readonly service: WebhooksService) {}

  @Post()
  @ApiOperation({ summary: 'Register a webhook' })
  create(@Request() req: { user: { userId: string } }, @Body() dto: CreateWebhookDto) {
    return this.service.register(req.user.userId, dto.url, dto.events);
  }

  @Get()
  @ApiOperation({ summary: 'List webhooks' })
  list(@Request() req: { user: { userId: string } }) {
    return this.service.list(req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a webhook' })
  update(@Request() req: { user: { userId: string } }, @Param('id') id: string, @Body() dto: UpdateWebhookDto) {
    return this.service.update(req.user.userId, id, {
      ...dto,
      events: dto.events?.join(','),
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a webhook' })
  remove(@Request() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.service.delete(req.user.userId, id);
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Get delivery logs for a webhook' })
  logs(@Request() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.service.getLogs(id, req.user.userId);
  }

  @Post('verify-signature')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify a webhook signature (for testing)' })
  async verifySignature(@Request() req: { user: { userId: string } }, @Body() dto: VerifySignatureDto) {
    const webhook = await this.service.getWebhookForUser(dto.webhookId, req.user.userId);
    const valid = this.service.verifySignature(webhook.secret, dto.body, dto.signature, dto.timestamp);
    if (!valid) throw new UnauthorizedException('Invalid signature or timestamp');
    return { valid: true };
  }
}
