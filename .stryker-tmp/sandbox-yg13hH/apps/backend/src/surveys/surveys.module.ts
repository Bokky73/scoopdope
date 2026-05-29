import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveysService } from './surveys.service';
import { SurveysController } from './surveys.controller';
import { Survey } from './survey.entity';
import { SurveyQuestion } from './survey-question.entity';
import { SurveyResponse } from './survey-response.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Survey, SurveyQuestion, SurveyResponse])],
  providers: [SurveysService],
  controllers: [SurveysController],
  exports: [SurveysService]
})
export class SurveysModule {}