import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Application logger.
 *
 * Emits structured JSON logs so they can be parsed by log aggregators.
 * In development we keep the output human-readable via pino-pretty,
 * while still producing JSON in production.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: {
    service: process.env.SERVICE_NAME || 'backend',
    env: process.env.NODE_ENV || 'development',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
  },
  transport: isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
});

export default logger;
