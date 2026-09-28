import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

function validateJwtSecret(): void {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      'JWT_SECRET environment variable is not set. The application cannot start without a JWT secret.',
    );
  }

  const MIN_JWT_SECRET_LENGTH = 32;
  if (secret.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters long. ` +
        `Received a value of length ${secret.length}.`,
    );
  }
}

async function bootstrap() {
  validateJwtSecret();

  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
