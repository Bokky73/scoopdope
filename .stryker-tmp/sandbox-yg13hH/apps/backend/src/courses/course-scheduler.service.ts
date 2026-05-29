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
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Course, CourseStatus } from './course.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';
import { Enrollment } from '../enrollments/enrollment.entity';
@Injectable()
export class CourseSchedulerService {
  private readonly logger = new Logger(CourseSchedulerService.name);
  constructor(@InjectRepository(Course)
  private courseRepo: Repository<Course>, @InjectRepository(Enrollment)
  private enrollmentRepo: Repository<Enrollment>, private notificationsService: NotificationsService) {}

  /** Runs every minute to publish courses whose scheduledAt has passed. */
  @Cron(CronExpression.EVERY_MINUTE)
  async publishScheduledCourses(): Promise<void> {
    if (stryMutAct_9fa48("2326")) {
      {}
    } else {
      stryCov_9fa48("2326");
      const now = new Date();
      const due = await this.courseRepo.find(stryMutAct_9fa48("2327") ? {} : (stryCov_9fa48("2327"), {
        where: stryMutAct_9fa48("2328") ? {} : (stryCov_9fa48("2328"), {
          status: CourseStatus.SCHEDULED,
          scheduledAt: LessThanOrEqual(now),
          isDeleted: stryMutAct_9fa48("2329") ? true : (stryCov_9fa48("2329"), false)
        })
      }));
      if (stryMutAct_9fa48("2332") ? false : stryMutAct_9fa48("2331") ? true : stryMutAct_9fa48("2330") ? due.length : (stryCov_9fa48("2330", "2331", "2332"), !due.length)) return;
      for (const course of due) {
        if (stryMutAct_9fa48("2333")) {
          {}
        } else {
          stryCov_9fa48("2333");
          course.status = CourseStatus.PUBLISHED;
          course.isPublished = stryMutAct_9fa48("2334") ? false : (stryCov_9fa48("2334"), true);
          course.publishedAt = now;
          await this.courseRepo.save(course);
          this.logger.log(stryMutAct_9fa48("2335") ? `` : (stryCov_9fa48("2335"), `Published course "${course.title}" (${course.id})`));
          await this.notifyEnrolledStudents(course);
        }
      }
    }
  }
  private async notifyEnrolledStudents(course: Course): Promise<void> {
    if (stryMutAct_9fa48("2336")) {
      {}
    } else {
      stryCov_9fa48("2336");
      const enrollments = await this.enrollmentRepo.find(stryMutAct_9fa48("2337") ? {} : (stryCov_9fa48("2337"), {
        where: stryMutAct_9fa48("2338") ? {} : (stryCov_9fa48("2338"), {
          courseId: course.id
        })
      }));
      await Promise.all(enrollments.map(stryMutAct_9fa48("2339") ? () => undefined : (stryCov_9fa48("2339"), e => this.notificationsService.create(e.userId, NotificationType.COURSE_PUBLISHED, stryMutAct_9fa48("2340") ? `` : (stryCov_9fa48("2340"), `"${course.title}" is now live!`)))));
    }
  }
}