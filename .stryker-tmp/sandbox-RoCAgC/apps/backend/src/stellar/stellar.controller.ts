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
import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { StellarService } from './stellar.service';
import { NetworkMonitorService } from './network-monitor.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
@ApiTags('stellar')
@Controller('stellar')
export class StellarController {
  constructor(private stellarService: StellarService, private networkMonitorService: NetworkMonitorService) {}
  @Get('network-status')
  @ApiOperation({
    summary: 'Get Stellar network health status'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns network health metrics'
  })
  getNetworkStatus() {
    if (stryMutAct_9fa48("6449")) {
      {}
    } else {
      stryCov_9fa48("6449");
      return this.networkMonitorService.getNetworkStatus();
    }
  }
  @Get('balance/:publicKey')
  @ApiOperation({
    summary: 'Get Stellar account balance'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns account balances'
  })
  getBalance(@Param('publicKey')
  publicKey: string) {
    if (stryMutAct_9fa48("6450")) {
      {}
    } else {
      stryCov_9fa48("6450");
      return this.stellarService.getAccountBalance(publicKey);
    }
  }
  @Post('fund-testnet')
  @ApiOperation({
    summary: 'Fund a testnet account via Friendbot (testnet only)'
  })
  @ApiResponse({
    status: 201,
    description: 'Account funded successfully'
  })
  @ApiResponse({
    status: 400,
    description: 'Not available on mainnet or Friendbot error'
  })
  async fundTestnet(@Body()
  body: {
    publicKey: string;
  }) {
    if (stryMutAct_9fa48("6451")) {
      {}
    } else {
      stryCov_9fa48("6451");
      return this.stellarService.fundTestnetAccount(body.publicKey);
    }
  }
  @Post('mint')
  @Throttle({
    default: {
      limit: 3,
      ttl: 60000
    }
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Mint a credential NFT'
  })
  @ApiBody({
    schema: {
      example: {
        recipientPublicKey: 'GABC...',
        courseId: 'uuid'
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Credential minted successfully',
    schema: {
      example: {
        data: 'transaction_hash',
        statusCode: 201,
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin role required'
  })
  mintCredential(@Body()
  body: {
    recipientPublicKey: string;
    courseId: string;
  }) {
    if (stryMutAct_9fa48("6452")) {
      {}
    } else {
      stryCov_9fa48("6452");
      return this.stellarService.issueCredential(body.recipientPublicKey, body.courseId);
    }
  }
}
@ApiTags('credentials')
@Controller('credentials')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CredentialsController {
  constructor(private stellarService: StellarService) {}
  @Post('issue')
  @Throttle({
    default: {
      limit: 3,
      ttl: 60000
    }
  })
  @Roles('admin')
  @ApiOperation({
    summary: 'Issue a credential for course completion'
  })
  @ApiBody({
    schema: {
      example: {
        recipientPublicKey: 'GABC...',
        courseId: 'uuid'
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Credential issued successfully',
    schema: {
      example: {
        data: 'transaction_hash',
        statusCode: 201,
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin role required'
  })
  issueCredential(@Body()
  body: {
    recipientPublicKey: string;
    courseId: string;
  }) {
    if (stryMutAct_9fa48("6453")) {
      {}
    } else {
      stryCov_9fa48("6453");
      return this.stellarService.issueCredential(body.recipientPublicKey, body.courseId);
    }
  }
}