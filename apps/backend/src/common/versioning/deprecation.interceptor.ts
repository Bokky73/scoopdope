import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { X_API_DEPRECATED, X_API_SUNSET } from './api-version.constants';
import { DEPRECATED_KEY, DeprecationInfo } from './deprecated.decorator';

@Injectable()
export class DeprecationInterceptor implements NestInterceptor {
  private readonly logger = new Logger(DeprecationInterceptor.name);

  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const deprecationInfo = this.reflector.getAllAndOverride<DeprecationInfo>(
      DEPRECATED_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!deprecationInfo) {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<{ method: string; path: string }>();
    const response = http.getResponse<{
      setHeader: (name: string, value: string) => void;
    }>();

    const { since, sunset, migrationUrl, reason: _reason } = deprecationInfo;
    const method = request.method;
    const path = request.path;

    // RFC 8594 Deprecation header
    response.setHeader('Deprecation', 'true');

    // RFC 7231 Sunset header (HTTP-date format)
    const sunsetDate = new Date(sunset);
    response.setHeader('Sunset', sunsetDate.toUTCString());

    // RFC 8594 Link header with successor-version relation
    if (migrationUrl) {
      response.setHeader('Link', `<${migrationUrl}>; rel="successor-version"`);
    }

    // Existing custom headers (same keys used by ApiVersionInterceptor)
    response.setHeader(
      X_API_DEPRECATED,
      `true; deprecation_date=${new Date(since).toISOString()}`,
    );
    response.setHeader(X_API_SUNSET, sunsetDate.toISOString());

    this.logger.warn(
      `Deprecated endpoint accessed: ${method} ${path}`,
      'DeprecationInterceptor',
    );

    return next.handle();
  }
}
