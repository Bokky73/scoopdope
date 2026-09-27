import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportTicket } from './support-ticket.entity';
import { TicketReply } from './ticket-reply.entity';
import { SupportTicketsService } from './support-tickets.service';
import { SupportTicketsController } from './support-tickets.controller';
import { AdminSupportTicketsController } from './admin-support-tickets.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SupportTicket, TicketReply]),
    forwardRef(() => NotificationsModule),
  ],
  providers: [SupportTicketsService],
  controllers: [SupportTicketsController, AdminSupportTicketsController],
  exports: [SupportTicketsService],
})
export class SupportTicketsModule {}
