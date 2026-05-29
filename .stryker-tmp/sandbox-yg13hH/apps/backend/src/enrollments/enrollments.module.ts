import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from './enrollment.entity';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { CoursesModule } from '../courses/courses.module';
import { CourseVersion } from '../courses/course-version.entity';
import { CourseVersioningService } from '../courses/course-versioning.service';
import { Course } from '../courses/course.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Enrollment, CourseVersion, Course]), CoursesModule],
  providers: [EnrollmentsService, CourseVersioningService],
  controllers: [EnrollmentsController],
  exports: [EnrollmentsService]
})
export class EnrollmentsModule {}