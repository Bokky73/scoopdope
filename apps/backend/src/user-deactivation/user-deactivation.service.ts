import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository, LessThan, IsNull, Not } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { User } from '../users/user.entity';
import { AuditService } from '../audit/audit.service';
import { MailService } from '../mail/mail.service';
import { DistributedLockService } from '../common/distributed-lock.service';

/** Days of inactivity before deactivation. Hardcoded per spec. */
const INACTIVITY_DAYS = 14;

/**
 * Days after warning email before the account is actually deactivated.
 * Users who log in within this window are automatically re-activated.
 */
const WARNING_DAYS = 3;

/** Reactivation token validity window (hours). */
const TOKEN_EXPIRY_HOURS = 48;

@Injectable()
export class UserDeactivationService {
  private readonly logger = new Logger(UserDeactivationService.name);

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private readonly auditService: AuditService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly distributedLockService: DistributedLockService,
  ) {}

  // ── Daily cron job ────────────────────────────────────────────────────────

  /**
   * Runs every day at 02:00 UTC.
   *
   * Pass 1 – Send warning emails to users who have been inactive for
   *           INACTIVITY_DAYS and haven't been warned yet.
   * Pass 2 – Deactivate users who received a warning WARNING_DAYS ago
   *           and still haven't logged in.
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async runDeactivationJob(): Promise<void> {
    const lockKey = 'lock:cron:user-deactivation';
    const result = await this.distributedLockService.withLock(lockKey, async () => {
      this.logger.log('Starting user deactivation job…');
      const warned = await this.sendWarningEmails();
      const deactivated = await this.deactivateInactiveUsers();
      this.logger.log(
        `Deactivation job complete — warned: ${warned}, deactivated: ${deactivated}`,
      );
    }, 120);

    if (result === null) {
      this.logger.debug('Skipping deactivation job — another instance holds the lock');
    }
  }

  // ── Pass 1: send warning emails ───────────────────────────────────────────

  private async sendWarningEmails(): Promise<number> {
    const cutoff = this.daysAgo(INACTIVITY_DAYS);
    let count = 0;

    // Find users who: are active, haven't been warned, have been inactive ≥ 14 days.
    // Exclude manually banned accounts (isBanned) — they are handled separately.
    const users = await this.userRepo.find({
      where: {
        isDeactivated: false,
        isBanned: false,
        deactivationNotifiedAt: IsNull(),
        lastActivityAt: LessThan(cutoff),
      },
      select: ['id', 'email', 'username', 'lastActivityAt'],
    });

    for (const user of users) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

      await this.userRepo.update(user.id, {
        deactivationToken: token,
        deactivationTokenExpiresAt: expiresAt,
        deactivationNotifiedAt: new Date(),
      });

      await this.sendWarningEmail(user.email, user.username ?? 'User', token);

      await this.auditService.log(
        'user.deactivation.warned',
        user.id,
        true,
        { lastActivityAt: user.lastActivityAt, tokenExpiresAt: expiresAt },
      );

      count++;
    }

    return count;
  }

  // ── Pass 2: deactivate warned users who still haven't logged in ──────────

  private async deactivateInactiveUsers(): Promise<number> {
    const warningCutoff = this.daysAgo(WARNING_DAYS);
    let count = 0;

    const users = await this.userRepo.find({
      where: {
        isDeactivated: false,
        isBanned: false,
        deactivationNotifiedAt: LessThan(warningCutoff),
        // deactivationNotifiedAt is non-null (warned but not cleared)
        deactivationToken: Not(IsNull()),
      },
      select: ['id', 'email', 'username', 'lastActivityAt', 'deactivationNotifiedAt'],
    });

    for (const user of users) {
      await this.userRepo.update(user.id, { isDeactivated: true });

      await this.auditService.log(
        'user.deactivation.deactivated',
        user.id,
        true,
        {
          lastActivityAt: user.lastActivityAt,
          notifiedAt: user.deactivationNotifiedAt,
          reason: `Inactive for ${INACTIVITY_DAYS}+ days`,
        },
      );

      count++;
    }

    return count;
  }

  // ── Reactivation ─────────────────────────────────────────────────────────

  /**
   * Validates the reactivation token and re-enables the account.
   * Returns the reactivated user on success; throws on invalid/expired token.
   */
  async reactivate(token: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { deactivationToken: token },
    });

    if (!user) {
      throw new Error('Invalid reactivation token');
    }

    if (
      !user.deactivationTokenExpiresAt ||
      user.deactivationTokenExpiresAt < new Date()
    ) {
      throw new Error('Reactivation token has expired');
    }

    const now = new Date();

    await this.userRepo.update(user.id, {
      isDeactivated: false,
      deactivationToken: null,
      deactivationTokenExpiresAt: null,
      deactivationNotifiedAt: null,
      lastActivityAt: now,
    });

    await this.auditService.log('user.deactivation.reactivated', user.id, true, {
      reactivatedAt: now,
    });

    return this.userRepo.findOne({ where: { id: user.id } }) as Promise<User>;
  }

  /**
   * Clear deactivation state when a user logs in (called from AuthService).
   * Handles both: warned-but-not-yet-deactivated and already-deactivated accounts
   * that have a valid token (direct reactivation link was clicked before login).
   */
  async clearDeactivationOnLogin(userId: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return;

    const needsClear =
      user.isDeactivated ||
      user.deactivationNotifiedAt !== null ||
      user.deactivationToken !== null;

    if (needsClear) {
      await this.userRepo.update(userId, {
        isDeactivated: false,
        deactivationToken: null,
        deactivationTokenExpiresAt: null,
        deactivationNotifiedAt: null,
      });
    }
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private daysAgo(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  }

  private async sendWarningEmail(
    email: string,
    username: string,
    token: string,
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>('frontend.url');
    const reactivateUrl = `${frontendUrl}/auth/reactivate?token=${token}`;

    try {
      await this.mailService.sendEmail(
        email,
        'Your scoopdope account will be deactivated soon',
        `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <h2>⚠️ Account Inactivity Notice</h2>
            <p>Hi ${username},</p>
            <p>We noticed you haven't logged in for over <strong>${INACTIVITY_DAYS} days</strong>.</p>
            <p>To keep your account active, please log in or click the button below within
               <strong>${WARNING_DAYS} days</strong>. After that, your account will be
               automatically deactivated.</p>
            <a href="${reactivateUrl}"
               style="background:#4F46E5;color:#fff;padding:12px 24px;border-radius:6px;
                      text-decoration:none;display:inline-block;margin:16px 0">
              Reactivate My Account
            </a>
            <p style="font-size:13px;color:#666">
              This link expires in ${TOKEN_EXPIRY_HOURS} hours. If you log in before then,
              your account will remain active and no further action is required.
            </p>
            <p style="font-size:12px;color:#999">
              If you no longer wish to use scoopdope, simply ignore this email.
            </p>
          </div>
        `,
      );
    } catch (err) {
      this.logger.error(`Failed to send inactivity warning to ${email}`, err);
    }
  }
}
