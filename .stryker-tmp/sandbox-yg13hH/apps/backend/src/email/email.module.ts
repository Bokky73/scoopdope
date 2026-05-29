import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailQueue } from './email-queue.entity';
import { EmailPreference } from './email-preference.entity';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
@Module({
  imports: [TypeOrmModule.forFeature([EmailQueue, EmailPreference])],
  providers: [EmailService],
  controllers: [EmailController],
  exports: [EmailService]
})
export class EmailModule {}