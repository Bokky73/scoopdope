import { Controller, Post, Get, Patch, UseGuards, Body, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RemindersService } from './reminders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('reminders')
@ApiBearerAuth()
@Controller('v1/reminders')
export class RemindersController {
  constructor(private remindersService: RemindersService) {}

  @Post('send-inactive')
  @ApiOperation({ summary: 'Send inactive user reminders' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async sendInactiveReminders() {
    await this.remindersService.sendInactiveReminders();
    return { message: 'Reminders sent successfully' };
  }

  @Post(':userId/:courseId')
  @ApiOperation({ summary: 'Create a reminder for a user and course' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseGuards(JwtAuthGuard)
  async createReminder(@Param('userId') userId: string, @Param('courseId') courseId: string) {
    return this.remindersService.createReminder(userId, courseId);
  }

  @Patch(':userId/:courseId/disable')
  @ApiOperation({ summary: 'Disable a reminder' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseGuards(JwtAuthGuard)
  async disableReminder(@Param('userId') userId: string, @Param('courseId') courseId: string) {
    await this.remindersService.disableReminder(userId, courseId);
    return { message: 'Reminder disabled' };
  }

  @Patch(':userId/:courseId/enable')
  @ApiOperation({ summary: 'Enable a reminder' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseGuards(JwtAuthGuard)
  async enableReminder(@Param('userId') userId: string, @Param('courseId') courseId: string) {
    await this.remindersService.enableReminder(userId, courseId);
    return { message: 'Reminder enabled' };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get reminder statistics' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getReminderStats() {
    return this.remindersService.getReminderStats();
  }
}
