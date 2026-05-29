import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from './quiz.entity';
import { QuizQuestion } from './quiz-question.entity';
import { QuizAnswer } from './quiz-answer.entity';
import { QuizAttempt } from './quiz-attempt.entity';
import { QuizAttemptAnswer } from './quiz-attempt-answer.entity';
import { QuizzesService } from './quizzes.service';
import { QuizzesController } from './quizzes.controller';
import { StreaksModule } from '../streaks/streaks.module';
@Module({
  imports: [TypeOrmModule.forFeature([Quiz, QuizQuestion, QuizAnswer, QuizAttempt, QuizAttemptAnswer]), StreaksModule],
  providers: [QuizzesService],
  controllers: [QuizzesController],
  exports: [QuizzesService]
})
export class QuizzesModule {}