// @ts-nocheck
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModerationItem } from './moderation-item.entity';
import { ModerationLog } from './moderation-log.entity';
import { ModerationService } from './moderation.service';
import { ModerationController } from './moderation.controller';
@Module({
  imports: [TypeOrmModule.forFeature([ModerationItem, ModerationLog])],
  providers: [ModerationService],
  controllers: [ModerationController],
  exports: [ModerationService]
})
export class ModerationModule {}