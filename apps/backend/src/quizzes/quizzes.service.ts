import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz } from './quiz.entity';
import { QuizQuestion, QuestionType } from './quiz-question.entity';
import { QuizAttempt } from './quiz-attempt.entity';
import { QuizAttemptAnswer } from './quiz-attempt-answer.entity';
import { QuizAnswer } from './quiz-answer.entity';
import { StreaksService } from '../streaks/streaks.service';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectRepository(Quiz) private quizRepo: Repository<Quiz>,
    @InjectRepository(QuizQuestion) private questionRepo: Repository<QuizQuestion>,
    @InjectRepository(QuizAttempt) private attemptRepo: Repository<QuizAttempt>,
    @InjectRepository(QuizAttemptAnswer) private attemptAnswerRepo: Repository<QuizAttemptAnswer>,
    @InjectRepository(QuizAnswer) private answerRepo: Repository<QuizAnswer>,
    private streaksService: StreaksService
  ) {}

  async createQuiz(lessonId: string, data: any) {
    const quiz = this.quizRepo.create({ lessonId, ...data });
    return this.quizRepo.save(quiz);
  }

  async getQuiz(id: string) {
    return this.quizRepo.findOne({
      where: { id },
      relations: ['questions', 'questions.answers'],
    });
  }

  async addQuestion(quizId: string, data: any) {
    const question = this.questionRepo.create({ quizId, ...data });
    return this.questionRepo.save(question);
  }

  async addAnswer(questionId: string, data: any) {
    const answer = this.answerRepo.create({ questionId, ...data });
    return this.answerRepo.save(answer);
  }

  async submitAttempt(quizId: string, userId: string, answers: any[]) {
    // Prevent re-submission
    const existingAttempt = await this.attemptRepo.findOne({
      where: { quizId, userId },
    });

    if (existingAttempt) {
      throw new BadRequestException('Quiz already submitted');
    }

    // Record activity for streak
    await this.streaksService.recordActivity(userId);

    const quiz = await this.quizRepo.findOne({
      where: { id: quizId },
      relations: ['questions', 'questions.answers'],
    });

    if (!quiz) {
      throw new BadRequestException('Quiz not found');
    }

    const attempt = this.attemptRepo.create({ quizId, userId });
    const savedAttempt = await this.attemptRepo.save(attempt);

    let totalScore = 0;
    let totalPoints = 0;
    const gradedAnswers = [];

    for (const answer of answers) {
      const question = quiz.questions.find((q) => q.id === answer.questionId);
      if (!question) continue;

      totalPoints += question.points;

      const attemptAnswer = this.attemptAnswerRepo.create({
        attemptId: savedAttempt.id,
        questionId: answer.questionId,
        answer: answer.answer,
      });

      if (question.type !== QuestionType.ESSAY) {
        const correctAnswer = question.answers.find((a) => a.isCorrect);
        const isCorrect = correctAnswer && correctAnswer.text === answer.answer;
        
        if (isCorrect) {
          attemptAnswer.points = question.points;
          totalScore += question.points;
        } else {
          attemptAnswer.points = 0;
        }

        gradedAnswers.push({
          questionId: question.id,
          userAnswer: answer.answer,
          correctAnswer: correctAnswer?.text,
          isCorrect,
          points: attemptAnswer.points,
        });
      }

      await this.attemptAnswerRepo.save(attemptAnswer);
    }

    savedAttempt.score = totalPoints > 0 ? (totalScore / totalPoints) * 100 : 0;
    savedAttempt.isGraded = quiz.questions.every((q) => q.type !== QuestionType.ESSAY);

    const result = await this.attemptRepo.save(savedAttempt);

    return {
      ...result,
      gradedAnswers,
    };
  }

  async gradeEssay(attemptId: string, questionId: string, points: number, feedback: string) {
    const attemptAnswer = await this.attemptAnswerRepo.findOne({
      where: { attemptId, questionId },
    });

    if (attemptAnswer) {
      attemptAnswer.points = points;
      await this.attemptAnswerRepo.save(attemptAnswer);
    }

    const attempt = await this.attemptRepo.findOne({
      where: { id: attemptId },
      relations: ['answers', 'quiz', 'quiz.questions'],
    });

    if (!attempt) {
      throw new BadRequestException('Quiz attempt not found');
    }

    if (!attempt.quiz) {
      throw new BadRequestException('Quiz not found for attempt');
    }

    const totalPoints = attempt.quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const totalScore = attempt.answers.reduce((sum, a) => sum + (a.points || 0), 0);

    attempt.score = totalPoints > 0 ? (totalScore / totalPoints) * 100 : 0;
    attempt.feedback = feedback;
    attempt.isGraded = true;

    return this.attemptRepo.save(attempt);
  }

  async getAttempts(quizId: string, userId?: string) {
    const query = this.attemptRepo
      .createQueryBuilder('attempt')
      .leftJoinAndSelect('attempt.answers', 'answers')
      .leftJoinAndSelect('attempt.quiz', 'quiz')
      .leftJoinAndSelect('quiz.questions', 'questions')
      .leftJoinAndSelect('questions.answers', 'questionAnswers')
      .where('attempt.quizId = :quizId', { quizId });

    if (userId) {
      query.andWhere('attempt.userId = :userId', { userId });
    }

    const attempts = await query.orderBy('attempt.submittedAt', 'DESC').getMany();

    // Map to include gradedAnswers format for consistency
    return attempts.map((attempt) => {
      const gradedAnswers = attempt.answers.map((ua) => {
        const question = attempt.quiz.questions.find((q) => q.id === ua.questionId);
        const correctAnswer = question?.answers.find((a) => a.isCorrect);
        return {
          questionId: ua.questionId,
          userAnswer: ua.answer,
          correctAnswer: correctAnswer?.text,
          isCorrect: correctAnswer && correctAnswer.text === ua.answer,
          points: ua.points,
        };
      });

      return {
        ...attempt,
        gradedAnswers,
      };
    });
  }
}
