import { createLogger, format, transports } from 'winston';

const { combine, timestamp, errors, json } = format;

/**
 * Application logger emitting structured JSON logs.
 *
 * Each log line is a single JSON object containing the level, message,
 * timestamp and any contextual metadata passed to the logger, making logs
 * easier to parse and query by downstream tooling.
 */
export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
    errors({ stack: true }),
    json(),
  ),
  defaultMeta: { service: process.env.SERVICE_NAME || 'backend' },
  transports: [new transports.Console()],
});

export default logger;
