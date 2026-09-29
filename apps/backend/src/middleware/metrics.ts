import { Request, Response, NextFunction } from 'express';
import client from 'prom-client';

// Collect default Node.js process metrics (CPU, memory, event loop, etc.)
client.collectDefaultMetrics({ prefix: 'app_' });

// Histogram tracking HTTP request durations in seconds, labelled by method,
// route and status code so endpoint response times can be monitored.
export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

// Counter for total requests, useful alongside the duration histogram.
export const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

/**
 * Express middleware that records the duration of every request once the
 * response has been sent. Uses the matched route pattern (falling back to the
 * raw path) to keep label cardinality bounded.
 */
export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationSeconds = Number(process.hrtime.bigint() - start) / 1e9;
    const route = req.route?.path ?? req.baseUrl ?? req.path ?? 'unknown';
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    };

    httpRequestDuration.observe(labels, durationSeconds);
    httpRequestTotal.inc(labels);
  });

  next();
}

/**
 * Express handler exposing the Prometheus registry for scraping.
 */
export async function metricsEndpoint(_req: Request, res: Response): Promise<void> {
  res.setHeader('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
}

export default metricsMiddleware;
