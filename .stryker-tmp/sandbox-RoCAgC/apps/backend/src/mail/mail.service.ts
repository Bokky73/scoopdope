// @ts-nocheck
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
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;
  constructor(private configService: ConfigService) {
    if (stryMutAct_9fa48("4385")) {
      {}
    } else {
      stryCov_9fa48("4385");
      this.transporter = nodemailer.createTransport(stryMutAct_9fa48("4386") ? {} : (stryCov_9fa48("4386"), {
        host: this.configService.get<string>(stryMutAct_9fa48("4387") ? "" : (stryCov_9fa48("4387"), 'mail.host')),
        port: this.configService.get<number>(stryMutAct_9fa48("4388") ? "" : (stryCov_9fa48("4388"), 'mail.port')),
        secure: this.configService.get<boolean>(stryMutAct_9fa48("4389") ? "" : (stryCov_9fa48("4389"), 'mail.secure')),
        auth: stryMutAct_9fa48("4390") ? {} : (stryCov_9fa48("4390"), {
          user: this.configService.get<string>(stryMutAct_9fa48("4391") ? "" : (stryCov_9fa48("4391"), 'mail.user')),
          pass: this.configService.get<string>(stryMutAct_9fa48("4392") ? "" : (stryCov_9fa48("4392"), 'mail.pass'))
        })
      }));
    }
  }
  async sendPasswordResetEmail(to: string, token: string) {
    if (stryMutAct_9fa48("4393")) {
      {}
    } else {
      stryCov_9fa48("4393");
      const frontendUrl = this.configService.get<string>(stryMutAct_9fa48("4394") ? "" : (stryCov_9fa48("4394"), 'frontend.url'));
      const resetUrl = stryMutAct_9fa48("4395") ? `` : (stryCov_9fa48("4395"), `${frontendUrl}/auth/reset-password?token=${token}`);
      if (stryMutAct_9fa48("4398") ? false : stryMutAct_9fa48("4397") ? true : stryMutAct_9fa48("4396") ? this.configService.get<boolean>('mail.enabled') : (stryCov_9fa48("4396", "4397", "4398"), !this.configService.get<boolean>(stryMutAct_9fa48("4399") ? "" : (stryCov_9fa48("4399"), 'mail.enabled')))) {
        if (stryMutAct_9fa48("4400")) {
          {}
        } else {
          stryCov_9fa48("4400");
          this.logger.log(stryMutAct_9fa48("4401") ? `` : (stryCov_9fa48("4401"), `[DEV] Password reset link for ${to}: ${resetUrl}`));
          return;
        }
      }
      await this.transporter.sendMail(stryMutAct_9fa48("4402") ? {} : (stryCov_9fa48("4402"), {
        from: this.configService.get<string>(stryMutAct_9fa48("4403") ? "" : (stryCov_9fa48("4403"), 'mail.from')),
        to,
        subject: stryMutAct_9fa48("4404") ? "" : (stryCov_9fa48("4404"), 'Reset your password'),
        html: stryMutAct_9fa48("4405") ? `` : (stryCov_9fa48("4405"), `<p>Click the link below to reset your password. It expires in 1 hour.</p>
             <a href="${resetUrl}">${resetUrl}</a>
             <p>If you did not request this, ignore this email.</p>`)
      }));
    }
  }
  async sendVerificationEmail(to: string, token: string) {
    if (stryMutAct_9fa48("4406")) {
      {}
    } else {
      stryCov_9fa48("4406");
      const frontendUrl = this.configService.get<string>(stryMutAct_9fa48("4407") ? "" : (stryCov_9fa48("4407"), 'frontend.url'));
      const verifyUrl = stryMutAct_9fa48("4408") ? `` : (stryCov_9fa48("4408"), `${frontendUrl}/auth/verify?token=${token}`);
      if (stryMutAct_9fa48("4411") ? false : stryMutAct_9fa48("4410") ? true : stryMutAct_9fa48("4409") ? this.configService.get<boolean>('mail.enabled') : (stryCov_9fa48("4409", "4410", "4411"), !this.configService.get<boolean>(stryMutAct_9fa48("4412") ? "" : (stryCov_9fa48("4412"), 'mail.enabled')))) {
        if (stryMutAct_9fa48("4413")) {
          {}
        } else {
          stryCov_9fa48("4413");
          this.logger.log(stryMutAct_9fa48("4414") ? `` : (stryCov_9fa48("4414"), `[DEV] Verification link for ${to}: ${verifyUrl}`));
          return;
        }
      }
      await this.transporter.sendMail(stryMutAct_9fa48("4415") ? {} : (stryCov_9fa48("4415"), {
        from: this.configService.get<string>(stryMutAct_9fa48("4416") ? "" : (stryCov_9fa48("4416"), 'mail.from')),
        to,
        subject: stryMutAct_9fa48("4417") ? "" : (stryCov_9fa48("4417"), 'Verify your email'),
        html: stryMutAct_9fa48("4418") ? `` : (stryCov_9fa48("4418"), `<p>Click the link below to verify your email. It expires in 24 hours.</p>
             <a href="${verifyUrl}">${verifyUrl}</a>`)
      }));
    }
  }
  async sendReminderEmail(to: string, username: string, courseTitle: string) {
    if (stryMutAct_9fa48("4419")) {
      {}
    } else {
      stryCov_9fa48("4419");
      const frontendUrl = this.configService.get<string>(stryMutAct_9fa48("4420") ? "" : (stryCov_9fa48("4420"), 'frontend.url'));
      if (stryMutAct_9fa48("4423") ? false : stryMutAct_9fa48("4422") ? true : stryMutAct_9fa48("4421") ? this.configService.get<boolean>('mail.enabled') : (stryCov_9fa48("4421", "4422", "4423"), !this.configService.get<boolean>(stryMutAct_9fa48("4424") ? "" : (stryCov_9fa48("4424"), 'mail.enabled')))) {
        if (stryMutAct_9fa48("4425")) {
          {}
        } else {
          stryCov_9fa48("4425");
          this.logger.log(stryMutAct_9fa48("4426") ? `` : (stryCov_9fa48("4426"), `[DEV] Reminder email for ${to} about course ${courseTitle}`));
          return;
        }
      }
      await this.transporter.sendMail(stryMutAct_9fa48("4427") ? {} : (stryCov_9fa48("4427"), {
        from: this.configService.get<string>(stryMutAct_9fa48("4428") ? "" : (stryCov_9fa48("4428"), 'mail.from')),
        to,
        subject: stryMutAct_9fa48("4429") ? `` : (stryCov_9fa48("4429"), `Continue learning: ${courseTitle}`),
        html: stryMutAct_9fa48("4430") ? `` : (stryCov_9fa48("4430"), `<p>Hi ${username},</p>
             <p>We noticed you haven't made progress in <strong>${courseTitle}</strong> recently.</p>
             <p>Continue your learning journey and earn rewards!</p>
             <a href="${frontendUrl}/courses">View Courses</a>`)
      }));
    }
  }
}