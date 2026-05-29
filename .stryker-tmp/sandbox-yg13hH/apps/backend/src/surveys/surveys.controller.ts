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
import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SurveysService } from './surveys.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
@Controller('v1/surveys')
@UseGuards(JwtAuthGuard)
export class SurveysController {
  constructor(private surveysService: SurveysService) {}
  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  async createSurvey(@Body()
  body: {
    courseId: string;
    title: string;
    description: string;
    triggerType: 'completion' | 'milestone';
    triggerMilestone?: number;
    allowAnonymous?: boolean;
  }) {
    if (stryMutAct_9fa48("6905")) {
      {}
    } else {
      stryCov_9fa48("6905");
      return this.surveysService.createSurvey(body.courseId, body.title, body.description, body.triggerType, body.triggerMilestone, body.allowAnonymous);
    }
  }
  @Post(':surveyId/questions')
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  async addQuestion(@Param('surveyId')
  surveyId: string, @Body()
  body: {
    text: string;
    type: 'rating' | 'text' | 'mcq';
    order: number;
    options?: string[];
    required?: boolean;
  }) {
    if (stryMutAct_9fa48("6906")) {
      {}
    } else {
      stryCov_9fa48("6906");
      return this.surveysService.addQuestion(surveyId, body.text, body.type, body.order, body.options, body.required);
    }
  }
  @Post(':surveyId/responses')
  async submitResponse(@Request()
  req, @Param('surveyId')
  surveyId: string, @Body()
  body: {
    answers: Record<string, string | number>;
    isAnonymous?: boolean;
  }) {
    if (stryMutAct_9fa48("6907")) {
      {}
    } else {
      stryCov_9fa48("6907");
      return this.surveysService.submitResponse(surveyId, req.user.id, body.answers, body.isAnonymous);
    }
  }
  @Get('course/:courseId')
  async getSurveysByCourse(@Param('courseId')
  courseId: string) {
    if (stryMutAct_9fa48("6908")) {
      {}
    } else {
      stryCov_9fa48("6908");
      return this.surveysService.getSurveyByCourse(courseId);
    }
  }
  @Get(':surveyId/responses')
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  async getResponses(@Param('surveyId')
  surveyId: string) {
    if (stryMutAct_9fa48("6909")) {
      {}
    } else {
      stryCov_9fa48("6909");
      return this.surveysService.getResponsesForSurvey(surveyId);
    }
  }
  @Get(':surveyId/analytics')
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  async getAnalytics(@Param('surveyId')
  surveyId: string) {
    if (stryMutAct_9fa48("6910")) {
      {}
    } else {
      stryCov_9fa48("6910");
      return this.surveysService.getAnalytics(surveyId);
    }
  }
  @Get('instructor/:instructorId/aggregate')
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  async getInstructorAggregate(@Param('instructorId')
  instructorId: string) {
    if (stryMutAct_9fa48("6911")) {
      {}
    } else {
      stryCov_9fa48("6911");
      return this.surveysService.getInstructorSurveyAggregate(instructorId);
    }
  }
}