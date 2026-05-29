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
import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdaptiveLearningService } from './adaptive-learning.service';
@ApiTags('adaptive-learning')
@Controller('adaptive-learning')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdaptiveLearningController {
  constructor(private readonly service: AdaptiveLearningService) {}
  @Post('record')
  @ApiOperation({
    summary: 'Record quiz result and update difficulty'
  })
  recordResult(@Request()
  req, @Body()
  body: {
    topicId: string;
    score: number;
  }) {
    if (stryMutAct_9fa48("99")) {
      {}
    } else {
      stryCov_9fa48("99");
      return this.service.recordQuizResult(req.user.id, body.topicId, body.score);
    }
  }
  @Get('recommendations')
  @ApiOperation({
    summary: 'Get remedial content recommendations for weak topics'
  })
  getRecommendations(@Request()
  req) {
    if (stryMutAct_9fa48("100")) {
      {}
    } else {
      stryCov_9fa48("100");
      return this.service.getRecommendations(req.user.id);
    }
  }
  @Get('performance')
  @ApiOperation({
    summary: 'Get student performance across all topics'
  })
  getPerformance(@Request()
  req) {
    if (stryMutAct_9fa48("101")) {
      {}
    } else {
      stryCov_9fa48("101");
      return this.service.getPerformance(req.user.id);
    }
  }
  @Get('ab-test/:experiment')
  @ApiOperation({
    summary: 'Get or assign A/B test variant for current user'
  })
  getVariant(@Request()
  req, @Param('experiment')
  experiment: string) {
    if (stryMutAct_9fa48("102")) {
      {}
    } else {
      stryCov_9fa48("102");
      return this.service.getOrAssignVariant(req.user.id, experiment);
    }
  }
  @Post('ab-test/:experiment/outcome')
  @ApiOperation({
    summary: 'Record A/B test outcome score'
  })
  recordOutcome(@Request()
  req, @Param('experiment')
  experiment: string, @Body()
  body: {
    score: number;
  }) {
    if (stryMutAct_9fa48("103")) {
      {}
    } else {
      stryCov_9fa48("103");
      return this.service.recordAbOutcome(req.user.id, experiment, body.score);
    }
  }
  @Get('ab-test/:experiment/results')
  @ApiOperation({
    summary: 'Get A/B test aggregate results'
  })
  getAbResults(@Param('experiment')
  experiment: string) {
    if (stryMutAct_9fa48("104")) {
      {}
    } else {
      stryCov_9fa48("104");
      return this.service.getAbTestResults(experiment);
    }
  }
}