import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import * as crypto from 'crypto';

@Injectable()
export class DistributedLockService implements OnModuleDestroy {
  private client?: Redis;

  constructor(private readonly configService: ConfigService) {}

  private getClient(): Redis {
    if (!this.client) {
      const redisUrl = this.configService.get<string>('redis.url');
      if (!redisUrl) {
        throw new Error('DistributedLockService requires redis.url configuration');
      }
      this.client = new Redis(redisUrl);
    }
    return this.client;
  }

  async acquireLock(lockKey: string, ttlSeconds = 60): Promise<string | null> {
    const client = this.getClient();
    const lockValue = crypto.randomBytes(16).toString('hex');
    const result = await client.set(lockKey, lockValue, 'EX', ttlSeconds, 'NX');
    return result === 'OK' ? lockValue : null;
  }

  async releaseLock(lockKey: string, lockValue: string): Promise<void> {
    const client = this.getClient();
    const releaseScript = `
      if redis.call('get', KEYS[1]) == ARGV[1] then
        return redis.call('del', KEYS[1])
      end
      return 0
    `;
    try {
      await client.eval(releaseScript, 1, lockKey, lockValue);
    } catch {
      // Best-effort cleanup. Do not fail cron execution because the lock release failed.
    }
  }

  async withLock<T>(lockKey: string, callback: () => Promise<T>, ttlSeconds = 60): Promise<T | null> {
    const lockValue = await this.acquireLock(lockKey, ttlSeconds);
    if (!lockValue) {
      return null;
    }

    try {
      return await callback();
    } finally {
      await this.releaseLock(lockKey, lockValue);
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.quit();
    }
  }
}
