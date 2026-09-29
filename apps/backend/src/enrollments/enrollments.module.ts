import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { Enrollment } from './enrollment.entity';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { CoursesModule } from '../courses/courses.module';
import { CourseVersion } from '../courses/course-version.entity';
import { CourseVersioningService } from '../courses/course-versioning.service';
import { Course } from '../courses/course.entity';
import { MetricsModule } from '../metrics/metrics.module';
import { StellarModule } from '../stellar/stellar.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Enrollment, CourseVersion, Course]),
    CacheModule.register({ ttl: 60_000 }),
    CoursesModule,
    MetricsModule,
    StellarModule,
  ],
  providers: [EnrollmentsService, CourseVersioningService],
  controllers: [EnrollmentsController],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}
