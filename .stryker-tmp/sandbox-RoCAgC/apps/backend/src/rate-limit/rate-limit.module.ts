// @ts-nocheck
import { Module } from '@nestjs/common';
import { UserRateLimitService } from './user-rate-limit.service';
import { UserRateLimitGuard } from './user-rate-limit.guard';
@Module({
  providers: [UserRateLimitService, UserRateLimitGuard],
  exports: [UserRateLimitService, UserRateLimitGuard]
})
export class RateLimitModule {}