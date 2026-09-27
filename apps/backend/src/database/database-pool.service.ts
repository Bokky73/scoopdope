import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { MetricsService } from '../metrics/metrics.service';

export interface DatabasePoolStatus {
  configured: { min: number; max: number; idleTimeoutMs: number };
  total: number;
  idle: number;
  waiting: number;
  active: number;
}

@Injectable()
export class DatabasePoolService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabasePoolService.name);
  private logTimer?: NodeJS.Timeout;

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly metricsService: MetricsService,
  ) {}

  onModuleInit() {
    this.logPoolStatus();
    this.logTimer = setInterval(() => this.logPoolStatus(), 30_000);
    this.logTimer.unref();
  }

  onModuleDestroy() {
    if (this.logTimer) clearInterval(this.logTimer);
  }

  getStatus(): DatabasePoolStatus {
    const pool = (this.dataSource.driver as { master?: {
      totalCount?: number;
      idleCount?: number;
      waitingCount?: number;
    } }).master;
    const total = pool?.totalCount ?? 0;
    const idle = pool?.idleCount ?? 0;
    const waiting = pool?.waitingCount ?? 0;

    return {
      configured: {
        min: this.configService.get<number>('database.poolMin') ?? 5,
        max: this.configService.get<number>('database.poolMax') ?? 20,
        idleTimeoutMs: this.configService.get<number>('database.idleTimeoutMs') ?? 30_000,
      },
      total,
      idle,
      waiting,
      active: Math.max(0, total - idle),
    };
  }

  private logPoolStatus() {
    const status = this.getStatus();
    this.metricsService.setDatabasePoolSize('total', status.total);
    this.metricsService.setDatabasePoolSize('idle', status.idle);
    this.metricsService.setDatabasePoolSize('active', status.active);
    this.metricsService.setDatabasePoolSize('waiting', status.waiting);
    this.logger.log(`Database pool: ${status.active} active, ${status.idle} idle, ${status.waiting} waiting`);
  }
}
