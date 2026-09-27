import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DistributedLockService } from '../common/distributed-lock.service';
import { LiveSession, SessionStatus } from './live-session.entity';
import { CohortMember } from '../cohorts/cohort-member.entity';
import { User } from '../users/user.entity';
import { SessionJoin } from './session-join.entity';
import { CreateLiveSessionDto, UpdateLiveSessionDto } from './live-session.dto';
import { EmailService } from '../email/email.service';
import { emailTemplates } from '../email/email.templates';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LiveSessionsService {
  private readonly logger = new Logger(LiveSessionsService.name);

  constructor(
    @InjectRepository(LiveSession) private repo: Repository<LiveSession>,
    @InjectRepository(CohortMember) private memberRepo: Repository<CohortMember>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(SessionJoin) private joinRepo: Repository<SessionJoin>,
    private emailService: EmailService,
    private config: ConfigService,
    private readonly distributedLockService: DistributedLockService,
  ) {}

  findByCohort(cohortId: string): Promise<LiveSession[]> {
    return this.repo.find({ where: { cohortId }, order: { scheduledAt: 'ASC' } });
  }

  async findOne(id: string): Promise<LiveSession> {
    const session = await this.repo.findOne({ where: { id } });
    if (!session) throw new NotFoundException('Live session not found');
    return session;
  }

  async create(cohortId: string, instructorId: string, dto: CreateLiveSessionDto): Promise<LiveSession> {
    const session = this.repo.create({
      cohortId,
      instructorId,
      ...dto,
      scheduledAt: new Date(dto.scheduledAt),
    });
    const saved = await this.repo.save(session);
    await this.sendCalendarInvites(saved);
    return saved;
  }

  async update(id: string, instructorId: string, dto: UpdateLiveSessionDto): Promise<LiveSession> {
    const session = await this.findOne(id);
    if (session.instructorId !== instructorId) throw new ForbiddenException();
    if (dto.scheduledAt) (dto as any).scheduledAt = new Date(dto.scheduledAt);
    Object.assign(session, dto);
    return this.repo.save(session);
  }

  async cancel(id: string, instructorId: string): Promise<LiveSession> {
    const session = await this.findOne(id);
    if (session.instructorId !== instructorId) throw new ForbiddenException();
    session.status = SessionStatus.CANCELLED;
    return this.repo.save(session);
  }

  // ── Session Joining ────────────────────────────────────────────────────────

  async joinSession(sessionId: string, userId: string): Promise<SessionJoin> {
    // Verify session exists and is not cancelled
    const session = await this.findOne(sessionId);
    if (session.status === SessionStatus.CANCELLED) {
      throw new ForbiddenException('This session has been cancelled');
    }

    // Check if user is enrolled in the cohort
    const isMember = await this.memberRepo.findOne({
      where: { cohortId: session.cohortId, userId },
    });
    if (!isMember) {
      throw new ForbiddenException('You are not enrolled in this cohort');
    }

    // Check capacity
    const currentAttendees = await this.joinRepo.count({
      where: { sessionId },
    });
    if (currentAttendees >= session.maxCapacity) {
      throw new ForbiddenException(
        `Session is at full capacity (${session.maxCapacity}/${session.maxCapacity})`,
      );
    }

    // Check if user already joined (idempotent)
    let join = await this.joinRepo.findOne({
      where: { sessionId, userId },
    });
    if (join) {
      return join; // Already joined, return existing record
    }

    // Create join record
    join = this.joinRepo.create({
      sessionId,
      userId,
      joinToken: `join-token-${sessionId}-${userId}-${Date.now()}`,
    });

    return this.joinRepo.save(join);
  }

  async getSessionAttendees(sessionId: string): Promise<SessionJoin[]> {
    return this.joinRepo.find({
      where: { sessionId },
      relations: ['user'],
      order: { joinedAt: 'ASC' },
    });
  }

  // ── Reminders ─────────────────────────────────────────────────────────────

  @Cron(CronExpression.EVERY_MINUTE)
  async sendReminders(): Promise<void> {
    const lockKey = 'lock:cron:liveSessions:sendReminders';
    const result = await this.distributedLockService.withLock(lockKey, async () => {
      const now = new Date();
      const upcoming = await this.repo.find({
        where: { status: SessionStatus.SCHEDULED, scheduledAt: MoreThan(now) },
      });

      for (const session of upcoming) {
        const msUntil = session.scheduledAt.getTime() - now.getTime();
        const hoursUntil = msUntil / 3_600_000;
        const sent = session.remindersSent ?? [];

        const toSend: string[] = [];
        if (hoursUntil <= 24 && hoursUntil > 23 && !sent.includes('24h')) toSend.push('24h');
        if (hoursUntil <= 1 && hoursUntil > 0 && !sent.includes('1h')) toSend.push('1h');

        for (const label of toSend) {
          await this.notifyMembers(session, label);
          sent.push(label);
        }

        if (toSend.length) {
          session.remindersSent = sent;
          await this.repo.save(session);
        }
      }
    }, 60);

    if (result === null) {
      this.logger.debug('Skipping live session reminders because another instance holds the lock');
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private async getMembers(cohortId: string): Promise<User[]> {
    const members = await this.memberRepo.find({ where: { cohortId } });
    if (!members.length) return [];
    return this.userRepo.findByIds(members.map((m) => m.userId));
  }

  private async sendCalendarInvites(session: LiveSession): Promise<void> {
    const users = await this.getMembers(session.cohortId);
    const frontendUrl = this.config.get<string>('frontend.url') ?? 'http://localhost:3001';
    const icsContent = this.buildIcs(session, frontendUrl);
    const date = session.scheduledAt.toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });

    for (const user of users) {
      const template = emailTemplates.calendarInvite({
        userName: user.username ?? user.email,
        sessionTitle: session.title,
        date,
        duration: session.durationMinutes,
        joinUrl: session.meetingUrl,
        sessionUrl: `${frontendUrl}/live-sessions/${session.id}`,
      });

      await this.emailService.enqueue(user.email, template.subject, template.html);
    }
    this.logger.log(`Calendar invites sent for session "${session.title}" to ${users.length} member(s)`);
  }

  private async notifyMembers(session: LiveSession, label: string): Promise<void> {
    const users = await this.getMembers(session.cohortId);
    const frontendUrl = this.config.get<string>('frontend.url') ?? 'http://localhost:3001';
    const timeLabel = label === '24h' ? '24 hours' : '1 hour';
    const date = session.scheduledAt.toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });

    for (const user of users) {
      const template = emailTemplates.liveSessionReminder({
        userName: user.username ?? user.email,
        sessionTitle: session.title,
        date,
        timeLabel,
        joinUrl: session.meetingUrl || '',
        sessionUrl: `${frontendUrl}/live-sessions/${session.id}`,
      });

      await this.emailService.enqueue(user.email, template.subject, template.html);
    }
    this.logger.log(`${label} reminders sent for session "${session.title}" to ${users.length} member(s)`);
  }

  private buildIcs(session: LiveSession, frontendUrl: string): string {
    const start = session.scheduledAt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const end = new Date(session.scheduledAt.getTime() + session.durationMinutes * 60_000)
      .toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const uid = `${session.id}@scoopdope`;
    const location = session.meetingUrl ?? `${frontendUrl}/live-sessions/${session.id}`;

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//scoopdope//EN',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${session.title}`,
      `DESCRIPTION:${session.description ?? ''}`,
      `LOCATION:${location}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
  }
}
