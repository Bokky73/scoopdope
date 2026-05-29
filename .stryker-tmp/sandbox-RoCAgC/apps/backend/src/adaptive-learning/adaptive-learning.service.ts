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
import { StudentPerformance } from './student-performance.entity';
import { AbTestAssignment } from './ab-test-assignment.entity';
const MASTERY_THRESHOLD_UP = 0.8;
const MASTERY_THRESHOLD_DOWN = 0.4;
@Injectable()
export class AdaptiveLearningService {
  constructor(@InjectRepository(StudentPerformance)
  private performanceRepo: Repository<StudentPerformance>, @InjectRepository(AbTestAssignment)
  private abTestRepo: Repository<AbTestAssignment>) {}
  async recordQuizResult(userId: string, topicId: string, score // 0-100
  : number): Promise<StudentPerformance> {
    if (stryMutAct_9fa48("105")) {
      {}
    } else {
      stryCov_9fa48("105");
      let perf = await this.performanceRepo.findOne(stryMutAct_9fa48("106") ? {} : (stryCov_9fa48("106"), {
        where: stryMutAct_9fa48("107") ? {} : (stryCov_9fa48("107"), {
          userId,
          topicId
        })
      }));
      if (stryMutAct_9fa48("110") ? false : stryMutAct_9fa48("109") ? true : stryMutAct_9fa48("108") ? perf : (stryCov_9fa48("108", "109", "110"), !perf)) {
        if (stryMutAct_9fa48("111")) {
          {}
        } else {
          stryCov_9fa48("111");
          perf = this.performanceRepo.create(stryMutAct_9fa48("112") ? {} : (stryCov_9fa48("112"), {
            userId,
            topicId
          }));
        }
      }

      // Rolling average
      const total = stryMutAct_9fa48("113") ? perf.averageScore * perf.attemptCount - score : (stryCov_9fa48("113"), (stryMutAct_9fa48("114") ? perf.averageScore / perf.attemptCount : (stryCov_9fa48("114"), perf.averageScore * perf.attemptCount)) + score);
      stryMutAct_9fa48("115") ? perf.attemptCount -= 1 : (stryCov_9fa48("115"), perf.attemptCount += 1);
      perf.averageScore = stryMutAct_9fa48("116") ? total * perf.attemptCount : (stryCov_9fa48("116"), total / perf.attemptCount);
      perf.masteryLevel = stryMutAct_9fa48("117") ? perf.averageScore * 100 : (stryCov_9fa48("117"), perf.averageScore / 100);

      // Adjust difficulty
      perf.currentDifficulty = this.adjustDifficulty(perf.masteryLevel, perf.currentDifficulty);
      return this.performanceRepo.save(perf);
    }
  }
  private adjustDifficulty(mastery: number, current: 'easy' | 'medium' | 'hard'): 'easy' | 'medium' | 'hard' {
    if (stryMutAct_9fa48("118")) {
      {}
    } else {
      stryCov_9fa48("118");
      if (stryMutAct_9fa48("122") ? mastery < MASTERY_THRESHOLD_UP : stryMutAct_9fa48("121") ? mastery > MASTERY_THRESHOLD_UP : stryMutAct_9fa48("120") ? false : stryMutAct_9fa48("119") ? true : (stryCov_9fa48("119", "120", "121", "122"), mastery >= MASTERY_THRESHOLD_UP)) {
        if (stryMutAct_9fa48("123")) {
          {}
        } else {
          stryCov_9fa48("123");
          if (stryMutAct_9fa48("126") ? current !== 'easy' : stryMutAct_9fa48("125") ? false : stryMutAct_9fa48("124") ? true : (stryCov_9fa48("124", "125", "126"), current === (stryMutAct_9fa48("127") ? "" : (stryCov_9fa48("127"), 'easy')))) return stryMutAct_9fa48("128") ? "" : (stryCov_9fa48("128"), 'medium');
          if (stryMutAct_9fa48("131") ? current !== 'medium' : stryMutAct_9fa48("130") ? false : stryMutAct_9fa48("129") ? true : (stryCov_9fa48("129", "130", "131"), current === (stryMutAct_9fa48("132") ? "" : (stryCov_9fa48("132"), 'medium')))) return stryMutAct_9fa48("133") ? "" : (stryCov_9fa48("133"), 'hard');
        }
      }
      if (stryMutAct_9fa48("137") ? mastery >= MASTERY_THRESHOLD_DOWN : stryMutAct_9fa48("136") ? mastery <= MASTERY_THRESHOLD_DOWN : stryMutAct_9fa48("135") ? false : stryMutAct_9fa48("134") ? true : (stryCov_9fa48("134", "135", "136", "137"), mastery < MASTERY_THRESHOLD_DOWN)) {
        if (stryMutAct_9fa48("138")) {
          {}
        } else {
          stryCov_9fa48("138");
          if (stryMutAct_9fa48("141") ? current !== 'hard' : stryMutAct_9fa48("140") ? false : stryMutAct_9fa48("139") ? true : (stryCov_9fa48("139", "140", "141"), current === (stryMutAct_9fa48("142") ? "" : (stryCov_9fa48("142"), 'hard')))) return stryMutAct_9fa48("143") ? "" : (stryCov_9fa48("143"), 'medium');
          if (stryMutAct_9fa48("146") ? current !== 'medium' : stryMutAct_9fa48("145") ? false : stryMutAct_9fa48("144") ? true : (stryCov_9fa48("144", "145", "146"), current === (stryMutAct_9fa48("147") ? "" : (stryCov_9fa48("147"), 'medium')))) return stryMutAct_9fa48("148") ? "" : (stryCov_9fa48("148"), 'easy');
        }
      }
      return current;
    }
  }
  async getRecommendations(userId: string): Promise<{
    weakTopics: string[];
    recommendedDifficulty: Record<string, string>;
  }> {
    if (stryMutAct_9fa48("149")) {
      {}
    } else {
      stryCov_9fa48("149");
      const performances = await this.performanceRepo.find(stryMutAct_9fa48("150") ? {} : (stryCov_9fa48("150"), {
        where: stryMutAct_9fa48("151") ? {} : (stryCov_9fa48("151"), {
          userId
        })
      }));
      const weakTopics = stryMutAct_9fa48("152") ? performances.map(p => p.topicId) : (stryCov_9fa48("152"), performances.filter(stryMutAct_9fa48("153") ? () => undefined : (stryCov_9fa48("153"), p => stryMutAct_9fa48("157") ? p.masteryLevel >= MASTERY_THRESHOLD_DOWN : stryMutAct_9fa48("156") ? p.masteryLevel <= MASTERY_THRESHOLD_DOWN : stryMutAct_9fa48("155") ? false : stryMutAct_9fa48("154") ? true : (stryCov_9fa48("154", "155", "156", "157"), p.masteryLevel < MASTERY_THRESHOLD_DOWN))).map(stryMutAct_9fa48("158") ? () => undefined : (stryCov_9fa48("158"), p => p.topicId)));
      const recommendedDifficulty: Record<string, string> = {};
      for (const p of performances) {
        if (stryMutAct_9fa48("159")) {
          {}
        } else {
          stryCov_9fa48("159");
          recommendedDifficulty[p.topicId] = p.currentDifficulty;
        }
      }
      return stryMutAct_9fa48("160") ? {} : (stryCov_9fa48("160"), {
        weakTopics,
        recommendedDifficulty
      });
    }
  }
  async getPerformance(userId: string, topicId?: string): Promise<StudentPerformance[]> {
    if (stryMutAct_9fa48("161")) {
      {}
    } else {
      stryCov_9fa48("161");
      const where = topicId ? stryMutAct_9fa48("162") ? {} : (stryCov_9fa48("162"), {
        userId,
        topicId
      }) : stryMutAct_9fa48("163") ? {} : (stryCov_9fa48("163"), {
        userId
      });
      return this.performanceRepo.find(stryMutAct_9fa48("164") ? {} : (stryCov_9fa48("164"), {
        where
      }));
    }
  }

  /** Assign user to A/B experiment variant deterministically */
  async getOrAssignVariant(userId: string, experimentName: string): Promise<'control' | 'variant'> {
    if (stryMutAct_9fa48("165")) {
      {}
    } else {
      stryCov_9fa48("165");
      const existing = await this.abTestRepo.findOne(stryMutAct_9fa48("166") ? {} : (stryCov_9fa48("166"), {
        where: stryMutAct_9fa48("167") ? {} : (stryCov_9fa48("167"), {
          userId,
          experimentName
        })
      }));
      if (stryMutAct_9fa48("169") ? false : stryMutAct_9fa48("168") ? true : (stryCov_9fa48("168", "169"), existing)) return existing.variant;

      // Simple deterministic split based on userId hash
      const hash = userId.split(stryMutAct_9fa48("170") ? "Stryker was here!" : (stryCov_9fa48("170"), '')).reduce(stryMutAct_9fa48("171") ? () => undefined : (stryCov_9fa48("171"), (acc, c) => stryMutAct_9fa48("172") ? acc - c.charCodeAt(0) : (stryCov_9fa48("172"), acc + c.charCodeAt(0))), 0);
      const variant: 'control' | 'variant' = (stryMutAct_9fa48("175") ? hash % 2 !== 0 : stryMutAct_9fa48("174") ? false : stryMutAct_9fa48("173") ? true : (stryCov_9fa48("173", "174", "175"), (stryMutAct_9fa48("176") ? hash * 2 : (stryCov_9fa48("176"), hash % 2)) === 0)) ? stryMutAct_9fa48("177") ? "" : (stryCov_9fa48("177"), 'control') : stryMutAct_9fa48("178") ? "" : (stryCov_9fa48("178"), 'variant');
      await this.abTestRepo.save(this.abTestRepo.create(stryMutAct_9fa48("179") ? {} : (stryCov_9fa48("179"), {
        userId,
        experimentName,
        variant
      })));
      return variant;
    }
  }
  async recordAbOutcome(userId: string, experimentName: string, outcomeScore: number): Promise<void> {
    if (stryMutAct_9fa48("180")) {
      {}
    } else {
      stryCov_9fa48("180");
      await this.abTestRepo.update(stryMutAct_9fa48("181") ? {} : (stryCov_9fa48("181"), {
        userId,
        experimentName
      }), stryMutAct_9fa48("182") ? {} : (stryCov_9fa48("182"), {
        outcomeScore
      }));
    }
  }
  async getAbTestResults(experimentName: string): Promise<{
    control: {
      count: number;
      avgScore: number;
    };
    variant: {
      count: number;
      avgScore: number;
    };
  }> {
    if (stryMutAct_9fa48("183")) {
      {}
    } else {
      stryCov_9fa48("183");
      const assignments = await this.abTestRepo.find(stryMutAct_9fa48("184") ? {} : (stryCov_9fa48("184"), {
        where: stryMutAct_9fa48("185") ? {} : (stryCov_9fa48("185"), {
          experimentName
        })
      }));
      const summarize = (v: 'control' | 'variant') => {
        if (stryMutAct_9fa48("186")) {
          {}
        } else {
          stryCov_9fa48("186");
          const group = stryMutAct_9fa48("187") ? assignments : (stryCov_9fa48("187"), assignments.filter(stryMutAct_9fa48("188") ? () => undefined : (stryCov_9fa48("188"), a => stryMutAct_9fa48("191") ? a.variant === v || a.outcomeScore != null : stryMutAct_9fa48("190") ? false : stryMutAct_9fa48("189") ? true : (stryCov_9fa48("189", "190", "191"), (stryMutAct_9fa48("193") ? a.variant !== v : stryMutAct_9fa48("192") ? true : (stryCov_9fa48("192", "193"), a.variant === v)) && (stryMutAct_9fa48("195") ? a.outcomeScore == null : stryMutAct_9fa48("194") ? true : (stryCov_9fa48("194", "195"), a.outcomeScore != null))))));
          const count = group.length;
          const avgScore = (stryMutAct_9fa48("199") ? count <= 0 : stryMutAct_9fa48("198") ? count >= 0 : stryMutAct_9fa48("197") ? false : stryMutAct_9fa48("196") ? true : (stryCov_9fa48("196", "197", "198", "199"), count > 0)) ? stryMutAct_9fa48("200") ? group.reduce((s, a) => s + a.outcomeScore, 0) * count : (stryCov_9fa48("200"), group.reduce(stryMutAct_9fa48("201") ? () => undefined : (stryCov_9fa48("201"), (s, a) => stryMutAct_9fa48("202") ? s - a.outcomeScore : (stryCov_9fa48("202"), s + a.outcomeScore)), 0) / count) : 0;
          return stryMutAct_9fa48("203") ? {} : (stryCov_9fa48("203"), {
            count,
            avgScore
          });
        }
      };
      return stryMutAct_9fa48("204") ? {} : (stryCov_9fa48("204"), {
        control: summarize(stryMutAct_9fa48("205") ? "" : (stryCov_9fa48("205"), 'control')),
        variant: summarize(stryMutAct_9fa48("206") ? "" : (stryCov_9fa48("206"), 'variant'))
      });
    }
  }
}