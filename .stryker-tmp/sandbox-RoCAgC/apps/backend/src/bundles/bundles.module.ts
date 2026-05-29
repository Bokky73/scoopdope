// @ts-nocheck
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bundle } from './bundle.entity';
import { BundleEnrollment } from './bundle-enrollment.entity';
import { Course } from '../courses/course.entity';
import { BundlesService } from './bundles.service';
import { BundlesController, AdminBundlesController } from './bundles.controller';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { StellarModule } from '../stellar/stellar.module';
import { CredentialsModule } from '../credentials/credentials.module';
import { UsersModule } from '../users/users.module';
@Module({
  imports: [TypeOrmModule.forFeature([Bundle, BundleEnrollment, Course]), EnrollmentsModule, StellarModule, CredentialsModule, UsersModule],
  providers: [BundlesService],
  controllers: [BundlesController, AdminBundlesController],
  exports: [BundlesService]
})
export class BundlesModule {}