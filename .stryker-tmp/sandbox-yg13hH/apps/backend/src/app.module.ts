import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { SentryModule } from '@sentry/nestjs/setup';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { CoursesModule } from './courses/courses.module';
import { UsersModule } from './users/users.module';
import { StellarModule } from './stellar/stellar.module';
import { ProgressModule } from './progress/progress.module';
import { CredentialsModule } from './credentials/credentials.module';
import { NotificationsModule } from './notifications/notifications.module';
import { LoggerModule } from './common/logger'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';
import { KycModule } from './kyc/kyc.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { ForumsModule } from './forums/forums.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { EmailModule } from './email/email.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { ModerationModule } from './moderation/moderation.module';
import { ImportExportModule } from './import-export/import-export.module';
import { SearchModule } from './search/search.module';
import { BatchModule } from './batch/batch.module';
import { ApiUsageModule } from './api-usage/api-usage.module';
import { ApiUsageInterceptor } from './api-usage/api-usage.interceptor';
import { QuizzesModule } from './quizzes/quizzes.module';
import { CohortsModule } from './cohorts/cohorts.module';
import { CdnModule } from './cdn/cdn.module';
import { AccessControlModule } from './access-control/access-control.module';
import { RateLimitModule } from './rate-limit/rate-limit.module';
import { UserRateLimitGuard } from './rate-limit/user-rate-limit.guard';
import { AuditModule } from './audit/audit.module';
import { RemindersModule } from './reminders/reminders.module';
import { CertificatesModule } from './certificates/certificates.module';
import { PayoutsModule } from './payouts/payouts.module';
import { InstructorApplicationsModule } from './instructor-applications/instructor-applications.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { StreaksModule } from './streaks/streaks.module';
import { BundlesModule } from './bundles/bundles.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { LiveSessionsModule } from './live-sessions/live-sessions.module';
import { PaymentsModule } from './payments/payments.module';
import * as redisStore from 'cache-manager-redis-store';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import configuration from './config/configuration';
import { validationSchema } from './config/validation.schema';
@Module({
  imports: [SentryModule.forRoot(), EventEmitterModule.forRoot(), ScheduleModule.forRoot(), ConfigModule.forRoot({
    isGlobal: true,
    load: [configuration],
    validationSchema,
    validationOptions: {
      abortEarly: false
    }
  }), TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      type: 'postgres',
      host: config.get<string>('database.host'),
      port: config.get<number>('database.port'),
      username: config.get<string>('database.username'),
      password: config.get<string>('database.password'),
      database: config.get<string>('database.name'),
      autoLoadEntities: true,
      synchronize: config.get<string>('nodeEnv') !== 'production'
    })
  }), CacheModule.registerAsync({
    isGlobal: true,
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      store: redisStore,
      url: config.get<string>('redis.url'),
      ttl: 60
    })
  }), ThrottlerModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      throttlers: [{
        ttl: config.get<number>('throttle.ttl') || 60000,
        limit: config.get<number>('throttle.limit') || 100
      }],
      storage: new ThrottlerStorageRedisService(config.get<string>('redis.url') || 'redis://localhost:6379')
    })
  }), AuthModule, CoursesModule, UsersModule, StellarModule, ProgressModule, CredentialsModule, LeaderboardModule, ForumsModule, NotificationsModule, RemindersModule, CertificatesModule, PayoutsModule, InstructorApplicationsModule, HealthModule, MetricsModule, KycModule, RecommendationsModule, EmailModule, AnalyticsModule, WebhooksModule, ModerationModule, ImportExportModule, SearchModule, BatchModule, ApiUsageModule, QuizzesModule, CohortsModule, CdnModule, AccessControlModule, RateLimitModule, AuditModule, DownloadsModule, QaModule, AnnouncementsModule, AssignmentsModule, StreaksModule, BundlesModule, SubscriptionsModule, LiveSessionsModule, PaymentsModule],
  providers: [{
    provide: APP_GUARD,
    useClass: ThrottlerGuard
  }, {
    provide: APP_GUARD,
    useClass: UserRateLimitGuard
  }, {
    provide: APP_INTERCEPTOR,
    useClass: ApiUsageInterceptor
  }]
})
export class AppModule {}