import express from 'express';
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
  },
});

const app = express();

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - start,
    }, 'request completed');
  });
  next();
});

app.get('/health', (req, res) => {
  logger.info('health check');
  res.json({ status: 'ok' });
});

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  logger.info({ port }, 'server started');
});

export default app;
