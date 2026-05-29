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
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ModulesService } from './modules.service';
import { Enrollment } from '../enrollments/enrollment.entity';
import { User } from '../users/user.entity';
import { Course } from './course.entity';
@Injectable()
export class DripSchedulerService {
  private readonly logger = new Logger(DripSchedulerService.name);
  constructor(private modulesService: ModulesService, @InjectRepository(Enrollment)
  private enrollmentRepo: Repository<Enrollment>, @InjectRepository(User)
  private userRepo: Repository<User>, @InjectRepository(Course)
  private courseRepo: Repository<Course>, private eventEmitter: EventEmitter2) {}
  @Cron(CronExpression.EVERY_MINUTE)
  async checkUnlockedModules() {
    if (stryMutAct_9fa48("2649")) {
      {}
    } else {
      stryCov_9fa48("2649");
      const justUnlocked = await this.modulesService.findJustUnlocked();
      if (stryMutAct_9fa48("2652") ? false : stryMutAct_9fa48("2651") ? true : stryMutAct_9fa48("2650") ? justUnlocked.length : (stryCov_9fa48("2650", "2651", "2652"), !justUnlocked.length)) return;
      for (const mod of justUnlocked) {
        if (stryMutAct_9fa48("2653")) {
          {}
        } else {
          stryCov_9fa48("2653");
          const enrollments = await this.enrollmentRepo.find(stryMutAct_9fa48("2654") ? {} : (stryCov_9fa48("2654"), {
            where: stryMutAct_9fa48("2655") ? {} : (stryCov_9fa48("2655"), {
              courseId: mod.courseId
            })
          }));
          if (stryMutAct_9fa48("2658") ? false : stryMutAct_9fa48("2657") ? true : stryMutAct_9fa48("2656") ? enrollments.length : (stryCov_9fa48("2656", "2657", "2658"), !enrollments.length)) continue;
          const [course, users] = await Promise.all(stryMutAct_9fa48("2659") ? [] : (stryCov_9fa48("2659"), [this.courseRepo.findOne(stryMutAct_9fa48("2660") ? {} : (stryCov_9fa48("2660"), {
            where: stryMutAct_9fa48("2661") ? {} : (stryCov_9fa48("2661"), {
              id: mod.courseId
            })
          })), this.userRepo.findByIds(enrollments.map(stryMutAct_9fa48("2662") ? () => undefined : (stryCov_9fa48("2662"), e => e.userId)))]));
          for (const user of users) {
            if (stryMutAct_9fa48("2663")) {
              {}
            } else {
              stryCov_9fa48("2663");
              this.eventEmitter.emit(stryMutAct_9fa48("2664") ? "" : (stryCov_9fa48("2664"), 'module.unlocked'), stryMutAct_9fa48("2665") ? {} : (stryCov_9fa48("2665"), {
                userId: user.id,
                userEmail: user.email,
                userName: stryMutAct_9fa48("2666") ? user.username && user.email : (stryCov_9fa48("2666"), user.username ?? user.email),
                courseId: mod.courseId,
                courseTitle: stryMutAct_9fa48("2667") ? course?.title && mod.courseId : (stryCov_9fa48("2667"), (stryMutAct_9fa48("2668") ? course.title : (stryCov_9fa48("2668"), course?.title)) ?? mod.courseId),
                moduleTitle: mod.title
              }));
            }
          }
          this.logger.log(stryMutAct_9fa48("2669") ? `` : (stryCov_9fa48("2669"), `Emitted module.unlocked for module "${mod.title}" to ${users.length} learner(s)`));
        }
      }
    }
  }
}