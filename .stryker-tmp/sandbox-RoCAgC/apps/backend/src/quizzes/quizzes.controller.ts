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
import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { QuizzesService } from './quizzes.service';
@Controller('v1/quizzes')
@UseGuards(JwtAuthGuard)
export class QuizzesController {
  constructor(private quizzesService: QuizzesService) {}
  @Post(':lessonId')
  async createQuiz(@Param('lessonId')
  lessonId: string, @Body()
  data: any) {
    if (stryMutAct_9fa48("5756")) {
      {}
    } else {
      stryCov_9fa48("5756");
      return this.quizzesService.createQuiz(lessonId, data);
    }
  }
  @Get(':id')
  async getQuiz(@Param('id')
  id: string) {
    if (stryMutAct_9fa48("5757")) {
      {}
    } else {
      stryCov_9fa48("5757");
      return this.quizzesService.getQuiz(id);
    }
  }
  @Post(':quizId/questions')
  async addQuestion(@Param('quizId')
  quizId: string, @Body()
  data: any) {
    if (stryMutAct_9fa48("5758")) {
      {}
    } else {
      stryCov_9fa48("5758");
      return this.quizzesService.addQuestion(quizId, data);
    }
  }
  @Post('questions/:questionId/answers')
  async addAnswer(@Param('questionId')
  questionId: string, @Body()
  data: any) {
    if (stryMutAct_9fa48("5759")) {
      {}
    } else {
      stryCov_9fa48("5759");
      return this.quizzesService.addAnswer(questionId, data);
    }
  }
  @Post(':quizId/submit')
  async submitAttempt(@Param('quizId')
  quizId: string, @Body()
  data: any, @CurrentUser()
  user: any) {
    if (stryMutAct_9fa48("5760")) {
      {}
    } else {
      stryCov_9fa48("5760");
      return this.quizzesService.submitAttempt(quizId, user.id, data.answers);
    }
  }
  @Post(':attemptId/grade')
  async gradeEssay(@Param('attemptId')
  attemptId: string, @Body()
  data: any) {
    if (stryMutAct_9fa48("5761")) {
      {}
    } else {
      stryCov_9fa48("5761");
      return this.quizzesService.gradeEssay(attemptId, data.questionId, data.points, data.feedback);
    }
  }
  @Get(':quizId/attempts')
  async getAttempts(@Param('quizId')
  quizId: string) {
    if (stryMutAct_9fa48("5762")) {
      {}
    } else {
      stryCov_9fa48("5762");
      return this.quizzesService.getAttempts(quizId);
    }
  }
}