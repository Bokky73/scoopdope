import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseFeedback } from './course-feedback.entity';
import { Enrollment } from '../enrollments/enrollment.entity';
import { CourseFeedbackService } from './course-feedback.service';
import { CourseFeedbackController } from './course-feedback.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CourseFeedback, Enrollment])],
  providers: [CourseFeedbackService],
  controllers: [CourseFeedbackController],
  exports: [CourseFeedbackService],
})
export class CourseFeedbackModule {}
