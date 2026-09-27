import { Controller, Post, Get, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PayoutsService } from './payouts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('payouts')
@ApiBearerAuth()
@Controller('v1/payouts')
export class PayoutsController {
  constructor(private payoutsService: PayoutsService) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate payouts for a date range' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async calculatePayouts(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.payoutsService.calculatePayouts(new Date(startDate), new Date(endDate));
  }

  @Post(':payoutId/process')
  @ApiOperation({ summary: 'Process a payout' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async processPayout(@Param('payoutId') payoutId: string) {
    return this.payoutsService.processPayout(payoutId);
  }

  @Get('instructor/:instructorId')
  @ApiOperation({ summary: 'Get instructor payouts' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseGuards(JwtAuthGuard)
  async getInstructorPayouts(@Param('instructorId') instructorId: string) {
    return this.payoutsService.getInstructorPayouts(instructorId);
  }

  @Get('instructor/:instructorId/stats')
  @ApiOperation({ summary: 'Get payout stats for an instructor' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseGuards(JwtAuthGuard)
  async getPayoutStats(@Param('instructorId') instructorId: string) {
    return this.payoutsService.getPayoutStats(instructorId);
  }

  @Get('instructor/:instructorId/history')
  @ApiOperation({ summary: 'Get payout history for an instructor' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseGuards(JwtAuthGuard)
  async getPayoutHistory(
    @Param('instructorId') instructorId: string,
    @Query('limit') limit = 10,
  ) {
    return this.payoutsService.getPayoutHistory(instructorId, limit);
  }

  @Get('instructor/:instructorId/monthly')
  @ApiOperation({ summary: 'Get monthly revenue for an instructor' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseGuards(JwtAuthGuard)
  async getMonthlyRevenue(@Param('instructorId') instructorId: string) {
    return this.payoutsService.getMonthlyRevenue(instructorId);
  }

  @Get('instructor/:instructorId/per-course')
  @ApiOperation({ summary: 'Get per-course revenue for an instructor' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseGuards(JwtAuthGuard)
  async getPerCourseRevenue(@Param('instructorId') instructorId: string) {
    return this.payoutsService.getPerCourseRevenue(instructorId);
  }

  @Get('instructor/:instructorId/projection')
  @ApiOperation({ summary: 'Get revenue projection for an instructor' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseGuards(JwtAuthGuard)
  async getRevenueProjection(@Param('instructorId') instructorId: string) {
    return this.payoutsService.getRevenueProjection(instructorId);
  }
}
