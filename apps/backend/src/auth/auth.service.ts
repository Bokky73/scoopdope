import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
  ConflictException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcryptLib from 'bcrypt';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { PasswordResetToken } from './password-reset-token.entity';
import { User } from '../users/user.entity';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/audit-log.entity';
import { TokenService } from './token.service';
import { MfaService } from './mfa.service';
import { OAuthService } from './oauth.service';
import {
  ACCOUNT_LOCKOUT_COOLDOWN_MS,
  FAILED_LOGIN_ATTEMPT_WINDOW_MS,
  MAX_FAILED_LOGIN_ATTEMPTS,
} from './account-lockout.constants';
import * as crypto from 'crypto';

const LOGIN_RATE_LIMIT_MAX_ATTEMPTS = 5;
const LOGIN_RATE_LIMIT_WINDOW_MS = 60 * 1000;

@Injectable()
export class AuthService {
  private loginAttempts = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private usersService: UsersService,
    private mailService: MailService,
    private auditService: AuditService,
    private tokenService: TokenService,
    private mfaService: MfaService,
    private oauthService: OAuthService,
    @InjectRepository(PasswordResetToken)
    private resetTokenRepo: Repository<PasswordResetToken>,
    private dataSource: DataSource,
  ) {}

  private enforceLoginRateLimit(ipAddress?: string) {
    const key = ipAddress || 'unknown';
    const now = Date.now();
    const entry = this.loginAttempts.get(key);

    if (!entry || entry.resetAt <= now) {
      this.loginAttempts.set(key, { count: 1, resetAt: now + LOGIN_RATE_LIMIT_WINDOW_MS });
      return;
    }

    if (entry.count >= LOGIN_RATE_LIMIT_MAX_ATTEMPTS) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      throw new HttpException(
        'Too many login attempts. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    entry.count += 1;
  }

  async register(email: string, password: string, refCode?: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcryptLib.hash(password, 10);
    const { token, hash, expiresAt } = this.tokenService.generateOpaqueToken(24);
    const referralCode = crypto.randomBytes(6).toString('hex');

    let referredBy: string | null = null;
    if (refCode) {
      const referrer = await this.usersService.findByReferralCode(refCode);
      if (referrer) referredBy = referrer.id;
    }

    const user = await this.usersService.create({
      email,
      passwordHash,
      isVerified: false,
      verificationToken: hash,
      verificationTokenExpiresAt: expiresAt,
      referralCode,
      referredBy,
    });

    await this.mailService.sendVerificationEmail(user.email, token);
    await this.auditService.log(AuditAction.REGISTER, user.id, true, { email });

    const tokens = await this.tokenService.issueTokenPair(user.id, user.email, user.role);
    return {
      userId: user.id,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      message: 'Registration successful. Please verify your email.',
    };
  }

  async login(email: string, password: string, mfaToken?: string, ipAddress?: string, userAgent?: string) {
    this.enforceLoginRateLimit(ipAddress);

    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user) {
      await this.auditService.log(AuditAction.LOGIN_FAILURE, null, false, { email }, ipAddress, userAgent);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check account lockout (#960)
    if (user.lockoutUntil && new Date(user.lockoutUntil) > new Date()) {
      const remainingMinutes = Math.ceil(
        (new Date(user.lockoutUntil).getTime() - Date.now()) / (60 * 1000),
      );
      await this.auditService.log(
        AuditAction.LOGIN_FAILURE,
        user.id,
        false,
        { reason: 'account_locked', remainingMinutes },
        ipAddress,
        userAgent,
      );
      throw new UnauthorizedException(
        `Account is temporarily locked due to too many failed login attempts. Please try again in ${remainingMinutes} minute(s).`,
      );
    }

    const isPasswordValid = await bcryptLib.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      const MAX_FAILED_ATTEMPTS = 5;
      const LOCKOUT_MINUTES = 15;
      const attempts = (user.failedLoginAttempts || 0) + 1;
      let lockoutDate: Date | null = null;
      if (attempts >= MAX_FAILED_ATTEMPTS) {
        lockoutDate = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
      }
      await this.usersService.updateFailedLoginAttempts(user.id, attempts, lockoutDate);
      await this.auditService.log(
        AuditAction.LOGIN_FAILURE,
        user.id,
        false,
        { email, attempts, locked: !!lockoutDate },
        ipAddress,
        userAgent,
      );

      if (lockoutDate) {
        throw new UnauthorizedException(
          `Account has been locked for ${LOCKOUT_MINUTES} minutes due to ${MAX_FAILED_ATTEMPTS} consecutive failed login attempts.`,
        );
      }
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed login attempts on successful authentication
    if (user.failedLoginAttempts > 0 || user.lockoutUntil) {
      await this.usersService.updateFailedLoginAttempts(user.id, 0, null);
    }

    if (user.isBanned) {
      await this.auditService.log(AuditAction.LOGIN_FAILURE, user.id, false, { reason: 'banned' }, ipAddress, userAgent);
      throw new UnauthorizedException('Account is banned');
    }

    if (user.status && user.status !== 'active') {
      await this.auditService.log(AuditAction.LOGIN_FAILURE, user.id, false, { reason: user.status }, ipAddress, userAgent);
      throw new UnauthorizedException(`Account is ${user.status}`);
    }

    if (!user.isVerified) {
      await this.auditService.log(AuditAction.LOGIN_FAILURE, user.id, false, { reason: 'unverified' }, ipAddress, userAgent);
      throw new ForbiddenException('Please verify your email before logging in');
    }

    if (user.role === 'admin' && !user.mfaEnabled) {
      await this.auditService.log(AuditAction.LOGIN_FAILURE, user.id, false, { reason: 'mfa_required' }, ipAddress, userAgent);
      throw new ForbiddenException('Admin accounts must enable 2FA before logging in');
    }

    if (user.mfaEnabled) {
      if (!mfaToken) return { mfa_required: true };
      const valid = await this.mfaService.verifyCode(user.id, mfaToken);
      if (!valid) {
        await this.auditService.log(AuditAction.LOGIN_FAILURE, user.id, false, { reason: 'invalid_mfa' }, ipAddress, userAgent);
        throw new UnauthorizedException('Invalid MFA token');
      }
    }

    // A verified password clears the streak so the next typo starts from zero.
    await this.clearLoginLockout(user);

    const tokens = await this.tokenService.issueTokenPair(user.id, user.email, user.role);
    await this.auditService.log(AuditAction.LOGIN_SUCCESS, user.id, true, {}, ipAddress, userAgent);
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar ?? null,
        username: user.username ?? null,
        createdAt: user.createdAt,
      },
    };
  }

  /**
   * #960 – Account lockout after failed login attempts
   *
   * An account counts as locked only while `lockedUntil` is still in the
   * future, so the cooldown expires on its own without an admin intervention.
   */
  private isAccountLocked(user: User, now: Date = new Date()): boolean {
    if (!user.lockedUntil) return false;
    return new Date(user.lockedUntil).getTime() > now.getTime();
  }

  private lockoutRetryAfterSeconds(user: User, now: Date = new Date()): number {
    if (!user.lockedUntil) return Math.ceil(ACCOUNT_LOCKOUT_COOLDOWN_MS / 1000);
    return Math.max(1, Math.ceil((new Date(user.lockedUntil).getTime() - now.getTime()) / 1000));
  }

  /**
   * Counter and cooldown arithmetic for a single failed password attempt.
   * A counter that has been idle for longer than the attempt window restarts at
   * zero, so occasional typos never accumulate into a lockout.
   */
  private nextFailedLoginState(user: User, now: Date = new Date()): { failedLoginAttempts: number; lockedUntil: Date | null } {
    const lastFailure = user.lastFailedLoginAt ? new Date(user.lastFailedLoginAt).getTime() : null;
    const isStale = lastFailure === null || now.getTime() - lastFailure > FAILED_LOGIN_ATTEMPT_WINDOW_MS;
    const failedLoginAttempts = (isStale ? 0 : user.failedLoginAttempts ?? 0) + 1;

    return {
      failedLoginAttempts,
      lockedUntil:
        failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS
          ? new Date(now.getTime() + ACCOUNT_LOCKOUT_COOLDOWN_MS)
          : null,
    };
  }

  /** Clear the failure counter and any active cooldown for a user. */
  private async clearLoginLockout(user: User) {
    user.failedLoginAttempts = 0;
    user.lastFailedLoginAt = null;
    user.lockedUntil = null;
    await this.usersService.updateLoginLockout(user.id, {
      failedLoginAttempts: 0,
      lastFailedLoginAt: null,
      lockedUntil: null,
    });
  }

  private accountLockedError(retryAfterSeconds: number): HttpException {
    return new HttpException(
      {
        statusCode: HttpStatus.LOCKED,
        message: `Account temporarily locked after ${MAX_FAILED_LOGIN_ATTEMPTS} failed login attempts. Try again in ${retryAfterSeconds} seconds.`,
        retryAfterSeconds,
      },
      HttpStatus.LOCKED,
    );
  }

  async refresh(rawRefreshToken: string) {
    return this.tokenService.refresh(rawRefreshToken);
  }

  async logout(rawRefreshToken: string, userId?: string) {
    await this.tokenService.revokeRefreshToken(rawRefreshToken, userId);
    return { message: 'Logged out successfully.' };
  }

  async verifyEmail(token: string) {
    const hash = this.tokenService.hashToken(token);
    const user = await this.usersService.findByVerificationToken(hash);

    if (!user) throw new BadRequestException('Invalid or expired verification token');
    if (!user.verificationTokenExpiresAt || user.verificationTokenExpiresAt < new Date()) {
      throw new BadRequestException('Verification token has expired');
    }

    await this.usersService.update(user.id, {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiresAt: null,
    });
    return { message: 'Email verified successfully. You can now log in.' };
  }

  async resendVerification(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');
    if (user.isVerified) throw new BadRequestException('Email is already verified');

    const { token, hash, expiresAt } = this.tokenService.generateOpaqueToken(24);
    await this.usersService.update(user.id, {
      verificationToken: hash,
      verificationTokenExpiresAt: expiresAt,
    });
    await this.mailService.sendVerificationEmail(user.email, token);
    return { message: 'Verification email resent.' };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return { message: 'If that email exists, a reset link has been sent.' };

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentTokens = await this.resetTokenRepo
      .createQueryBuilder('t')
      .where('t.userId = :userId', { userId: user.id })
      .andWhere('t.createdAt > :since', { since: oneHourAgo })
      .getCount();

    if (recentTokens >= 3) {
      throw new BadRequestException('Too many reset requests. Please wait before trying again.');
    }

    // Enforce 15-minute expiry window on password reset flow (#961)
    const { token, hash, expiresAt } = this.tokenService.generateOpaqueToken(0.25);
    await this.resetTokenRepo.save(
      this.resetTokenRepo.create({ tokenHash: hash, userId: user.id, expiresAt, used: false }),
    );

    await this.mailService.sendPasswordResetEmail(user.email, token);
    await this.auditService.log(AuditAction.PASSWORD_RESET_REQUEST, user.id, true, { email });
    return { message: 'If that email exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const hash = this.tokenService.hashToken(token);

    // Wrap token validation, password update, and token deletion in a single
    // transaction so that concurrent use of the same token is detected.
    const userId = await this.dataSource.transaction(async (manager) => {
      const resetTokenRepo = manager.getRepository(PasswordResetToken);
      const userRepo = manager.getRepository(User);

      const resetToken = await resetTokenRepo.findOne({
        where: { tokenHash: hash },
      });

      if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      const passwordHash = await bcryptLib.hash(newPassword, 10);
      await userRepo.update(resetToken.userId, { passwordHash });
      await resetTokenRepo.update(resetToken.id, { used: true });

      return resetToken.userId;
    });

    await this.auditService.log(AuditAction.PASSWORD_RESET, userId, true, {});
    return { message: 'Password reset successfully. You can now log in.' };
  }
}
