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
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Enrollment } from './enrollment.entity';
import { PrerequisitesService } from '../courses/prerequisites.service';
import { CourseVersioningService } from '../courses/course-versioning.service';
@Injectable()
export class EnrollmentsService {
  constructor(@InjectRepository(Enrollment)
  private repo: Repository<Enrollment>, private eventEmitter: EventEmitter2, private prereqService: PrerequisitesService, private versioningService: CourseVersioningService) {}
  async enroll(userId: string, courseId: string, adminOverride = stryMutAct_9fa48("3533") ? true : (stryCov_9fa48("3533"), false)): Promise<Enrollment> {
    if (stryMutAct_9fa48("3534")) {
      {}
    } else {
      stryCov_9fa48("3534");
      const existing = await this.repo.findOne(stryMutAct_9fa48("3535") ? {} : (stryCov_9fa48("3535"), {
        where: stryMutAct_9fa48("3536") ? {} : (stryCov_9fa48("3536"), {
          userId,
          courseId
        })
      }));
      if (stryMutAct_9fa48("3538") ? false : stryMutAct_9fa48("3537") ? true : (stryCov_9fa48("3537", "3538"), existing)) throw new ConflictException(stryMutAct_9fa48("3539") ? "" : (stryCov_9fa48("3539"), 'Already enrolled in this course'));
      await this.prereqService.enforcePrerequisites(userId, courseId, adminOverride);

      // Pin the student to the latest published version at enrollment time
      const versions = await this.versioningService.listVersions(courseId);
      const latestVersion = stryMutAct_9fa48("3540") ? versions[0] && null : (stryCov_9fa48("3540"), versions[0] ?? null);
      const enrollment = await this.repo.save(this.repo.create(stryMutAct_9fa48("3541") ? {} : (stryCov_9fa48("3541"), {
        userId,
        courseId,
        enrolledVersionNumber: stryMutAct_9fa48("3542") ? latestVersion?.versionNumber && null : (stryCov_9fa48("3542"), (stryMutAct_9fa48("3543") ? latestVersion.versionNumber : (stryCov_9fa48("3543"), latestVersion?.versionNumber)) ?? null)
      })));
      this.eventEmitter.emit(stryMutAct_9fa48("3544") ? "" : (stryCov_9fa48("3544"), 'enrollment.created'), stryMutAct_9fa48("3545") ? {} : (stryCov_9fa48("3545"), {
        enrollmentId: enrollment.id,
        userId,
        courseId,
        enrolledAt: enrollment.enrolledAt
      }));
      return enrollment;
    }
  }
  async unenroll(userId: string, courseId: string): Promise<void> {
    if (stryMutAct_9fa48("3546")) {
      {}
    } else {
      stryCov_9fa48("3546");
      const enrollment = await this.repo.findOne(stryMutAct_9fa48("3547") ? {} : (stryCov_9fa48("3547"), {
        where: stryMutAct_9fa48("3548") ? {} : (stryCov_9fa48("3548"), {
          userId,
          courseId
        })
      }));
      if (stryMutAct_9fa48("3551") ? false : stryMutAct_9fa48("3550") ? true : stryMutAct_9fa48("3549") ? enrollment : (stryCov_9fa48("3549", "3550", "3551"), !enrollment)) throw new NotFoundException(stryMutAct_9fa48("3552") ? "" : (stryCov_9fa48("3552"), 'Enrollment not found'));
      await this.repo.remove(enrollment);

      // Notify waitlist system that a spot has opened
      this.eventEmitter.emit(stryMutAct_9fa48("3553") ? "" : (stryCov_9fa48("3553"), 'enrollment.removed'), stryMutAct_9fa48("3554") ? {} : (stryCov_9fa48("3554"), {
        userId,
        courseId
      }));
    }
  }
  findByUser(userId: string): Promise<Enrollment[]> {
    if (stryMutAct_9fa48("3555")) {
      {}
    } else {
      stryCov_9fa48("3555");
      return this.repo.find(stryMutAct_9fa48("3556") ? {} : (stryCov_9fa48("3556"), {
        where: stryMutAct_9fa48("3557") ? {} : (stryCov_9fa48("3557"), {
          userId
        }),
        relations: stryMutAct_9fa48("3558") ? [] : (stryCov_9fa48("3558"), [stryMutAct_9fa48("3559") ? "" : (stryCov_9fa48("3559"), 'course')]),
        order: stryMutAct_9fa48("3560") ? {} : (stryCov_9fa48("3560"), {
          enrolledAt: stryMutAct_9fa48("3561") ? "" : (stryCov_9fa48("3561"), 'DESC')
        })
      }));
    }
  }

  /** Upgrade a student's pinned version to the latest available version. */
  async upgradeVersion(userId: string, courseId: string): Promise<Enrollment> {
    if (stryMutAct_9fa48("3562")) {
      {}
    } else {
      stryCov_9fa48("3562");
      const enrollment = await this.repo.findOne(stryMutAct_9fa48("3563") ? {} : (stryCov_9fa48("3563"), {
        where: stryMutAct_9fa48("3564") ? {} : (stryCov_9fa48("3564"), {
          userId,
          courseId
        })
      }));
      if (stryMutAct_9fa48("3567") ? false : stryMutAct_9fa48("3566") ? true : stryMutAct_9fa48("3565") ? enrollment : (stryCov_9fa48("3565", "3566", "3567"), !enrollment)) throw new NotFoundException(stryMutAct_9fa48("3568") ? "" : (stryCov_9fa48("3568"), 'Enrollment not found'));
      const versions = await this.versioningService.listVersions(courseId);
      const latestVersion = versions[0];
      if (stryMutAct_9fa48("3571") ? false : stryMutAct_9fa48("3570") ? true : stryMutAct_9fa48("3569") ? latestVersion : (stryCov_9fa48("3569", "3570", "3571"), !latestVersion)) throw new NotFoundException(stryMutAct_9fa48("3572") ? "" : (stryCov_9fa48("3572"), 'No versions found for this course'));
      enrollment.enrolledVersionNumber = latestVersion.versionNumber;
      return this.repo.save(enrollment);
    }
  }
}