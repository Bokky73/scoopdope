import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { SupportTicketsService } from './support-tickets.service';
import { TicketQueryDto } from './dto/ticket-query.dto';

@ApiTags('admin-support-tickets')
@Controller('admin/support-tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class AdminSupportTicketsController {
  constructor(private readonly supportTicketsService: SupportTicketsService) {}

  @Get()
  @ApiOperation({ summary: 'List all support tickets (admin view)' })
  @ApiResponse({ status: 200, description: 'Returns all paginated support tickets with student info' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  getAllTickets(@Query() query: TicketQueryDto) {
    return this.supportTicketsService.findAllTickets(query);
  }
}
