import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { DatabaseController } from './database.controller';
import { MigrationRunnerService } from './migration-runner.service';
import { SeedService } from './seeds/seed.service';
import { DatabasePoolService } from './database-pool.service';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([]),
    AuthModule,
    MetricsModule,
  ],
  controllers: [DatabaseController],
  providers: [MigrationRunnerService, SeedService, DatabasePoolService],
  exports: [MigrationRunnerService, SeedService, DatabasePoolService],
})
export class DatabaseModule {}
