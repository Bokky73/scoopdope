import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { SupportTicketsService } from './support-tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CreateTicketReplyDto } from './dto/create-ticket-reply.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { TicketQueryDto } from './dto/ticket-query.dto';

@ApiTags('support-tickets')
@Controller('support-tickets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SupportTicketsController {
  constructor(private readonly supportTicketsService: SupportTicketsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a support ticket' })
  @ApiResponse({ status: 201, description: 'Ticket created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  createTicket(
    @Body() dto: CreateTicketDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.supportTicketsService.createTicket(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get current user\'s support tickets' })
  @ApiResponse({ status: 200, description: 'Returns paginated student tickets' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  getMyTickets(
    @Query() query: TicketQueryDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.supportTicketsService.findStudentTickets(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific support ticket' })
  @ApiResponse({ status: 200, description: 'Returns the support ticket with replies' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  getTicket(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    // Admins can view any ticket; students only their own
    if (user.role === 'admin') {
      return this.supportTicketsService.findTicketById(id);
    }
    return this.supportTicketsService.findTicketForStudent(id, user.id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update ticket status (admin only)' })
  @ApiResponse({ status: 200, description: 'Status updated and student notified' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTicketStatusDto,
  ) {
    return this.supportTicketsService.updateStatus(id, dto);
  }

  @Post(':id/replies')
  @ApiOperation({ summary: 'Reply to a support ticket' })
  @ApiResponse({ status: 201, description: 'Reply added' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  addReply(
    @Param('id') ticketId: string,
    @Body() dto: CreateTicketReplyDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    const isAdmin = user.role === 'admin';
    return this.supportTicketsService.addReply(ticketId, user.id, dto, isAdmin);
  }
}
