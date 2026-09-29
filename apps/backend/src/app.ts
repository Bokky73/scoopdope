import express from 'express';
import promClient from 'prom-client';

const app = express();

// Global request body size limit (1MB) to reject oversized payloads
const BODY_LIMIT = '1mb';
app.use(express.json({ limit: BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: BODY_LIMIT }));

// Collect default metrics (CPU, memory, event loop, etc.)
promClient.collectDefaultMetrics();

// Histogram to track HTTP request durations
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

// Middleware to measure response times
app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const durationSeconds = Number(process.hrtime.bigint() - start) / 1e9;
    const route = req.route ? req.baseUrl + req.route.path : req.path;
    httpRequestDuration
      .labels(req.method, route, String(res.statusCode))
      .observe(durationSeconds);
  });
  next();
});

// Expose metrics for Prometheus scraping
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

// Return 413 Payload Too Large for oversized request bodies
type BodyParserError = Error & { status?: number; statusCode?: number; type?: string };
app.use((err: BodyParserError, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err && (err.type === 'entity.too.large' || err.status === 413 || err.statusCode === 413)) {
    res.status(413).json({ error: 'Payload Too Large' });
    return;
  }
  next(err);
});

export default app;
