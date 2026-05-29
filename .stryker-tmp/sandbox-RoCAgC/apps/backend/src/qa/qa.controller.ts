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
import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { QaService } from './qa.service';
class AskQuestionDto {
  courseId: string;
  body: string;
  timestampSeconds?: number;
  instructorId?: string;
}
class AnswerQuestionDto {
  answer: string;
}
@ApiTags('qa')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/qa')
export class QaController {
  constructor(private readonly service: QaService) {}
  @Post()
  @ApiOperation({
    summary: 'Ask a question in a course'
  })
  ask(@Request()
  req, @Body()
  dto: AskQuestionDto) {
    if (stryMutAct_9fa48("5709")) {
      {}
    } else {
      stryCov_9fa48("5709");
      return this.service.ask(req.user.id, dto.courseId, dto.body, dto.timestampSeconds, dto.instructorId);
    }
  }
  @Get()
  @ApiOperation({
    summary: 'List questions for a course'
  })
  list(@Query('courseId')
  courseId: string) {
    if (stryMutAct_9fa48("5710")) {
      {}
    } else {
      stryCov_9fa48("5710");
      return this.service.findByCourse(courseId);
    }
  }
  @Patch(':id/answer')
  @ApiOperation({
    summary: 'Answer a question (instructor)'
  })
  answer(@Request()
  req, @Param('id')
  id: string, @Body()
  dto: AnswerQuestionDto) {
    if (stryMutAct_9fa48("5711")) {
      {}
    } else {
      stryCov_9fa48("5711");
      return this.service.answer(id, req.user.id, dto.answer);
    }
  }
  @Patch(':id/upvote')
  @ApiOperation({
    summary: 'Upvote a question'
  })
  upvote(@Param('id')
  id: string) {
    if (stryMutAct_9fa48("5712")) {
      {}
    } else {
      stryCov_9fa48("5712");
      return this.service.upvote(id);
    }
  }
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete own question'
  })
  remove(@Request()
  req, @Param('id')
  id: string) {
    if (stryMutAct_9fa48("5713")) {
      {}
    } else {
      stryCov_9fa48("5713");
      return this.service.remove(id, req.user.id);
    }
  }
}