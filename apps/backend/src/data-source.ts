import { DataSource, DataSourceOptions, Logger as TypeORMLogger } from 'typeorm';
import { config } from 'dotenv';
import { DatabaseConfigParser } from './common/utils/database-config';

config();

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';
const isStaging = nodeEnv === 'staging';
const isDevelopment = nodeEnv === 'development';

// Ensure synchronize is always false for migrations (safety first)
const synchronize = false;

// Validate synchronize setting for safety
if ((isProduction || isStaging) && synchronize) {
  throw new Error(
    `CRITICAL: TypeORM synchronize is enabled in ${nodeEnv} environment. ` +
    `This can cause data loss. Synchronize must be disabled in production and staging.`
  );
}

// Parse database configuration (supports both DATABASE_URL and individual env vars)
const dbConfig = DatabaseConfigParser.parse();

/**
 * Custom TypeORM logger for tracking query performance
 */
class QueryPerformanceLogger implements TypeORMLogger {
  log(
    level: 'log' | 'info' | 'warn',
    message: string,
    queryRunner?: any,
  ): any {
    if (level === 'log' && isDevelopment) {
      console.log('[TypeORM]', message);
    }
  }

  logQuery(query: string, parameters?: any[], queryRunner?: any): any {
    if (isDevelopment || process.env.QUERY_LOG_ENABLED === 'true') {
      const time = queryRunner?.data?.queryStartTime
        ? Date.now() - queryRunner.data.queryStartTime
        : 0;
      console.log('[Query]', query, 'Parameters:', parameters, `Time: ${time}ms`);
    }
  }

  logQueryError(
    error: string | Error,
    query: string,
    parameters?: any[],
    queryRunner?: any,
  ): any {
    console.error('[QueryError]', error, 'Query:', query, 'Parameters:', parameters);
  }

  logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: any): any {
    console.warn('[SlowQuery]', `${time}ms`, query, 'Parameters:', parameters);
  }

  logSchemaBuild(message: string, queryRunner?: any): any {
    if (isDevelopment) {
      console.log('[Schema]', message);
    }
  }

  logMigration(message: string, queryRunner?: any): any {
    console.log('[Migration]', message);
  }

  log(
    level: 'info' | 'warn' | 'error',
    message: string,
    queryRunner?: any,
  ): any {
    switch (level) {
      case 'warn':
        console.warn('[TypeORM]', message);
        break;
      case 'error':
        console.error('[TypeORM]', message);
        break;
      case 'info':
      default:
        console.info('[TypeORM]', message);
    }
  }
}

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.name,
  entities: isProduction
    ? ['dist/**/*.entity.js']
    : ['src/**/*.entity.ts'],
  migrations: isProduction
    ? ['dist/migrations/*.js']
    : ['src/migrations/*.ts'],
  migrationsTableName: 'schema_migrations',
  migrationsTransactionMode: 'all',
  logging: process.env.DB_LOGGING === 'true' ? ['query', 'error', 'schema', 'warn'] : ['error', 'schema'],
  // Enable query logger in development or when explicitly enabled
  logger: isDevelopment || process.env.QUERY_LOG_ENABLED === 'true' 
    ? new QueryPerformanceLogger()
    : undefined,
  // Log queries taking longer than this threshold (in milliseconds)
  maxQueryExecutionTime: parseInt(process.env.DB_SLOW_QUERY_THRESHOLD || '1000', 10),
  ssl: isProduction
    ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' }
    : false,
  extra: {
    min: parseInt(process.env.DATABASE_POOL_MIN || '5', 10),
    max: parseInt(process.env.DATABASE_POOL_MAX || '20', 10),
    idleTimeoutMillis: parseInt(process.env.DATABASE_IDLE_TIMEOUT_MS || '30000', 10),
    connectionTimeoutMillis: 5_000,
  },
  synchronize,
};

export const AppDataSource = new DataSource(dataSourceOptions);
