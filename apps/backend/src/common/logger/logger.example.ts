import { Injectable } from '@nestjs/common';
import { CustomLoggerService } from './logger.service';

/**
 * Example service demonstrating how to use the Winston logger
 * This file shows the proper way to inject and use the logger in services
 */
@Injectable()
export class ExampleService {
  private readonly logger = new CustomLoggerService(null as any);

  constructor() {
    this.logger.setContext('ExampleService');
  }

  async exampleMethod() {
    // Different log levels
    this.logger.debug('Debug message with context');
    this.logger.info('Info message - operation started');
    this.logger.warn('Warning message - something might be wrong');

    try {
      // Simulate some operation
      throw new Error('Example error for demonstration');
    } catch (error) {
      const message = error instanceof Error ? error.stack : String(error);
      this.logger.error('Error occurred in example method', message);
    }

    // Using child logger for specific context
    const childLogger = this.logger.child('ChildContext');
    childLogger.info('Message from child logger');
  }
}
