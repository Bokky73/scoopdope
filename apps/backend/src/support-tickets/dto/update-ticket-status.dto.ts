import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TicketStatus } from '../support-ticket.entity';

export class UpdateTicketStatusDto {
  @ApiProperty({ enum: TicketStatus, description: 'New ticket status' })
  @IsEnum(TicketStatus)
  status: TicketStatus;
}
