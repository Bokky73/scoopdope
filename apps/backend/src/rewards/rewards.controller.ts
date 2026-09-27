import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ClaimRewardDto, RewardsService } from './rewards.service';

@ApiTags('rewards')
@ApiBearerAuth()
@Controller('rewards')
@UseGuards(JwtAuthGuard)
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Post('claim')
  @ApiOperation({ summary: 'Claim completion-based BST rewards' })
  @ApiResponse({ status: 200, description: 'Reward claimed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User or wallet not found' })
  @ApiResponse({ status: 409, description: 'Duplicate reward claim' })
  @ApiBody({
    schema: {
      example: {
        type: 'module',
        referenceId: 'module-uuid',
      },
    },
  })
  async claim(@Request() req, @Body() dto: ClaimRewardDto) {
    return this.rewardsService.claim(req.user.id, dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'List reward history for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Reward history returned' })
  async history(@Request() req) {
    return this.rewardsService.getHistory(req.user.id);
  }
}
