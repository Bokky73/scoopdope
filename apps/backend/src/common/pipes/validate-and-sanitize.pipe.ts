import { Injectable, PipeTransform, BadRequestException, ArgumentMetadata } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SanitizationPipe } from './sanitization.pipe';

@Injectable()
export class ValidateAndSanitizePipe implements PipeTransform {
  private sanitizationPipe = new SanitizationPipe();

  async transform(value: any, metadata: ArgumentMetadata) {
    // First sanitize
    const sanitized = await this.sanitizationPipe.transform(value);

    // Then validate if DTO class is provided
    if (!metadata.type || metadata.type === 'custom' || !metadata.metatype) {
      return sanitized;
    }

    const object = plainToInstance(metadata.metatype as any, sanitized);
    const errors = await validate(object, {
      skipMissingProperties: false,
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      const messages = errors
        .map((error) => {
          const constraints = Object.values(error.constraints || {});
          return `${error.property}: ${constraints.join(', ')}`;
        })
        .join('; ');

      throw new BadRequestException({
        statusCode: 400,
        message: 'Validation failed',
        errors: messages,
      });
    }

    return object;
  }
}
