import Redis from 'ioredis';
import { env } from './env';

let client: Redis | null = null;

/**
 * Lazily create a shared Redis client. Returns null when Redis is not
 * configured so callers can transparently fall back to the database.
 */
export function getRedis(): Redis | null {
  if (client) {
    return client;
  }

  const url = env.REDIS_URL;
  if (!url) {
    return null;
  }

  client = new Redis(url, {
    lazyConnect: false,
    maxRetriesPerRequest: 2,
  });

  client.on('error', (err) => {
    // Never let a cache failure crash the process.
    console.error('[redis] connection error', err);
  });

  return client;
}

/**
 * Read a JSON value from the cache. Returns null on miss or when Redis is
 * unavailable, so callers can fall back to the database.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (!redis) {
    return null;
  }

  try {
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (err) {
    console.error('[redis] get failed', key, err);
    return null;
  }
}

/**
 * Store a JSON value in the cache with a TTL (seconds).
 */
export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number,
): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    return;
  }

  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (err) {
    console.error('[redis] set failed', key, err);
  }
}

/**
 * Invalidate one or more cache keys. Used on writes so cached entities stay
 * consistent with the database.
 */
export async function cacheDel(...keys: string[]): Promise<void> {
  const redis = getRedis();
  if (!redis || keys.length === 0) {
    return;
  }

  try {
    await redis.del(...keys);
  } catch (err) {
    console.error('[redis] del failed', keys, err);
  }
}

/**
 * Remove every key matching a pattern (e.g. "courses:*"). Uses SCAN to avoid
 * blocking Redis with KEYS on large keyspaces.
 */
export async function cacheDelByPattern(pattern: string): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    return;
  }

  try {
    let cursor = '0';
    do {
      const [next, found] = await redis.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );
      cursor = next;
      if (found.length > 0) {
        await redis.del(...found);
      }
    } while (cursor !== '0');
  } catch (err) {
    console.error('[redis] pattern delete failed', pattern, err);
  }
}

/** Cache key builders for the frequently accessed entities. */
export const cacheKeys = {
  courseList: () => 'courses:list',
  course: (id: string | number) => `courses:${id}`,
  userProfile: (id: string | number) => `users:profile:${id}`,
};

/** Default TTLs (seconds) for cached entities. */
export const cacheTtl = {
  courseList: 300,
  course: 300,
  userProfile: 300,
};
