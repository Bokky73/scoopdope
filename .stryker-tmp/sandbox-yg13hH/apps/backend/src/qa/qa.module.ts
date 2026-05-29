import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QaQuestion } from './qa-question.entity';
import { QaService } from './qa.service';
import { QaController } from './qa.controller';
import { NotificationsModule } from '../notifications/notifications.module';
@Module({
  imports: [TypeOrmModule.forFeature([QaQuestion]), NotificationsModule],
  providers: [QaService],
  controllers: [QaController]
})
export class QaModule {}