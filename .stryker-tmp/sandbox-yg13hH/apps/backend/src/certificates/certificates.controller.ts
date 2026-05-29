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
import { Controller, Post, Get, Param, UseGuards, Body, Header, StreamableFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CertificatesService } from './certificates.service';
import { CertificatePdfService } from './certificate-pdf.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
@ApiTags('certificates')
@Controller('v1/certificates')
export class CertificatesController {
  constructor(private certificatesService: CertificatesService, private certificatePdfService: CertificatePdfService, private configService: ConfigService) {}
  @Post(':userId/:courseId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Issue a certificate for a completed course'
  })
  async issueCertificate(@Param('userId')
  userId: string, @Param('courseId')
  courseId: string) {
    if (stryMutAct_9fa48("1680")) {
      {}
    } else {
      stryCov_9fa48("1680");
      return this.certificatesService.issueCertificate(userId, courseId);
    }
  }
  @Get(':id')
  @ApiOperation({
    summary: 'Get a certificate by ID'
  })
  async getCertificate(@Param('id')
  id: string) {
    if (stryMutAct_9fa48("1681")) {
      {}
    } else {
      stryCov_9fa48("1681");
      return this.certificatesService.getCertificate(id);
    }
  }
  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all certificates for a user'
  })
  async getUserCertificates(@Param('userId')
  userId: string) {
    if (stryMutAct_9fa48("1682")) {
      {}
    } else {
      stryCov_9fa48("1682");
      return this.certificatesService.getUserCertificates(userId);
    }
  }
  @Post('verify')
  @ApiOperation({
    summary: 'Verify a certificate by hash'
  })
  async verifyCertificate(@Body()
  body: {
    certificateHash: string;
  }) {
    if (stryMutAct_9fa48("1683")) {
      {}
    } else {
      stryCov_9fa48("1683");
      return this.certificatesService.verifyCertificate(body.certificateHash);
    }
  }
  @Get(':id/pdf')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Header('Content-Type', 'application/pdf')
  @ApiOperation({
    summary: 'Download a certificate as a branded PDF with QR code'
  })
  @ApiResponse({
    status: 200,
    description: 'PDF certificate'
  })
  async downloadPdf(@Param('id')
  id: string): Promise<StreamableFile> {
    if (stryMutAct_9fa48("1684")) {
      {}
    } else {
      stryCov_9fa48("1684");
      const certificate = await this.certificatesService.getCertificateWithRelations(id);
      const baseUrl = this.configService.get<string>(stryMutAct_9fa48("1685") ? "" : (stryCov_9fa48("1685"), 'APP_URL'), stryMutAct_9fa48("1686") ? "" : (stryCov_9fa48("1686"), 'http://localhost:3000'));
      const pdf = await this.certificatePdfService.generateCertificatePdf(certificate, baseUrl);
      return new StreamableFile(pdf, stryMutAct_9fa48("1687") ? {} : (stryCov_9fa48("1687"), {
        disposition: stryMutAct_9fa48("1688") ? `` : (stryCov_9fa48("1688"), `attachment; filename="certificate-${id}.pdf"`),
        type: stryMutAct_9fa48("1689") ? "" : (stryCov_9fa48("1689"), 'application/pdf')
      }));
    }
  }
}