import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProgressSyncGateway } from './progress-sync.gateway';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret'),
        signOptions: { expiresIn: config.get<string>('jwt.expiresIn') || '7d' },
      }),
    }),
  ],
  providers: [ProgressSyncGateway],
  exports: [ProgressSyncGateway],
})
export class ProgressSyncModule {}
