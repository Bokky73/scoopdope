import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningPath } from './learning-path.entity';
import { LearningPathEnrollment } from './learning-path-enrollment.entity';
import { Course } from '../courses/course.entity';
import { LearningPathsService } from './learning-paths.service';
import { LearningPathsController, AdminLearningPathsController } from './learning-paths.controller';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { CredentialsModule } from '../credentials/credentials.module';
import { UsersModule } from '../users/users.module';
@Module({
  imports: [TypeOrmModule.forFeature([LearningPath, LearningPathEnrollment, Course]), EnrollmentsModule, CredentialsModule, UsersModule],
  providers: [LearningPathsService],
  controllers: [LearningPathsController, AdminLearningPathsController],
  exports: [LearningPathsService]
})
export class LearningPathsModule {}