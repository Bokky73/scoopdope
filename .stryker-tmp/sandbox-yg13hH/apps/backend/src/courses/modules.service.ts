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
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseModule } from './course-module.entity';
@Injectable()
export class ModulesService {
  constructor(@InjectRepository(CourseModule)
  private repo: Repository<CourseModule>) {}
  private withLockStatus(mod: CourseModule): CourseModule & {
    isLocked: boolean;
  } {
    if (stryMutAct_9fa48("2752")) {
      {}
    } else {
      stryCov_9fa48("2752");
      const isLocked = stryMutAct_9fa48("2755") ? mod.releaseDate != null || new Date(mod.releaseDate) > new Date() : stryMutAct_9fa48("2754") ? false : stryMutAct_9fa48("2753") ? true : (stryCov_9fa48("2753", "2754", "2755"), (stryMutAct_9fa48("2757") ? mod.releaseDate == null : stryMutAct_9fa48("2756") ? true : (stryCov_9fa48("2756", "2757"), mod.releaseDate != null)) && (stryMutAct_9fa48("2760") ? new Date(mod.releaseDate) <= new Date() : stryMutAct_9fa48("2759") ? new Date(mod.releaseDate) >= new Date() : stryMutAct_9fa48("2758") ? true : (stryCov_9fa48("2758", "2759", "2760"), new Date(mod.releaseDate) > new Date())));
      return stryMutAct_9fa48("2761") ? {} : (stryCov_9fa48("2761"), {
        ...mod,
        isLocked
      });
    }
  }
  async findByCourse(courseId: string) {
    if (stryMutAct_9fa48("2762")) {
      {}
    } else {
      stryCov_9fa48("2762");
      const modules = await this.repo.find(stryMutAct_9fa48("2763") ? {} : (stryCov_9fa48("2763"), {
        where: stryMutAct_9fa48("2764") ? {} : (stryCov_9fa48("2764"), {
          courseId
        }),
        order: stryMutAct_9fa48("2765") ? {} : (stryCov_9fa48("2765"), {
          order: stryMutAct_9fa48("2766") ? "" : (stryCov_9fa48("2766"), 'ASC')
        })
      }));
      return modules.map(stryMutAct_9fa48("2767") ? () => undefined : (stryCov_9fa48("2767"), m => this.withLockStatus(m)));
    }
  }
  async findOne(id: string) {
    if (stryMutAct_9fa48("2768")) {
      {}
    } else {
      stryCov_9fa48("2768");
      const mod = await this.repo.findOne(stryMutAct_9fa48("2769") ? {} : (stryCov_9fa48("2769"), {
        where: stryMutAct_9fa48("2770") ? {} : (stryCov_9fa48("2770"), {
          id
        })
      }));
      return mod ? this.withLockStatus(mod) : null;
    }
  }

  /** Check if a module is accessible. Admins/instructors bypass the lock. */
  async assertAccessible(id: string, role?: string): Promise<void> {
    if (stryMutAct_9fa48("2771")) {
      {}
    } else {
      stryCov_9fa48("2771");
      const mod = await this.repo.findOne(stryMutAct_9fa48("2772") ? {} : (stryCov_9fa48("2772"), {
        where: stryMutAct_9fa48("2773") ? {} : (stryCov_9fa48("2773"), {
          id
        })
      }));
      if (stryMutAct_9fa48("2776") ? false : stryMutAct_9fa48("2775") ? true : stryMutAct_9fa48("2774") ? mod : (stryCov_9fa48("2774", "2775", "2776"), !mod)) throw new NotFoundException(stryMutAct_9fa48("2777") ? "" : (stryCov_9fa48("2777"), 'Module not found'));
      if (stryMutAct_9fa48("2780") ? role === 'admin' && role === 'instructor' : stryMutAct_9fa48("2779") ? false : stryMutAct_9fa48("2778") ? true : (stryCov_9fa48("2778", "2779", "2780"), (stryMutAct_9fa48("2782") ? role !== 'admin' : stryMutAct_9fa48("2781") ? false : (stryCov_9fa48("2781", "2782"), role === (stryMutAct_9fa48("2783") ? "" : (stryCov_9fa48("2783"), 'admin')))) || (stryMutAct_9fa48("2785") ? role !== 'instructor' : stryMutAct_9fa48("2784") ? false : (stryCov_9fa48("2784", "2785"), role === (stryMutAct_9fa48("2786") ? "" : (stryCov_9fa48("2786"), 'instructor')))))) return;
      if (stryMutAct_9fa48("2789") ? mod.releaseDate || new Date(mod.releaseDate) > new Date() : stryMutAct_9fa48("2788") ? false : stryMutAct_9fa48("2787") ? true : (stryCov_9fa48("2787", "2788", "2789"), mod.releaseDate && (stryMutAct_9fa48("2792") ? new Date(mod.releaseDate) <= new Date() : stryMutAct_9fa48("2791") ? new Date(mod.releaseDate) >= new Date() : stryMutAct_9fa48("2790") ? true : (stryCov_9fa48("2790", "2791", "2792"), new Date(mod.releaseDate) > new Date())))) {
        if (stryMutAct_9fa48("2793")) {
          {}
        } else {
          stryCov_9fa48("2793");
          throw new ForbiddenException(stryMutAct_9fa48("2794") ? `` : (stryCov_9fa48("2794"), `Module is locked until ${mod.releaseDate.toISOString()}`));
        }
      }
    }
  }
  create(courseId: string, data: Partial<CourseModule>) {
    if (stryMutAct_9fa48("2795")) {
      {}
    } else {
      stryCov_9fa48("2795");
      return this.repo.save(this.repo.create(stryMutAct_9fa48("2796") ? {} : (stryCov_9fa48("2796"), {
        ...data,
        courseId
      })));
    }
  }
  async update(id: string, data: Partial<CourseModule>) {
    if (stryMutAct_9fa48("2797")) {
      {}
    } else {
      stryCov_9fa48("2797");
      const mod = await this.repo.findOne(stryMutAct_9fa48("2798") ? {} : (stryCov_9fa48("2798"), {
        where: stryMutAct_9fa48("2799") ? {} : (stryCov_9fa48("2799"), {
          id
        })
      }));
      if (stryMutAct_9fa48("2802") ? false : stryMutAct_9fa48("2801") ? true : stryMutAct_9fa48("2800") ? mod : (stryCov_9fa48("2800", "2801", "2802"), !mod)) throw new NotFoundException(stryMutAct_9fa48("2803") ? "" : (stryCov_9fa48("2803"), 'Module not found'));
      return this.withLockStatus(await this.repo.save(stryMutAct_9fa48("2804") ? {} : (stryCov_9fa48("2804"), {
        ...mod,
        ...data
      })));
    }
  }
  async remove(id: string) {
    if (stryMutAct_9fa48("2805")) {
      {}
    } else {
      stryCov_9fa48("2805");
      const mod = await this.repo.findOne(stryMutAct_9fa48("2806") ? {} : (stryCov_9fa48("2806"), {
        where: stryMutAct_9fa48("2807") ? {} : (stryCov_9fa48("2807"), {
          id
        })
      }));
      if (stryMutAct_9fa48("2810") ? false : stryMutAct_9fa48("2809") ? true : stryMutAct_9fa48("2808") ? mod : (stryCov_9fa48("2808", "2809", "2810"), !mod)) throw new NotFoundException(stryMutAct_9fa48("2811") ? "" : (stryCov_9fa48("2811"), 'Module not found'));
      return this.repo.remove(mod);
    }
  }

  /** Admin override: clear the release date to unlock immediately. */
  async unlockNow(id: string) {
    if (stryMutAct_9fa48("2812")) {
      {}
    } else {
      stryCov_9fa48("2812");
      const mod = await this.repo.findOne(stryMutAct_9fa48("2813") ? {} : (stryCov_9fa48("2813"), {
        where: stryMutAct_9fa48("2814") ? {} : (stryCov_9fa48("2814"), {
          id
        })
      }));
      if (stryMutAct_9fa48("2817") ? false : stryMutAct_9fa48("2816") ? true : stryMutAct_9fa48("2815") ? mod : (stryCov_9fa48("2815", "2816", "2817"), !mod)) throw new NotFoundException(stryMutAct_9fa48("2818") ? "" : (stryCov_9fa48("2818"), 'Module not found'));
      mod.releaseDate = null;
      return this.withLockStatus(await this.repo.save(mod));
    }
  }

  /** Find modules whose releaseDate just passed (within the last minute). Used by the scheduler. */
  findJustUnlocked(): Promise<CourseModule[]> {
    if (stryMutAct_9fa48("2819")) {
      {}
    } else {
      stryCov_9fa48("2819");
      const now = new Date();
      const oneMinuteAgo = new Date(stryMutAct_9fa48("2820") ? now.getTime() + 60_000 : (stryCov_9fa48("2820"), now.getTime() - 60_000));
      return this.repo.createQueryBuilder(stryMutAct_9fa48("2821") ? "" : (stryCov_9fa48("2821"), 'm')).where(stryMutAct_9fa48("2822") ? "" : (stryCov_9fa48("2822"), 'm.releaseDate <= :now'), stryMutAct_9fa48("2823") ? {} : (stryCov_9fa48("2823"), {
        now
      })).andWhere(stryMutAct_9fa48("2824") ? "" : (stryCov_9fa48("2824"), 'm.releaseDate > :oneMinuteAgo'), stryMutAct_9fa48("2825") ? {} : (stryCov_9fa48("2825"), {
        oneMinuteAgo
      })).getMany();
    }
  }
}