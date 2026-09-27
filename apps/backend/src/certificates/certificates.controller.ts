import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  Body,
  Header,
  StreamableFile,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CertificatesService, CertificateVerificationResult } from './certificates.service';
import { CertificatePdfService } from './certificate-pdf.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ConfigService } from '@nestjs/config';

@ApiTags('certificates')
@Controller('v1/certificates')
export class CertificatesController {
  constructor(
    private certificatesService: CertificatesService,
    private certificatePdfService: CertificatePdfService,
    private configService: ConfigService,
  ) {}

  // ── Manual issuance (admin / instructor trigger) ──────────────────────────

  @Post('issue')
  @UseGuards(AuthGuard(['jwt', 'api-key']), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: issue a certificate for a fully completed course' })
  @ApiBody({
    schema: {
      example: {
        userId: 'uuid-of-student',
        courseId: 'uuid-of-course',
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Certificate issued successfully' })
  @ApiResponse({ status: 400, description: 'Enrollment not found or course not fully completed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 409, description: 'Certificate already issued' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'On-chain minting failed' })
  async issueCertificate(@Body() body: { userId: string; courseId: string }) {
    return this.certificatesService.issueCertificate(body.userId, body.courseId);
  }

  @Post(':userId/:courseId')
  @UseGuards(AuthGuard(['jwt', 'api-key']), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Legacy admin-only certificate issuance trigger' })
  @ApiParam({ name: 'userId', description: 'UUID of the student' })
  @ApiParam({ name: 'courseId', description: 'UUID of the completed course' })
  @ApiResponse({ status: 201, description: 'Certificate issued successfully' })
  @ApiResponse({ status: 400, description: 'Enrollment not found or course not completed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 409, description: 'Certificate already issued' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'On-chain minting failed' })
  async issueCertificateByRoute(
    @Param('userId') userId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.certificatesService.issueCertificate(userId, courseId);
  }

  // ── Public verification ───────────────────────────────────────────────────

  /**
   * Public endpoint — no authentication required.
   *
   * Fetches the certificate by ID, cross-checks the stored transaction hash
   * against the Stellar network, and returns a structured verification payload.
   *
   * Example response:
   * {
   *   "verified": true,
   *   "certificateId": "uuid",
   *   "studentId": "uuid",
   *   "courseId": "uuid",
   *   "certificateHash": "sha256hex",
   *   "issuedAt": "2026-06-02T10:00:00.000Z",
   *   "transactionHash": "abc123...",
   *   "onChain": {
   *     "found": true,
   *     "successful": true,
   *     "ledgerTimestamp": "2026-06-02T10:00:01Z"
   *   }
   * }
   */
  @Get(':id/verify')
  @ApiOperation({
    summary: 'Publicly verify a certificate against the Stellar ledger',
    description:
      'Returns the certificate record cross-checked with the on-chain transaction. ' +
      'No authentication required — safe to embed in QR codes.',
  })
  @ApiParam({ name: 'id', description: 'UUID of the certificate to verify' })
  @ApiResponse({
    status: 200,
    description: 'Verification result',
    schema: {
      example: {
        verified: true,
        certificateId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        studentId: 'user-uuid',
        courseId: 'course-uuid',
        certificateHash: 'abc123def456...',
        issuedAt: '2026-06-02T10:00:00.000Z',
        transactionHash: 'abcdef1234567890...',
        onChain: {
          found: true,
          successful: true,
          ledgerTimestamp: '2026-06-02T10:00:01Z',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Certificate not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async verify(@Param('id') id: string): Promise<CertificateVerificationResult> {
    return this.certificatesService.verifyById(id);
  }

  // ── Authenticated read endpoints ──────────────────────────────────────────

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all certificates for a user' })
  @ApiResponse({ status: 200, description: 'List of certificates' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getUserCertificates(@Param('userId') userId: string) {
    return this.certificatesService.getUserCertificates(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a certificate by ID' })
  @ApiResponse({ status: 200, description: 'Certificate record' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Certificate not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getCertificate(@Param('id') id: string) {
    return this.certificatesService.getCertificate(id);
  }

  // ── Legacy hash verification ──────────────────────────────────────────────

  @Post('verify')
  @ApiOperation({ summary: 'Verify a certificate by its SHA-256 hash (legacy)' })
  @ApiResponse({ status: 200, description: 'Verification result' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async verifyCertificate(@Body() body: { certificateHash: string }) {
    return this.certificatesService.verifyCertificate(body.certificateHash);
  }

  // ── PDF download ──────────────────────────────────────────────────────────

  @Get(':id/pdf')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Header('Content-Type', 'application/pdf')
  @ApiOperation({ summary: 'Download a certificate as a branded PDF with QR code' })
  @ApiResponse({ status: 200, description: 'PDF certificate binary' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Certificate not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async downloadPdf(@Param('id') id: string): Promise<StreamableFile> {
    const certificate = await this.certificatesService.getCertificateWithRelations(id);
    const baseUrl = this.configService.get<string>('frontend.url') ?? 'http://localhost:3000';
    const pdf = await this.certificatePdfService.generateCertificatePdf(certificate, baseUrl);
    return new StreamableFile(pdf, {
      disposition: `attachment; filename="certificate-${id}.pdf"`,
      type: 'application/pdf',
    });
  }

  // ── Download endpoint (issue #874) ────────────────────────────────────────

  /**
   * GET /v1/certificates/:id/download
   *
   * Returns a PDF certificate as a downloadable file.
   * File name includes course slug and issue date for easy identification
   * (e.g. "certificate-intro-to-stellar-2026-08-26.pdf").
   *
   * Authentication is required so only the certificate owner (or an admin)
   * can download it.
   */
  @Get(':id/download')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Header('Content-Type', 'application/pdf')
  @ApiOperation({
    summary: 'Download a certificate PDF (issue #874)',
    description:
      'Streams the certificate as a PDF attachment. The filename embeds the course ' +
      'title slug and the issue date so downloads are self-describing.',
  })
  @ApiParam({ name: 'id', description: 'UUID of the certificate to download' })
  @ApiResponse({ status: 200, description: 'PDF attachment with course/date in filename' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — you do not own this certificate' })
  @ApiResponse({ status: 404, description: 'Certificate not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async downloadCertificate(
    @Param('id') id: string,
    @Request() req: { user: { id: string; role: string } },
  ): Promise<StreamableFile> {
    const certificate = await this.certificatesService.getCertificateWithRelations(id);

    // Only the certificate owner or an admin may download
    if (certificate.userId !== req.user.id && req.user.role !== 'admin') {
      throw new ForbiddenException('You are not authorised to download this certificate');
    }

    const baseUrl = this.configService.get<string>('frontend.url') ?? 'http://localhost:3000';
    const pdf = await this.certificatePdfService.generateCertificatePdf(certificate, baseUrl);

    // Build a descriptive filename: certificate-<course-slug>-<YYYY-MM-DD>.pdf
    const courseTitle = certificate.course?.title ?? 'course';
    const courseSlug = courseTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60);
    const issuedDate = certificate.issuedAt.toISOString().slice(0, 10); // YYYY-MM-DD
    const filename = `certificate-${courseSlug}-${issuedDate}.pdf`;

    return new StreamableFile(pdf, {
      disposition: `attachment; filename="${filename}"`,
      type: 'application/pdf',
    });
  }
}
