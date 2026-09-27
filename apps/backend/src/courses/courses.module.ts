import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './course.entity';
import { CourseModule } from './course-module.entity';
import { Lesson } from './lesson.entity';
import { Category } from './category.entity';
import { CoursesService } from './courses.service';
import { ModulesService } from './modules.service';
import { LessonsService } from './lessons.service';
import { CategoriesService } from './categories.service';
import { CoursesController } from './courses.controller';
import { AdminCoursesController } from './admin-courses.controller';
import { ModulesController } from './modules.controller';
import { CategoriesController } from './categories.controller';
import { Review } from './review.entity';
import { Enrollment } from '../enrollments/enrollment.entity';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { SearchModule } from '../search/search.module';
import { CourseVersion } from './course-version.entity';
import { CourseVersioningService } from './course-versioning.service';
import { CourseVersioningController } from './course-versioning.controller';
import { CoursePrerequisite } from './course-prerequisite.entity';
import { PrerequisitesService } from './prerequisites.service';
import { PrerequisitesController } from './prerequisites.controller';
import { CourseSchedulerService } from './course-scheduler.service';
import { DripSchedulerService } from './drip-scheduler.service';
import { TranscribeService } from './transcribe.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { MetricsModule } from '../metrics/metrics.module';
import { User } from '../users/user.entity';
import { CourseInstructor } from './course-instructor.entity';
import { InstructorAssignmentService } from './instructor-assignment.service';
import { InstructorAssignmentController } from './instructor-assignment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      CourseModule,
      Lesson,
      Review,
      Enrollment,
      CourseVersion,
      CoursePrerequisite,
      User,
      CourseInstructor,
    ]),
    SearchModule,
    NotificationsModule,
    MetricsModule,
    AnnouncementsModule,
  ],
  providers: [
    CoursesService,
    ModulesService,
    LessonsService,
    ReviewsService,
    CourseVersioningService,
    PrerequisitesService,
    CourseSchedulerService,
    DripSchedulerService,
    TranscribeService,
    InstructorAssignmentService,
  ],
  controllers: [
    CoursesController,
    ModulesController,
    ReviewsController,
    CourseVersioningController,
    PrerequisitesController,
    InstructorAssignmentController,
  ],
  exports: [CoursesService, PrerequisitesService],
})
export class CoursesModule {}
