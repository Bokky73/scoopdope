function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
import './tracing';
import './instrument';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { SanitizationPipe } from './common/pipes/sanitization.pipe';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { MetricsInterceptor } from './metrics/metrics.interceptor';
import { MetricsService } from './metrics/metrics.service';
async function bootstrap() {
  if (stryMutAct_9fa48("4431")) {
    {}
  } else {
    stryCov_9fa48("4431");
    const logger = new Logger(stryMutAct_9fa48("4432") ? "" : (stryCov_9fa48("4432"), 'Bootstrap'));
    const app = await NestFactory.create(AppModule, stryMutAct_9fa48("4433") ? {} : (stryCov_9fa48("4433"), {
      rawBody: stryMutAct_9fa48("4434") ? false : (stryCov_9fa48("4434"), true)
    }));
    const configService = app.get(ConfigService);
    const port = configService.get<number>(stryMutAct_9fa48("4435") ? "" : (stryCov_9fa48("4435"), 'port'));
    const nodeEnv = configService.get<string>(stryMutAct_9fa48("4436") ? "" : (stryCov_9fa48("4436"), 'nodeEnv'));
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
    app.setGlobalPrefix(stryMutAct_9fa48("4437") ? "" : (stryCov_9fa48("4437"), 'v1'));
    app.useGlobalPipes(new ValidationPipe(stryMutAct_9fa48("4438") ? {} : (stryCov_9fa48("4438"), {
      whitelist: stryMutAct_9fa48("4439") ? false : (stryCov_9fa48("4439"), true)
    })), new SanitizationPipe());
    app.useGlobalFilters(new HttpExceptionFilter(), new ValidationExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor(), new MetricsInterceptor(app.get(MetricsService)));
    const corsOrigins = stryMutAct_9fa48("4442") ? configService.get<string[]>('cors.origins') && ['http://localhost:3001'] : stryMutAct_9fa48("4441") ? false : stryMutAct_9fa48("4440") ? true : (stryCov_9fa48("4440", "4441", "4442"), configService.get<string[]>(stryMutAct_9fa48("4443") ? "" : (stryCov_9fa48("4443"), 'cors.origins')) || (stryMutAct_9fa48("4444") ? [] : (stryCov_9fa48("4444"), [stryMutAct_9fa48("4445") ? "" : (stryCov_9fa48("4445"), 'http://localhost:3001')])));
    const corsCredentials = stryMutAct_9fa48("4446") ? configService.get<boolean>('cors.credentials') && false : (stryCov_9fa48("4446"), configService.get<boolean>(stryMutAct_9fa48("4447") ? "" : (stryCov_9fa48("4447"), 'cors.credentials')) ?? (stryMutAct_9fa48("4448") ? true : (stryCov_9fa48("4448"), false)));
    const corsPreflight = stryMutAct_9fa48("4449") ? configService.get<number>('cors.maxAge') && 86400 : (stryCov_9fa48("4449"), configService.get<number>(stryMutAct_9fa48("4450") ? "" : (stryCov_9fa48("4450"), 'cors.maxAge')) ?? 86400);
    app.enableCors(stryMutAct_9fa48("4451") ? {} : (stryCov_9fa48("4451"), {
      origin: (stryMutAct_9fa48("4454") ? nodeEnv !== 'production' : stryMutAct_9fa48("4453") ? false : stryMutAct_9fa48("4452") ? true : (stryCov_9fa48("4452", "4453", "4454"), nodeEnv === (stryMutAct_9fa48("4455") ? "" : (stryCov_9fa48("4455"), 'production')))) ? corsOrigins : stryMutAct_9fa48("4456") ? false : (stryCov_9fa48("4456"), true),
      methods: stryMutAct_9fa48("4457") ? [] : (stryCov_9fa48("4457"), [stryMutAct_9fa48("4458") ? "" : (stryCov_9fa48("4458"), 'GET'), stryMutAct_9fa48("4459") ? "" : (stryCov_9fa48("4459"), 'HEAD'), stryMutAct_9fa48("4460") ? "" : (stryCov_9fa48("4460"), 'PUT'), stryMutAct_9fa48("4461") ? "" : (stryCov_9fa48("4461"), 'PATCH'), stryMutAct_9fa48("4462") ? "" : (stryCov_9fa48("4462"), 'POST'), stryMutAct_9fa48("4463") ? "" : (stryCov_9fa48("4463"), 'DELETE'), stryMutAct_9fa48("4464") ? "" : (stryCov_9fa48("4464"), 'OPTIONS')]),
      allowedHeaders: stryMutAct_9fa48("4465") ? [] : (stryCov_9fa48("4465"), [stryMutAct_9fa48("4466") ? "" : (stryCov_9fa48("4466"), 'Content-Type'), stryMutAct_9fa48("4467") ? "" : (stryCov_9fa48("4467"), 'Authorization'), stryMutAct_9fa48("4468") ? "" : (stryCov_9fa48("4468"), 'X-API-KEY'), stryMutAct_9fa48("4469") ? "" : (stryCov_9fa48("4469"), 'X-Webhook-Signature')]),
      credentials: corsCredentials,
      maxAge: corsPreflight
    }));
    const config = new DocumentBuilder().setTitle(stryMutAct_9fa48("4470") ? "" : (stryCov_9fa48("4470"), 'scoopdope API')).setDescription((stryMutAct_9fa48("4471") ? "" : (stryCov_9fa48("4471"), 'Blockchain education platform API powered by Stellar\n\n')) + (stryMutAct_9fa48("4472") ? "" : (stryCov_9fa48("4472"), '## Authentication\n\n')) + (stryMutAct_9fa48("4473") ? "" : (stryCov_9fa48("4473"), 'This API uses JWT Bearer tokens for authentication.\n\n')) + (stryMutAct_9fa48("4474") ? "" : (stryCov_9fa48("4474"), '### Getting Started\n\n')) + (stryMutAct_9fa48("4475") ? "" : (stryCov_9fa48("4475"), '1. **Register**: POST /v1/auth/register with email and password\n')) + (stryMutAct_9fa48("4476") ? "" : (stryCov_9fa48("4476"), '2. **Login**: POST /v1/auth/login to receive access_token\n')) + (stryMutAct_9fa48("4477") ? "" : (stryCov_9fa48("4477"), '3. **Authorize**: Click "Authorize" button and enter: `Bearer <access_token>`\n')) + (stryMutAct_9fa48("4478") ? "" : (stryCov_9fa48("4478"), '4. **Use API**: All protected endpoints now accessible\n\n')) + (stryMutAct_9fa48("4479") ? "" : (stryCov_9fa48("4479"), '### Example Flow\n\n')) + (stryMutAct_9fa48("4480") ? "" : (stryCov_9fa48("4480"), '```bash\n')) + (stryMutAct_9fa48("4481") ? "" : (stryCov_9fa48("4481"), '# Register\n')) + (stryMutAct_9fa48("4482") ? "" : (stryCov_9fa48("4482"), 'curl -X POST https://api.scoopdope.com/v1/auth/register \\\n')) + (stryMutAct_9fa48("4483") ? "" : (stryCov_9fa48("4483"), '  -H "Content-Type: application/json" \\\n')) + (stryMutAct_9fa48("4484") ? "" : (stryCov_9fa48("4484"), '  -d \'{"email":"user@example.com","password":"securepass123"}\'\n\n')) + (stryMutAct_9fa48("4485") ? "" : (stryCov_9fa48("4485"), '# Login\n')) + (stryMutAct_9fa48("4486") ? "" : (stryCov_9fa48("4486"), 'curl -X POST https://api.scoopdope.com/v1/auth/login \\\n')) + (stryMutAct_9fa48("4487") ? "" : (stryCov_9fa48("4487"), '  -H "Content-Type: application/json" \\\n')) + (stryMutAct_9fa48("4488") ? "" : (stryCov_9fa48("4488"), '  -d \'{"email":"user@example.com","password":"securepass123"}\'\n\n')) + (stryMutAct_9fa48("4489") ? "" : (stryCov_9fa48("4489"), '# Use token in subsequent requests\n')) + (stryMutAct_9fa48("4490") ? "" : (stryCov_9fa48("4490"), 'curl -X GET https://api.scoopdope.com/v1/courses \\\n')) + (stryMutAct_9fa48("4491") ? "" : (stryCov_9fa48("4491"), '  -H "Authorization: Bearer <your_access_token>"\n')) + (stryMutAct_9fa48("4492") ? "" : (stryCov_9fa48("4492"), '```'))).setVersion(stryMutAct_9fa48("4493") ? "" : (stryCov_9fa48("4493"), '1.0')).addBearerAuth(stryMutAct_9fa48("4494") ? {} : (stryCov_9fa48("4494"), {
      type: stryMutAct_9fa48("4495") ? "" : (stryCov_9fa48("4495"), 'http'),
      scheme: stryMutAct_9fa48("4496") ? "" : (stryCov_9fa48("4496"), 'bearer'),
      bearerFormat: stryMutAct_9fa48("4497") ? "" : (stryCov_9fa48("4497"), 'JWT'),
      description: stryMutAct_9fa48("4498") ? "" : (stryCov_9fa48("4498"), 'Enter JWT token obtained from /v1/auth/login')
    }), stryMutAct_9fa48("4499") ? "" : (stryCov_9fa48("4499"), 'JWT-auth')).addApiKey(stryMutAct_9fa48("4500") ? {} : (stryCov_9fa48("4500"), {
      type: stryMutAct_9fa48("4501") ? "" : (stryCov_9fa48("4501"), 'apiKey'),
      in: stryMutAct_9fa48("4502") ? "" : (stryCov_9fa48("4502"), 'header'),
      name: stryMutAct_9fa48("4503") ? "" : (stryCov_9fa48("4503"), 'X-API-KEY')
    }), stryMutAct_9fa48("4504") ? "" : (stryCov_9fa48("4504"), 'X-API-KEY')).addServer(stryMutAct_9fa48("4505") ? "" : (stryCov_9fa48("4505"), '/v1'), stryMutAct_9fa48("4506") ? "" : (stryCov_9fa48("4506"), 'API v1')).build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(stryMutAct_9fa48("4507") ? "" : (stryCov_9fa48("4507"), 'api/docs'), app, document);

    // Export OpenAPI spec for static hosting
    if (stryMutAct_9fa48("4510") ? process.env.EXPORT_OPENAPI === 'true' && process.argv.includes('--export-openapi') : stryMutAct_9fa48("4509") ? false : stryMutAct_9fa48("4508") ? true : (stryCov_9fa48("4508", "4509", "4510"), (stryMutAct_9fa48("4512") ? process.env.EXPORT_OPENAPI !== 'true' : stryMutAct_9fa48("4511") ? false : (stryCov_9fa48("4511", "4512"), process.env.EXPORT_OPENAPI === (stryMutAct_9fa48("4513") ? "" : (stryCov_9fa48("4513"), 'true')))) || process.argv.includes(stryMutAct_9fa48("4514") ? "" : (stryCov_9fa48("4514"), '--export-openapi')))) {
      if (stryMutAct_9fa48("4515")) {
        {}
      } else {
        stryCov_9fa48("4515");
        const outputPath = join(__dirname, stryMutAct_9fa48("4516") ? "" : (stryCov_9fa48("4516"), '..'), stryMutAct_9fa48("4517") ? "" : (stryCov_9fa48("4517"), 'openapi.json'));
        writeFileSync(outputPath, JSON.stringify(document, null, 2));
        logger.log(stryMutAct_9fa48("4518") ? `` : (stryCov_9fa48("4518"), `OpenAPI spec exported to ${outputPath}`));
        process.exit(0);
      }
    }
    await app.listen(stryMutAct_9fa48("4519") ? port && 3000 : (stryCov_9fa48("4519"), port ?? 3000));
    logger.log(stryMutAct_9fa48("4520") ? `` : (stryCov_9fa48("4520"), `scoopdope API running on port ${port} [${nodeEnv}]`));
  }
}
bootstrap();