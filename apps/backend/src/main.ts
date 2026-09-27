import './tracing';
import './instrument';
import * as compression from 'compression';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { SanitizationPipe } from './common/pipes/sanitization.pipe';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { RequestValidationMiddleware } from './common/middleware/request-validation.middleware';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { MetricsInterceptor } from './metrics/metrics.interceptor';
import { MetricsService } from './metrics/metrics.service';
import { AppDataSource } from './data-source';
import {
  API_VERSION_HEADER,
  API_VERSIONS,
  DEFAULT_API_VERSION,
  LATEST_API_VERSION,
  getVersionInfo,
} from './common/versioning';

async function runMigrationCommand(command: string) {
  const logger = new Logger('MigrationCommand');

  try {
    await AppDataSource.initialize();
    logger.log('DataSource initialized');

    switch (command) {
      case 'migration:run': {
        const migrations = await AppDataSource.runMigrations();
        if (migrations.length === 0) {
          logger.log('No pending migrations.');
        } else {
          logger.log(`Executed ${migrations.length} migration(s):`);
          migrations.forEach((m) => logger.log(`  ${m.name}`));
        }
        break;
      }
      case 'migration:revert': {
        await AppDataSource.undoLastMigration();
        logger.log('Last migration reverted.');
        break;
      }
      default:
        logger.error(`Unknown migration command: ${command}`);
        process.exit(1);
    }

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    logger.error(`Migration command "${command}" failed: ${error}`);
    process.exit(1);
  }
}

async function bootstrap() {
  const migrationCommand = process.argv
    .slice(2)
    .find((a) => a.startsWith('migration:'));

  if (migrationCommand) {
    await runMigrationCommand(migrationCommand);
    return;
  }

  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.enableShutdownHooks();

  // #882: Enable gzip compression for responses >1KB
  app.use(
    compression({
      threshold: 1024, // Only compress responses larger than 1KB
      level: 6,        // Balanced compression level (0-9)
      filter: (req, res) => {
        // Respect Cache-Control: no-transform
        if (res.getHeader('Cache-Control')?.toString().includes('no-transform')) {
          return false;
        }
        return compression.filter(req, res);
      },
    }),
  );
  const configService = app.get(ConfigService);

  const port = configService.get<number>('port');
  const nodeEnv = configService.get<string>('nodeEnv');

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  const correlationId = new CorrelationIdMiddleware();
  const requestValidation = new RequestValidationMiddleware();
  app.use((req, res, next) => correlationId.use(req, res, next));
  app.use((req, res, next) => requestValidation.use(req, res, next));

  app.setGlobalPrefix('v1', { exclude: ['health', 'health/live', 'health/ready', 'health/startup', 'health/environment', 'health/version'] });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }), new SanitizationPipe());
  app.useGlobalFilters(new HttpExceptionFilter(), new ValidationExceptionFilter());
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new MetricsInterceptor(app.get(MetricsService))
  );

  const corsOrigins = configService.get<string[]>('cors.origins') || ['http://localhost:3001'];
  const corsCredentials = configService.get<boolean>('cors.credentials') ?? false;
  const corsPreflight = configService.get<number>('cors.maxAge') ?? 86400;

  app.enableCors({
    origin: nodeEnv === 'production' ? corsOrigins : true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-KEY', 'X-Webhook-Signature'],
    credentials: corsCredentials,
    maxAge: corsPreflight,
  });

  const v1Info = getVersionInfo('v1');

  const config = new DocumentBuilder()
    .setTitle('scoopdope API')
    .setDescription(
      'Blockchain education platform API powered by Stellar\n\n' +
        '## API Versioning\n\n' +
        'This API uses **URL-based versioning**. All requests must include the version prefix.\n\n' +
        `Current version: **${LATEST_API_VERSION}** | Supported: ${API_VERSIONS.join(', ')}\n\n` +
        '### Version Headers\n\n' +
        '| Header | Description |\n' +
        '|--------|-------------|\n' +
        `| \`${API_VERSION_HEADER}\` | Request a specific version (e.g., \`v1\`) |\n` +
        '| `X-API-Version` | Response header indicating the served version |\n' +
        '| `X-API-Deprecated` | Response header warning about deprecation |\n' +
        '| `X-API-Sunset` | Response header with sunset date for deprecated versions |\n\n' +
        '### Versioning Policy\n\n' +
        '- Backward-compatible changes (new fields, new endpoints) are additive within a version\n' +
        '- Breaking changes trigger a new version (e.g., v2)\n' +
        '- Deprecated versions receive a **90-day** sunset window before removal\n' +
        '- Clients should monitor `X-API-Version` and `X-API-Deprecated` response headers\n\n' +
        '📖 **Full versioning policy, deprecation timeline, and migration guide:** ' +
        '[docs/api-versioning.md](https://github.com/augustina-jpg/scoopdope/blob/main/docs/api-versioning.md)\n\n' +
        '## Authentication\n\n' +
        'This API uses JWT Bearer tokens for authentication.\n\n' +
        '### Getting Started\n\n' +
        '1. **Register**: POST /v1/auth/register with email and password\n' +
        '2. **Login**: POST /v1/auth/login to receive access_token\n' +
        '3. **Authorize**: Click "Authorize" button and enter: `Bearer <access_token>`\n' +
        '4. **Use API**: All protected endpoints now accessible\n\n' +
        '### Example Flow\n\n' +
        '```bash\n' +
        '# Register\n' +
        'curl -X POST https://api.scoopdope.com/v1/auth/register \\\n' +
        '  -H "Content-Type: application/json" \\\n' +
        '  -d \'{"email":"user@example.com","password":"securepass123"}\'\n\n' +
        '# Login\n' +
        'curl -X POST https://api.scoopdope.com/v1/auth/login \\\n' +
        '  -H "Content-Type: application/json" \\\n' +
        '  -d \'{"email":"user@example.com","password":"securepass123"}\'\n\n' +
        '# Use token in subsequent requests\n' +
        'curl -X GET https://api.scoopdope.com/v1/courses \\\n' +
        '  -H "Authorization: Bearer <your_access_token>"\n' +
        '```'
    )
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Enter JWT token obtained from /v1/auth/login',
    })
    .addApiKey({ type: 'apiKey', in: 'header', name: 'X-API-KEY' }, 'X-API-KEY')
    .addServer(`/${LATEST_API_VERSION}`, `API ${LATEST_API_VERSION} (latest)`)
    .addServer(`/${DEFAULT_API_VERSION}`, `API ${DEFAULT_API_VERSION} (default)`)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'api-json',
  });

  if (process.env.EXPORT_OPENAPI === 'true' || process.argv.includes('--export-openapi')) {
    const outputPath = join(__dirname, '..', 'openapi.json');
    writeFileSync(outputPath, JSON.stringify(document, null, 2));
    logger.log(`OpenAPI spec exported to ${outputPath}`);
    process.exit(0);
  }

  await app.listen(port ?? 3000);
  logger.log(`scoopdope API running on port ${port} [${nodeEnv}]`);
}
bootstrap();
