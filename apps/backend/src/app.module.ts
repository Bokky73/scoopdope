import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';

// ── Entities ────────────────────────────────────────────────────────────────────

import { User } from './users/user.entity';
import { Course } from './courses/course.entity';
import { Enrollment } from './enrollments/enrollment.entity';
import { Certificate } from './certificates/certificate.entity';
import { Bundle } from './bundles/bundle.entity';
import { BundleCourse } from './bundles/bundle-course.entity';

// ── Modules ─────────────────────────────────────────────────────────────────────

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CoursesModule } from './courses/courses.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { CertificatesModule } from './certificates/certificates.module';
import { ApiVersionModule } from './common/versioning';
import { PayoutsModule } from './payouts/payouts.module';
import { InstructorApplicationsModule } from './instructor-applications/instructor-applications.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { StreaksModule } from './streaks/streaks.module';
import { StudySessionsModule } from './study-sessions/study-sessions.module';
import { BundlesModule } from './bundles/bundles.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { LiveSessionsModule } from './live-sessions/live-sessions.module';
import { PaymentsModule } from './payments/payments.module';
import { RewardsModule } from './rewards/rewards.module';
import * as redisStore from 'cache-manager-redis-store';
import configuration from './config/configuration';
import { validationSchema } from './config/validation.schema';

import { RateLimitModule } from './rate-limit/rate-limit.module';
import { UserRateLimitGuard } from './rate-limit/user-rate-limit.guard';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: [User, Course, Enrollment, Certificate, Bundle, BundleCourse],
        synchronize: configService.get('environment') !== 'production',
        logging: configService.get('environment') !== 'production',
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    CoursesModule,
    EnrollmentsModule,
    CertificatesModule,
    PayoutsModule,
    InstructorApplicationsModule,
    HealthModule,
    MetricsModule,
    KycModule,
    RecommendationsModule,
    EmailModule,
    AnalyticsModule,
    WebhooksModule,
    ModerationModule,
    ImportExportModule,
    SearchModule,
    BatchModule,
    ApiUsageModule,
    QuizzesModule,
    CohortsModule,
    CdnModule,
    AccessControlModule,
    RateLimitModule,
    AuditModule,
    DownloadsModule,
    QaModule,
    AnnouncementsModule,
    AssignmentsModule,
    StreaksModule,
    StudySessionsModule,
    BundlesModule,
    SubscriptionsModule,
    LiveSessionsModule,
    PaymentsModule,
    RewardsModule,
    RateLimitModule,
    ApiVersionModule,
    MonitoringModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: GlobalErrorInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: UserRateLimitGuard,
    },
  ],
})
export class AppModule {}