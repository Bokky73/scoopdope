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
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { StellarService } from '../stellar/stellar.service';
@Injectable()
export class StreaksService {
  private readonly logger = new Logger(StreaksService.name);
  constructor(@InjectRepository(User)
  private userRepo: Repository<User>, private stellarService: StellarService) {}
  async recordActivity(userId: string): Promise<User> {
    if (stryMutAct_9fa48("6748")) {
      {}
    } else {
      stryCov_9fa48("6748");
      const user = await this.userRepo.findOne(stryMutAct_9fa48("6749") ? {} : (stryCov_9fa48("6749"), {
        where: stryMutAct_9fa48("6750") ? {} : (stryCov_9fa48("6750"), {
          id: userId
        })
      }));
      if (stryMutAct_9fa48("6753") ? false : stryMutAct_9fa48("6752") ? true : stryMutAct_9fa48("6751") ? user : (stryCov_9fa48("6751", "6752", "6753"), !user)) {
        if (stryMutAct_9fa48("6754")) {
          {}
        } else {
          stryCov_9fa48("6754");
          throw new Error(stryMutAct_9fa48("6755") ? "" : (stryCov_9fa48("6755"), 'User not found'));
        }
      }
      const now = new Date();
      const lastActivity = user.lastActivityAt;
      if (stryMutAct_9fa48("6758") ? false : stryMutAct_9fa48("6757") ? true : stryMutAct_9fa48("6756") ? lastActivity : (stryCov_9fa48("6756", "6757", "6758"), !lastActivity)) {
        if (stryMutAct_9fa48("6759")) {
          {}
        } else {
          stryCov_9fa48("6759");
          // First activity ever
          user.currentStreak = 1;
          user.lastActivityAt = now;
        }
      } else {
        if (stryMutAct_9fa48("6760")) {
          {}
        } else {
          stryCov_9fa48("6760");
          const isSameDay = this.isSameDay(now, lastActivity);
          const isYesterday = this.isYesterday(now, lastActivity);
          if (stryMutAct_9fa48("6762") ? false : stryMutAct_9fa48("6761") ? true : (stryCov_9fa48("6761", "6762"), isSameDay)) {
            if (stryMutAct_9fa48("6763")) {
              {}
            } else {
              stryCov_9fa48("6763");
              // Already recorded today, no change to streak count
              user.lastActivityAt = now;
              return this.userRepo.save(user);
            }
          }
          if (stryMutAct_9fa48("6765") ? false : stryMutAct_9fa48("6764") ? true : (stryCov_9fa48("6764", "6765"), isYesterday)) {
            if (stryMutAct_9fa48("6766")) {
              {}
            } else {
              stryCov_9fa48("6766");
              // Consecutive day
              stryMutAct_9fa48("6767") ? user.currentStreak -= 1 : (stryCov_9fa48("6767"), user.currentStreak += 1);
            }
          } else {
            if (stryMutAct_9fa48("6768")) {
              {}
            } else {
              stryCov_9fa48("6768");
              // Missed a day or more
              user.currentStreak = 1;
            }
          }
          user.lastActivityAt = now;
        }
      }
      if (stryMutAct_9fa48("6772") ? user.currentStreak <= user.longestStreak : stryMutAct_9fa48("6771") ? user.currentStreak >= user.longestStreak : stryMutAct_9fa48("6770") ? false : stryMutAct_9fa48("6769") ? true : (stryCov_9fa48("6769", "6770", "6771", "6772"), user.currentStreak > user.longestStreak)) {
        if (stryMutAct_9fa48("6773")) {
          {}
        } else {
          stryCov_9fa48("6773");
          user.longestStreak = user.currentStreak;
        }
      }
      const savedUser = await this.userRepo.save(user);

      // Check for milestone rewards
      await this.checkMilestones(savedUser);
      return savedUser;
    }
  }
  private async checkMilestones(user: User) {
    if (stryMutAct_9fa48("6774")) {
      {}
    } else {
      stryCov_9fa48("6774");
      const milestones = stryMutAct_9fa48("6775") ? [] : (stryCov_9fa48("6775"), [stryMutAct_9fa48("6776") ? {} : (stryCov_9fa48("6776"), {
        days: 7,
        reward: 10
      }), stryMutAct_9fa48("6777") ? {} : (stryCov_9fa48("6777"), {
        days: 30,
        reward: 50
      }), stryMutAct_9fa48("6778") ? {} : (stryCov_9fa48("6778"), {
        days: 100,
        reward: 200
      })]);
      const milestone = milestones.find(stryMutAct_9fa48("6779") ? () => undefined : (stryCov_9fa48("6779"), m => stryMutAct_9fa48("6782") ? m.days !== user.currentStreak : stryMutAct_9fa48("6781") ? false : stryMutAct_9fa48("6780") ? true : (stryCov_9fa48("6780", "6781", "6782"), m.days === user.currentStreak)));
      if (stryMutAct_9fa48("6785") ? milestone || user.stellarPublicKey : stryMutAct_9fa48("6784") ? false : stryMutAct_9fa48("6783") ? true : (stryCov_9fa48("6783", "6784", "6785"), milestone && user.stellarPublicKey)) {
        if (stryMutAct_9fa48("6786")) {
          {}
        } else {
          stryCov_9fa48("6786");
          try {
            if (stryMutAct_9fa48("6787")) {
              {}
            } else {
              stryCov_9fa48("6787");
              this.logger.log(stryMutAct_9fa48("6788") ? `` : (stryCov_9fa48("6788"), `User ${user.id} reached ${milestone.days} day streak! Minting ${milestone.reward} BST reward.`));
              await this.stellarService.mintReward(user.stellarPublicKey, milestone.reward);
            }
          } catch (error) {
            if (stryMutAct_9fa48("6789")) {
              {}
            } else {
              stryCov_9fa48("6789");
              this.logger.error(stryMutAct_9fa48("6790") ? `` : (stryCov_9fa48("6790"), `Failed to mint streak reward for user ${user.id}: ${error.message}`));
            }
          }
        }
      }
    }
  }
  private isSameDay(d1: Date, d2: Date): boolean {
    if (stryMutAct_9fa48("6791")) {
      {}
    } else {
      stryCov_9fa48("6791");
      return stryMutAct_9fa48("6794") ? d1.getUTCFullYear() === d2.getUTCFullYear() && d1.getUTCMonth() === d2.getUTCMonth() || d1.getUTCDate() === d2.getUTCDate() : stryMutAct_9fa48("6793") ? false : stryMutAct_9fa48("6792") ? true : (stryCov_9fa48("6792", "6793", "6794"), (stryMutAct_9fa48("6796") ? d1.getUTCFullYear() === d2.getUTCFullYear() || d1.getUTCMonth() === d2.getUTCMonth() : stryMutAct_9fa48("6795") ? true : (stryCov_9fa48("6795", "6796"), (stryMutAct_9fa48("6798") ? d1.getUTCFullYear() !== d2.getUTCFullYear() : stryMutAct_9fa48("6797") ? true : (stryCov_9fa48("6797", "6798"), d1.getUTCFullYear() === d2.getUTCFullYear())) && (stryMutAct_9fa48("6800") ? d1.getUTCMonth() !== d2.getUTCMonth() : stryMutAct_9fa48("6799") ? true : (stryCov_9fa48("6799", "6800"), d1.getUTCMonth() === d2.getUTCMonth())))) && (stryMutAct_9fa48("6802") ? d1.getUTCDate() !== d2.getUTCDate() : stryMutAct_9fa48("6801") ? true : (stryCov_9fa48("6801", "6802"), d1.getUTCDate() === d2.getUTCDate())));
    }
  }
  private isYesterday(now: Date, last: Date): boolean {
    if (stryMutAct_9fa48("6803")) {
      {}
    } else {
      stryCov_9fa48("6803");
      const yesterday = new Date(now);
      stryMutAct_9fa48("6804") ? yesterday.setTime(now.getUTCDate() - 1) : (stryCov_9fa48("6804"), yesterday.setUTCDate(stryMutAct_9fa48("6805") ? now.getUTCDate() + 1 : (stryCov_9fa48("6805"), now.getUTCDate() - 1)));
      return this.isSameDay(yesterday, last);
    }
  }
}