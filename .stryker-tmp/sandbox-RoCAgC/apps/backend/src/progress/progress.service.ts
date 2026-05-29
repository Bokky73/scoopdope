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
import { Repository, Not, IsNull } from 'typeorm';
import { Progress } from './progress.entity';
import { RecordProgressDto } from './dto/record-progress.dto';
import { StellarService } from '../stellar/stellar.service';
import { CredentialsService } from '../credentials/credentials.service';
import { UsersService } from '../users/users.service';
import { StreaksService } from '../streaks/streaks.service';
import { BundlesService } from '../bundles/bundles.service';
@Injectable()
export class ProgressService {
  constructor(@InjectRepository(Progress)
  private repo: Repository<Progress>, private stellarService: StellarService, private credentialsService: CredentialsService, private usersService: UsersService, private streaksService: StreaksService, private bundlesService: BundlesService) {}
  async record(userId: string, dto: RecordProgressDto, stellarPublicKey: string) {
    if (stryMutAct_9fa48("5664")) {
      {}
    } else {
      stryCov_9fa48("5664");
      // Record activity for streak
      await this.streaksService.recordActivity(userId);
      let progress = await this.repo.findOne(stryMutAct_9fa48("5665") ? {} : (stryCov_9fa48("5665"), {
        where: stryMutAct_9fa48("5666") ? {} : (stryCov_9fa48("5666"), {
          userId,
          courseId: dto.courseId
        })
      }));
      if (stryMutAct_9fa48("5669") ? false : stryMutAct_9fa48("5668") ? true : stryMutAct_9fa48("5667") ? progress : (stryCov_9fa48("5667", "5668", "5669"), !progress)) {
        if (stryMutAct_9fa48("5670")) {
          {}
        } else {
          stryCov_9fa48("5670");
          progress = this.repo.create(stryMutAct_9fa48("5671") ? {} : (stryCov_9fa48("5671"), {
            userId,
            courseId: dto.courseId
          }));
        }
      }
      progress.lessonId = stryMutAct_9fa48("5672") ? dto.lessonId && progress.lessonId : (stryCov_9fa48("5672"), dto.lessonId ?? progress.lessonId);
      progress.progressPct = dto.progressPct;
      if (stryMutAct_9fa48("5676") ? dto.progressPct < 100 : stryMutAct_9fa48("5675") ? dto.progressPct > 100 : stryMutAct_9fa48("5674") ? false : stryMutAct_9fa48("5673") ? true : (stryCov_9fa48("5673", "5674", "5675", "5676"), dto.progressPct >= 100)) {
        if (stryMutAct_9fa48("5677")) {
          {}
        } else {
          stryCov_9fa48("5677");
          progress.completedAt = new Date();
        }
      }

      // Record on-chain
      try {
        if (stryMutAct_9fa48("5678")) {
          {}
        } else {
          stryCov_9fa48("5678");
          const txHash = await this.stellarService.recordProgress(stellarPublicKey, dto.courseId, dto.progressPct);
          progress.txHash = txHash;
        }
      } catch (err) {
        // Non-fatal: store progress off-chain even if on-chain call fails
      }
      const saved = await this.repo.save(progress);

      // Update bundle progress if applicable
      if (stryMutAct_9fa48("5682") ? dto.progressPct < 100 : stryMutAct_9fa48("5681") ? dto.progressPct > 100 : stryMutAct_9fa48("5680") ? false : stryMutAct_9fa48("5679") ? true : (stryCov_9fa48("5679", "5680", "5681", "5682"), dto.progressPct >= 100)) {
        if (stryMutAct_9fa48("5683")) {
          {}
        } else {
          stryCov_9fa48("5683");
          await this.bundlesService.updateProgress(userId, dto.courseId);
        }
      }

      // Auto-issue credential at 100%
      if (stryMutAct_9fa48("5687") ? dto.progressPct < 100 : stryMutAct_9fa48("5686") ? dto.progressPct > 100 : stryMutAct_9fa48("5685") ? false : stryMutAct_9fa48("5684") ? true : (stryCov_9fa48("5684", "5685", "5686", "5687"), dto.progressPct >= 100)) {
        if (stryMutAct_9fa48("5688")) {
          {}
        } else {
          stryCov_9fa48("5688");
          await this.credentialsService.issue(userId, dto.courseId, stellarPublicKey);

          // Mint 50 BST to referrer on first course completion
          const completedCount = await this.repo.count(stryMutAct_9fa48("5689") ? {} : (stryCov_9fa48("5689"), {
            where: stryMutAct_9fa48("5690") ? {} : (stryCov_9fa48("5690"), {
              userId,
              completedAt: Not(IsNull())
            })
          }));
          if (stryMutAct_9fa48("5693") ? completedCount !== 1 : stryMutAct_9fa48("5692") ? false : stryMutAct_9fa48("5691") ? true : (stryCov_9fa48("5691", "5692", "5693"), completedCount === 1)) {
            if (stryMutAct_9fa48("5694")) {
              {}
            } else {
              stryCov_9fa48("5694");
              const user = await this.usersService.findById(userId);
              if (stryMutAct_9fa48("5697") ? user.referredBy : stryMutAct_9fa48("5696") ? false : stryMutAct_9fa48("5695") ? true : (stryCov_9fa48("5695", "5696", "5697"), user?.referredBy)) {
                if (stryMutAct_9fa48("5698")) {
                  {}
                } else {
                  stryCov_9fa48("5698");
                  const referrer = await this.usersService.findById(user.referredBy);
                  if (stryMutAct_9fa48("5701") ? referrer.stellarPublicKey : stryMutAct_9fa48("5700") ? false : stryMutAct_9fa48("5699") ? true : (stryCov_9fa48("5699", "5700", "5701"), referrer?.stellarPublicKey)) {
                    if (stryMutAct_9fa48("5702")) {
                      {}
                    } else {
                      stryCov_9fa48("5702");
                      try {
                        if (stryMutAct_9fa48("5703")) {
                          {}
                        } else {
                          stryCov_9fa48("5703");
                          await this.stellarService.mintReward(referrer.stellarPublicKey, 50);
                        }
                      } catch (_) {
                        // Non-fatal
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      return saved;
    }
  }
  findByUser(userId: string) {
    if (stryMutAct_9fa48("5704")) {
      {}
    } else {
      stryCov_9fa48("5704");
      return this.repo.find(stryMutAct_9fa48("5705") ? {} : (stryCov_9fa48("5705"), {
        where: stryMutAct_9fa48("5706") ? {} : (stryCov_9fa48("5706"), {
          userId
        }),
        order: stryMutAct_9fa48("5707") ? {} : (stryCov_9fa48("5707"), {
          updatedAt: stryMutAct_9fa48("5708") ? "" : (stryCov_9fa48("5708"), 'DESC')
        })
      }));
    }
  }
}