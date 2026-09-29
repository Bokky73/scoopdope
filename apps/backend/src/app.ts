import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import apiRoutes from './routes';

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(cors(config.cors));
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// API routes
app.use('/api', apiRoutes);

// Static assets are served by the Express app only outside production.
// In production they must be served by a CDN or nginx (see issue #1032).
if (config.env !== 'production') {
  app.use(express.static(path.join(__dirname, '../public')));
}

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

export default app;
