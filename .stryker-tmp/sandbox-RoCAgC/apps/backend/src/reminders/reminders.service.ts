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
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Reminder } from './reminder.entity';
import { Enrollment } from '../enrollments/enrollment.entity';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);
  constructor(@InjectRepository(Reminder)
  private remindersRepository: Repository<Reminder>, @InjectRepository(Enrollment)
  private enrollmentsRepository: Repository<Enrollment>, private mailService: MailService, private configService: ConfigService) {}
  async sendInactiveReminders(): Promise<void> {
    if (stryMutAct_9fa48("6047")) {
      {}
    } else {
      stryCov_9fa48("6047");
      const inactivityDays = this.configService.get<number>(stryMutAct_9fa48("6048") ? "" : (stryCov_9fa48("6048"), 'REMINDER_INACTIVITY_DAYS'), 7);
      const cutoffDate = new Date();
      stryMutAct_9fa48("6049") ? cutoffDate.setTime(cutoffDate.getDate() - inactivityDays) : (stryCov_9fa48("6049"), cutoffDate.setDate(stryMutAct_9fa48("6050") ? cutoffDate.getDate() + inactivityDays : (stryCov_9fa48("6050"), cutoffDate.getDate() - inactivityDays)));
      const inactiveEnrollments = await this.enrollmentsRepository.createQueryBuilder(stryMutAct_9fa48("6051") ? "" : (stryCov_9fa48("6051"), 'e')).leftJoinAndSelect(stryMutAct_9fa48("6052") ? "" : (stryCov_9fa48("6052"), 'e.user'), stryMutAct_9fa48("6053") ? "" : (stryCov_9fa48("6053"), 'user')).leftJoinAndSelect(stryMutAct_9fa48("6054") ? "" : (stryCov_9fa48("6054"), 'e.course'), stryMutAct_9fa48("6055") ? "" : (stryCov_9fa48("6055"), 'course')).where(stryMutAct_9fa48("6056") ? "" : (stryCov_9fa48("6056"), 'e.completedAt IS NULL')).andWhere(stryMutAct_9fa48("6057") ? "" : (stryCov_9fa48("6057"), 'e.enrolledAt < :cutoffDate'), stryMutAct_9fa48("6058") ? {} : (stryCov_9fa48("6058"), {
        cutoffDate
      })).getMany();
      for (const enrollment of inactiveEnrollments) {
        if (stryMutAct_9fa48("6059")) {
          {}
        } else {
          stryCov_9fa48("6059");
          const reminder = await this.remindersRepository.findOne(stryMutAct_9fa48("6060") ? {} : (stryCov_9fa48("6060"), {
            where: stryMutAct_9fa48("6061") ? {} : (stryCov_9fa48("6061"), {
              userId: enrollment.userId,
              courseId: enrollment.courseId
            })
          }));
          if (stryMutAct_9fa48("6064") ? !reminder && !reminder.isActive : stryMutAct_9fa48("6063") ? false : stryMutAct_9fa48("6062") ? true : (stryCov_9fa48("6062", "6063", "6064"), (stryMutAct_9fa48("6065") ? reminder : (stryCov_9fa48("6065"), !reminder)) || (stryMutAct_9fa48("6066") ? reminder.isActive : (stryCov_9fa48("6066"), !reminder.isActive)))) continue;
          const lastReminder = new Date(reminder.lastReminderSentAt);
          const reminderFrequencyHours = this.configService.get<number>(stryMutAct_9fa48("6067") ? "" : (stryCov_9fa48("6067"), 'REMINDER_FREQUENCY_HOURS'), 168);
          const nextReminderTime = new Date(stryMutAct_9fa48("6068") ? lastReminder.getTime() - reminderFrequencyHours * 60 * 60 * 1000 : (stryCov_9fa48("6068"), lastReminder.getTime() + (stryMutAct_9fa48("6069") ? reminderFrequencyHours * 60 * 60 / 1000 : (stryCov_9fa48("6069"), (stryMutAct_9fa48("6070") ? reminderFrequencyHours * 60 / 60 : (stryCov_9fa48("6070"), (stryMutAct_9fa48("6071") ? reminderFrequencyHours / 60 : (stryCov_9fa48("6071"), reminderFrequencyHours * 60)) * 60)) * 1000))));
          if (stryMutAct_9fa48("6075") ? new Date() >= nextReminderTime : stryMutAct_9fa48("6074") ? new Date() <= nextReminderTime : stryMutAct_9fa48("6073") ? false : stryMutAct_9fa48("6072") ? true : (stryCov_9fa48("6072", "6073", "6074", "6075"), new Date() < nextReminderTime)) continue;
          await this.mailService.sendReminderEmail(enrollment.user.email, enrollment.user.username, enrollment.course.title);
          reminder.lastReminderSentAt = new Date();
          await this.remindersRepository.save(reminder);
          this.logger.log(stryMutAct_9fa48("6076") ? `` : (stryCov_9fa48("6076"), `Reminder sent to ${enrollment.user.email} for course ${enrollment.course.title}`));
        }
      }
    }
  }
  async createReminder(userId: string, courseId: string): Promise<Reminder> {
    if (stryMutAct_9fa48("6077")) {
      {}
    } else {
      stryCov_9fa48("6077");
      const reminder = this.remindersRepository.create(stryMutAct_9fa48("6078") ? {} : (stryCov_9fa48("6078"), {
        userId,
        courseId,
        lastReminderSentAt: new Date(),
        isActive: stryMutAct_9fa48("6079") ? false : (stryCov_9fa48("6079"), true)
      }));
      return this.remindersRepository.save(reminder);
    }
  }
  async disableReminder(userId: string, courseId: string): Promise<void> {
    if (stryMutAct_9fa48("6080")) {
      {}
    } else {
      stryCov_9fa48("6080");
      await this.remindersRepository.update(stryMutAct_9fa48("6081") ? {} : (stryCov_9fa48("6081"), {
        userId,
        courseId
      }), stryMutAct_9fa48("6082") ? {} : (stryCov_9fa48("6082"), {
        isActive: stryMutAct_9fa48("6083") ? true : (stryCov_9fa48("6083"), false)
      }));
    }
  }
  async enableReminder(userId: string, courseId: string): Promise<void> {
    if (stryMutAct_9fa48("6084")) {
      {}
    } else {
      stryCov_9fa48("6084");
      await this.remindersRepository.update(stryMutAct_9fa48("6085") ? {} : (stryCov_9fa48("6085"), {
        userId,
        courseId
      }), stryMutAct_9fa48("6086") ? {} : (stryCov_9fa48("6086"), {
        isActive: stryMutAct_9fa48("6087") ? false : (stryCov_9fa48("6087"), true)
      }));
    }
  }
  async getReminderStats(): Promise<{
    totalReminders: number;
    activeReminders: number;
    sentToday: number;
  }> {
    if (stryMutAct_9fa48("6088")) {
      {}
    } else {
      stryCov_9fa48("6088");
      const totalReminders = await this.remindersRepository.count();
      const activeReminders = await this.remindersRepository.count(stryMutAct_9fa48("6089") ? {} : (stryCov_9fa48("6089"), {
        where: stryMutAct_9fa48("6090") ? {} : (stryCov_9fa48("6090"), {
          isActive: stryMutAct_9fa48("6091") ? false : (stryCov_9fa48("6091"), true)
        })
      }));
      const today = new Date();
      stryMutAct_9fa48("6092") ? today.setMinutes(0, 0, 0, 0) : (stryCov_9fa48("6092"), today.setHours(0, 0, 0, 0));
      const sentToday = await this.remindersRepository.count(stryMutAct_9fa48("6093") ? {} : (stryCov_9fa48("6093"), {
        where: stryMutAct_9fa48("6094") ? {} : (stryCov_9fa48("6094"), {
          lastReminderSentAt: MoreThanOrEqual(today)
        })
      }));
      return stryMutAct_9fa48("6095") ? {} : (stryCov_9fa48("6095"), {
        totalReminders,
        activeReminders,
        sentToday
      });
    }
  }
}