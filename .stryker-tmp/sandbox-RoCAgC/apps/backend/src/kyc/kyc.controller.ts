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
import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { KycService } from './kyc.service';
@ApiTags('kyc')
@Controller('kyc')
export class KycController {
  constructor(private kycService: KycService) {}
  @Get('status/:stellarPublicKey')
  @ApiOperation({
    summary: 'SEP-0012: get KYC status for a Stellar account'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns KYC status record'
  })
  getStatus(@Param('stellarPublicKey')
  stellarPublicKey: string) {
    if (stryMutAct_9fa48("4016")) {
      {}
    } else {
      stryCov_9fa48("4016");
      return this.kycService.getStatus(stellarPublicKey);
    }
  }
  @Put('customer')
  @ApiOperation({
    summary: 'SEP-0012: submit or update KYC fields'
  })
  @ApiResponse({
    status: 200,
    description: 'KYC submission accepted'
  })
  upsertCustomer(@Body()
  body: {
    stellarPublicKey: string;
    [key: string]: string;
  }) {
    if (stryMutAct_9fa48("4017")) {
      {}
    } else {
      stryCov_9fa48("4017");
      const {
        stellarPublicKey,
        ...fields
      } = body;
      return this.kycService.upsertCustomer(stellarPublicKey, fields);
    }
  }

  /** Webhook called by the KYC provider when verification status changes */
  @Post('webhook')
  @ApiOperation({
    summary: 'KYC provider webhook — status update callback'
  })
  async webhook(@Body()
  payload: any) {
    if (stryMutAct_9fa48("4018")) {
      {}
    } else {
      stryCov_9fa48("4018");
      await this.kycService.handleWebhook(payload);
      return stryMutAct_9fa48("4019") ? {} : (stryCov_9fa48("4019"), {
        received: stryMutAct_9fa48("4020") ? false : (stryCov_9fa48("4020"), true)
      });
    }
  }
}