import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  Inject,
  Optional,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { QueryPerformanceService } from '../services/query-performance.service';
import { Request } from 'express';

/**
 * Tracks database query execution time and logs slow queries
 */
@Injectable()
export class QueryLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(QueryLoggerInterceptor.name);

  constructor(
    @Optional() private queryPerformanceService?: QueryPerformanceService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const startTime = Date.now();

    // Store start time for potential nested query tracking
    (request as any)._queryStartTime = startTime;
    (request as any)._queryLog = [];

    return next.handle().pipe(
      tap(
        (result) => {
          const duration = Date.now() - startTime;
          const path = request.path;
          const method = request.method;

          // Log request execution time for monitoring
          if (duration > 100) {
            this.logger.debug(
              `[${method} ${path}] completed in ${duration}ms`,
            );
          }
        },
        (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `[${request.method} ${request.path}] failed after ${duration}ms`,
            error,
          );
        },
      ),
    );
  }
}
