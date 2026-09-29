import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseDto, getHttpStatusPhrase } from '../dto/error-response.dto';

/**
 * Exception filter specifically for {@link BadRequestException} thrown by the
 * global {@link ValidationPipe}.  Returns the same {@link ErrorResponseDto}
 * shape as {@link HttpExceptionFilter}, with field-level constraint violations
 * surfaced in the `details` array.
 *
 * Response structure:
 * ```json
 * {
 *   "statusCode": 400,
 *   "error": "Bad Request",
 *   "message": "Validation failed",
 *   "details": ["email must be an email", "password is too short"],
 *   "timestamp": "2025-01-01T00:00:00.000Z",
 *   "correlationId": "abc-123",
 *   "path": "/api/v1/auth/register"
 * }
 * ```
 */
@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message = 'Bad Request';
    let details: string[] | null = null;

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const raw = exceptionResponse as Record<string, unknown>;

      // class-validator produces an array of constraint messages in `message`
      if (Array.isArray(raw['message'])) {
        message = 'Validation failed';
        details = raw['message'] as string[];
      } else if (typeof raw['message'] === 'string') {
        message = raw['message'];
      }

      // Also capture explicit `errors` arrays set by manual BadRequestException throws
      if (!details && Array.isArray(raw['errors'])) {
        details = raw['errors'] as string[];
      }
    }

    const errorResponse: ErrorResponseDto = {
      statusCode: status,
      error: getHttpStatusPhrase(status),
      message,
      details,
      timestamp: new Date().toISOString(),
      correlationId: request.correlationId,
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}
