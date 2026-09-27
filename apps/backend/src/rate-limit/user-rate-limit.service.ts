import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RateLimitConfig, UserRateLimitRole, DEFAULT_RATE_LIMITS } from './rate-limit.constants';

@Injectable()
export class UserRateLimitService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  private async getEntry(key: string, windowMs: number) {
    const cached = await this.cacheManager.get<
      number | { count: number; resetAt: number }
    >(key);
    const now = Date.now();

    if (cached && typeof cached === 'object' && cached.resetAt > now) {
      return cached;
    }

    const count = typeof cached === 'number' ? cached : 0;
    return { count, resetAt: now + windowMs };
  }

  private roleKey(userId: string, ip: string): string {
    return `rate-limit:${userId || ip}`;
  }

  async checkRateLimit(
    userId: string | null,
    ip: string,
    role: UserRateLimitRole,
    overrideConfig?: Partial<RateLimitConfig>,
  ): Promise<boolean> {
    const config = { ...DEFAULT_RATE_LIMITS[role], ...overrideConfig };
    const key = this.roleKey(userId || ip, ip);

    const entry = await this.getEntry(key, config.windowMs);
    const count = entry.count + 1;

    if (count > config.limit) {
      return false;
    }

    await this.cacheManager.set(
      key,
      { count, resetAt: entry.resetAt },
      Math.max(entry.resetAt - Date.now(), 1),
    );
    return true;
  }

  async getRateLimitStatus(
    userId: string | null,
    ip: string,
    role: UserRateLimitRole,
    overrideConfig?: Partial<RateLimitConfig>,
  ) {
    const config = { ...DEFAULT_RATE_LIMITS[role], ...overrideConfig };
    const key = this.roleKey(userId || ip, ip);
    const entry = await this.getEntry(key, config.windowMs);

    return {
      limit: config.limit,
      current: entry.count,
      remaining: Math.max(0, config.limit - entry.count),
      resetTime: new Date(entry.resetAt),
    };
  }

  async resetUserLimit(userId: string): Promise<void> {
    const key = `rate-limit:${userId}`;
    await this.cacheManager.del(key);
  }

  resolveRole(userRole: string | undefined, authenticated: boolean): UserRateLimitRole {
    if (!authenticated) return 'guest';
    const normalized = (userRole || 'student').toLowerCase();
    if (normalized === 'admin') return 'admin';
    if (normalized === 'instructor') return 'instructor';
    return 'student';
  }
}
