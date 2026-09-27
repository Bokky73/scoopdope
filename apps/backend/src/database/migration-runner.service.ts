import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface MigrationStatus {
  id: number;
  timestamp: number;
  name: string;
  executedAt?: Date;
}

export interface MigrationResult {
  success: boolean;
  migrations: MigrationStatus[];
  executed: string[];
  durationMs: number;
}

@Injectable()
export class MigrationRunnerService {
  private readonly logger = new Logger(MigrationRunnerService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async run(): Promise<MigrationResult> {
    const start = Date.now();
    this.logger.log('Running pending migrations...');

    if (!this.dataSource.isInitialized) {
      throw new Error('DataSource is not initialized');
    }

    const executed = await this.dataSource.runMigrations();
    const durationMs = Date.now() - start;

    this.logger.log(
      `Ran ${executed.length} migration(s) in ${durationMs}ms`,
    );

    const allMigrations = await this.getStatus();

    return {
      success: executed.length > 0,
      migrations: allMigrations,
      executed: executed.map((m) => m.name),
      durationMs,
    };
  }

  async revert(): Promise<MigrationResult> {
    const start = Date.now();
    this.logger.log('Reverting last migration...');

    if (!this.dataSource.isInitialized) {
      throw new Error('DataSource is not initialized');
    }

    const before = await this.getStatus();
    const executedBefore = before.filter((m) => m.executedAt).length;

    await this.dataSource.undoLastMigration();

    const after = await this.getStatus();
    const executedAfter = after.filter((m) => m.executedAt).length;
    const durationMs = Date.now() - start;

    const revertedCount = executedBefore - executedAfter;

    this.logger.log(
      `Reverted ${revertedCount} migration(s) in ${durationMs}ms`,
    );

    return {
      success: revertedCount > 0,
      migrations: after,
      executed: [],
      durationMs,
    };
  }

  async getStatus(): Promise<MigrationStatus[]> {
    if (!this.dataSource.isInitialized) {
      return [];
    }

    const executedMigrations = await this.dataSource.query(
      `SELECT id, name, "timestamp", "executedAt" FROM "${this.dataSource.options.migrationsTableName || 'migrations'}" ORDER BY "timestamp" ASC`,
    );

    const pendingMigrations =
      this.dataSource.migrations.filter(
        (m) =>
          !executedMigrations.some(
            (em: any) => em.name === m.name,
          ),
      );

    const all: MigrationStatus[] = [
      ...executedMigrations.map((em: any) => ({
        id: em.id,
        timestamp: em.timestamp,
        name: em.name,
        executedAt: em.executedAt ? new Date(em.executedAt) : undefined,
        status: 'executed' as const,
      })),
      ...pendingMigrations.map((pm) => ({
        id: -1,
        timestamp: this.extractTimestamp(pm.name ?? ''),
        name: pm.name ?? 'unknown',
        status: 'pending' as const,
      })),
    ];

    const seen = new Set<string>();
    const deduped = all.filter((m) => {
      if (seen.has(m.name)) return false;
      seen.add(m.name);
      return true;
    });

    deduped.sort((a, b) => a.timestamp - b.timestamp);

    return deduped;
  }

  private extractTimestamp(name: string): number {
    const match = name.match(/(\d{13})/);
    return match ? parseInt(match[1], 10) : 0;
  }
}
