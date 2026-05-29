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
import { Controller, Get, Post, Patch, Delete, Body, Param, Headers, UseGuards, Request, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { IsUrl, IsArray, IsString, IsBoolean, IsOptional } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WebhooksService } from './webhooks.service';
class CreateWebhookDto {
  @IsUrl()
  url: string;
  @IsArray()
  @IsString({
    each: true
  })
  events: string[];
}
class UpdateWebhookDto {
  @IsOptional()
  @IsUrl()
  url?: string;
  @IsOptional()
  @IsArray()
  @IsString({
    each: true
  })
  events?: string[];
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
class VerifySignatureDto {
  @IsString()
  webhookId: string;
  @IsString()
  body: string;
  @IsString()
  signature: string;
  @IsOptional()
  @IsString()
  timestamp?: string;
}
@ApiTags('webhooks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/webhooks')
export class WebhooksController {
  constructor(private readonly service: WebhooksService) {}
  @Post()
  @ApiOperation({
    summary: 'Register a webhook'
  })
  create(@Request()
  req: any, @Body()
  dto: CreateWebhookDto) {
    if (stryMutAct_9fa48("7514")) {
      {}
    } else {
      stryCov_9fa48("7514");
      return this.service.register(req.user.userId, dto.url, dto.events);
    }
  }
  @Get()
  @ApiOperation({
    summary: 'List webhooks'
  })
  list(@Request()
  req: any) {
    if (stryMutAct_9fa48("7515")) {
      {}
    } else {
      stryCov_9fa48("7515");
      return this.service.list(req.user.userId);
    }
  }
  @Patch(':id')
  @ApiOperation({
    summary: 'Update a webhook'
  })
  update(@Request()
  req: any, @Param('id')
  id: string, @Body()
  dto: UpdateWebhookDto) {
    if (stryMutAct_9fa48("7516")) {
      {}
    } else {
      stryCov_9fa48("7516");
      return this.service.update(req.user.userId, id, dto);
    }
  }
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a webhook'
  })
  remove(@Request()
  req: any, @Param('id')
  id: string) {
    if (stryMutAct_9fa48("7517")) {
      {}
    } else {
      stryCov_9fa48("7517");
      return this.service.delete(req.user.userId, id);
    }
  }
  @Get(':id/logs')
  @ApiOperation({
    summary: 'Get delivery logs for a webhook'
  })
  logs(@Request()
  req: any, @Param('id')
  id: string) {
    if (stryMutAct_9fa48("7518")) {
      {}
    } else {
      stryCov_9fa48("7518");
      return this.service.getLogs(id, req.user.userId);
    }
  }
  @Post('verify-signature')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify a webhook signature (for testing)'
  })
  async verifySignature(@Request()
  req: any, @Body()
  dto: VerifySignatureDto) {
    if (stryMutAct_9fa48("7519")) {
      {}
    } else {
      stryCov_9fa48("7519");
      const webhook = await this.service.getWebhookForUser(dto.webhookId, req.user.userId);
      const valid = this.service.verifySignature(webhook.secret, dto.body, dto.signature, dto.timestamp);
      if (stryMutAct_9fa48("7522") ? false : stryMutAct_9fa48("7521") ? true : stryMutAct_9fa48("7520") ? valid : (stryCov_9fa48("7520", "7521", "7522"), !valid)) throw new UnauthorizedException(stryMutAct_9fa48("7523") ? "" : (stryCov_9fa48("7523"), 'Invalid signature or timestamp'));
      return stryMutAct_9fa48("7524") ? {} : (stryCov_9fa48("7524"), {
        valid: stryMutAct_9fa48("7525") ? false : (stryCov_9fa48("7525"), true)
      });
    }
  }
}