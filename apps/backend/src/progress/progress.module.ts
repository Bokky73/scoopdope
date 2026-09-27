import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Progress } from './progress.entity';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { StellarModule } from '../stellar/stellar.module';
import { CredentialsModule } from '../credentials/credentials.module';
import { UsersModule } from '../users/users.module';
import { StreaksModule } from '../streaks/streaks.module';
import { BundlesModule } from '../bundles/bundles.module';
import { MetricsModule } from '../metrics/metrics.module';
import { Course } from '../courses/course.entity';
import { CourseModule as CourseModuleEntity } from '../courses/course-module.entity';
import { Enrollment } from '../enrollments/enrollment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Progress, Course, CourseModuleEntity, Enrollment]),
    StellarModule,
    CredentialsModule,
    UsersModule,
    StreaksModule,
    BundlesModule,
    MetricsModule,
  ],
  providers: [ProgressService],
  controllers: [ProgressController],
  exports: [ProgressService],
})
export class ProgressModule {}
