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
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, IsNull, Or } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';
import { EmailQueue, EmailStatus } from './email-queue.entity';
import { EmailPreference } from './email-preference.entity';
import { emailTemplates } from './email.templates';
const MAX_ATTEMPTS = 3;
const RETRY_DELAYS = stryMutAct_9fa48("3396") ? [] : (stryCov_9fa48("3396"), [60, 300, 900]); // seconds

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private processing = stryMutAct_9fa48("3397") ? true : (stryCov_9fa48("3397"), false);
  constructor(@InjectRepository(EmailQueue)
  private queueRepo: Repository<EmailQueue>, @InjectRepository(EmailPreference)
  private prefRepo: Repository<EmailPreference>, private config: ConfigService) {}
  onModuleInit() {
    if (stryMutAct_9fa48("3398")) {
      {}
    } else {
      stryCov_9fa48("3398");
      this.transporter = nodemailer.createTransport(stryMutAct_9fa48("3399") ? {} : (stryCov_9fa48("3399"), {
        host: this.config.get<string>(stryMutAct_9fa48("3400") ? "" : (stryCov_9fa48("3400"), 'mail.host')),
        port: this.config.get<number>(stryMutAct_9fa48("3401") ? "" : (stryCov_9fa48("3401"), 'mail.port')),
        secure: this.config.get<boolean>(stryMutAct_9fa48("3402") ? "" : (stryCov_9fa48("3402"), 'mail.secure')),
        auth: stryMutAct_9fa48("3403") ? {} : (stryCov_9fa48("3403"), {
          user: this.config.get<string>(stryMutAct_9fa48("3404") ? "" : (stryCov_9fa48("3404"), 'mail.user')),
          pass: this.config.get<string>(stryMutAct_9fa48("3405") ? "" : (stryCov_9fa48("3405"), 'mail.pass'))
        })
      }));
      // Process queue every 30 seconds
      setInterval(stryMutAct_9fa48("3406") ? () => undefined : (stryCov_9fa48("3406"), () => this.processQueue()), 30_000);
    }
  }
  private async getOrCreatePrefs(userId: string): Promise<EmailPreference> {
    if (stryMutAct_9fa48("3407")) {
      {}
    } else {
      stryCov_9fa48("3407");
      let prefs = await this.prefRepo.findOne(stryMutAct_9fa48("3408") ? {} : (stryCov_9fa48("3408"), {
        where: stryMutAct_9fa48("3409") ? {} : (stryCov_9fa48("3409"), {
          userId
        })
      }));
      if (stryMutAct_9fa48("3412") ? false : stryMutAct_9fa48("3411") ? true : stryMutAct_9fa48("3410") ? prefs : (stryCov_9fa48("3410", "3411", "3412"), !prefs)) {
        if (stryMutAct_9fa48("3413")) {
          {}
        } else {
          stryCov_9fa48("3413");
          prefs = this.prefRepo.create(stryMutAct_9fa48("3414") ? {} : (stryCov_9fa48("3414"), {
            userId,
            unsubscribeToken: crypto.randomUUID()
          }));
          prefs = await this.prefRepo.save(prefs);
        }
      }
      return prefs;
    }
  }
  private unsubscribeUrl(token: string) {
    if (stryMutAct_9fa48("3415")) {
      {}
    } else {
      stryCov_9fa48("3415");
      return stryMutAct_9fa48("3416") ? `` : (stryCov_9fa48("3416"), `${this.config.get(stryMutAct_9fa48("3417") ? "" : (stryCov_9fa48("3417"), 'frontend.url'))}/email/unsubscribe?token=${token}`);
    }
  }
  async enqueue(to: string, subject: string, html: string): Promise<void> {
    if (stryMutAct_9fa48("3418")) {
      {}
    } else {
      stryCov_9fa48("3418");
      await this.queueRepo.save(this.queueRepo.create(stryMutAct_9fa48("3419") ? {} : (stryCov_9fa48("3419"), {
        to,
        subject,
        html
      })));
      // Try to send immediately
      setImmediate(stryMutAct_9fa48("3420") ? () => undefined : (stryCov_9fa48("3420"), () => this.processQueue()));
    }
  }
  async processQueue(): Promise<void> {
    if (stryMutAct_9fa48("3421")) {
      {}
    } else {
      stryCov_9fa48("3421");
      if (stryMutAct_9fa48("3423") ? false : stryMutAct_9fa48("3422") ? true : (stryCov_9fa48("3422", "3423"), this.processing)) return;
      this.processing = stryMutAct_9fa48("3424") ? false : (stryCov_9fa48("3424"), true);
      try {
        if (stryMutAct_9fa48("3425")) {
          {}
        } else {
          stryCov_9fa48("3425");
          const now = new Date();
          const jobs = await this.queueRepo.find(stryMutAct_9fa48("3426") ? {} : (stryCov_9fa48("3426"), {
            where: stryMutAct_9fa48("3427") ? [] : (stryCov_9fa48("3427"), [stryMutAct_9fa48("3428") ? {} : (stryCov_9fa48("3428"), {
              status: EmailStatus.PENDING,
              nextRetryAt: IsNull()
            }), stryMutAct_9fa48("3429") ? {} : (stryCov_9fa48("3429"), {
              status: EmailStatus.PENDING,
              nextRetryAt: LessThanOrEqual(now)
            })]),
            take: 10,
            order: stryMutAct_9fa48("3430") ? {} : (stryCov_9fa48("3430"), {
              createdAt: stryMutAct_9fa48("3431") ? "" : (stryCov_9fa48("3431"), 'ASC')
            })
          }));
          for (const job of jobs) {
            if (stryMutAct_9fa48("3432")) {
              {}
            } else {
              stryCov_9fa48("3432");
              await this.sendJob(job);
            }
          }
        }
      } finally {
        if (stryMutAct_9fa48("3433")) {
          {}
        } else {
          stryCov_9fa48("3433");
          this.processing = stryMutAct_9fa48("3434") ? true : (stryCov_9fa48("3434"), false);
        }
      }
    }
  }
  private async sendJob(job: EmailQueue): Promise<void> {
    if (stryMutAct_9fa48("3435")) {
      {}
    } else {
      stryCov_9fa48("3435");
      stryMutAct_9fa48("3436") ? job.attempts -= 1 : (stryCov_9fa48("3436"), job.attempts += 1);
      try {
        if (stryMutAct_9fa48("3437")) {
          {}
        } else {
          stryCov_9fa48("3437");
          if (stryMutAct_9fa48("3440") ? false : stryMutAct_9fa48("3439") ? true : stryMutAct_9fa48("3438") ? this.config.get<boolean>('mail.enabled') : (stryCov_9fa48("3438", "3439", "3440"), !this.config.get<boolean>(stryMutAct_9fa48("3441") ? "" : (stryCov_9fa48("3441"), 'mail.enabled')))) {
            if (stryMutAct_9fa48("3442")) {
              {}
            } else {
              stryCov_9fa48("3442");
              this.logger.log(stryMutAct_9fa48("3443") ? `` : (stryCov_9fa48("3443"), `[DEV] Email to ${job.to}: ${job.subject}`));
            }
          } else {
            if (stryMutAct_9fa48("3444")) {
              {}
            } else {
              stryCov_9fa48("3444");
              await this.transporter.sendMail(stryMutAct_9fa48("3445") ? {} : (stryCov_9fa48("3445"), {
                from: this.config.get<string>(stryMutAct_9fa48("3446") ? "" : (stryCov_9fa48("3446"), 'mail.from')),
                to: job.to,
                subject: job.subject,
                html: job.html
              }));
            }
          }
          job.status = EmailStatus.SENT;
        }
      } catch (err: any) {
        if (stryMutAct_9fa48("3447")) {
          {}
        } else {
          stryCov_9fa48("3447");
          job.lastError = err.message;
          if (stryMutAct_9fa48("3451") ? job.attempts < MAX_ATTEMPTS : stryMutAct_9fa48("3450") ? job.attempts > MAX_ATTEMPTS : stryMutAct_9fa48("3449") ? false : stryMutAct_9fa48("3448") ? true : (stryCov_9fa48("3448", "3449", "3450", "3451"), job.attempts >= MAX_ATTEMPTS)) {
            if (stryMutAct_9fa48("3452")) {
              {}
            } else {
              stryCov_9fa48("3452");
              job.status = EmailStatus.FAILED;
            }
          } else {
            if (stryMutAct_9fa48("3453")) {
              {}
            } else {
              stryCov_9fa48("3453");
              const delaySec = stryMutAct_9fa48("3454") ? RETRY_DELAYS[job.attempts - 1] && 900 : (stryCov_9fa48("3454"), RETRY_DELAYS[stryMutAct_9fa48("3455") ? job.attempts + 1 : (stryCov_9fa48("3455"), job.attempts - 1)] ?? 900);
              job.nextRetryAt = new Date(stryMutAct_9fa48("3456") ? Date.now() - delaySec * 1000 : (stryCov_9fa48("3456"), Date.now() + (stryMutAct_9fa48("3457") ? delaySec / 1000 : (stryCov_9fa48("3457"), delaySec * 1000))));
            }
          }
        }
      }
      await this.queueRepo.save(job);
    }
  }

  // --- Event listeners ---

  @OnEvent('enrollment.created')
  async onEnrollment(payload: {
    userId: string;
    courseId: string;
    userEmail: string;
    userName: string;
    courseTitle: string;
  }) {
    if (stryMutAct_9fa48("3458")) {
      {}
    } else {
      stryCov_9fa48("3458");
      const prefs = await this.getOrCreatePrefs(payload.userId);
      if (stryMutAct_9fa48("3461") ? prefs.unsubscribedAll && !prefs.enrollment : stryMutAct_9fa48("3460") ? false : stryMutAct_9fa48("3459") ? true : (stryCov_9fa48("3459", "3460", "3461"), prefs.unsubscribedAll || (stryMutAct_9fa48("3462") ? prefs.enrollment : (stryCov_9fa48("3462"), !prefs.enrollment)))) return;
      const tpl = emailTemplates.enrollment(stryMutAct_9fa48("3463") ? {} : (stryCov_9fa48("3463"), {
        userName: payload.userName,
        courseTitle: payload.courseTitle,
        courseUrl: stryMutAct_9fa48("3464") ? `` : (stryCov_9fa48("3464"), `${this.config.get(stryMutAct_9fa48("3465") ? "" : (stryCov_9fa48("3465"), 'frontend.url'))}/courses/${payload.courseId}`),
        unsubscribeUrl: this.unsubscribeUrl(prefs.unsubscribeToken)
      }));
      await this.enqueue(payload.userEmail, tpl.subject, tpl.html);
    }
  }
  @OnEvent('enrollment.completed')
  async onCompletion(payload: {
    userId: string;
    courseId: string;
    userEmail: string;
    userName: string;
    courseTitle: string;
  }) {
    if (stryMutAct_9fa48("3466")) {
      {}
    } else {
      stryCov_9fa48("3466");
      const prefs = await this.getOrCreatePrefs(payload.userId);
      if (stryMutAct_9fa48("3469") ? prefs.unsubscribedAll && !prefs.completion : stryMutAct_9fa48("3468") ? false : stryMutAct_9fa48("3467") ? true : (stryCov_9fa48("3467", "3468", "3469"), prefs.unsubscribedAll || (stryMutAct_9fa48("3470") ? prefs.completion : (stryCov_9fa48("3470"), !prefs.completion)))) return;
      const tpl = emailTemplates.completion(stryMutAct_9fa48("3471") ? {} : (stryCov_9fa48("3471"), {
        userName: payload.userName,
        courseTitle: payload.courseTitle,
        credentialUrl: stryMutAct_9fa48("3472") ? `` : (stryCov_9fa48("3472"), `${this.config.get(stryMutAct_9fa48("3473") ? "" : (stryCov_9fa48("3473"), 'frontend.url'))}/credentials`),
        unsubscribeUrl: this.unsubscribeUrl(prefs.unsubscribeToken)
      }));
      await this.enqueue(payload.userEmail, tpl.subject, tpl.html);
    }
  }
  @OnEvent('credential.issued')
  async onCredentialIssued(payload: {
    userId: string;
    userEmail: string;
    userName: string;
    courseTitle: string;
    txHash: string;
  }) {
    if (stryMutAct_9fa48("3474")) {
      {}
    } else {
      stryCov_9fa48("3474");
      const prefs = await this.getOrCreatePrefs(payload.userId);
      if (stryMutAct_9fa48("3477") ? prefs.unsubscribedAll && !prefs.credentialIssued : stryMutAct_9fa48("3476") ? false : stryMutAct_9fa48("3475") ? true : (stryCov_9fa48("3475", "3476", "3477"), prefs.unsubscribedAll || (stryMutAct_9fa48("3478") ? prefs.credentialIssued : (stryCov_9fa48("3478"), !prefs.credentialIssued)))) return;
      const tpl = emailTemplates.credentialIssued(stryMutAct_9fa48("3479") ? {} : (stryCov_9fa48("3479"), {
        userName: payload.userName,
        courseTitle: payload.courseTitle,
        txHash: payload.txHash,
        unsubscribeUrl: this.unsubscribeUrl(prefs.unsubscribeToken)
      }));
      await this.enqueue(payload.userEmail, tpl.subject, tpl.html);
    }
  }
  @OnEvent('module.unlocked')
  async onModuleUnlocked(payload: {
    userId: string;
    userEmail: string;
    userName: string;
    courseId: string;
    courseTitle: string;
    moduleTitle: string;
  }) {
    if (stryMutAct_9fa48("3480")) {
      {}
    } else {
      stryCov_9fa48("3480");
      const prefs = await this.getOrCreatePrefs(payload.userId);
      if (stryMutAct_9fa48("3483") ? prefs.unsubscribedAll && !prefs.enrollment : stryMutAct_9fa48("3482") ? false : stryMutAct_9fa48("3481") ? true : (stryCov_9fa48("3481", "3482", "3483"), prefs.unsubscribedAll || (stryMutAct_9fa48("3484") ? prefs.enrollment : (stryCov_9fa48("3484"), !prefs.enrollment)))) return;
      const tpl = emailTemplates.moduleUnlocked(stryMutAct_9fa48("3485") ? {} : (stryCov_9fa48("3485"), {
        userName: payload.userName,
        courseTitle: payload.courseTitle,
        moduleTitle: payload.moduleTitle,
        courseUrl: stryMutAct_9fa48("3486") ? `` : (stryCov_9fa48("3486"), `${this.config.get(stryMutAct_9fa48("3487") ? "" : (stryCov_9fa48("3487"), 'frontend.url'))}/courses/${payload.courseId}`),
        unsubscribeUrl: this.unsubscribeUrl(prefs.unsubscribeToken)
      }));
      await this.enqueue(payload.userEmail, tpl.subject, tpl.html);
    }
  }

  // --- Preferences management ---

  async getPreferences(userId: string) {
    if (stryMutAct_9fa48("3488")) {
      {}
    } else {
      stryCov_9fa48("3488");
      return this.getOrCreatePrefs(userId);
    }
  }
  async updatePreferences(userId: string, updates: Partial<Pick<EmailPreference, 'enrollment' | 'completion' | 'credentialIssued' | 'marketing'>>) {
    if (stryMutAct_9fa48("3489")) {
      {}
    } else {
      stryCov_9fa48("3489");
      const prefs = await this.getOrCreatePrefs(userId);
      Object.assign(prefs, updates);
      return this.prefRepo.save(prefs);
    }
  }
  async unsubscribeByToken(token: string): Promise<void> {
    if (stryMutAct_9fa48("3490")) {
      {}
    } else {
      stryCov_9fa48("3490");
      const prefs = await this.prefRepo.findOne(stryMutAct_9fa48("3491") ? {} : (stryCov_9fa48("3491"), {
        where: stryMutAct_9fa48("3492") ? {} : (stryCov_9fa48("3492"), {
          unsubscribeToken: token
        })
      }));
      if (stryMutAct_9fa48("3495") ? false : stryMutAct_9fa48("3494") ? true : stryMutAct_9fa48("3493") ? prefs : (stryCov_9fa48("3493", "3494", "3495"), !prefs)) return;
      prefs.unsubscribedAll = stryMutAct_9fa48("3496") ? false : (stryCov_9fa48("3496"), true);
      await this.prefRepo.save(prefs);
    }
  }
}