import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';
import { CertificatePdfService } from './certificate-pdf.service';
import { Certificate } from './certificate.entity';
import { Enrollment } from '../enrollments/enrollment.entity';
import { Progress } from '../progress/progress.entity';
import { CourseModule } from '../courses/course-module.entity';
import { Lesson } from '../courses/lesson.entity';
import { StellarModule } from '../stellar/stellar.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Certificate, Enrollment, Progress, CourseModule, Lesson]),
    StellarModule,
  ],
  providers: [CertificatesService, CertificatePdfService],
  controllers: [CertificatesController],
  exports: [CertificatesService],
})
export class CertificatesModule {}
