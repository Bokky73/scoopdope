import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { BatchJob, BatchJobType } from './batch-job.entity';
import { UsersService } from '../users/users.service';
import { CoursesService } from '../courses/courses.service';

export interface BatchPayloadItem {
  action: string;
  userId?: string;
  courseId?: string;
  role?: string;
  [key: string]: unknown;
}

interface BatchResultEntry {
  id: string;
}

const CHUNK_SIZE = 5;
const STUCK_TIMEOUT_MS = 30 * 60 * 1000;

@Injectable()
export class BatchService implements OnModuleInit {
  private readonly logger = new Logger(BatchService.name);

  constructor(
    @InjectRepository(BatchJob) private jobRepo: Repository<BatchJob>,
    private usersService: UsersService,
    private coursesService: CoursesService,
  ) {}

  async onModuleInit() {
    await this.recoverStuckJobs();
  }

  private async recoverStuckJobs(): Promise<void> {
    const cutoff = new Date(Date.now() - STUCK_TIMEOUT_MS);
    const stuck = await this.jobRepo.find({
      where: { status: 'processing', startedAt: LessThan(cutoff) },
    });
    for (const job of stuck) {
      this.logger.warn(`Recovering stuck batch job ${job.id} (type=${job.type})`);
      await this.jobRepo.update(job.id, {
        status: 'pending',
        startedAt: null,
      });
    }
  }

  async createUserBatch(payload: BatchPayloadItem[], createdById: string): Promise<BatchJob> {
    const job = await this.jobRepo.save(
      this.jobRepo.create({ type: 'users', payload, totalItems: payload.length, createdById }),
    );
    setImmediate(() => this.processUserBatch(job.id));
    return job;
  }

  async createCourseBatch(payload: BatchPayloadItem[], createdById: string): Promise<BatchJob> {
    const job = await this.jobRepo.save(
      this.jobRepo.create({ type: 'courses', payload, totalItems: payload.length, createdById }),
    );
    setImmediate(() => this.processCourseBatch(job.id));
    return job;
  }

  async getJobStatus(jobId: string): Promise<BatchJob> {
    const job = await this.jobRepo.findOne({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Batch job not found');
    return job;
  }

  async listJobs(type?: string): Promise<BatchJob[]> {
    const where = type ? { type: type as BatchJobType } : undefined;
    return this.jobRepo.find({ where, order: { createdAt: 'DESC' }, take: 100 });
  }

  async markJobFailed(jobId: string, failedReason: string): Promise<void> {
    await this.jobRepo.update(jobId, {
      status: 'failed',
      errors: [{ error: failedReason }],
    });
  }

  async processUserBatch(jobId: string): Promise<void> {
    const job = await this.jobRepo.findOne({ where: { id: jobId } });
    if (!job) return;

    await this.jobRepo.update(jobId, { status: 'processing', startedAt: new Date() });

    const results: Array<Record<string, unknown>> = [];
    const errors: Array<Record<string, unknown>> = [];
    let index = 0;

    const processChunk = async (): Promise<void> => {
      const chunkLimit = Math.min(index + CHUNK_SIZE, job.payload.length);

      for (; index < chunkLimit; index++) {
        const item = job.payload[index];
        try {
          const { action, userId, ...data } = item as BatchPayloadItem;
          let result: BatchResultEntry;

          if (action === 'update' && userId) {
            result = await this.usersService.update(userId, data as Record<string, unknown>);
          } else if (action === 'ban' && userId) {
            result = await this.usersService.banUser(userId, true);
          } else if (action === 'unban' && userId) {
            result = await this.usersService.banUser(userId, false);
          } else if (action === 'changeRole' && userId) {
            result = await this.usersService.changeRole(userId, (data.role as string) ?? '');
          } else if (action === 'delete' && userId) {
            result = await this.usersService.softDelete(userId);
          } else {
            throw new Error(`Unknown action: ${action}`);
          }

          results.push({ userId, action, success: true, result: { id: result.id } });
        } catch (err: unknown) {
          errors.push({ item, error: err instanceof Error ? err.message : 'Unknown error' });
        }
      }

      await this.jobRepo.update(jobId, {
        processedItems: results.length,
        failedItems: errors.length,
      } as any);

      if (index < job.payload.length) {
        await new Promise<void>((resolve) => setImmediate(resolve));
        await processChunk();
      } else {
        await this.jobRepo.update(jobId, {
          status: errors.length === job.totalItems ? 'failed' : 'completed',
          results: results as BatchJob['results'],
          errors: errors as BatchJob['errors'],
          processedItems: results.length,
          failedItems: errors.length,
          startedAt: null,
        } as any);
      }
    };

    await processChunk();
  }

  async processCourseBatch(jobId: string): Promise<void> {
    const job = await this.jobRepo.findOne({ where: { id: jobId } });
    if (!job) return;

    await this.jobRepo.update(jobId, { status: 'processing', startedAt: new Date() });

    const results: Array<Record<string, unknown>> = [];
    const errors: Array<Record<string, unknown>> = [];
    let index = 0;

    const processChunk = async (): Promise<void> => {
      const chunkLimit = Math.min(index + CHUNK_SIZE, job.payload.length);

      for (; index < chunkLimit; index++) {
        const item = job.payload[index];
        try {
          const { action, courseId, ...data } = item as BatchPayloadItem;
          let result: BatchResultEntry;

          if (action === 'update' && courseId) {
            result = await this.coursesService.update(courseId, data as Record<string, unknown>);
          } else if (action === 'delete' && courseId) {
            result = await this.coursesService.delete(courseId);
          } else if (action === 'create') {
            result = await this.coursesService.create(data as Record<string, unknown>);
          } else {
            throw new Error(`Unknown action: ${action}`);
          }

          results.push({ courseId: result.id, action, success: true });
        } catch (err: unknown) {
          errors.push({ item, error: err instanceof Error ? err.message : 'Unknown error' });
        }
      }

      await this.jobRepo.update(jobId, {
        processedItems: results.length,
        failedItems: errors.length,
      } as any);

      if (index < job.payload.length) {
        await new Promise<void>((resolve) => setImmediate(resolve));
        await processChunk();
      } else {
        await this.jobRepo.update(jobId, {
          status: errors.length === job.totalItems ? 'failed' : 'completed',
          results: results as BatchJob['results'],
          errors: errors as BatchJob['errors'],
          processedItems: results.length,
          failedItems: errors.length,
          startedAt: null,
        } as any);
      }
    };

    await processChunk();
  }
}
