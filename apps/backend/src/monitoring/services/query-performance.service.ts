import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export interface QueryLog {
  timestamp: Date;
  duration: number;
  query: string;
  parameters: any[];
  status: 'slow' | 'normal' | 'critical';
  context?: string;
}

export interface QueryMetrics {
  totalQueries: number;
  slowQueries: number;
  criticalQueries: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
}

@Injectable()
export class QueryPerformanceService {
  private readonly logger = new Logger(QueryPerformanceService.name);
  private readonly slowQueryThreshold: number; // ms
  private readonly criticalQueryThreshold: number; // ms
  private readonly logFilePath: string;
  private queryLogs: QueryLog[] = [];
  private readonly MAX_LOGS_IN_MEMORY = 1000;

  constructor(private configService: ConfigService) {
    this.slowQueryThreshold = this.configService.get<number>('monitoring.slowQueryThreshold') || 1000;
    this.criticalQueryThreshold = this.configService.get<number>('monitoring.criticalQueryThreshold') || 5000;
    this.logFilePath = this.configService.get<string>('monitoring.slowQueryLogPath') || 
      path.join(process.cwd(), 'logs', 'slow-queries.log');
    
    this.ensureLogDirectory();
  }

  /**
   * Record a query execution
   */
  recordQuery(query: string, parameters: any[], duration: number, context?: string): void {
    if (duration < this.slowQueryThreshold) {
      return; // Don't log fast queries
    }

    const status = duration >= this.criticalQueryThreshold ? 'critical' : 'slow';
    const queryLog: QueryLog = {
      timestamp: new Date(),
      duration,
      query: this.sanitizeQuery(query),
      parameters: this.sanitizeParameters(parameters),
      status,
      context,
    };

    this.queryLogs.push(queryLog);

    // Maintain max logs in memory
    if (this.queryLogs.length > this.MAX_LOGS_IN_MEMORY) {
      this.queryLogs.shift();
    }

    this.writeToLogFile(queryLog);

    if (status === 'critical') {
      this.logger.warn(
        `CRITICAL QUERY: ${duration}ms - ${this.truncateQuery(query, 100)}`,
        { duration, context }
      );
    } else {
      this.logger.debug(
        `Slow query: ${duration}ms - ${this.truncateQuery(query, 100)}`,
        { duration, context }
      );
    }
  }

  /**
   * Get recent slow queries
   */
  getRecentSlowQueries(limit: number = 50): QueryLog[] {
    return this.queryLogs.slice(-limit);
  }

  /**
   * Get query metrics
   */
  getMetrics(): QueryMetrics {
    if (this.queryLogs.length === 0) {
      return {
        totalQueries: 0,
        slowQueries: 0,
        criticalQueries: 0,
        averageResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
      };
    }

    const slowCount = this.queryLogs.filter(q => q.status === 'slow').length;
    const criticalCount = this.queryLogs.filter(q => q.status === 'critical').length;
    const durations = this.queryLogs.map(q => q.duration).sort((a, b) => a - b);
    
    return {
      totalQueries: this.queryLogs.length,
      slowQueries: slowCount,
      criticalQueries: criticalCount,
      averageResponseTime: durations.reduce((a, b) => a + b, 0) / durations.length,
      p95ResponseTime: durations[Math.floor(durations.length * 0.95)],
      p99ResponseTime: durations[Math.floor(durations.length * 0.99)],
    };
  }

  /**
   * Get queries by status
   */
  getQueriesByStatus(status: 'slow' | 'critical'): QueryLog[] {
    return this.queryLogs.filter(q => q.status === status);
  }

  /**
   * Clear in-memory logs
   */
  clearLogs(): void {
    this.queryLogs = [];
    this.logger.log('Query logs cleared');
  }

  /**
   * Get the configured slow query threshold
   */
  getSlowQueryThreshold(): number {
    return this.slowQueryThreshold;
  }

  /**
   * Get the configured critical query threshold
   */
  getCriticalQueryThreshold(): number {
    return this.criticalQueryThreshold;
  }

  /**
   * Sanitize query to remove sensitive data
   */
  private sanitizeQuery(query: string): string {
    // Remove values, keep structure
    return query
      .replace(/VALUES\s*\([^)]+\)/gi, 'VALUES (...)')
      .replace(/IN\s*\([^)]+\)/gi, 'IN (...)')
      .replace(/'[^']*'/g, "'...'");
  }

  /**
   * Sanitize parameters to remove sensitive data
   */
  private sanitizeParameters(parameters: any[]): any[] {
    return parameters?.map(param => {
      if (typeof param === 'string' && param.length > 50) {
        return param.substring(0, 50) + '...';
      }
      if (typeof param === 'object' && param !== null) {
        return '[Object]';
      }
      return param;
    }) || [];
  }

  /**
   * Truncate query for logging
   */
  private truncateQuery(query: string, length: number): string {
    if (query.length <= length) {
      return query;
    }
    return query.substring(0, length) + '...';
  }

  /**
   * Write query log to file
   */
  private writeToLogFile(queryLog: QueryLog): void {
    try {
      const logEntry = JSON.stringify({
        timestamp: queryLog.timestamp.toISOString(),
        duration: queryLog.duration,
        status: queryLog.status,
        query: queryLog.query,
        parameters: queryLog.parameters,
        context: queryLog.context,
      });

      fs.appendFileSync(this.logFilePath, logEntry + '\n', { encoding: 'utf-8' });
    } catch (error) {
      this.logger.error('Failed to write to slow query log file', error);
    }
  }

  /**
   * Ensure log directory exists
   */
  private ensureLogDirectory(): void {
    try {
      const dir = path.dirname(this.logFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    } catch (error) {
      this.logger.error('Failed to create log directory', error);
    }
  }

  /**
   * Read slow queries from log file
   */
  readLogFile(limit: number = 100): QueryLog[] {
    try {
      if (!fs.existsSync(this.logFilePath)) {
        return [];
      }

      const content = fs.readFileSync(this.logFilePath, { encoding: 'utf-8' });
      const lines = content.split('\n').filter(line => line.trim());
      
      return lines
        .slice(-limit)
        .map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter((entry): entry is QueryLog => entry !== null);
    } catch (error) {
      this.logger.error('Failed to read slow query log file', error);
      return [];
    }
  }
}
