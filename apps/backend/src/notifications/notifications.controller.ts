import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Request,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { NotificationsService } from './notifications.service';
import { PushNotificationsService } from './push-notifications.service';
import { NotificationType } from './notification.entity';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class NotificationQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}

class CreateSystemNotificationDto {
  @ApiPropertyOptional({ description: 'Target user ID; omit to broadcast to all users' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ example: 'Platform Maintenance Tonight' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Scheduled maintenance from 02:00–04:00 UTC.' })
  @IsString()
  @IsNotEmpty()
  message: string;
}

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private notificationsService: NotificationsService,
    private pushNotificationsService: PushNotificationsService,
  ) {}

  /**
   * GET /v1/notifications
   * Returns the last 20 notifications by default; use ?page & ?limit for history.
   */
  @Get()
  @ApiOperation({ summary: 'Get paginated notifications for the current user' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Results per page, max 100 (default: 20)' })
  @ApiResponse({ status: 200, description: 'Returns paginated user notifications with unread count' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Request() req: { user: { id: string } }) {
    return this.notificationsService.findByUser(req.user.id);
  }

  /**
   * GET /v1/notifications/unread-count
   * Lightweight endpoint for the bell badge.
   */
  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count for the current user' })
  @ApiResponse({ status: 200, description: 'Returns the unread notification count', schema: { example: { count: 3 } } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getUnreadCount(@Request() req) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }

  /**
   * POST /v1/notifications
   * Admin-only: create a system notification for a specific user or broadcast.
   */
  @Post()
  @ApiOperation({ summary: '[Admin] Create a system notification for a user or all users' })
  @ApiBody({ type: CreateSystemNotificationDto })
  @ApiResponse({ status: 201, description: 'Notification(s) created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin only' })
  createSystemNotification(@Request() req, @Body() dto: CreateSystemNotificationDto) {
    return this.notificationsService.createSystemNotification(req.user.id, dto);
  }

  /**
   * PATCH /v1/notifications/:id/read
   */
  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a single notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  /**
   * PATCH /v1/notifications/read-all
   */
  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  markAllAsRead(@Request() req: { user: { id: string } }) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe to push notifications' })
  @ApiBody({
    schema: { example: { endpoint: 'https://...', keys: { p256dh: '...', auth: '...' } } },
  })
  @ApiResponse({ status: 201, description: 'Subscribed successfully' })
  subscribe(@Request() req: { user: { id: string } }, @Body() subscription: any) {
    return this.pushNotificationsService.subscribe(req.user.id, subscription);
  }

  @Delete('unsubscribe')
  @ApiOperation({ summary: 'Unsubscribe from push notifications' })
  @ApiBody({ schema: { example: { endpoint: 'https://...' } } })
  @ApiResponse({ status: 200, description: 'Unsubscribed successfully' })
  unsubscribe(@Request() req: { user: { id: string } }, @Body('endpoint') endpoint: string) {
    return this.pushNotificationsService.unsubscribe(req.user.id, endpoint);
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update notification preferences' })
  @ApiBody({
    schema: {
      example: { courseUpdates: true, liveSessions: false, tokenRewards: true, pushEnabled: true },
    },
  })
  @ApiResponse({ status: 200, description: 'Preferences updated successfully' })
  updatePreferences(@Request() req: { user: { id: string } }, @Body() preferences: any) {
    return this.notificationsService.updatePreferences(req.user.id, preferences);
  }
}
