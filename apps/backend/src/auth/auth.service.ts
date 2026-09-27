import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
  ConflictException,
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
    if (!user || !(await bcryptLib.compare(password, user.passwordHash))) {
      await this.auditService.log(AuditAction.LOGIN_FAILURE, null, false, { email }, ipAddress, userAgent);
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
