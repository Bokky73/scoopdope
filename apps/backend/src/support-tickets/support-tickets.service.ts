import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportTicket, TicketStatus } from './support-ticket.entity';
import { TicketReply } from './ticket-reply.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CreateTicketReplyDto } from './dto/create-ticket-reply.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { TicketQueryDto } from './dto/ticket-query.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';

@Injectable()
export class SupportTicketsService {
  constructor(
    @InjectRepository(SupportTicket)
    private readonly ticketRepo: Repository<SupportTicket>,
    @InjectRepository(TicketReply)
    private readonly replyRepo: Repository<TicketReply>,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}

  async createTicket(studentId: string, dto: CreateTicketDto): Promise<SupportTicket> {
    const ticket = this.ticketRepo.create({
      studentId,
      subject: dto.subject,
      description: dto.description,
      status: TicketStatus.OPEN,
    });
    return this.ticketRepo.save(ticket);
  }

  async findStudentTickets(studentId: string, query: TicketQueryDto) {
    const { page = 1, limit = 20, status } = query;

    const qb = this.ticketRepo
      .createQueryBuilder('ticket')
      .where('ticket.studentId = :studentId', { studentId })
      .leftJoinAndSelect('ticket.replies', 'replies')
      .orderBy('ticket.createdAt', 'DESC');

    if (status) {
      qb.andWhere('ticket.status = :status', { status });
    }

    const total = await qb.clone().getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total, page, limit };
  }

  async findAllTickets(query: TicketQueryDto) {
    const { page = 1, limit = 20, status } = query;

    const qb = this.ticketRepo
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.student', 'student')
      .leftJoinAndSelect('ticket.replies', 'replies')
      .orderBy('ticket.createdAt', 'DESC');

    if (status) {
      qb.andWhere('ticket.status = :status', { status });
    }

    const total = await qb.clone().getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total, page, limit };
  }

  async findTicketById(id: string): Promise<SupportTicket> {
    const ticket = await this.ticketRepo.findOne({
      where: { id },
      relations: ['student', 'replies', 'replies.author'],
    });
    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }
    return ticket;
  }

  async findTicketForStudent(id: string, studentId: string): Promise<SupportTicket> {
    const ticket = await this.findTicketById(id);
    if (ticket.studentId !== studentId) {
      throw new ForbiddenException('Access denied');
    }
    return ticket;
  }

  async updateStatus(
    id: string,
    dto: UpdateTicketStatusDto,
  ): Promise<SupportTicket> {
    const ticket = await this.findTicketById(id);
    const previousStatus = ticket.status;
    ticket.status = dto.status;
    const saved = await this.ticketRepo.save(ticket);

    // Notify the student of status change
    if (previousStatus !== dto.status) {
      const humanStatus = dto.status.replace(/_/g, ' ');
      await this.notificationsService
        .create(
          ticket.studentId,
          NotificationType.SUPPORT_TICKET_UPDATE,
          `Your support ticket "${ticket.subject}" status changed to: ${humanStatus}`,
        )
        .catch(() => {});
    }

    return saved;
  }

  async addReply(
    ticketId: string,
    authorId: string,
    dto: CreateTicketReplyDto,
    isAdmin = false,
  ): Promise<TicketReply> {
    const ticket = await this.findTicketById(ticketId);

    // Students can only reply to their own tickets
    if (!isAdmin && ticket.studentId !== authorId) {
      throw new ForbiddenException('Access denied');
    }

    const reply = this.replyRepo.create({
      ticketId,
      authorId,
      content: dto.content,
    });
    const saved = await this.replyRepo.save(reply);

    // If support/admin replies, notify the student
    if (isAdmin && ticket.studentId !== authorId) {
      await this.notificationsService
        .create(
          ticket.studentId,
          NotificationType.SUPPORT_TICKET_UPDATE,
          `A support agent replied to your ticket: "${ticket.subject}"`,
        )
        .catch(() => {});
    }

    // Auto-move to in_progress when support replies to an open ticket
    if (isAdmin && ticket.status === TicketStatus.OPEN) {
      ticket.status = TicketStatus.IN_PROGRESS;
      await this.ticketRepo.save(ticket);
    }

    return saved;
  }
}
