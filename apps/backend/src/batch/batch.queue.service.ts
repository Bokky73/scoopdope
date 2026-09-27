import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Queue, Worker, Job } from 'bullmq';
import { BatchService, BatchPayloadItem } from './batch.service';

@Injectable()
export class BatchQueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BatchQueueService.name);
  public queue: Queue;
  public dlq: Queue;
  private worker: Worker;

  constructor(
    private readonly batchService: BatchService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const redisUrl = this.configService.get<string>('redis.url');
    const maxRetries = this.configService.get<number>('batch.maxRetries');

    this.queue = new Queue('batch', {
      connection: { url: redisUrl },
      defaultJobOptions: {
        attempts: maxRetries,
        removeOnFail: false,
        removeOnComplete: { age: 24 * 60 * 60 },
        backoff: { type: 'exponential', delay: 1000 },
      },
    });

    this.dlq = new Queue('batch-dlq', {
      connection: { url: redisUrl },
      defaultJobOptions: {
        removeOnFail: false,
        removeOnComplete: false,
      },
    });

    this.worker = new Worker(
      'batch',
      async (job: Job) => {
        const batchJobId = job.data.batchJobId as string;
        if (!batchJobId) {
          throw new Error('Missing batchJobId');
        }

        if (job.name === 'users') {
          await this.batchService.processUserBatch(batchJobId);
        } else if (job.name === 'courses') {
          await this.batchService.processCourseBatch(batchJobId);
        } else {
          throw new Error(`Unsupported batch job type: ${job.name}`);
        }
      },
      {
        connection: { url: redisUrl },
      },
    );

    this.worker.on('failed', async (job, error) => {
      if (!job) return;
      const maxAttempts = job.opts.attempts ?? maxRetries ?? 1;
      const isTerminalFailure = (job.attemptsMade ?? 0) >= maxAttempts;
      const failedReason = error?.message || 'Unknown batch failure';

      if (isTerminalFailure) {
        try {
          await this.moveToDlq(job, failedReason);
          await this.sendAlert(job, failedReason);
          await this.batchService.markJobFailed(job.data.batchJobId, failedReason);
        } catch (err: any) {
          this.logger.error('Failed handling terminal batch failure', err?.stack || err);
        }
      }
    });
  }

  async onModuleInit(): Promise<void> {
    await Promise.all([
      this.queue.waitUntilReady(),
      this.dlq.waitUntilReady(),
      this.worker.waitUntilReady(),
    ]);
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all([
      this.worker.close(),
      this.queue.close(),
      this.dlq.close(),
    ]);
  }

  async createUserBatch(payload: BatchPayloadItem[], createdById: string) {
    const batchJob = await this.batchService.createUserBatch(payload, createdById);
    await this.queue.add('users', { batchJobId: batchJob.id });
    return batchJob;
  }

  async createCourseBatch(payload: BatchPayloadItem[], createdById: string) {
    const batchJob = await this.batchService.createCourseBatch(payload, createdById);
    await this.queue.add('courses', { batchJobId: batchJob.id });
    return batchJob;
  }

  private async moveToDlq(job: Job, failedReason: string) {
    await this.dlq.add(`${job.name}-failed`, {
      batchJobId: job.data.batchJobId,
      originalJobId: job.id,
      data: job.data,
      failedReason,
    });
  }

  private async sendAlert(job: Job, failedReason: string) {
    const slackUrl = this.configService.get<string>('batch.alertSlackWebhookUrl');
    const pagerDutyKey = this.configService.get<string>('batch.alertPagerDutyRoutingKey');
    const summary = `Batch job failed permanently: type=${job.name} jobId=${job.data.batchJobId} reason=${failedReason}`;

    if (slackUrl) {
      await this.sendSlackAlert(slackUrl, summary);
    }

    if (pagerDutyKey) {
      await this.sendPagerDutyAlert(pagerDutyKey, summary);
    }

    if (!slackUrl && !pagerDutyKey) {
      this.logger.warn('No batch alert destination configured. Terminal failure not alerted.', {
        batchJobId: job.data.batchJobId,
        reason: failedReason,
      });
    }
  }

  private async sendSlackAlert(webhookUrl: string, text: string) {
    try {
      await firstValueFrom(this.httpService.post(webhookUrl, { text }));
    } catch (error: any) {
      this.logger.error('Slack alert failed', error?.response?.data || error?.message || error);
    }
  }

  private async sendPagerDutyAlert(routingKey: string, summary: string) {
    try {
      await firstValueFrom(
        this.httpService.post('https://events.pagerduty.com/v2/enqueue', {
          routing_key: routingKey,
          event_action: 'trigger',
          payload: {
            summary,
            severity: 'error',
            source: 'scoopdope.batch',
            timestamp: new Date().toISOString(),
          },
        }),
      );
    } catch (error: any) {
      this.logger.error('PagerDuty alert failed', error?.response?.data || error?.message || error);
    }
  }
}
