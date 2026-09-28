export interface AppConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
}

const MIN_JWT_SECRET_LENGTH = 32;

function validateJwtSecret(secret: string | undefined): string {
  if (!secret || secret.trim().length === 0) {
    throw new Error(
      'JWT_SECRET environment variable is not set. ' +
        'Set JWT_SECRET to a strong, unique value before starting the application.',
    );
  }

  if (secret.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters long ` +
        `(received ${secret.length}). Use a longer, randomly generated secret.`,
    );
  }

  return secret;
}

function loadConfig(): AppConfig {
  return {
    jwtSecret: validateJwtSecret(process.env.JWT_SECRET),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
  };
}

export const config: AppConfig = loadConfig();
