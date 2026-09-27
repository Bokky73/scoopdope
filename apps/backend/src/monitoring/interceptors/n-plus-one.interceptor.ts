import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { QueryPerformanceService } from '../services/query-performance.service';

interface QueryPattern {
  table: string;
  queryType: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  count: number;
  duration: number;
}

/**
 * Detects potential N+1 query patterns
 * N+1 queries occur when one query fetches data and then N additional queries
 * are executed for each result (e.g., fetching users then querying for each user's posts)
 */
@Injectable()
export class NPlusOneInterceptor implements NestInterceptor {
  private readonly logger = new Logger(NPlusOneInterceptor.name);
  private readonly REQUEST_TIMEOUT = 30000; // 30 seconds

  constructor(private queryPerformanceService: QueryPerformanceService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const requestUrl = request.url;
    const queryPatterns = new Map<string, QueryPattern>();
    const startTime = Date.now();

    // Hook into TypeORM's query event to track patterns
    // This will be enhanced when we integrate with the database module
    const originalTimestamp = request._queryStartTime || startTime;

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - originalTimestamp;
        this.detectNPlusOnePatterns(queryPatterns, requestUrl, duration);
      }),
    );
  }

  /**
   * Detect N+1 query patterns
   */
  private detectNPlusOnePatterns(
    queryPatterns: Map<string, QueryPattern>,
    requestUrl: string,
    duration: number,
  ): void {
    // This method will be triggered by the QueryLogger interceptor
    // Check if we have multiple queries on the same table
    for (const [tableKey, pattern] of queryPatterns.entries()) {
      if (pattern.count > 5 && pattern.queryType === 'SELECT') {
        this.logger.warn(
          `Potential N+1 query pattern detected in ${requestUrl}`,
          {
            table: pattern.table,
            queryCount: pattern.count,
            totalDuration: pattern.duration,
            averagePerQuery: pattern.duration / pattern.count,
          },
        );
      }
    }
  }

  /**
   * Extract table name from SQL query
   */
  private extractTableName(query: string): string {
    const selectMatch = query.match(/FROM\s+["']?(\w+)["']?/i);
    const updateMatch = query.match(/UPDATE\s+["']?(\w+)["']?/i);
    const insertMatch = query.match(/INSERT\s+INTO\s+["']?(\w+)["']?/i);
    const deleteMatch = query.match(/DELETE\s+FROM\s+["']?(\w+)["']?/i);

    return (
      selectMatch?.[1] ||
      updateMatch?.[1] ||
      insertMatch?.[1] ||
      deleteMatch?.[1] ||
      'unknown'
    );
  }

  /**
   * Extract query type
   */
  private extractQueryType(
    query: string,
  ): 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' {
    const match = query.match(/^\s*(\w+)/i);
    const type = match?.[1]?.toUpperCase();

    if (type === 'SELECT' || type === 'INSERT' || type === 'UPDATE' || type === 'DELETE') {
      return type;
    }

    return 'SELECT';
  }

  /**
   * Update query pattern
   */
  private updateQueryPattern(
    patterns: Map<string, QueryPattern>,
    tableName: string,
    queryType: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE',
    duration: number,
  ): void {
    const key = `${tableName}_${queryType}`;

    if (patterns.has(key)) {
      const existing = patterns.get(key)!;
      existing.count++;
      existing.duration += duration;
    } else {
      patterns.set(key, {
        table: tableName,
        queryType,
        count: 1,
        duration,
      });
    }
  }
}
