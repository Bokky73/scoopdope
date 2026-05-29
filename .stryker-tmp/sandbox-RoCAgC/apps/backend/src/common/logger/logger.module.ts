// @ts-nocheck
import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
@Module({
  imports: [WinstonModule.forRootAsync({
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
      const logLevel = configService.get<string>('LOG_LEVEL', 'info');
      const nodeEnv = configService.get<string>('NODE_ENV', 'development');

      // Define log format based on environment
      const logFormat = nodeEnv === 'production' ? winston.format.combine(winston.format.timestamp(), winston.format.errors({
        stack: true
      }), winston.format.json()) : winston.format.combine(winston.format.timestamp(), winston.format.errors({
        stack: true
      }), winston.format.colorize(), winston.format.printf(({
        timestamp,
        level,
        message,
        context,
        ...meta
      }) => {
        const contextStr = context ? `[${context}] ` : '';
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return `${timestamp} ${level}: ${contextStr}${message}${metaStr}`;
      }));
      return {
        level: logLevel,
        format: logFormat,
        transports: [
        // Console transport - logs to stdout for container orchestrators
        new winston.transports.Console({
          handleExceptions: true,
          handleRejections: true
        })],
        exitOnError: false
      };
    }
  })],
  exports: [WinstonModule]
})
export class LoggerModule {}