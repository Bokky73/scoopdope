import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { SecretRotation } from './secret-rotation.entity';
import { SecretRotationService } from './secret-rotation.service';
import { SecretRotationController } from './secret-rotation.controller';
import { ApiKey } from '../auth/api-key.entity';
@Module({
  imports: [ScheduleModule.forRoot(), TypeOrmModule.forFeature([SecretRotation, ApiKey])],
  providers: [SecretRotationService],
  controllers: [SecretRotationController],
  exports: [SecretRotationService]
})
export class SecretRotationModule {}