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
import { Controller, Get, Patch, Query, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EmailService } from './email.service';
class UpdatePrefsDto {
  @IsOptional()
  @IsBoolean()
  enrollment?: boolean;
  @IsOptional()
  @IsBoolean()
  completion?: boolean;
  @IsOptional()
  @IsBoolean()
  credentialIssued?: boolean;
  @IsOptional()
  @IsBoolean()
  marketing?: boolean;
}
@ApiTags('email')
@Controller('v1/email')
export class EmailController {
  constructor(private readonly service: EmailService) {}
  @Get('unsubscribe')
  @ApiOperation({
    summary: 'Unsubscribe from all emails via token'
  })
  @ApiQuery({
    name: 'token',
    required: true
  })
  async unsubscribe(@Query('token')
  token: string) {
    if (stryMutAct_9fa48("3391")) {
      {}
    } else {
      stryCov_9fa48("3391");
      await this.service.unsubscribeByToken(token);
      return stryMutAct_9fa48("3392") ? {} : (stryCov_9fa48("3392"), {
        message: stryMutAct_9fa48("3393") ? "" : (stryCov_9fa48("3393"), 'You have been unsubscribed from all emails.')
      });
    }
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('preferences')
  @ApiOperation({
    summary: 'Get email preferences'
  })
  getPreferences(@Request()
  req: any) {
    if (stryMutAct_9fa48("3394")) {
      {}
    } else {
      stryCov_9fa48("3394");
      return this.service.getPreferences(req.user.userId);
    }
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('preferences')
  @ApiOperation({
    summary: 'Update email preferences'
  })
  updatePreferences(@Request()
  req: any, @Body()
  dto: UpdatePrefsDto) {
    if (stryMutAct_9fa48("3395")) {
      {}
    } else {
      stryCov_9fa48("3395");
      return this.service.updatePreferences(req.user.userId, dto);
    }
  }
}