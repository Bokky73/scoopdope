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
import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProgressService } from './progress.service';
import { RecordProgressDto } from './dto/record-progress.dto';
@ApiTags('progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ProgressController {
  constructor(private progressService: ProgressService) {}
  @Post('progress')
  @ApiOperation({
    summary: 'Record lesson completion and update on-chain progress'
  })
  @ApiBody({
    schema: {
      example: {
        courseId: 'uuid',
        lessonId: 'uuid',
        progressPct: 75
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Progress recorded',
    schema: {
      example: {
        id: 'uuid',
        courseId: 'uuid',
        progressPct: 75
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  record(@Request()
  req, @Body()
  dto: RecordProgressDto) {
    if (stryMutAct_9fa48("5662")) {
      {}
    } else {
      stryCov_9fa48("5662");
      return this.progressService.record(req.user.id, dto, req.user.stellarPublicKey);
    }
  }
  @Get('users/:id/progress')
  @ApiOperation({
    summary: 'Get all progress records for a user'
  })
  @ApiResponse({
    status: 200,
    description: 'List of progress records',
    schema: {
      example: [{
        courseId: 'uuid',
        progressPct: 75,
        updatedAt: '2024-01-01T00:00:00.000Z'
      }]
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @ApiResponse({
    status: 404,
    description: 'User not found'
  })
  findByUser(@Param('id')
  id: string) {
    if (stryMutAct_9fa48("5663")) {
      {}
    } else {
      stryCov_9fa48("5663");
      return this.progressService.findByUser(id);
    }
  }
}