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
import { CdnService } from './cdn.service';
import { ContentType } from './cdn-asset.entity';
@Controller('v1/cdn')
@UseGuards(JwtAuthGuard)
export class CdnController {
  constructor(private cdnService: CdnService) {}
  @Post('upload')
  async uploadAsset(@Body()
  data: any) {
    if (stryMutAct_9fa48("1534")) {
      {}
    } else {
      stryCov_9fa48("1534");
      return this.cdnService.uploadAsset(data.lessonId, data.fileName, data.contentType as ContentType, data.fileSize);
    }
  }
  @Get(':assetId/signed-url')
  async getSignedUrl(@Param('assetId')
  assetId: string, @Body()
  data?: any) {
    if (stryMutAct_9fa48("1535")) {
      {}
    } else {
      stryCov_9fa48("1535");
      const expirationMinutes = stryMutAct_9fa48("1538") ? data?.expirationMinutes && 60 : stryMutAct_9fa48("1537") ? false : stryMutAct_9fa48("1536") ? true : (stryCov_9fa48("1536", "1537", "1538"), (stryMutAct_9fa48("1539") ? data.expirationMinutes : (stryCov_9fa48("1539"), data?.expirationMinutes)) || 60);
      const signedUrl = this.cdnService.generateSignedUrl(assetId, expirationMinutes);
      return stryMutAct_9fa48("1540") ? {} : (stryCov_9fa48("1540"), {
        signedUrl
      });
    }
  }
  @Post(':assetId/transcode')
  async markTranscoded(@Param('assetId')
  assetId: string, @Body()
  data: any) {
    if (stryMutAct_9fa48("1541")) {
      {}
    } else {
      stryCov_9fa48("1541");
      return this.cdnService.markAsTranscoded(assetId, data.bitrates, data.thumbnailUrl);
    }
  }
  @Post(':assetId/invalidate')
  async invalidateCache(@Param('assetId')
  assetId: string) {
    if (stryMutAct_9fa48("1542")) {
      {}
    } else {
      stryCov_9fa48("1542");
      return this.cdnService.invalidateCache(assetId);
    }
  }
  @Get(':assetId')
  async getAsset(@Param('assetId')
  assetId: string) {
    if (stryMutAct_9fa48("1543")) {
      {}
    } else {
      stryCov_9fa48("1543");
      return this.cdnService.getAsset(assetId);
    }
  }
  @Get('lesson/:lessonId')
  async getLessonAssets(@Param('lessonId')
  lessonId: string) {
    if (stryMutAct_9fa48("1544")) {
      {}
    } else {
      stryCov_9fa48("1544");
      return this.cdnService.getLessonAssets(lessonId);
    }
  }
}