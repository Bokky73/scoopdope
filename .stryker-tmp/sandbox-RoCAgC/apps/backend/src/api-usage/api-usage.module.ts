// @ts-nocheck
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiUsageLog } from './api-usage-log.entity';
import { ApiUsageService } from './api-usage.service';
import { ApiUsageController } from './api-usage.controller';
import { ApiUsageInterceptor } from './api-usage.interceptor';
@Module({
  imports: [TypeOrmModule.forFeature([ApiUsageLog])],
  providers: [ApiUsageService, ApiUsageInterceptor],
  controllers: [ApiUsageController],
  exports: [ApiUsageService, ApiUsageInterceptor]
})
export class ApiUsageModule {}