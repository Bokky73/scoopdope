// @ts-nocheck
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';
import { CertificatePdfService } from './certificate-pdf.service';
import { Certificate } from './certificate.entity';
import { Enrollment } from '../enrollments/enrollment.entity';
import { StellarModule } from '../stellar/stellar.module';
@Module({
  imports: [TypeOrmModule.forFeature([Certificate, Enrollment]), StellarModule, ConfigModule],
  providers: [CertificatesService, CertificatePdfService],
  controllers: [CertificatesController],
  exports: [CertificatesService]
})
export class CertificatesModule {}