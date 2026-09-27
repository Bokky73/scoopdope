import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from '../enrollments/enrollment.entity';
import { Course } from '../courses/course.entity';
import { Progress } from '../progress/progress.entity';
import { Review } from '../courses/review.entity';
import { MetricsModule } from '../metrics/metrics.module';
import { RecommendationsService } from './recommendations.service';
import { RecommendationsController } from './recommendations.controller';
import { LearningPathService } from './learning-path.service';

@Module({
  imports: [TypeOrmModule.forFeature([Enrollment, Course, Progress, Review]), MetricsModule],
  providers: [RecommendationsService, LearningPathService],
  controllers: [RecommendationsController],
  exports: [RecommendationsService, LearningPathService],
})
export class RecommendationsModule {}
