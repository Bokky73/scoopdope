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

@Injectable()
export class AuthService {
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
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user) {
      await this.auditService.log(AuditAction.LOGIN_FAILURE, null, false, { email }, ipAddress, userAgent);
      throw new UnauthorizedException('Invalid credentials');
    }

    // #960 – A cooldown that has elapsed clears the account and its counter, so
    // that a single typo after waiting out the lockout does not re-lock it.
    if (user.lockedUntil && !this.isAccountLocked(user)) {
      await this.clearLoginLockout(user);
    }

    // Reject while the cooldown is still running, before spending a bcrypt
    // comparison on an account we already know is locked.
    if (this.isAccountLocked(user)) {
      const retryAfterSeconds = this.lockoutRetryAfterSeconds(user);
      await this.auditService.log(
        AuditAction.LOGIN_FAILURE,
        user.id,
        false,
        { reason: 'account_locked', retryAfterSeconds },
        ipAddress,
        userAgent,
      );
      throw this.accountLockedError(retryAfterSeconds);
    }

    if (!(await bcryptLib.compare(password, user.passwordHash))) {
      const { failedLoginAttempts, lockedUntil } = this.nextFailedLoginState(user);
      await this.usersService.updateLoginLockout(user.id, {
        failedLoginAttempts,
        lastFailedLoginAt: new Date(),
        lockedUntil,
      });

      if (lockedUntil) {
        await this.auditService.log(
          AuditAction.LOGIN_FAILURE,
          user.id,
          false,
          { reason: 'account_locked', failedLoginAttempts },
          ipAddress,
          userAgent,
        );
        throw this.accountLockedError(Math.ceil(ACCOUNT_LOCKOUT_COOLDOWN_MS / 1000));
      }

      await this.auditService.log(
        AuditAction.LOGIN_FAILURE,
        user.id,
        false,
        { reason: 'invalid_password', failedLoginAttempts },
        ipAddress,
        userAgent,
      );
      throw new UnauthorizedException('Invalid credentials');
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

    const { token, hash, expiresAt } = this.tokenService.generateOpaqueToken(1);
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
        where: { tokenHash: hash, used: false },
      });

      if (!resetToken) throw new BadRequestException('Invalid or expired reset token');
      if (resetToken.expiresAt < new Date()) throw new BadRequestException('Reset token has expired');

      const passwordHash = await bcryptLib.hash(newPassword, 10);
      await userRepo.update(resetToken.userId, { passwordHash });

      // Delete the token row immediately after use. If another request already
      // consumed it, affected will be 0 and we reject the second attempt.
      const deleteResult = await resetTokenRepo.delete({ id: resetToken.id });
      if (deleteResult.affected === 0) {
        throw new BadRequestException('This reset token has already been used');
      }

      return resetToken.userId;
    });

    await this.auditService.log(AuditAction.PASSWORD_RESET_COMPLETE, userId, true);
    return { message: 'Password reset successfully. You can now log in.' };
  }

  // ── MFA delegation ────────────────────────────────────────────────────────

  generateMfaSecret(userId: string) { return this.mfaService.generateSecret(userId); }
  verifyMfaSecret(userId: string, code: string) { return this.mfaService.verifyAndEnable(userId, code); }
  disableMfa(userId: string, code: string) { return this.mfaService.disable(userId, code); }
  regenerateBackupCodes(userId: string, totpCode: string) { return this.mfaService.regenerateBackupCodes(userId, totpCode); }

  // ── OAuth delegation ──────────────────────────────────────────────────────

  googleOAuthLogin(profile: { id: string; email: string; displayName: string; picture: string }) {
    return this.oauthService.googleLogin(profile);
  }

  generateStellarChallenge(publicKey: string) { return this.oauthService.generateStellarChallenge(publicKey); }
  verifyStellarSignature(userId: string, publicKey: string, signature: string, challenge: string) {
    return this.oauthService.verifyStellarSignature(userId, publicKey, signature, challenge);
  }

  // ── API key delegation ────────────────────────────────────────────────────

  generateApiKey(userId: string, name: string) { return this.tokenService.generateApiKey(userId, name); }
  revokeApiKey(id: string, userId?: string) { return this.tokenService.revokeApiKey(id, userId); }
}
