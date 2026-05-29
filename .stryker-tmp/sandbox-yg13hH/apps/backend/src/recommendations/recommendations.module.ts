import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from '../enrollments/enrollment.entity';
import { Course } from '../courses/course.entity';
import { Progress } from '../progress/progress.entity';
import { RecommendationsService } from './recommendations.service';
import { RecommendationsController } from './recommendations.controller';
@Module({
  imports: [TypeOrmModule.forFeature([Enrollment, Course, Progress])],
  providers: [RecommendationsService],
  controllers: [RecommendationsController],
  exports: [RecommendationsService]
})
export class RecommendationsModule {}