import {
  Injectable,
  NestMiddleware,
  BadRequestException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const JSON_CONTENT_TYPE = 'application/json';

/**
 * HTTP methods that are expected to carry a request body.
 * GET, DELETE, HEAD, OPTIONS are excluded — an empty body is valid for them.
 */
const BODY_REQUIRED_METHODS = ['POST', 'PUT', 'PATCH'];

/**
 * Global request body validation middleware.
 *
 * For state-changing requests (POST / PUT / PATCH) this middleware enforces:
 *
 * 1. **Content-Type header** — must be `application/json`.
 *    Returns 415 Unsupported Media Type otherwise.
 *
 * 2. **Non-empty body** — the parsed JSON body must not be `undefined`,
 *    `null`, or an empty object `{}`.
 *    Returns 400 Bad Request otherwise.
 *
 * All other methods (GET, DELETE, HEAD, …) pass through unchanged.
 *
 * This middleware runs before NestJS guards and pipes so malformed requests
 * are rejected early, before any business logic executes.
 */
@Injectable()
export class RequestValidationMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    const method = (req.method ?? '').toUpperCase();

    if (!BODY_REQUIRED_METHODS.includes(method)) {
      return next();
    }

    // 1. Validate Content-Type
    const contentType = req.headers['content-type'] ?? '';
    if (!contentType.includes(JSON_CONTENT_TYPE)) {
      throw new UnsupportedMediaTypeException(
        `Content-Type must be '${JSON_CONTENT_TYPE}'. Received: '${contentType || 'none'}'`,
      );
    }

    // 2. Validate body is present and non-empty
    const body = req.body;
    const isEmpty =
      body === undefined ||
      body === null ||
      (typeof body === 'object' && !Array.isArray(body) && Object.keys(body).length === 0);

    if (isEmpty) {
      throw new BadRequestException(
        'Request body must not be empty. Provide a valid JSON object.',
      );
    }

    next();
  }
}
