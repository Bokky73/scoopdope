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
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoursePrerequisite } from './course-prerequisite.entity';
import { Enrollment } from '../enrollments/enrollment.entity';
import { Course } from './course.entity';
@Injectable()
export class PrerequisitesService {
  constructor(@InjectRepository(CoursePrerequisite)
  private prereqRepo: Repository<CoursePrerequisite>, @InjectRepository(Enrollment)
  private enrollmentRepo: Repository<Enrollment>, @InjectRepository(Course)
  private courseRepo: Repository<Course>) {}
  async addPrerequisite(courseId: string, prerequisiteId: string): Promise<CoursePrerequisite> {
    if (stryMutAct_9fa48("2834")) {
      {}
    } else {
      stryCov_9fa48("2834");
      if (stryMutAct_9fa48("2837") ? courseId !== prerequisiteId : stryMutAct_9fa48("2836") ? false : stryMutAct_9fa48("2835") ? true : (stryCov_9fa48("2835", "2836", "2837"), courseId === prerequisiteId)) {
        if (stryMutAct_9fa48("2838")) {
          {}
        } else {
          stryCov_9fa48("2838");
          throw new BadRequestException(stryMutAct_9fa48("2839") ? "" : (stryCov_9fa48("2839"), 'A course cannot be its own prerequisite'));
        }
      }
      const [course, prereq] = await Promise.all(stryMutAct_9fa48("2840") ? [] : (stryCov_9fa48("2840"), [this.courseRepo.findOne(stryMutAct_9fa48("2841") ? {} : (stryCov_9fa48("2841"), {
        where: stryMutAct_9fa48("2842") ? {} : (stryCov_9fa48("2842"), {
          id: courseId,
          isDeleted: stryMutAct_9fa48("2843") ? true : (stryCov_9fa48("2843"), false)
        })
      })), this.courseRepo.findOne(stryMutAct_9fa48("2844") ? {} : (stryCov_9fa48("2844"), {
        where: stryMutAct_9fa48("2845") ? {} : (stryCov_9fa48("2845"), {
          id: prerequisiteId,
          isDeleted: stryMutAct_9fa48("2846") ? true : (stryCov_9fa48("2846"), false)
        })
      }))]));
      if (stryMutAct_9fa48("2849") ? false : stryMutAct_9fa48("2848") ? true : stryMutAct_9fa48("2847") ? course : (stryCov_9fa48("2847", "2848", "2849"), !course)) throw new NotFoundException(stryMutAct_9fa48("2850") ? "" : (stryCov_9fa48("2850"), 'Course not found'));
      if (stryMutAct_9fa48("2853") ? false : stryMutAct_9fa48("2852") ? true : stryMutAct_9fa48("2851") ? prereq : (stryCov_9fa48("2851", "2852", "2853"), !prereq)) throw new NotFoundException(stryMutAct_9fa48("2854") ? "" : (stryCov_9fa48("2854"), 'Prerequisite course not found'));
      return this.prereqRepo.save(this.prereqRepo.create(stryMutAct_9fa48("2855") ? {} : (stryCov_9fa48("2855"), {
        courseId,
        prerequisiteId
      })));
    }
  }
  async removePrerequisite(courseId: string, prerequisiteId: string): Promise<void> {
    if (stryMutAct_9fa48("2856")) {
      {}
    } else {
      stryCov_9fa48("2856");
      const record = await this.prereqRepo.findOne(stryMutAct_9fa48("2857") ? {} : (stryCov_9fa48("2857"), {
        where: stryMutAct_9fa48("2858") ? {} : (stryCov_9fa48("2858"), {
          courseId,
          prerequisiteId
        })
      }));
      if (stryMutAct_9fa48("2861") ? false : stryMutAct_9fa48("2860") ? true : stryMutAct_9fa48("2859") ? record : (stryCov_9fa48("2859", "2860", "2861"), !record)) throw new NotFoundException(stryMutAct_9fa48("2862") ? "" : (stryCov_9fa48("2862"), 'Prerequisite relationship not found'));
      await this.prereqRepo.remove(record);
    }
  }
  async getPrerequisites(courseId: string): Promise<CoursePrerequisite[]> {
    if (stryMutAct_9fa48("2863")) {
      {}
    } else {
      stryCov_9fa48("2863");
      return this.prereqRepo.find(stryMutAct_9fa48("2864") ? {} : (stryCov_9fa48("2864"), {
        where: stryMutAct_9fa48("2865") ? {} : (stryCov_9fa48("2865"), {
          courseId
        }),
        relations: stryMutAct_9fa48("2866") ? [] : (stryCov_9fa48("2866"), [stryMutAct_9fa48("2867") ? "" : (stryCov_9fa48("2867"), 'prerequisite')])
      }));
    }
  }

  /** Returns the full prerequisite chain (BFS) for visualization */
  async getPrerequisiteChain(courseId: string): Promise<Record<string, string[]>> {
    if (stryMutAct_9fa48("2868")) {
      {}
    } else {
      stryCov_9fa48("2868");
      const chain: Record<string, string[]> = {};
      const queue = stryMutAct_9fa48("2869") ? [] : (stryCov_9fa48("2869"), [courseId]);
      const visited = new Set<string>();
      while (stryMutAct_9fa48("2870") ? false : (stryCov_9fa48("2870"), queue.length)) {
        if (stryMutAct_9fa48("2871")) {
          {}
        } else {
          stryCov_9fa48("2871");
          const current = queue.shift()!;
          if (stryMutAct_9fa48("2873") ? false : stryMutAct_9fa48("2872") ? true : (stryCov_9fa48("2872", "2873"), visited.has(current))) continue;
          visited.add(current);
          const prereqs = await this.prereqRepo.find(stryMutAct_9fa48("2874") ? {} : (stryCov_9fa48("2874"), {
            where: stryMutAct_9fa48("2875") ? {} : (stryCov_9fa48("2875"), {
              courseId: current
            })
          }));
          chain[current] = prereqs.map(stryMutAct_9fa48("2876") ? () => undefined : (stryCov_9fa48("2876"), p => p.prerequisiteId));
          for (const p of prereqs) {
            if (stryMutAct_9fa48("2877")) {
              {}
            } else {
              stryCov_9fa48("2877");
              if (stryMutAct_9fa48("2880") ? false : stryMutAct_9fa48("2879") ? true : stryMutAct_9fa48("2878") ? visited.has(p.prerequisiteId) : (stryCov_9fa48("2878", "2879", "2880"), !visited.has(p.prerequisiteId))) queue.push(p.prerequisiteId);
            }
          }
        }
      }
      return chain;
    }
  }

  /** Validate that a user has completed all prerequisites for a course */
  async validatePrerequisites(userId: string, courseId: string, adminOverride = stryMutAct_9fa48("2881") ? true : (stryCov_9fa48("2881"), false)): Promise<{
    satisfied: boolean;
    missing: string[];
  }> {
    if (stryMutAct_9fa48("2882")) {
      {}
    } else {
      stryCov_9fa48("2882");
      if (stryMutAct_9fa48("2884") ? false : stryMutAct_9fa48("2883") ? true : (stryCov_9fa48("2883", "2884"), adminOverride)) return stryMutAct_9fa48("2885") ? {} : (stryCov_9fa48("2885"), {
        satisfied: stryMutAct_9fa48("2886") ? false : (stryCov_9fa48("2886"), true),
        missing: stryMutAct_9fa48("2887") ? ["Stryker was here"] : (stryCov_9fa48("2887"), [])
      });
      const prereqs = await this.prereqRepo.find(stryMutAct_9fa48("2888") ? {} : (stryCov_9fa48("2888"), {
        where: stryMutAct_9fa48("2889") ? {} : (stryCov_9fa48("2889"), {
          courseId
        })
      }));
      if (stryMutAct_9fa48("2892") ? false : stryMutAct_9fa48("2891") ? true : stryMutAct_9fa48("2890") ? prereqs.length : (stryCov_9fa48("2890", "2891", "2892"), !prereqs.length)) return stryMutAct_9fa48("2893") ? {} : (stryCov_9fa48("2893"), {
        satisfied: stryMutAct_9fa48("2894") ? false : (stryCov_9fa48("2894"), true),
        missing: stryMutAct_9fa48("2895") ? ["Stryker was here"] : (stryCov_9fa48("2895"), [])
      });
      const completedEnrollments = await this.enrollmentRepo.find(stryMutAct_9fa48("2896") ? {} : (stryCov_9fa48("2896"), {
        where: stryMutAct_9fa48("2897") ? {} : (stryCov_9fa48("2897"), {
          userId
        }),
        select: stryMutAct_9fa48("2898") ? [] : (stryCov_9fa48("2898"), [stryMutAct_9fa48("2899") ? "" : (stryCov_9fa48("2899"), 'courseId'), stryMutAct_9fa48("2900") ? "" : (stryCov_9fa48("2900"), 'completedAt')])
      }));
      const completedCourseIds = new Set(stryMutAct_9fa48("2901") ? completedEnrollments.map(e => e.courseId) : (stryCov_9fa48("2901"), completedEnrollments.filter(stryMutAct_9fa48("2902") ? () => undefined : (stryCov_9fa48("2902"), e => e.completedAt)).map(stryMutAct_9fa48("2903") ? () => undefined : (stryCov_9fa48("2903"), e => e.courseId))));
      const missing = stryMutAct_9fa48("2904") ? prereqs.map(p => p.prerequisiteId) : (stryCov_9fa48("2904"), prereqs.filter(stryMutAct_9fa48("2905") ? () => undefined : (stryCov_9fa48("2905"), p => stryMutAct_9fa48("2906") ? completedCourseIds.has(p.prerequisiteId) : (stryCov_9fa48("2906"), !completedCourseIds.has(p.prerequisiteId)))).map(stryMutAct_9fa48("2907") ? () => undefined : (stryCov_9fa48("2907"), p => p.prerequisiteId)));
      return stryMutAct_9fa48("2908") ? {} : (stryCov_9fa48("2908"), {
        satisfied: stryMutAct_9fa48("2911") ? missing.length !== 0 : stryMutAct_9fa48("2910") ? false : stryMutAct_9fa48("2909") ? true : (stryCov_9fa48("2909", "2910", "2911"), missing.length === 0),
        missing
      });
    }
  }

  /** Throws if prerequisites are not met (used by enrollment) */
  async enforcePrerequisites(userId: string, courseId: string, adminOverride = stryMutAct_9fa48("2912") ? true : (stryCov_9fa48("2912"), false)): Promise<void> {
    if (stryMutAct_9fa48("2913")) {
      {}
    } else {
      stryCov_9fa48("2913");
      const {
        satisfied,
        missing
      } = await this.validatePrerequisites(userId, courseId, adminOverride);
      if (stryMutAct_9fa48("2916") ? false : stryMutAct_9fa48("2915") ? true : stryMutAct_9fa48("2914") ? satisfied : (stryCov_9fa48("2914", "2915", "2916"), !satisfied)) {
        if (stryMutAct_9fa48("2917")) {
          {}
        } else {
          stryCov_9fa48("2917");
          throw new ForbiddenException(stryMutAct_9fa48("2918") ? `` : (stryCov_9fa48("2918"), `Prerequisites not completed. Missing course IDs: ${missing.join(stryMutAct_9fa48("2919") ? "" : (stryCov_9fa48("2919"), ', '))}`));
        }
      }
    }
  }

  /** Returns prerequisites with per-course progress for the given user */
  async getPrerequisiteStatus(courseId: string, userId: string) {
    if (stryMutAct_9fa48("2920")) {
      {}
    } else {
      stryCov_9fa48("2920");
      const prereqs = await this.prereqRepo.find(stryMutAct_9fa48("2921") ? {} : (stryCov_9fa48("2921"), {
        where: stryMutAct_9fa48("2922") ? {} : (stryCov_9fa48("2922"), {
          courseId
        }),
        relations: stryMutAct_9fa48("2923") ? [] : (stryCov_9fa48("2923"), [stryMutAct_9fa48("2924") ? "" : (stryCov_9fa48("2924"), 'prerequisite')])
      }));
      if (stryMutAct_9fa48("2927") ? false : stryMutAct_9fa48("2926") ? true : stryMutAct_9fa48("2925") ? prereqs.length : (stryCov_9fa48("2925", "2926", "2927"), !prereqs.length)) return stryMutAct_9fa48("2928") ? {} : (stryCov_9fa48("2928"), {
        allSatisfied: stryMutAct_9fa48("2929") ? false : (stryCov_9fa48("2929"), true),
        prerequisites: stryMutAct_9fa48("2930") ? ["Stryker was here"] : (stryCov_9fa48("2930"), [])
      });
      const enrollments = await this.enrollmentRepo.find(stryMutAct_9fa48("2931") ? {} : (stryCov_9fa48("2931"), {
        where: stryMutAct_9fa48("2932") ? {} : (stryCov_9fa48("2932"), {
          userId
        }),
        select: stryMutAct_9fa48("2933") ? [] : (stryCov_9fa48("2933"), [stryMutAct_9fa48("2934") ? "" : (stryCov_9fa48("2934"), 'courseId'), stryMutAct_9fa48("2935") ? "" : (stryCov_9fa48("2935"), 'completedAt')])
      }));
      const enrollmentMap = new Map(enrollments.map(stryMutAct_9fa48("2936") ? () => undefined : (stryCov_9fa48("2936"), e => stryMutAct_9fa48("2937") ? [] : (stryCov_9fa48("2937"), [e.courseId, e]))));
      const prerequisites = prereqs.map(p => {
        if (stryMutAct_9fa48("2938")) {
          {}
        } else {
          stryCov_9fa48("2938");
          const enrollment = enrollmentMap.get(p.prerequisiteId);
          return stryMutAct_9fa48("2939") ? {} : (stryCov_9fa48("2939"), {
            courseId: p.prerequisiteId,
            title: p.prerequisite.title,
            completed: stryMutAct_9fa48("2940") ? !enrollment?.completedAt : (stryCov_9fa48("2940"), !(stryMutAct_9fa48("2941") ? enrollment?.completedAt : (stryCov_9fa48("2941"), !(stryMutAct_9fa48("2942") ? enrollment.completedAt : (stryCov_9fa48("2942"), enrollment?.completedAt))))),
            enrolled: stryMutAct_9fa48("2943") ? !enrollment : (stryCov_9fa48("2943"), !(stryMutAct_9fa48("2944") ? enrollment : (stryCov_9fa48("2944"), !enrollment)))
          });
        }
      });
      return stryMutAct_9fa48("2945") ? {} : (stryCov_9fa48("2945"), {
        allSatisfied: stryMutAct_9fa48("2946") ? prerequisites.some(p => p.completed) : (stryCov_9fa48("2946"), prerequisites.every(stryMutAct_9fa48("2947") ? () => undefined : (stryCov_9fa48("2947"), p => p.completed))),
        prerequisites
      });
    }
  }
}