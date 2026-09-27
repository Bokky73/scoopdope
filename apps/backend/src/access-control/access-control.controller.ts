import { Controller, Post, Get, Delete, Body, Param, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AccessControlService } from './access-control.service';
import { AccessRole } from './course-access-control.entity';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('access-control')
@ApiBearerAuth()
@Controller('v1/access-control')
@UseGuards(JwtAuthGuard)
export class AccessControlController {
  constructor(private accessControlService: AccessControlService) {}

  @Post('grant')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Grant course access to a user' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async grantAccess(@Body() data: any) {
    return this.accessControlService.grantAccess(
      data.courseId,
      data.userId,
      data.role as AccessRole,
      data.subscriptionExpiryDate ? new Date(data.subscriptionExpiryDate) : undefined,
      data.allowedIpAddresses,
    );
  }

  @Post('grant/timed')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Grant time-limited course access to a user' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async grantTimedAccess(@Body() data: any) {
    return this.accessControlService.grantTimeLimitedAccess(
      data.courseId,
      data.userId,
      data.role as AccessRole,
      data.expiresInHours,
    );
  }

  @Post('verify-content')
  @ApiOperation({ summary: 'Verify whether a user can access content' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async verifyContentAccess(@Body() data: any, @Req() req: any) {
    const ipAddress = req.ip || req.connection?.remoteAddress;
    await this.accessControlService.verifyContentAccess(
      data.courseId,
      data.userId,
      data.contentId,
      ipAddress,
    );
    return { allowed: true };
  }

  @Post('check')
  @ApiOperation({ summary: 'Check course access for a user' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async checkAccess(@Body() data: any, @Req() req: any) {
    const ipAddress = req.ip || req.connection?.remoteAddress;
    return this.accessControlService.checkAccess(
      data.courseId,
      data.userId,
      ipAddress,
    );
  }

  @Delete(':courseId/users/:userId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Revoke a user\'s course access' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async revokeAccess(
    @Param('courseId') courseId: string,
    @Param('userId') userId: string,
  ) {
    return this.accessControlService.revokeAccess(courseId, userId);
  }

  @Post(':courseId/users/:userId/subscription')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update a user\'s course subscription access' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateSubscription(
    @Param('courseId') courseId: string,
    @Param('userId') userId: string,
    @Body() data: any,
  ) {
    return this.accessControlService.updateSubscription(
      courseId,
      userId,
      new Date(data.expiryDate),
    );
  }

  @Get(':courseId/logs')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get access logs for a course' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAccessLogs(
    @Param('courseId') courseId: string,
    @Body() data?: any,
  ) {
    return this.accessControlService.getAccessLogs(
      courseId,
      data?.userId,
      data?.days || 30,
    );
  }

  @Get(':courseId/users/:userId')
  @ApiOperation({ summary: 'Get a user\'s course access details' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAccessControl(
    @Param('courseId') courseId: string,
    @Param('userId') userId: string,
  ) {
    return this.accessControlService.getAccessControl(courseId, userId);
  }

  @Get(':courseId/users')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'List users with access to a course' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getCourseAccessList(@Param('courseId') courseId: string) {
    return this.accessControlService.getCourseAccessList(courseId);
  }
}
