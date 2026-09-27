export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

export const RATE_LIMIT_METADATA = 'rate-limit:config';

export type UserRateLimitRole = 'admin' | 'instructor' | 'student' | 'guest';

export const DEFAULT_RATE_LIMITS: Record<UserRateLimitRole, RateLimitConfig> = {
  admin: { limit: 100, windowMs: 60000 },
  instructor: { limit: 100, windowMs: 60000 },
  student: { limit: 100, windowMs: 60000 },
  guest: { limit: 20, windowMs: 60000 },
};

export const AUTH_RATE_LIMIT: RateLimitConfig = { limit: 5, windowMs: 60000 };
