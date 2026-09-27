import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LessThan, Repository } from 'typeorm';
import { AuditLog, AuditAction } from './audit-log.entity';
import { CustomLoggerService } from '../common/logger/logger.service';
import { DistributedLockService } from '../common/distributed-lock.service';

const RETENTION_DAYS = 90;

export interface AuditLogOptions {
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  resourceType?: string;
  resourceId?: string;
  changes?: Record<string, { from: unknown; to: unknown }>;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
    private logger: CustomLoggerService,
    private readonly distributedLockService: DistributedLockService,
  ) {
    this.logger.setContext('AuditService');
  }

  /**
   * Write an audit log entry.
   *
   * Supports both the legacy positional signature and a new options-object
   * overload so existing callers don't need to be updated.
   */
  async log(
    action: AuditAction | string,
    userId: string | null,
    success: boolean,
    metadataOrOptions?: Record<string, any> | AuditLogOptions,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    let metadata: Record<string, any> | undefined;
    let resourceType: string | undefined;
    let resourceId: string | undefined;
    let changes: Record<string, { from: unknown; to: unknown }> | undefined;

    // Detect if the 4th argument is an AuditLogOptions object (has known keys)
    if (
      metadataOrOptions &&
      ('resourceType' in metadataOrOptions ||
        'resourceId' in metadataOrOptions ||
        'changes' in metadataOrOptions ||
        'ipAddress' in metadataOrOptions ||
        'userAgent' in metadataOrOptions)
    ) {
      const opts = metadataOrOptions as AuditLogOptions;
      metadata = opts.metadata;
      resourceType = opts.resourceType;
      resourceId = opts.resourceId;
      changes = opts.changes;
      ipAddress = opts.ipAddress ?? ipAddress;
      userAgent = opts.userAgent ?? userAgent;
    } else {
      metadata = metadataOrOptions as Record<string, any> | undefined;
    }

    try {
      await this.auditRepo.save({
        action,
        userId,
        success,
        metadata: metadata ?? null,
        ipAddress: ipAddress ?? null,
        userAgent: userAgent ?? null,
        resourceType: resourceType ?? null,
        resourceId: resourceId ?? null,
        changes: changes ?? null,
      });
      this.logger.info(`Audit: ${action}`, { userId, success, metadata } as any);
    } catch (err) {
      this.logger.error('Failed to write audit log', err as any);
    }
  }

  async getLogs(filters: {
    userId?: string;
    action?: string;
    resourceType?: string;
    resourceId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(100, Math.max(1, filters.limit ?? 50));

    const qb = this.auditRepo.createQueryBuilder('log');

    if (filters.userId) qb.andWhere('log.userId = :userId', { userId: filters.userId });
    if (filters.action) qb.andWhere('log.action = :action', { action: filters.action });
    if (filters.resourceType) qb.andWhere('log.resourceType = :resourceType', { resourceType: filters.resourceType });
    if (filters.resourceId) qb.andWhere('log.resourceId = :resourceId', { resourceId: filters.resourceId });
    if (filters.startDate) qb.andWhere('log.createdAt >= :start', { start: filters.startDate });
    if (filters.endDate) qb.andWhere('log.createdAt <= :end', { end: filters.endDate });

    qb.orderBy('log.createdAt', 'DESC');

    const total = await qb.clone().getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async purgeOldLogs(): Promise<void> {
    const lockKey = 'lock:cron:audit:purgeOldLogs';
    const result = await this.distributedLockService.withLock(lockKey, async () => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
      const { affected } = await this.auditRepo.delete({ createdAt: LessThan(cutoff) });
      this.logger.info(`Audit retention: purged ${affected ?? 0} logs older than ${RETENTION_DAYS} days`);
    }, 60);

    if (result === null) {
      this.logger.debug('Skipping audit retention purge because another instance holds the lock');
    }
  }
}
