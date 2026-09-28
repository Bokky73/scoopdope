const MIN_JWT_SECRET_LENGTH = 32;

export function validateEnv(env: NodeJS.ProcessEnv = process.env): void {
  const jwtSecret = env.JWT_SECRET;

  if (!jwtSecret || jwtSecret.trim().length === 0) {
    throw new Error(
      'JWT_SECRET environment variable is not set. ' +
        'Set JWT_SECRET to a strong, random value before starting the application.',
    );
  }

  if (jwtSecret.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters long ` +
        `(received ${jwtSecret.length}). ` +
        'Use a strong, randomly generated secret before starting the application.',
    );
  }
}

export { MIN_JWT_SECRET_LENGTH };
