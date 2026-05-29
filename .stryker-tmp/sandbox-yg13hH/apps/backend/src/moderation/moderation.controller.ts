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
import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ModerationService } from './moderation.service';
import { AppealDto, FlagContentDto, ModerationQueueQueryDto, ReviewItemDto } from './dto/moderation.dto';
@ApiTags('moderation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('moderation')
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}
  @Post('flag')
  @ApiOperation({
    summary: 'Flag content for review'
  })
  flag(@Body()
  dto: FlagContentDto, @Request()
  req: {
    user: {
      id: string;
    };
  }) {
    if (stryMutAct_9fa48("5101")) {
      {}
    } else {
      stryCov_9fa48("5101");
      return this.moderationService.flagContent(dto, req.user.id);
    }
  }
  @Get('queue')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Get moderation queue (admin)'
  })
  getQueue(@Query()
  query: ModerationQueueQueryDto) {
    if (stryMutAct_9fa48("5102")) {
      {}
    } else {
      stryCov_9fa48("5102");
      return this.moderationService.getQueue(query);
    }
  }
  @Patch(':id/review')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Review a moderation item (admin)'
  })
  review(@Param('id')
  id: string, @Body()
  dto: ReviewItemDto, @Request()
  req: {
    user: {
      id: string;
    };
  }) {
    if (stryMutAct_9fa48("5103")) {
      {}
    } else {
      stryCov_9fa48("5103");
      return this.moderationService.reviewItem(id, dto, req.user.id);
    }
  }
  @Post(':id/appeal')
  @ApiOperation({
    summary: 'Submit an appeal for a rejected item'
  })
  appeal(@Param('id')
  id: string, @Body()
  dto: AppealDto, @Request()
  req: {
    user: {
      id: string;
    };
  }) {
    if (stryMutAct_9fa48("5104")) {
      {}
    } else {
      stryCov_9fa48("5104");
      return this.moderationService.submitAppeal(id, dto, req.user.id);
    }
  }
  @Patch(':id/appeal/resolve')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Resolve an appeal (admin)'
  })
  resolveAppeal(@Param('id')
  id: string, @Body()
  body: {
    approve: boolean;
    note?: string;
  }, @Request()
  req: {
    user: {
      id: string;
    };
  }) {
    if (stryMutAct_9fa48("5105")) {
      {}
    } else {
      stryCov_9fa48("5105");
      return this.moderationService.resolveAppeal(id, body.approve, req.user.id, body.note);
    }
  }
  @Get(':id/logs')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Get audit logs for a moderation item (admin)'
  })
  getLogs(@Param('id')
  id: string) {
    if (stryMutAct_9fa48("5106")) {
      {}
    } else {
      stryCov_9fa48("5106");
      return this.moderationService.getLogs(id);
    }
  }
}