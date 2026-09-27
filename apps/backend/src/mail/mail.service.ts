import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('mail.host'),
      port: this.configService.get<number>('mail.port'),
      secure: this.configService.get<boolean>('mail.secure'),
      auth: {
        user: this.configService.get<string>('mail.user'),
        pass: this.configService.get<string>('mail.pass'),
      },
    });
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const frontendUrl = this.configService.get<string>('frontend.url');
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${token}`;

    if (!this.configService.get<boolean>('mail.enabled')) {
      this.logger.log(`[DEV] Password reset link for ${to}: ${resetUrl}`);
      return;
    }

    await this.transporter.sendMail({
      from: this.configService.get<string>('mail.from'),
      to,
      subject: 'Reset your password',
      html: `<p>Click the link below to reset your password. It expires in 1 hour.</p>
             <a href="${resetUrl}">${resetUrl}</a>
             <p>If you did not request this, ignore this email.</p>`,
    });
  }

  async sendVerificationEmail(to: string, token: string) {
    const frontendUrl = this.configService.get<string>('frontend.url');
    const verifyUrl = `${frontendUrl}/auth/verify?token=${token}`;

    if (!this.configService.get<boolean>('mail.enabled')) {
      this.logger.log(`[DEV] Verification link for ${to}: ${verifyUrl}`);
      return;
    }

    await this.transporter.sendMail({
      from: this.configService.get<string>('mail.from'),
      to,
      subject: 'Verify your email',
      html: `<p>Click the link below to verify your email. It expires in 24 hours.</p>
             <a href="${verifyUrl}">${verifyUrl}</a>`,
    });
  }

  async sendReminderEmail(to: string, username: string, courseTitle: string) {
    const frontendUrl = this.configService.get<string>('frontend.url');

    if (!this.configService.get<boolean>('mail.enabled')) {
      this.logger.log(`[DEV] Reminder email for ${to} about course ${courseTitle}`);
      return;
    }

    await this.transporter.sendMail({
      from: this.configService.get<string>('mail.from'),
      to,
      subject: `Continue learning: ${courseTitle}`,
      html: `<p>Hi ${username},</p>
             <p>We noticed you haven't made progress in <strong>${courseTitle}</strong> recently.</p>
             <p>Continue your learning journey and earn rewards!</p>
             <a href="${frontendUrl}/courses">View Courses</a>`,
    });
  }

  /** Generic helper for services that need to send a custom email. */
  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    if (!this.configService.get<boolean>('mail.enabled')) {
      this.logger.log(`[DEV] Email to ${to} — Subject: ${subject}`);
      return;
    }

    await this.transporter.sendMail({
      from: this.configService.get<string>('mail.from'),
      to,
      subject,
      html,
    });
  }
}
