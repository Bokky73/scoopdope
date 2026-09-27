import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const JSON_CONTENT_TYPE = 'application/json';
const STATE_CHANGING_METHODS = ['POST', 'PUT', 'PATCH'];

@Injectable()
export class RequestValidationMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    const method = (req.method || '').toUpperCase();

    if (!STATE_CHANGING_METHODS.includes(method)) {
      return next();
    }

    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes(JSON_CONTENT_TYPE)) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Unsupported media type',
        errors: {
          field: 'content-type',
          message: `Expected ${JSON_CONTENT_TYPE}`,
        },
      });
    }

    const body = req.body;
    if (body === undefined || body === null || Object.keys(body).length === 0) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Validation failed',
        errors: {
          field: 'body',
          message: 'Request body must not be empty',
        },
      });
    }

    next();
  }
}
