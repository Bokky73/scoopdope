import { Pool, PoolConfig } from 'pg';

/**
 * Database connection pool.
 *
 * A single shared pool is created at module load and reused across requests so
 * that connections are not opened per request. Pool sizing and timeouts are
 * configurable through environment variables with sensible defaults.
 */

function toInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const poolConfig: PoolConfig = {
  host: process.env.DB_HOST ?? 'localhost',
  port: toInt(process.env.DB_PORT, 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Pool sizing
  min: toInt(process.env.DB_POOL_MIN, 2),
  max: toInt(process.env.DB_POOL_MAX, 10),
  // Timeouts (milliseconds)
  idleTimeoutMillis: toInt(process.env.DB_POOL_IDLE_TIMEOUT_MS, 30000),
  connectionTimeoutMillis: toInt(process.env.DB_POOL_CONNECTION_TIMEOUT_MS, 5000),
};

export const pool = new Pool(poolConfig);

// Surface unexpected pool-level errors instead of crashing the process.
pool.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error('Unexpected error on idle database client', err);
});

/**
 * Run a query using a pooled connection. The client is released back to the
 * pool automatically, preserving existing query semantics.
 */
export async function query<T = any>(text: string, params?: unknown[]): Promise<T[]> {
  const result = await pool.query(text, params as any[]);
  return result.rows as T[];
}

/**
 * Acquire a client from the pool for multi-statement transactions. Callers are
 * responsible for releasing the client when finished.
 */
export function getClient() {
  return pool.connect();
}

export async function closePool(): Promise<void> {
  await pool.end();
}

export default pool;
