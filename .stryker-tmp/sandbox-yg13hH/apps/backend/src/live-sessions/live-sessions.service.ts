function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LiveSession, SessionStatus } from './live-session.entity';
import { CohortMember } from '../cohorts/cohort-member.entity';
import { User } from '../users/user.entity';
import { CreateLiveSessionDto, UpdateLiveSessionDto } from './live-session.dto';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class LiveSessionsService {
  private readonly logger = new Logger(LiveSessionsService.name);
  constructor(@InjectRepository(LiveSession)
  private repo: Repository<LiveSession>, @InjectRepository(CohortMember)
  private memberRepo: Repository<CohortMember>, @InjectRepository(User)
  private userRepo: Repository<User>, private emailService: EmailService, private config: ConfigService) {}
  findByCohort(cohortId: string): Promise<LiveSession[]> {
    if (stryMutAct_9fa48("4246")) {
      {}
    } else {
      stryCov_9fa48("4246");
      return this.repo.find(stryMutAct_9fa48("4247") ? {} : (stryCov_9fa48("4247"), {
        where: stryMutAct_9fa48("4248") ? {} : (stryCov_9fa48("4248"), {
          cohortId
        }),
        order: stryMutAct_9fa48("4249") ? {} : (stryCov_9fa48("4249"), {
          scheduledAt: stryMutAct_9fa48("4250") ? "" : (stryCov_9fa48("4250"), 'ASC')
        })
      }));
    }
  }
  async findOne(id: string): Promise<LiveSession> {
    if (stryMutAct_9fa48("4251")) {
      {}
    } else {
      stryCov_9fa48("4251");
      const session = await this.repo.findOne(stryMutAct_9fa48("4252") ? {} : (stryCov_9fa48("4252"), {
        where: stryMutAct_9fa48("4253") ? {} : (stryCov_9fa48("4253"), {
          id
        })
      }));
      if (stryMutAct_9fa48("4256") ? false : stryMutAct_9fa48("4255") ? true : stryMutAct_9fa48("4254") ? session : (stryCov_9fa48("4254", "4255", "4256"), !session)) throw new NotFoundException(stryMutAct_9fa48("4257") ? "" : (stryCov_9fa48("4257"), 'Live session not found'));
      return session;
    }
  }
  async create(cohortId: string, instructorId: string, dto: CreateLiveSessionDto): Promise<LiveSession> {
    if (stryMutAct_9fa48("4258")) {
      {}
    } else {
      stryCov_9fa48("4258");
      const session = this.repo.create(stryMutAct_9fa48("4259") ? {} : (stryCov_9fa48("4259"), {
        cohortId,
        instructorId,
        ...dto,
        scheduledAt: new Date(dto.scheduledAt)
      }));
      const saved = await this.repo.save(session);
      await this.sendCalendarInvites(saved);
      return saved;
    }
  }
  async update(id: string, instructorId: string, dto: UpdateLiveSessionDto): Promise<LiveSession> {
    if (stryMutAct_9fa48("4260")) {
      {}
    } else {
      stryCov_9fa48("4260");
      const session = await this.findOne(id);
      if (stryMutAct_9fa48("4263") ? session.instructorId === instructorId : stryMutAct_9fa48("4262") ? false : stryMutAct_9fa48("4261") ? true : (stryCov_9fa48("4261", "4262", "4263"), session.instructorId !== instructorId)) throw new ForbiddenException();
      if (stryMutAct_9fa48("4265") ? false : stryMutAct_9fa48("4264") ? true : (stryCov_9fa48("4264", "4265"), dto.scheduledAt)) (dto as any).scheduledAt = new Date(dto.scheduledAt);
      Object.assign(session, dto);
      return this.repo.save(session);
    }
  }
  async cancel(id: string, instructorId: string): Promise<LiveSession> {
    if (stryMutAct_9fa48("4266")) {
      {}
    } else {
      stryCov_9fa48("4266");
      const session = await this.findOne(id);
      if (stryMutAct_9fa48("4269") ? session.instructorId === instructorId : stryMutAct_9fa48("4268") ? false : stryMutAct_9fa48("4267") ? true : (stryCov_9fa48("4267", "4268", "4269"), session.instructorId !== instructorId)) throw new ForbiddenException();
      session.status = SessionStatus.CANCELLED;
      return this.repo.save(session);
    }
  }

  // ── Reminders ─────────────────────────────────────────────────────────────

  @Cron(CronExpression.EVERY_MINUTE)
  async sendReminders(): Promise<void> {
    if (stryMutAct_9fa48("4270")) {
      {}
    } else {
      stryCov_9fa48("4270");
      const now = new Date();
      const upcoming = await this.repo.find(stryMutAct_9fa48("4271") ? {} : (stryCov_9fa48("4271"), {
        where: stryMutAct_9fa48("4272") ? {} : (stryCov_9fa48("4272"), {
          status: SessionStatus.SCHEDULED,
          scheduledAt: MoreThan(now)
        })
      }));
      for (const session of upcoming) {
        if (stryMutAct_9fa48("4273")) {
          {}
        } else {
          stryCov_9fa48("4273");
          const msUntil = stryMutAct_9fa48("4274") ? session.scheduledAt.getTime() + now.getTime() : (stryCov_9fa48("4274"), session.scheduledAt.getTime() - now.getTime());
          const hoursUntil = stryMutAct_9fa48("4275") ? msUntil * 3_600_000 : (stryCov_9fa48("4275"), msUntil / 3_600_000);
          const sent = stryMutAct_9fa48("4276") ? session.remindersSent && [] : (stryCov_9fa48("4276"), session.remindersSent ?? (stryMutAct_9fa48("4277") ? ["Stryker was here"] : (stryCov_9fa48("4277"), [])));
          const toSend: string[] = stryMutAct_9fa48("4278") ? ["Stryker was here"] : (stryCov_9fa48("4278"), []);
          if (stryMutAct_9fa48("4281") ? hoursUntil <= 24 && hoursUntil > 23 || !sent.includes('24h') : stryMutAct_9fa48("4280") ? false : stryMutAct_9fa48("4279") ? true : (stryCov_9fa48("4279", "4280", "4281"), (stryMutAct_9fa48("4283") ? hoursUntil <= 24 || hoursUntil > 23 : stryMutAct_9fa48("4282") ? true : (stryCov_9fa48("4282", "4283"), (stryMutAct_9fa48("4286") ? hoursUntil > 24 : stryMutAct_9fa48("4285") ? hoursUntil < 24 : stryMutAct_9fa48("4284") ? true : (stryCov_9fa48("4284", "4285", "4286"), hoursUntil <= 24)) && (stryMutAct_9fa48("4289") ? hoursUntil <= 23 : stryMutAct_9fa48("4288") ? hoursUntil >= 23 : stryMutAct_9fa48("4287") ? true : (stryCov_9fa48("4287", "4288", "4289"), hoursUntil > 23)))) && (stryMutAct_9fa48("4290") ? sent.includes('24h') : (stryCov_9fa48("4290"), !sent.includes(stryMutAct_9fa48("4291") ? "" : (stryCov_9fa48("4291"), '24h')))))) toSend.push(stryMutAct_9fa48("4292") ? "" : (stryCov_9fa48("4292"), '24h'));
          if (stryMutAct_9fa48("4295") ? hoursUntil <= 1 && hoursUntil > 0 || !sent.includes('1h') : stryMutAct_9fa48("4294") ? false : stryMutAct_9fa48("4293") ? true : (stryCov_9fa48("4293", "4294", "4295"), (stryMutAct_9fa48("4297") ? hoursUntil <= 1 || hoursUntil > 0 : stryMutAct_9fa48("4296") ? true : (stryCov_9fa48("4296", "4297"), (stryMutAct_9fa48("4300") ? hoursUntil > 1 : stryMutAct_9fa48("4299") ? hoursUntil < 1 : stryMutAct_9fa48("4298") ? true : (stryCov_9fa48("4298", "4299", "4300"), hoursUntil <= 1)) && (stryMutAct_9fa48("4303") ? hoursUntil <= 0 : stryMutAct_9fa48("4302") ? hoursUntil >= 0 : stryMutAct_9fa48("4301") ? true : (stryCov_9fa48("4301", "4302", "4303"), hoursUntil > 0)))) && (stryMutAct_9fa48("4304") ? sent.includes('1h') : (stryCov_9fa48("4304"), !sent.includes(stryMutAct_9fa48("4305") ? "" : (stryCov_9fa48("4305"), '1h')))))) toSend.push(stryMutAct_9fa48("4306") ? "" : (stryCov_9fa48("4306"), '1h'));
          for (const label of toSend) {
            if (stryMutAct_9fa48("4307")) {
              {}
            } else {
              stryCov_9fa48("4307");
              await this.notifyMembers(session, label);
              sent.push(label);
            }
          }
          if (stryMutAct_9fa48("4309") ? false : stryMutAct_9fa48("4308") ? true : (stryCov_9fa48("4308", "4309"), toSend.length)) {
            if (stryMutAct_9fa48("4310")) {
              {}
            } else {
              stryCov_9fa48("4310");
              session.remindersSent = sent;
              await this.repo.save(session);
            }
          }
        }
      }
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private async getMembers(cohortId: string): Promise<User[]> {
    if (stryMutAct_9fa48("4311")) {
      {}
    } else {
      stryCov_9fa48("4311");
      const members = await this.memberRepo.find(stryMutAct_9fa48("4312") ? {} : (stryCov_9fa48("4312"), {
        where: stryMutAct_9fa48("4313") ? {} : (stryCov_9fa48("4313"), {
          cohortId
        })
      }));
      if (stryMutAct_9fa48("4316") ? false : stryMutAct_9fa48("4315") ? true : stryMutAct_9fa48("4314") ? members.length : (stryCov_9fa48("4314", "4315", "4316"), !members.length)) return stryMutAct_9fa48("4317") ? ["Stryker was here"] : (stryCov_9fa48("4317"), []);
      return this.userRepo.findByIds(members.map(stryMutAct_9fa48("4318") ? () => undefined : (stryCov_9fa48("4318"), m => m.userId)));
    }
  }
  private async sendCalendarInvites(session: LiveSession): Promise<void> {
    if (stryMutAct_9fa48("4319")) {
      {}
    } else {
      stryCov_9fa48("4319");
      const users = await this.getMembers(session.cohortId);
      const frontendUrl = this.config.get<string>(stryMutAct_9fa48("4320") ? "" : (stryCov_9fa48("4320"), 'frontend.url'));
      const icsContent = this.buildIcs(session, frontendUrl);
      for (const user of users) {
        if (stryMutAct_9fa48("4321")) {
          {}
        } else {
          stryCov_9fa48("4321");
          await this.emailService.enqueue(user.email, stryMutAct_9fa48("4322") ? `` : (stryCov_9fa48("4322"), `📅 Live Session: ${session.title}`), this.calendarInviteHtml(session, stryMutAct_9fa48("4323") ? user.username && user.email : (stryCov_9fa48("4323"), user.username ?? user.email), frontendUrl, icsContent));
        }
      }
      this.logger.log(stryMutAct_9fa48("4324") ? `` : (stryCov_9fa48("4324"), `Calendar invites sent for session "${session.title}" to ${users.length} member(s)`));
    }
  }
  private async notifyMembers(session: LiveSession, label: string): Promise<void> {
    if (stryMutAct_9fa48("4325")) {
      {}
    } else {
      stryCov_9fa48("4325");
      const users = await this.getMembers(session.cohortId);
      const frontendUrl = this.config.get<string>(stryMutAct_9fa48("4326") ? "" : (stryCov_9fa48("4326"), 'frontend.url'));
      const timeLabel = (stryMutAct_9fa48("4329") ? label !== '24h' : stryMutAct_9fa48("4328") ? false : stryMutAct_9fa48("4327") ? true : (stryCov_9fa48("4327", "4328", "4329"), label === (stryMutAct_9fa48("4330") ? "" : (stryCov_9fa48("4330"), '24h')))) ? stryMutAct_9fa48("4331") ? "" : (stryCov_9fa48("4331"), '24 hours') : stryMutAct_9fa48("4332") ? "" : (stryCov_9fa48("4332"), '1 hour');
      for (const user of users) {
        if (stryMutAct_9fa48("4333")) {
          {}
        } else {
          stryCov_9fa48("4333");
          await this.emailService.enqueue(user.email, stryMutAct_9fa48("4334") ? `` : (stryCov_9fa48("4334"), `⏰ Reminder: "${session.title}" starts in ${timeLabel}`), this.reminderHtml(session, stryMutAct_9fa48("4335") ? user.username && user.email : (stryCov_9fa48("4335"), user.username ?? user.email), timeLabel, frontendUrl));
        }
      }
      this.logger.log(stryMutAct_9fa48("4336") ? `` : (stryCov_9fa48("4336"), `${label} reminders sent for session "${session.title}" to ${users.length} member(s)`));
    }
  }
  private buildIcs(session: LiveSession, frontendUrl: string): string {
    if (stryMutAct_9fa48("4337")) {
      {}
    } else {
      stryCov_9fa48("4337");
      const start = session.scheduledAt.toISOString().replace(stryMutAct_9fa48("4338") ? /[^-:]/g : (stryCov_9fa48("4338"), /[-:]/g), stryMutAct_9fa48("4339") ? "Stryker was here!" : (stryCov_9fa48("4339"), '')).split(stryMutAct_9fa48("4340") ? "" : (stryCov_9fa48("4340"), '.'))[0] + (stryMutAct_9fa48("4341") ? "" : (stryCov_9fa48("4341"), 'Z'));
      const end = new Date(stryMutAct_9fa48("4342") ? session.scheduledAt.getTime() - session.durationMinutes * 60_000 : (stryCov_9fa48("4342"), session.scheduledAt.getTime() + (stryMutAct_9fa48("4343") ? session.durationMinutes / 60_000 : (stryCov_9fa48("4343"), session.durationMinutes * 60_000)))).toISOString().replace(stryMutAct_9fa48("4344") ? /[^-:]/g : (stryCov_9fa48("4344"), /[-:]/g), stryMutAct_9fa48("4345") ? "Stryker was here!" : (stryCov_9fa48("4345"), '')).split(stryMutAct_9fa48("4346") ? "" : (stryCov_9fa48("4346"), '.'))[0] + (stryMutAct_9fa48("4347") ? "" : (stryCov_9fa48("4347"), 'Z'));
      const uid = stryMutAct_9fa48("4348") ? `` : (stryCov_9fa48("4348"), `${session.id}@scoopdope`);
      const location = stryMutAct_9fa48("4349") ? session.meetingUrl && `${frontendUrl}/live-sessions/${session.id}` : (stryCov_9fa48("4349"), session.meetingUrl ?? (stryMutAct_9fa48("4350") ? `` : (stryCov_9fa48("4350"), `${frontendUrl}/live-sessions/${session.id}`)));
      return (stryMutAct_9fa48("4351") ? [] : (stryCov_9fa48("4351"), [stryMutAct_9fa48("4352") ? "" : (stryCov_9fa48("4352"), 'BEGIN:VCALENDAR'), stryMutAct_9fa48("4353") ? "" : (stryCov_9fa48("4353"), 'VERSION:2.0'), stryMutAct_9fa48("4354") ? "" : (stryCov_9fa48("4354"), 'PRODID:-//scoopdope//EN'), stryMutAct_9fa48("4355") ? "" : (stryCov_9fa48("4355"), 'BEGIN:VEVENT'), stryMutAct_9fa48("4356") ? `` : (stryCov_9fa48("4356"), `UID:${uid}`), stryMutAct_9fa48("4357") ? `` : (stryCov_9fa48("4357"), `DTSTART:${start}`), stryMutAct_9fa48("4358") ? `` : (stryCov_9fa48("4358"), `DTEND:${end}`), stryMutAct_9fa48("4359") ? `` : (stryCov_9fa48("4359"), `SUMMARY:${session.title}`), stryMutAct_9fa48("4360") ? `` : (stryCov_9fa48("4360"), `DESCRIPTION:${stryMutAct_9fa48("4361") ? session.description && '' : (stryCov_9fa48("4361"), session.description ?? (stryMutAct_9fa48("4362") ? "Stryker was here!" : (stryCov_9fa48("4362"), '')))}`), stryMutAct_9fa48("4363") ? `` : (stryCov_9fa48("4363"), `LOCATION:${location}`), stryMutAct_9fa48("4364") ? "" : (stryCov_9fa48("4364"), 'END:VEVENT'), stryMutAct_9fa48("4365") ? "" : (stryCov_9fa48("4365"), 'END:VCALENDAR')])).join(stryMutAct_9fa48("4366") ? "" : (stryCov_9fa48("4366"), '\r\n'));
    }
  }
  private calendarInviteHtml(session: LiveSession, name: string, frontendUrl: string, ics: string): string {
    if (stryMutAct_9fa48("4367")) {
      {}
    } else {
      stryCov_9fa48("4367");
      const date = session.scheduledAt.toLocaleString(stryMutAct_9fa48("4368") ? "" : (stryCov_9fa48("4368"), 'en-US'), stryMutAct_9fa48("4369") ? {} : (stryCov_9fa48("4369"), {
        dateStyle: stryMutAct_9fa48("4370") ? "" : (stryCov_9fa48("4370"), 'full'),
        timeStyle: stryMutAct_9fa48("4371") ? "" : (stryCov_9fa48("4371"), 'short')
      }));
      return stryMutAct_9fa48("4372") ? `` : (stryCov_9fa48("4372"), `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2>📅 You're invited to a live session</h2>
        <p>Hi ${name},</p>
        <p><strong>${session.title}</strong> has been scheduled.</p>
        <ul>
          <li><strong>Date:</strong> ${date}</li>
          <li><strong>Duration:</strong> ${session.durationMinutes} minutes</li>
          ${session.meetingUrl ? stryMutAct_9fa48("4373") ? `` : (stryCov_9fa48("4373"), `<li><strong>Join:</strong> <a href="${session.meetingUrl}">${session.meetingUrl}</a></li>`) : stryMutAct_9fa48("4374") ? "Stryker was here!" : (stryCov_9fa48("4374"), '')}
        </ul>
        <p>Add to your calendar using the attached .ics file.</p>
        <a href="${frontendUrl}/live-sessions/${session.id}" style="background:#4F46E5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">View Session</a>
      </div>`);
    }
  }
  private reminderHtml(session: LiveSession, name: string, timeLabel: string, frontendUrl: string): string {
    if (stryMutAct_9fa48("4375")) {
      {}
    } else {
      stryCov_9fa48("4375");
      const date = session.scheduledAt.toLocaleString(stryMutAct_9fa48("4376") ? "" : (stryCov_9fa48("4376"), 'en-US'), stryMutAct_9fa48("4377") ? {} : (stryCov_9fa48("4377"), {
        dateStyle: stryMutAct_9fa48("4378") ? "" : (stryCov_9fa48("4378"), 'full'),
        timeStyle: stryMutAct_9fa48("4379") ? "" : (stryCov_9fa48("4379"), 'short')
      }));
      return stryMutAct_9fa48("4380") ? `` : (stryCov_9fa48("4380"), `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2>⏰ Session starting in ${timeLabel}</h2>
        <p>Hi ${name},</p>
        <p><strong>${session.title}</strong> starts in ${timeLabel}.</p>
        <ul>
          <li><strong>Date:</strong> ${date}</li>
          ${session.meetingUrl ? stryMutAct_9fa48("4381") ? `` : (stryCov_9fa48("4381"), `<li><strong>Join:</strong> <a href="${session.meetingUrl}">${session.meetingUrl}</a></li>`) : stryMutAct_9fa48("4382") ? "Stryker was here!" : (stryCov_9fa48("4382"), '')}
        </ul>
        <a href="${stryMutAct_9fa48("4383") ? session.meetingUrl && `${frontendUrl}/live-sessions/${session.id}` : (stryCov_9fa48("4383"), session.meetingUrl ?? (stryMutAct_9fa48("4384") ? `` : (stryCov_9fa48("4384"), `${frontendUrl}/live-sessions/${session.id}`)))}" style="background:#059669;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Join Now</a>
      </div>`);
    }
  }
}