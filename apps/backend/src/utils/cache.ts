import Redis from 'ioredis';
import { env } from '../config/env';

/**
 * Shared Redis client used for transparent, TTL-based caching of
 * frequently accessed data (e.g. course list, user profile).
 *
 * The client is created lazily so importing this module never opens a
 * connection on its own, and it is safe to reuse across the app.
 */
let client: Redis | null = null;

function getClient(): Redis {
  if (!client) {
    client = new Redis(env.REDIS_URL, {
      lazyConnect: false,
      maxRetriesPerRequest: 2,
    });
  }
  return client;
}

/**
 * Read a value from the cache. Returns null on a miss or on any Redis
 * error so callers transparently fall back to the database.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await getClient().get(key);
    if (raw === null) {
      return null;
    }
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Store a value in the cache with a TTL (in seconds). Failures are
 * swallowed so caching never breaks the request path.
 */
export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number,
): Promise<void> {
  try {
    await getClient().set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch {
    // Cache writes are best-effort; ignore failures.
  }
}

/**
 * Remove a single cached entry. Used on writes to invalidate stale data.
 */
export async function cacheDel(key: string): Promise<void> {
  try {
    await getClient().del(key);
  } catch {
    // Cache invalidation is best-effort; ignore failures.
  }
}

/**
 * Remove every cached entry matching a prefix. Useful when a write
 * affects a collection (e.g. the course list) rather than one key.
 */
export async function cacheDelByPrefix(prefix: string): Promise<void> {
  try {
    const redis = getClient();
    const keys = await redis.keys(`${prefix}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {
    // Cache invalidation is best-effort; ignore failures.
  }
}

/**
 * Cache-aside helper: return the cached value when present, otherwise
 * run the loader, cache its result, and return it. Keeps callers free
 * of caching concerns while avoiding a DB hit on every request.
 */
export async function cacheWrap<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>,
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    return cached;
  }
  const value = await loader();
  await cacheSet(key, value, ttlSeconds);
  return value;
}

/**
 * Cache key builders so producers and invalidators agree on names.
 */
export const cacheKeys = {
  courseList: () => 'courses:list',
  courseListPrefix: () => 'courses:',
  userProfile: (userId: string | number) => `user:profile:${userId}`,
  userProfilePrefix: () => 'user:profile:',
};

export const cacheTtl = {
  courseList: 300,
  userProfile: 300,
};
