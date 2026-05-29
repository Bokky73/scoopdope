// @ts-nocheck
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchJob } from './batch-job.entity';
import { BatchService } from './batch.service';
import { BatchController } from './batch.controller';
import { UsersModule } from '../users/users.module';
import { CoursesModule } from '../courses/courses.module';
@Module({
  imports: [TypeOrmModule.forFeature([BatchJob]), UsersModule, CoursesModule],
  providers: [BatchService],
  controllers: [BatchController]
})
export class BatchModule {}