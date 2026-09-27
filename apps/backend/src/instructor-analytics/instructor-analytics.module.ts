import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from '../enrollments/enrollment.entity';
import { Progress } from '../progress/progress.entity';
import { Lesson } from '../courses/lesson.entity';
import { InstructorAnalyticsService } from './instructor-analytics.service';
import { InstructorAnalyticsController } from './instructor-analytics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Enrollment, Progress, Lesson])],
  providers: [InstructorAnalyticsService],
  controllers: [InstructorAnalyticsController],
  exports: [InstructorAnalyticsService],
})
export class InstructorAnalyticsModule {}
