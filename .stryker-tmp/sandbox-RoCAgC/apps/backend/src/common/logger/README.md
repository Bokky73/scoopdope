# Winston Logging Implementation

This directory contains the Winston logging implementation for the scoopdope backend API.

## Features

- ✅ **Structured Logging**: JSON format in production, colorized format in development
- ✅ **Log Levels**: error, warn, info, debug, verbose
- ✅ **Environment Configuration**: LOG_LEVEL environment variable support
- ✅ **Context Support**: Child loggers with context prefixes
- ✅ **Container-Ready**: Logs to stdout for container orchestrators
- ✅ **NestJS Integration**: Full integration with NestJS logging system

## Configuration

### Environment Variables

```bash
LOG_LEVEL=info  # Options: error, warn, info, debug, verbose
NODE_ENV=production  # Affects log format (JSON vs colorized)
```

### Log Levels (in order of priority)

1. **error** - Error conditions
2. **warn** - Warning conditions  
3. **info** - Informational messages (default)
4. **debug** - Debug-level messages
5. **verbose** - Verbose debug information

## Usage

### In Services

```typescript
import { Injectable } from '@nestjs/common';
import { CustomLoggerService } from '../common/logger';

@Injectable()
export class MyService {
  private readonly logger = new CustomLoggerService();

  constructor() {
    this.logger.setContext('MyService');
  }

  async someMethod() {
    this.logger.info('Operation started');
    
    try {
      // Your code here
      this.logger.debug('Debug information');
    } catch (error) {
      this.logger.error('Operation failed', error.stack);
    }
  }
}
```

### Child Loggers

```typescript
const childLogger = this.logger.child('SpecificContext');
childLogger.info('Message with specific context');
```

## Log Formats

### Development (NODE_ENV=development)
```
2024-01-15T10:30:45.123Z info: [MyService] Operation started
2024-01-15T10:30:45.124Z error: [MyService] Operation failed {"stack":"Error: ..."}
```

### Production (NODE_ENV=production)
```json
{"timestamp":"2024-01-15T10:30:45.123Z","level":"info","message":"Operation started","context":"MyService"}
{"timestamp":"2024-01-15T10:30:45.124Z","level":"error","message":"Operation failed","context":"MyService","stack":"Error: ..."}
```

## Integration

The logger is automatically configured in `app.module.ts` and set as the default NestJS logger in `main.ts`. All NestJS internal logging will use Winston.

## Container Orchestration

Logs are sent to stdout, making them compatible with:
- Docker containers
- Kubernetes
- Docker Compose
- Cloud logging services (AWS CloudWatch, Google Cloud Logging, etc.)

## Migration from console.log

Replace all `console.log`, `console.error`, `console.warn`, etc. with the appropriate logger methods:

```typescript
// Before
console.log('User logged in');
console.error('Database connection failed', error);

// After  
this.logger.info('User logged in');
this.logger.error('Database connection failed', error.stack);
```