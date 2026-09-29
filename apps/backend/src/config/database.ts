import { Pool, PoolConfig } from 'pg';

/**
 * Database connection pool configuration.
 *
 * Values are sourced from environment variables with sensible defaults so the
 * backend reuses a bounded set of connections instead of opening a new
 * connection per request.
 */
export interface DatabasePoolSettings {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  max: number;
  min: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

function toInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getDatabasePoolSettings(): DatabasePoolSettings {
  return {
    host: process.env.DB_HOST ?? 'localhost',
    port: toInt(process.env.DB_PORT, 5432),
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'app',
    max: toInt(process.env.DB_POOL_MAX, 10),
    min: toInt(process.env.DB_POOL_MIN, 0),
    idleTimeoutMillis: toInt(process.env.DB_POOL_IDLE_TIMEOUT_MS, 30000),
    connectionTimeoutMillis: toInt(process.env.DB_POOL_CONNECTION_TIMEOUT_MS, 5000),
  };
}

let pool: Pool | undefined;

/**
 * Returns the shared connection pool, creating it on first use so that all
 * requests reuse the same bounded set of connections.
 */
export function getPool(): Pool {
  if (!pool) {
    const settings = getDatabasePoolSettings();
    const config: PoolConfig = {
      host: settings.host,
      port: settings.port,
      user: settings.user,
      password: settings.password,
      database: settings.database,
      max: settings.max,
      min: settings.min,
      idleTimeoutMillis: settings.idleTimeoutMillis,
      connectionTimeoutMillis: settings.connectionTimeoutMillis,
    };
    pool = new Pool(config);
  }
  return pool;
}

/**
 * Runs a query against the shared pool. Query semantics are unchanged; callers
 * simply no longer create a connection per request.
 */
export function query<T = any>(text: string, params?: unknown[]): Promise<{ rows: T[] }> {
  return getPool().query(text, params as any[]);
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}
