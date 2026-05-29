// @ts-nocheck
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
import { Injectable } from '@nestjs/common';
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
  constructor(@InjectRepository(Quiz)
  private quizRepo: Repository<Quiz>, @InjectRepository(QuizQuestion)
  private questionRepo: Repository<QuizQuestion>, @InjectRepository(QuizAttempt)
  private attemptRepo: Repository<QuizAttempt>, @InjectRepository(QuizAttemptAnswer)
  private attemptAnswerRepo: Repository<QuizAttemptAnswer>, @InjectRepository(QuizAnswer)
  private answerRepo: Repository<QuizAnswer>, private streaksService: StreaksService) {}
  async createQuiz(lessonId: string, data: any) {
    if (stryMutAct_9fa48("5763")) {
      {}
    } else {
      stryCov_9fa48("5763");
      const quiz = this.quizRepo.create(stryMutAct_9fa48("5764") ? {} : (stryCov_9fa48("5764"), {
        lessonId,
        ...data
      }));
      return this.quizRepo.save(quiz);
    }
  }
  async getQuiz(id: string) {
    if (stryMutAct_9fa48("5765")) {
      {}
    } else {
      stryCov_9fa48("5765");
      return this.quizRepo.findOne(stryMutAct_9fa48("5766") ? {} : (stryCov_9fa48("5766"), {
        where: stryMutAct_9fa48("5767") ? {} : (stryCov_9fa48("5767"), {
          id
        }),
        relations: stryMutAct_9fa48("5768") ? [] : (stryCov_9fa48("5768"), [stryMutAct_9fa48("5769") ? "" : (stryCov_9fa48("5769"), 'questions'), stryMutAct_9fa48("5770") ? "" : (stryCov_9fa48("5770"), 'questions.answers')])
      }));
    }
  }
  async addQuestion(quizId: string, data: any) {
    if (stryMutAct_9fa48("5771")) {
      {}
    } else {
      stryCov_9fa48("5771");
      const question = this.questionRepo.create(stryMutAct_9fa48("5772") ? {} : (stryCov_9fa48("5772"), {
        quizId,
        ...data
      }));
      return this.questionRepo.save(question);
    }
  }
  async addAnswer(questionId: string, data: any) {
    if (stryMutAct_9fa48("5773")) {
      {}
    } else {
      stryCov_9fa48("5773");
      const answer = this.answerRepo.create(stryMutAct_9fa48("5774") ? {} : (stryCov_9fa48("5774"), {
        questionId,
        ...data
      }));
      return this.answerRepo.save(answer);
    }
  }
  async submitAttempt(quizId: string, userId: string, answers: any[]) {
    if (stryMutAct_9fa48("5775")) {
      {}
    } else {
      stryCov_9fa48("5775");
      // Record activity for streak
      await this.streaksService.recordActivity(userId);
      const quiz = await this.quizRepo.findOne(stryMutAct_9fa48("5776") ? {} : (stryCov_9fa48("5776"), {
        where: stryMutAct_9fa48("5777") ? {} : (stryCov_9fa48("5777"), {
          id: quizId
        }),
        relations: stryMutAct_9fa48("5778") ? [] : (stryCov_9fa48("5778"), [stryMutAct_9fa48("5779") ? "" : (stryCov_9fa48("5779"), 'questions'), stryMutAct_9fa48("5780") ? "" : (stryCov_9fa48("5780"), 'questions.answers')])
      }));
      const attempt = this.attemptRepo.create(stryMutAct_9fa48("5781") ? {} : (stryCov_9fa48("5781"), {
        quizId,
        userId
      }));
      const savedAttempt = await this.attemptRepo.save(attempt);
      let totalScore = 0;
      let totalPoints = 0;
      for (const answer of answers) {
        if (stryMutAct_9fa48("5782")) {
          {}
        } else {
          stryCov_9fa48("5782");
          const question = quiz.questions.find(stryMutAct_9fa48("5783") ? () => undefined : (stryCov_9fa48("5783"), q => stryMutAct_9fa48("5786") ? q.id !== answer.questionId : stryMutAct_9fa48("5785") ? false : stryMutAct_9fa48("5784") ? true : (stryCov_9fa48("5784", "5785", "5786"), q.id === answer.questionId)));
          if (stryMutAct_9fa48("5789") ? false : stryMutAct_9fa48("5788") ? true : stryMutAct_9fa48("5787") ? question : (stryCov_9fa48("5787", "5788", "5789"), !question)) continue;
          stryMutAct_9fa48("5790") ? totalPoints -= question.points : (stryCov_9fa48("5790"), totalPoints += question.points);
          const attemptAnswer = this.attemptAnswerRepo.create(stryMutAct_9fa48("5791") ? {} : (stryCov_9fa48("5791"), {
            attemptId: savedAttempt.id,
            questionId: answer.questionId,
            answer: answer.answer
          }));
          if (stryMutAct_9fa48("5794") ? question.type === QuestionType.ESSAY : stryMutAct_9fa48("5793") ? false : stryMutAct_9fa48("5792") ? true : (stryCov_9fa48("5792", "5793", "5794"), question.type !== QuestionType.ESSAY)) {
            if (stryMutAct_9fa48("5795")) {
              {}
            } else {
              stryCov_9fa48("5795");
              const correctAnswer = question.answers.find(stryMutAct_9fa48("5796") ? () => undefined : (stryCov_9fa48("5796"), a => a.isCorrect));
              if (stryMutAct_9fa48("5799") ? correctAnswer || correctAnswer.text === answer.answer : stryMutAct_9fa48("5798") ? false : stryMutAct_9fa48("5797") ? true : (stryCov_9fa48("5797", "5798", "5799"), correctAnswer && (stryMutAct_9fa48("5801") ? correctAnswer.text !== answer.answer : stryMutAct_9fa48("5800") ? true : (stryCov_9fa48("5800", "5801"), correctAnswer.text === answer.answer)))) {
                if (stryMutAct_9fa48("5802")) {
                  {}
                } else {
                  stryCov_9fa48("5802");
                  attemptAnswer.points = question.points;
                  stryMutAct_9fa48("5803") ? totalScore -= question.points : (stryCov_9fa48("5803"), totalScore += question.points);
                }
              } else {
                if (stryMutAct_9fa48("5804")) {
                  {}
                } else {
                  stryCov_9fa48("5804");
                  attemptAnswer.points = 0;
                }
              }
            }
          }
          await this.attemptAnswerRepo.save(attemptAnswer);
        }
      }
      savedAttempt.score = (stryMutAct_9fa48("5808") ? totalPoints <= 0 : stryMutAct_9fa48("5807") ? totalPoints >= 0 : stryMutAct_9fa48("5806") ? false : stryMutAct_9fa48("5805") ? true : (stryCov_9fa48("5805", "5806", "5807", "5808"), totalPoints > 0)) ? stryMutAct_9fa48("5809") ? totalScore / totalPoints / 100 : (stryCov_9fa48("5809"), (stryMutAct_9fa48("5810") ? totalScore * totalPoints : (stryCov_9fa48("5810"), totalScore / totalPoints)) * 100) : 0;
      savedAttempt.isGraded = stryMutAct_9fa48("5811") ? quiz.questions.some(q => q.type !== QuestionType.ESSAY) : (stryCov_9fa48("5811"), quiz.questions.every(stryMutAct_9fa48("5812") ? () => undefined : (stryCov_9fa48("5812"), q => stryMutAct_9fa48("5815") ? q.type === QuestionType.ESSAY : stryMutAct_9fa48("5814") ? false : stryMutAct_9fa48("5813") ? true : (stryCov_9fa48("5813", "5814", "5815"), q.type !== QuestionType.ESSAY))));
      return this.attemptRepo.save(savedAttempt);
    }
  }
  async gradeEssay(attemptId: string, questionId: string, points: number, feedback: string) {
    if (stryMutAct_9fa48("5816")) {
      {}
    } else {
      stryCov_9fa48("5816");
      const attemptAnswer = await this.attemptAnswerRepo.findOne(stryMutAct_9fa48("5817") ? {} : (stryCov_9fa48("5817"), {
        where: stryMutAct_9fa48("5818") ? {} : (stryCov_9fa48("5818"), {
          attemptId,
          questionId
        })
      }));
      if (stryMutAct_9fa48("5820") ? false : stryMutAct_9fa48("5819") ? true : (stryCov_9fa48("5819", "5820"), attemptAnswer)) {
        if (stryMutAct_9fa48("5821")) {
          {}
        } else {
          stryCov_9fa48("5821");
          attemptAnswer.points = points;
          await this.attemptAnswerRepo.save(attemptAnswer);
        }
      }
      const attempt = await this.attemptRepo.findOne(stryMutAct_9fa48("5822") ? {} : (stryCov_9fa48("5822"), {
        where: stryMutAct_9fa48("5823") ? {} : (stryCov_9fa48("5823"), {
          id: attemptId
        }),
        relations: stryMutAct_9fa48("5824") ? [] : (stryCov_9fa48("5824"), [stryMutAct_9fa48("5825") ? "" : (stryCov_9fa48("5825"), 'answers'), stryMutAct_9fa48("5826") ? "" : (stryCov_9fa48("5826"), 'quiz')])
      }));
      const totalPoints = attempt.quiz.questions.reduce(stryMutAct_9fa48("5827") ? () => undefined : (stryCov_9fa48("5827"), (sum, q) => stryMutAct_9fa48("5828") ? sum - q.points : (stryCov_9fa48("5828"), sum + q.points)), 0);
      const totalScore = attempt.answers.reduce(stryMutAct_9fa48("5829") ? () => undefined : (stryCov_9fa48("5829"), (sum, a) => stryMutAct_9fa48("5830") ? sum - (a.points || 0) : (stryCov_9fa48("5830"), sum + (stryMutAct_9fa48("5833") ? a.points && 0 : stryMutAct_9fa48("5832") ? false : stryMutAct_9fa48("5831") ? true : (stryCov_9fa48("5831", "5832", "5833"), a.points || 0)))), 0);
      attempt.score = (stryMutAct_9fa48("5837") ? totalPoints <= 0 : stryMutAct_9fa48("5836") ? totalPoints >= 0 : stryMutAct_9fa48("5835") ? false : stryMutAct_9fa48("5834") ? true : (stryCov_9fa48("5834", "5835", "5836", "5837"), totalPoints > 0)) ? stryMutAct_9fa48("5838") ? totalScore / totalPoints / 100 : (stryCov_9fa48("5838"), (stryMutAct_9fa48("5839") ? totalScore * totalPoints : (stryCov_9fa48("5839"), totalScore / totalPoints)) * 100) : 0;
      attempt.feedback = feedback;
      attempt.isGraded = stryMutAct_9fa48("5840") ? false : (stryCov_9fa48("5840"), true);
      return this.attemptRepo.save(attempt);
    }
  }
  async getAttempts(quizId: string, userId?: string) {
    if (stryMutAct_9fa48("5841")) {
      {}
    } else {
      stryCov_9fa48("5841");
      const query = this.attemptRepo.createQueryBuilder(stryMutAct_9fa48("5842") ? "" : (stryCov_9fa48("5842"), 'attempt')).where(stryMutAct_9fa48("5843") ? "" : (stryCov_9fa48("5843"), 'attempt.quizId = :quizId'), stryMutAct_9fa48("5844") ? {} : (stryCov_9fa48("5844"), {
        quizId
      }));
      if (stryMutAct_9fa48("5846") ? false : stryMutAct_9fa48("5845") ? true : (stryCov_9fa48("5845", "5846"), userId)) {
        if (stryMutAct_9fa48("5847")) {
          {}
        } else {
          stryCov_9fa48("5847");
          query.andWhere(stryMutAct_9fa48("5848") ? "" : (stryCov_9fa48("5848"), 'attempt.userId = :userId'), stryMutAct_9fa48("5849") ? {} : (stryCov_9fa48("5849"), {
            userId
          }));
        }
      }
      return query.orderBy(stryMutAct_9fa48("5850") ? "" : (stryCov_9fa48("5850"), 'attempt.submittedAt'), stryMutAct_9fa48("5851") ? "" : (stryCov_9fa48("5851"), 'DESC')).getMany();
    }
  }
}