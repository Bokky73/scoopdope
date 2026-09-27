import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { QueryPerformanceService } from './services/query-performance.service';
import { QueryAlertService } from './services/query-alert.service';
import { MonitoringQueryController } from './controllers/monitoring-query.controller';
import { QueryLoggerInterceptor } from './interceptors/query-logger.interceptor';
import { NPlusOneInterceptor } from './interceptors/n-plus-one.interceptor';

@Module({
  imports: [ConfigModule, EventEmitterModule, ScheduleModule],
  providers: [
    QueryPerformanceService,
    QueryAlertService,
    QueryLoggerInterceptor,
    NPlusOneInterceptor,
  ],
  controllers: [MonitoringQueryController],
  exports: [QueryPerformanceService, QueryAlertService, QueryLoggerInterceptor, NPlusOneInterceptor],
})
export class MonitoringModule {}
