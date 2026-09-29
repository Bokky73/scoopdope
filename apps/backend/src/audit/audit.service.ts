import { Injectable, Logger } from '@nestjs/common';

export type AuditAction = 'create' | 'update' | 'delete';

export interface AuditEntry {
  id: string;
  actor: string;
  action: AuditAction;
  resource: string;
  resourceId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private readonly entries: AuditEntry[] = [];

  record(
    actor: string,
    action: AuditAction,
    resource: string,
    resourceId: string,
    metadata?: Record<string, unknown>,
  ): AuditEntry {
    const entry: AuditEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      actor,
      action,
      resource,
      resourceId,
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.entries.push(entry);
    this.logger.log(
      `audit: ${entry.actor} ${entry.action} ${entry.resource}#${entry.resourceId}`,
    );

    return entry;
  }

  findAll(): AuditEntry[] {
    return [...this.entries];
  }

  findByResource(resource: string, resourceId?: string): AuditEntry[] {
    return this.entries.filter(
      (entry) =>
        entry.resource === resource &&
        (resourceId === undefined || entry.resourceId === resourceId),
    );
  }
}
