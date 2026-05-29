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
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseVersion } from './course-version.entity';
import { Course } from './course.entity';
@Injectable()
export class CourseVersioningService {
  constructor(@InjectRepository(CourseVersion)
  private versionRepo: Repository<CourseVersion>, @InjectRepository(Course)
  private courseRepo: Repository<Course>) {}
  async createVersion(courseId: string, changeNote: string, createdById?: string): Promise<CourseVersion> {
    if (stryMutAct_9fa48("2346")) {
      {}
    } else {
      stryCov_9fa48("2346");
      const course = await this.courseRepo.findOne(stryMutAct_9fa48("2347") ? {} : (stryCov_9fa48("2347"), {
        where: stryMutAct_9fa48("2348") ? {} : (stryCov_9fa48("2348"), {
          id: courseId,
          isDeleted: stryMutAct_9fa48("2349") ? true : (stryCov_9fa48("2349"), false)
        }),
        relations: stryMutAct_9fa48("2350") ? [] : (stryCov_9fa48("2350"), [stryMutAct_9fa48("2351") ? "" : (stryCov_9fa48("2351"), 'modules'), stryMutAct_9fa48("2352") ? "" : (stryCov_9fa48("2352"), 'modules.lessons')])
      }));
      if (stryMutAct_9fa48("2355") ? false : stryMutAct_9fa48("2354") ? true : stryMutAct_9fa48("2353") ? course : (stryCov_9fa48("2353", "2354", "2355"), !course)) throw new NotFoundException(stryMutAct_9fa48("2356") ? "" : (stryCov_9fa48("2356"), 'Course not found'));
      const count = await this.versionRepo.count(stryMutAct_9fa48("2357") ? {} : (stryCov_9fa48("2357"), {
        where: stryMutAct_9fa48("2358") ? {} : (stryCov_9fa48("2358"), {
          courseId
        })
      }));
      const versionNumber = stryMutAct_9fa48("2359") ? count - 1 : (stryCov_9fa48("2359"), count + 1);
      const versionTag = stryMutAct_9fa48("2360") ? `` : (stryCov_9fa48("2360"), `v${versionNumber}.0`);
      return this.versionRepo.save(this.versionRepo.create(stryMutAct_9fa48("2361") ? {} : (stryCov_9fa48("2361"), {
        courseId,
        versionNumber,
        versionTag,
        snapshot: course as unknown as Record<string, any>,
        changeNote,
        createdById
      })));
    }
  }
  async listVersions(courseId: string): Promise<CourseVersion[]> {
    if (stryMutAct_9fa48("2362")) {
      {}
    } else {
      stryCov_9fa48("2362");
      return this.versionRepo.find(stryMutAct_9fa48("2363") ? {} : (stryCov_9fa48("2363"), {
        where: stryMutAct_9fa48("2364") ? {} : (stryCov_9fa48("2364"), {
          courseId
        }),
        order: stryMutAct_9fa48("2365") ? {} : (stryCov_9fa48("2365"), {
          versionNumber: stryMutAct_9fa48("2366") ? "" : (stryCov_9fa48("2366"), 'DESC')
        }),
        select: stryMutAct_9fa48("2367") ? [] : (stryCov_9fa48("2367"), [stryMutAct_9fa48("2368") ? "" : (stryCov_9fa48("2368"), 'id'), stryMutAct_9fa48("2369") ? "" : (stryCov_9fa48("2369"), 'courseId'), stryMutAct_9fa48("2370") ? "" : (stryCov_9fa48("2370"), 'versionTag'), stryMutAct_9fa48("2371") ? "" : (stryCov_9fa48("2371"), 'versionNumber'), stryMutAct_9fa48("2372") ? "" : (stryCov_9fa48("2372"), 'changeNote'), stryMutAct_9fa48("2373") ? "" : (stryCov_9fa48("2373"), 'createdAt'), stryMutAct_9fa48("2374") ? "" : (stryCov_9fa48("2374"), 'createdById')])
      }));
    }
  }
  async getVersion(courseId: string, versionId: string): Promise<CourseVersion> {
    if (stryMutAct_9fa48("2375")) {
      {}
    } else {
      stryCov_9fa48("2375");
      const version = await this.versionRepo.findOne(stryMutAct_9fa48("2376") ? {} : (stryCov_9fa48("2376"), {
        where: stryMutAct_9fa48("2377") ? {} : (stryCov_9fa48("2377"), {
          id: versionId,
          courseId
        })
      }));
      if (stryMutAct_9fa48("2380") ? false : stryMutAct_9fa48("2379") ? true : stryMutAct_9fa48("2378") ? version : (stryCov_9fa48("2378", "2379", "2380"), !version)) throw new NotFoundException(stryMutAct_9fa48("2381") ? "" : (stryCov_9fa48("2381"), 'Version not found'));
      return version;
    }
  }
  async diffVersions(courseId: string, fromId: string, toId: string) {
    if (stryMutAct_9fa48("2382")) {
      {}
    } else {
      stryCov_9fa48("2382");
      const [from, to] = await Promise.all(stryMutAct_9fa48("2383") ? [] : (stryCov_9fa48("2383"), [this.getVersion(courseId, fromId), this.getVersion(courseId, toId)]));
      return stryMutAct_9fa48("2384") ? {} : (stryCov_9fa48("2384"), {
        from: stryMutAct_9fa48("2385") ? {} : (stryCov_9fa48("2385"), {
          versionTag: from.versionTag,
          snapshot: from.snapshot
        }),
        to: stryMutAct_9fa48("2386") ? {} : (stryCov_9fa48("2386"), {
          versionTag: to.versionTag,
          snapshot: to.snapshot
        }),
        changes: this.computeDiff(from.snapshot, to.snapshot)
      });
    }
  }
  async rollback(courseId: string, versionId: string): Promise<Course> {
    if (stryMutAct_9fa48("2387")) {
      {}
    } else {
      stryCov_9fa48("2387");
      const version = await this.getVersion(courseId, versionId);
      const {
        id,
        modules,
        reviews,
        createdAt,
        ...fields
      } = version.snapshot as any;
      await this.courseRepo.update(courseId, stryMutAct_9fa48("2388") ? {} : (stryCov_9fa48("2388"), {
        title: fields.title,
        description: fields.description,
        level: fields.level,
        durationHours: fields.durationHours,
        isPublished: fields.isPublished
      }));
      const updated = await this.courseRepo.findOne(stryMutAct_9fa48("2389") ? {} : (stryCov_9fa48("2389"), {
        where: stryMutAct_9fa48("2390") ? {} : (stryCov_9fa48("2390"), {
          id: courseId
        })
      }));
      if (stryMutAct_9fa48("2393") ? false : stryMutAct_9fa48("2392") ? true : stryMutAct_9fa48("2391") ? updated : (stryCov_9fa48("2391", "2392", "2393"), !updated)) throw new NotFoundException(stryMutAct_9fa48("2394") ? "" : (stryCov_9fa48("2394"), 'Course not found after rollback'));
      return updated;
    }
  }
  private computeDiff(from: Record<string, any>, to: Record<string, any>): Record<string, any> {
    if (stryMutAct_9fa48("2395")) {
      {}
    } else {
      stryCov_9fa48("2395");
      const changes: Record<string, any> = {};
      const keys = new Set(stryMutAct_9fa48("2396") ? [] : (stryCov_9fa48("2396"), [...Object.keys(from), ...Object.keys(to)]));
      for (const key of keys) {
        if (stryMutAct_9fa48("2397")) {
          {}
        } else {
          stryCov_9fa48("2397");
          if (stryMutAct_9fa48("2400") ? JSON.stringify(from[key]) === JSON.stringify(to[key]) : stryMutAct_9fa48("2399") ? false : stryMutAct_9fa48("2398") ? true : (stryCov_9fa48("2398", "2399", "2400"), JSON.stringify(from[key]) !== JSON.stringify(to[key]))) {
            if (stryMutAct_9fa48("2401")) {
              {}
            } else {
              stryCov_9fa48("2401");
              changes[key] = stryMutAct_9fa48("2402") ? {} : (stryCov_9fa48("2402"), {
                from: from[key],
                to: to[key]
              });
            }
          }
        }
      }
      return changes;
    }
  }
}