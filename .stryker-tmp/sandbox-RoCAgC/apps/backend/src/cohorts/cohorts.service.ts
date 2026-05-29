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
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cohort } from './cohort.entity';
import { CohortMember } from './cohort-member.entity';
@Injectable()
export class CohortsService {
  constructor(@InjectRepository(Cohort)
  private cohortRepo: Repository<Cohort>, @InjectRepository(CohortMember)
  private memberRepo: Repository<CohortMember>) {}
  async createCohort(courseId: string, instructorId: string, data: any) {
    if (stryMutAct_9fa48("1771")) {
      {}
    } else {
      stryCov_9fa48("1771");
      const cohort = this.cohortRepo.create(stryMutAct_9fa48("1772") ? {} : (stryCov_9fa48("1772"), {
        courseId,
        instructorId,
        ...data
      }));
      return this.cohortRepo.save(cohort);
    }
  }
  async getCohort(id: string) {
    if (stryMutAct_9fa48("1773")) {
      {}
    } else {
      stryCov_9fa48("1773");
      return this.cohortRepo.findOne(stryMutAct_9fa48("1774") ? {} : (stryCov_9fa48("1774"), {
        where: stryMutAct_9fa48("1775") ? {} : (stryCov_9fa48("1775"), {
          id
        }),
        relations: stryMutAct_9fa48("1776") ? [] : (stryCov_9fa48("1776"), [stryMutAct_9fa48("1777") ? "" : (stryCov_9fa48("1777"), 'members'), stryMutAct_9fa48("1778") ? "" : (stryCov_9fa48("1778"), 'members.user')])
      }));
    }
  }
  async addMember(cohortId: string, userId: string) {
    if (stryMutAct_9fa48("1779")) {
      {}
    } else {
      stryCov_9fa48("1779");
      const cohort = await this.cohortRepo.findOne(stryMutAct_9fa48("1780") ? {} : (stryCov_9fa48("1780"), {
        where: stryMutAct_9fa48("1781") ? {} : (stryCov_9fa48("1781"), {
          id: cohortId
        })
      }));
      if (stryMutAct_9fa48("1785") ? cohort.maxMembers <= 0 : stryMutAct_9fa48("1784") ? cohort.maxMembers >= 0 : stryMutAct_9fa48("1783") ? false : stryMutAct_9fa48("1782") ? true : (stryCov_9fa48("1782", "1783", "1784", "1785"), cohort.maxMembers > 0)) {
        if (stryMutAct_9fa48("1786")) {
          {}
        } else {
          stryCov_9fa48("1786");
          const memberCount = await this.memberRepo.count(stryMutAct_9fa48("1787") ? {} : (stryCov_9fa48("1787"), {
            where: stryMutAct_9fa48("1788") ? {} : (stryCov_9fa48("1788"), {
              cohortId
            })
          }));
          if (stryMutAct_9fa48("1792") ? memberCount < cohort.maxMembers : stryMutAct_9fa48("1791") ? memberCount > cohort.maxMembers : stryMutAct_9fa48("1790") ? false : stryMutAct_9fa48("1789") ? true : (stryCov_9fa48("1789", "1790", "1791", "1792"), memberCount >= cohort.maxMembers)) {
            if (stryMutAct_9fa48("1793")) {
              {}
            } else {
              stryCov_9fa48("1793");
              throw new Error(stryMutAct_9fa48("1794") ? "" : (stryCov_9fa48("1794"), 'Cohort is full'));
            }
          }
        }
      }
      const member = this.memberRepo.create(stryMutAct_9fa48("1795") ? {} : (stryCov_9fa48("1795"), {
        cohortId,
        userId
      }));
      return this.memberRepo.save(member);
    }
  }
  async removeMember(cohortId: string, userId: string) {
    if (stryMutAct_9fa48("1796")) {
      {}
    } else {
      stryCov_9fa48("1796");
      return this.memberRepo.delete(stryMutAct_9fa48("1797") ? {} : (stryCov_9fa48("1797"), {
        cohortId,
        userId
      }));
    }
  }
  async updateMemberProgress(cohortId: string, userId: string, progressPercentage: number) {
    if (stryMutAct_9fa48("1798")) {
      {}
    } else {
      stryCov_9fa48("1798");
      return this.memberRepo.update(stryMutAct_9fa48("1799") ? {} : (stryCov_9fa48("1799"), {
        cohortId,
        userId
      }), stryMutAct_9fa48("1800") ? {} : (stryCov_9fa48("1800"), {
        progressPercentage
      }));
    }
  }
  async getCohortProgress(cohortId: string) {
    if (stryMutAct_9fa48("1801")) {
      {}
    } else {
      stryCov_9fa48("1801");
      const members = await this.memberRepo.find(stryMutAct_9fa48("1802") ? {} : (stryCov_9fa48("1802"), {
        where: stryMutAct_9fa48("1803") ? {} : (stryCov_9fa48("1803"), {
          cohortId
        })
      }));
      const avgProgress = (stryMutAct_9fa48("1807") ? members.length <= 0 : stryMutAct_9fa48("1806") ? members.length >= 0 : stryMutAct_9fa48("1805") ? false : stryMutAct_9fa48("1804") ? true : (stryCov_9fa48("1804", "1805", "1806", "1807"), members.length > 0)) ? stryMutAct_9fa48("1808") ? members.reduce((sum, m) => sum + m.progressPercentage, 0) * members.length : (stryCov_9fa48("1808"), members.reduce(stryMutAct_9fa48("1809") ? () => undefined : (stryCov_9fa48("1809"), (sum, m) => stryMutAct_9fa48("1810") ? sum - m.progressPercentage : (stryCov_9fa48("1810"), sum + m.progressPercentage)), 0) / members.length) : 0;
      return stryMutAct_9fa48("1811") ? {} : (stryCov_9fa48("1811"), {
        totalMembers: members.length,
        averageProgress: avgProgress,
        members
      });
    }
  }
  async getCohortsByCourse(courseId: string) {
    if (stryMutAct_9fa48("1812")) {
      {}
    } else {
      stryCov_9fa48("1812");
      return this.cohortRepo.find(stryMutAct_9fa48("1813") ? {} : (stryCov_9fa48("1813"), {
        where: stryMutAct_9fa48("1814") ? {} : (stryCov_9fa48("1814"), {
          courseId
        }),
        relations: stryMutAct_9fa48("1815") ? [] : (stryCov_9fa48("1815"), [stryMutAct_9fa48("1816") ? "" : (stryCov_9fa48("1816"), 'members')])
      }));
    }
  }
}