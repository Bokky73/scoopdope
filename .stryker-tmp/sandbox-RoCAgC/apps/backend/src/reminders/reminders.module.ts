// @ts-nocheck
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RemindersService } from './reminders.service';
import { RemindersController } from './reminders.controller';
import { Reminder } from './reminder.entity';
import { Enrollment } from '../enrollments/enrollment.entity';
import { MailModule } from '../mail/mail.module';
@Module({
  imports: [TypeOrmModule.forFeature([Reminder, Enrollment]), MailModule],
  providers: [RemindersService],
  controllers: [RemindersController],
  exports: [RemindersService]
})
export class RemindersModule {}