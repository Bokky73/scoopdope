import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, LessThanOrEqual } from 'typeorm';
import * as webpush from 'web-push';
import { PushSubscription } from './push-subscription.entity';
import {
  PushNotificationQueue,
  PushQueueStatus,
} from './push-notification-queue.entity';

/** Maximum delivery attempts before marking a job as permanently failed. */
const MAX_ATTEMPTS = 4;

/**
 * Exponential-backoff retry delays (in seconds) indexed by attempt number.
 * Attempt 1 → 60 s, attempt 2 → 300 s, attempt 3 → 900 s (15 min).
 */
const RETRY_DELAYS_SECONDS = [60, 300, 900];

/** How often the background worker polls for due jobs (ms). */
const POLL_INTERVAL_MS = 30_000;

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
}

@Injectable()
export class PushNotificationsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PushNotificationsService.name);
  private vapidConfigured = false;
  private pollTimer: NodeJS.Timeout | null = null;

  constructor(
    private configService: ConfigService,
    @InjectRepository(PushSubscription)
    private pushSubscriptionRepo: Repository<PushSubscription>,
    @InjectRepository(PushNotificationQueue)
    private queueRepo: Repository<PushNotificationQueue>,
  ) {
    const publicKey = this.configService.get<string>('vapid.publicKey');
    const privateKey = this.configService.get<string>('vapid.privateKey');
    const subject =
      this.configService.get<string>('vapid.subject') ||
      'mailto:admin@scoopdope.com';

    if (publicKey && privateKey) {
      webpush.setVapidDetails(subject, publicKey, privateKey);
      this.vapidConfigured = true;
    } else {
      this.logger.warn(
        'VAPID keys are not configured. Push notifications will not work. ' +
          'Generate them with: node -e "const wp=require(\'web-push\'); console.log(JSON.stringify(wp.generateVAPIDKeys()))"',
      );
    }
  }

  onModuleInit() {
    // Kick off an initial sweep on startup (picks up any jobs left from last run)
    this.processQueue().catch((err) =>
      this.logger.error('Initial push queue sweep failed', err),
    );
    // Schedule recurring sweeps
    this.pollTimer = setInterval(
      () =>
        this.processQueue().catch((err) =>
          this.logger.error('Push queue sweep failed', err),
        ),
      POLL_INTERVAL_MS,
    );
  }

  onModuleDestroy() {
    if (this.pollTimer) clearInterval(this.pollTimer);
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  async subscribe(userId: string, subscription: any) {
    let sub = await this.pushSubscriptionRepo.findOne({
      where: { userId, endpoint: subscription.endpoint },
    });

    if (!sub) {
      sub = this.pushSubscriptionRepo.create({
        userId,
        endpoint: subscription.endpoint,
        expirationTime: subscription.expirationTime,
        keys: subscription.keys,
      });
    } else {
      sub.expirationTime = subscription.expirationTime;
      sub.keys = subscription.keys;
    }

    return this.pushSubscriptionRepo.save(sub);
  }

  async unsubscribe(userId: string, endpoint: string) {
    return this.pushSubscriptionRepo.delete({ userId, endpoint });
  }

  /**
   * Enqueue a push notification for all active subscriptions of a user.
   * The initial delivery attempt happens immediately; failures are retried
   * with exponential backoff up to MAX_ATTEMPTS.
   */
  async sendNotification(userId: string, payload: PushPayload): Promise<void> {
    if (!this.vapidConfigured) {
      this.logger.warn(
        `Skipping push notification for user ${userId}: VAPID not configured.`,
      );
      return;
    }

    const subscriptions = await this.pushSubscriptionRepo.find({
      where: { userId },
    });

    if (subscriptions.length === 0) return;

    // Enqueue one job per subscription and attempt immediate delivery
    await Promise.all(
      subscriptions.map((sub) =>
        this.enqueueAndDeliver(userId, sub, payload),
      ),
    );
  }

  // ─── Internal helpers ───────────────────────────────────────────────────────

  private async enqueueAndDeliver(
    userId: string,
    sub: PushSubscription,
    payload: PushPayload,
  ): Promise<void> {
    const job = this.queueRepo.create({
      userId,
      endpoint: sub.endpoint,
      payload: JSON.stringify(payload),
      status: PushQueueStatus.PENDING,
      attempts: 0,
      nextRetryAt: null,
    });
    const saved = await this.queueRepo.save(job);
    await this.deliverJob(saved, sub);
  }

  /**
   * Attempt to deliver a single queued job.
   * On failure, schedules the next retry or marks the job as permanently failed.
   */
  private async deliverJob(
    job: PushNotificationQueue,
    sub?: PushSubscription,
  ): Promise<void> {
    // Resolve the subscription record if not provided
    if (!sub) {
      const found = await this.pushSubscriptionRepo.findOne({
        where: { userId: job.userId, endpoint: job.endpoint },
      });
      if (!found) {
        // Subscription no longer exists — cancel the job
        await this.queueRepo.update(job.id, {
          status: PushQueueStatus.FAILED,
          lastError: 'Subscription record not found',
        });
        return;
      }
      sub = found;
    }

    job.attempts += 1;

    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys },
        job.payload,
      );

      await this.queueRepo.update(job.id, {
        status: PushQueueStatus.SENT,
        attempts: job.attempts,
        nextRetryAt: null,
        lastError: null,
      });

      this.logger.debug(
        `Push delivered to user ${job.userId} (attempt ${job.attempts})`,
      );
    } catch (error: unknown) {
      const statusCode =
        error instanceof Error && 'statusCode' in error
          ? Number((error as any).statusCode)
          : undefined;

      // Expired or unregistered endpoints — remove the subscription and cancel the job
      if (statusCode === 410 || statusCode === 404) {
        this.logger.log(
          `Removing expired push subscription for user ${job.userId}: ${sub.endpoint}`,
        );
        await this.pushSubscriptionRepo.remove(sub);
        await this.queueRepo.update(job.id, {
          status: PushQueueStatus.FAILED,
          attempts: job.attempts,
          lastError: `Subscription expired (HTTP ${statusCode})`,
          nextRetryAt: null,
        });
        return;
      }

      const message =
        error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Push delivery failed for user ${job.userId} (attempt ${job.attempts}/${MAX_ATTEMPTS}): ${message}`,
      );

      if (job.attempts >= MAX_ATTEMPTS) {
        // Permanently failed — stop retrying
        await this.queueRepo.update(job.id, {
          status: PushQueueStatus.FAILED,
          attempts: job.attempts,
          lastError: message,
          nextRetryAt: null,
        });
        this.logger.error(
          `Push notification permanently failed for user ${job.userId} after ${job.attempts} attempts.`,
        );
      } else {
        // Schedule next retry with exponential backoff
        const delaySeconds =
          RETRY_DELAYS_SECONDS[job.attempts - 1] ??
          RETRY_DELAYS_SECONDS[RETRY_DELAYS_SECONDS.length - 1];
        const nextRetryAt = new Date(Date.now() + delaySeconds * 1_000);

        await this.queueRepo.update(job.id, {
          status: PushQueueStatus.PENDING,
          attempts: job.attempts,
          lastError: message,
          nextRetryAt,
        });

        this.logger.debug(
          `Push retry scheduled for user ${job.userId} in ${delaySeconds}s (attempt ${job.attempts + 1}/${MAX_ATTEMPTS})`,
        );
      }
    }
  }

  /**
   * Background worker: fetch all PENDING jobs whose nextRetryAt is due
   * and attempt re-delivery.
   */
  async processQueue(): Promise<void> {
    const now = new Date();

    // Jobs due for delivery: either fresh (nextRetryAt IS NULL) or retry window elapsed
    const due = await this.queueRepo.find({
      where: [
        { status: PushQueueStatus.PENDING, nextRetryAt: IsNull() },
        { status: PushQueueStatus.PENDING, nextRetryAt: LessThanOrEqual(now) },
      ],
      order: { createdAt: 'ASC' },
      take: 100,
    });

    if (due.length === 0) return;

    this.logger.debug(`Processing ${due.length} pending push notification(s)`);

    await Promise.all(due.map((job) => this.deliverJob(job)));
  }
}
