import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseDto, getHttpStatusPhrase } from '../dto/error-response.dto';

/**
 * Global exception filter that catches all unhandled exceptions and returns a
 * consistent {@link ErrorResponseDto} shape.
 *
 * Response structure:
 * ```json
 * {
 *   "statusCode": 404,
 *   "error": "Not Found",
 *   "message": "Course not found",
 *   "details": null,
 *   "timestamp": "2025-01-01T00:00:00.000Z",
 *   "correlationId": "abc-123",
 *   "path": "/api/v1/courses/999"
 * }
 * ```
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    let details: string[] | null = null;

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const raw = exceptionResponse as Record<string, unknown>;
        message =
          typeof raw['message'] === 'string'
            ? raw['message']
            : Array.isArray(raw['message'])
            ? 'Validation failed'
            : exception.message;

        // Normalise validation detail arrays from class-validator
        if (Array.isArray(raw['message'])) {
          details = raw['message'] as string[];
        } else if (Array.isArray(raw['errors'])) {
          details = raw['errors'] as string[];
        }
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
