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
import { Body, Controller, Get, Header, Param, Post, StreamableFile, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CredentialsService } from './credentials.service';
import { CertificatePdfService } from './certificate-pdf.service';
@ApiTags('credentials')
@Controller('credentials')
export class CredentialsController {
  constructor(private credentialsService: CredentialsService, private certificatePdfService: CertificatePdfService) {}
  @Get('detail/:id')
  @ApiOperation({
    summary: 'Public: Get a credential by ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Credential found'
  })
  @ApiResponse({
    status: 404,
    description: 'Credential not found'
  })
  async findOne(@Param('id')
  id: string) {
    if (stryMutAct_9fa48("3261")) {
      {}
    } else {
      stryCov_9fa48("3261");
      const credential = await this.credentialsService.findOne(id);
      return stryMutAct_9fa48("3262") ? {} : (stryCov_9fa48("3262"), {
        id: credential.id,
        courseName: stryMutAct_9fa48("3263") ? credential.course.title : (stryCov_9fa48("3263"), credential.course?.title),
        studentName: stryMutAct_9fa48("3266") ? (credential.user?.username || credential.user?.email) && 'Student' : stryMutAct_9fa48("3265") ? false : stryMutAct_9fa48("3264") ? true : (stryCov_9fa48("3264", "3265", "3266"), (stryMutAct_9fa48("3268") ? credential.user?.username && credential.user?.email : stryMutAct_9fa48("3267") ? false : (stryCov_9fa48("3267", "3268"), (stryMutAct_9fa48("3269") ? credential.user.username : (stryCov_9fa48("3269"), credential.user?.username)) || (stryMutAct_9fa48("3270") ? credential.user.email : (stryCov_9fa48("3270"), credential.user?.email)))) || (stryMutAct_9fa48("3271") ? "" : (stryCov_9fa48("3271"), 'Student'))),
        issuedAt: credential.issuedAt,
        txHash: credential.txHash,
        grade: credential.grade,
        skills: stryMutAct_9fa48("3272") ? credential.course.skills : (stryCov_9fa48("3272"), credential.course?.skills)
      });
    }
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id/pdf')
  @Header('Content-Type', 'application/pdf')
  @ApiOperation({
    summary: 'Download a credential as a PDF certificate'
  })
  @ApiResponse({
    status: 200,
    description: 'PDF certificate generated successfully'
  })
  async downloadPdf(@Param('id')
  id: string) {
    if (stryMutAct_9fa48("3273")) {
      {}
    } else {
      stryCov_9fa48("3273");
      const credential = await this.credentialsService.findOne(id);
      const pdf = this.certificatePdfService.generateCertificatePdf(credential);
      return new StreamableFile(pdf, stryMutAct_9fa48("3274") ? {} : (stryCov_9fa48("3274"), {
        disposition: stryMutAct_9fa48("3275") ? `` : (stryCov_9fa48("3275"), `attachment; filename="credential-${id}.pdf"`),
        type: stryMutAct_9fa48("3276") ? "" : (stryCov_9fa48("3276"), 'application/pdf')
      }));
    }
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  @ApiOperation({
    summary: 'List all credentials for a user'
  })
  @ApiResponse({
    status: 200,
    description: 'List of credentials',
    schema: {
      example: [{
        id: 'uuid',
        courseId: 'uuid',
        txHash: 'abc123',
        issuedAt: '2024-01-01T00:00:00.000Z'
      }]
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  findByUser(@Param('userId')
  userId: string) {
    if (stryMutAct_9fa48("3277")) {
      {}
    } else {
      stryCov_9fa48("3277");
      return this.credentialsService.findByUser(userId);
    }
  }
  @Get('verify/:txHash')
  @ApiOperation({
    summary: 'Verify a credential on-chain by transaction hash'
  })
  @ApiResponse({
    status: 200,
    description: 'Verification result',
    schema: {
      example: {
        valid: true,
        txHash: 'abc123'
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction not found'
  })
  verify(@Param('txHash')
  txHash: string) {
    if (stryMutAct_9fa48("3278")) {
      {}
    } else {
      stryCov_9fa48("3278");
      return this.credentialsService.verify(txHash);
    }
  }
  @Post('issue')
  @UseGuards(AuthGuard(['jwt', 'api-key']), RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Admin: manually issue a credential'
  })
  @ApiBody({
    schema: {
      example: {
        userId: 'uuid',
        courseId: 'uuid',
        stellarPublicKey: 'GABC...'
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Credential issued',
    schema: {
      example: {
        id: 'uuid',
        txHash: 'abc123'
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
  issue(@Body()
  body: {
    userId: string;
    courseId: string;
    stellarPublicKey: string;
  }) {
    if (stryMutAct_9fa48("3279")) {
      {}
    } else {
      stryCov_9fa48("3279");
      return this.credentialsService.issue(body.userId, body.courseId, body.stellarPublicKey);
    }
  }
}