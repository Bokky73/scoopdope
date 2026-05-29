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
import { Injectable, Inject, forwardRef, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Credential } from './credential.entity';
import { StellarService } from '../stellar/stellar.service';
import { KycService } from '../kyc/kyc.service';
import { CoursesService } from '../courses/courses.service';
@Injectable()
export class CredentialsService {
  constructor(@InjectRepository(Credential)
  private repo: Repository<Credential>, @Inject(forwardRef(() => StellarService))
  private stellarService: StellarService, private kycService: KycService, private coursesService: CoursesService) {}
  async issue(userId: string, courseId: string, stellarPublicKey: string): Promise<Credential> {
    if (stryMutAct_9fa48("3280")) {
      {}
    } else {
      stryCov_9fa48("3280");
      // Avoid duplicate credentials
      const existing = await this.repo.findOne(stryMutAct_9fa48("3281") ? {} : (stryCov_9fa48("3281"), {
        where: stryMutAct_9fa48("3282") ? {} : (stryCov_9fa48("3282"), {
          userId,
          courseId
        })
      }));
      if (stryMutAct_9fa48("3284") ? false : stryMutAct_9fa48("3283") ? true : (stryCov_9fa48("3283", "3284"), existing)) return existing;

      // KYC gate — only enforced when the course requires it
      const course = await this.coursesService.findOne(courseId);
      if (stryMutAct_9fa48("3286") ? false : stryMutAct_9fa48("3285") ? true : (stryCov_9fa48("3285", "3286"), course.requiresKyc)) {
        if (stryMutAct_9fa48("3287")) {
          {}
        } else {
          stryCov_9fa48("3287");
          const approved = await this.kycService.isApproved(stellarPublicKey);
          if (stryMutAct_9fa48("3290") ? false : stryMutAct_9fa48("3289") ? true : stryMutAct_9fa48("3288") ? approved : (stryCov_9fa48("3288", "3289", "3290"), !approved)) {
            if (stryMutAct_9fa48("3291")) {
              {}
            } else {
              stryCov_9fa48("3291");
              throw new ForbiddenException(stryMutAct_9fa48("3292") ? "" : (stryCov_9fa48("3292"), 'KYC verification required before credential issuance for this course'));
            }
          }
        }
      }
      const metadata = stryMutAct_9fa48("3293") ? {} : (stryCov_9fa48("3293"), {
        courseName: course.title,
        grade: stryMutAct_9fa48("3294") ? "" : (stryCov_9fa48("3294"), 'Pass'),
        // Could be calculated from quiz scores if available
        skills: stryMutAct_9fa48("3297") ? course.skills && [] : stryMutAct_9fa48("3296") ? false : stryMutAct_9fa48("3295") ? true : (stryCov_9fa48("3295", "3296", "3297"), course.skills || (stryMutAct_9fa48("3298") ? ["Stryker was here"] : (stryCov_9fa48("3298"), [])))
      });
      const txHash = await this.stellarService.issueCredential(stellarPublicKey, courseId, metadata);

      // Mint reward tokens after credential issuance
      try {
        if (stryMutAct_9fa48("3299")) {
          {}
        } else {
          stryCov_9fa48("3299");
          await this.stellarService.mintReward(stellarPublicKey, 100);
        }
      } catch {
        // Non-fatal
      }
      const credential = this.repo.create(stryMutAct_9fa48("3300") ? {} : (stryCov_9fa48("3300"), {
        userId,
        courseId,
        txHash,
        stellarPublicKey,
        grade: metadata.grade
      }));
      return this.repo.save(credential);
    }
  }
  async issueBundle(userId: string, bundleId: string, stellarPublicKey: string): Promise<Credential> {
    if (stryMutAct_9fa48("3301")) {
      {}
    } else {
      stryCov_9fa48("3301");
      const existing = await this.repo.findOne(stryMutAct_9fa48("3302") ? {} : (stryCov_9fa48("3302"), {
        where: stryMutAct_9fa48("3303") ? {} : (stryCov_9fa48("3303"), {
          userId,
          bundleId
        })
      }));
      if (stryMutAct_9fa48("3305") ? false : stryMutAct_9fa48("3304") ? true : (stryCov_9fa48("3304", "3305"), existing)) return existing;
      const txHash = await this.stellarService.issueCredential(stellarPublicKey, stryMutAct_9fa48("3306") ? `` : (stryCov_9fa48("3306"), `bundle:${bundleId}`));
      try {
        if (stryMutAct_9fa48("3307")) {
          {}
        } else {
          stryCov_9fa48("3307");
          await this.stellarService.mintReward(stellarPublicKey, 500); // Higher reward for bundle completion
        }
      } catch {
        // Non-fatal
      }
      const credential = this.repo.create(stryMutAct_9fa48("3308") ? {} : (stryCov_9fa48("3308"), {
        userId,
        bundleId,
        txHash,
        stellarPublicKey
      }));
      return this.repo.save(credential);
    }
  }
  async issueLearningPath(userId: string, learningPathId: string, stellarPublicKey: string): Promise<Credential> {
    if (stryMutAct_9fa48("3309")) {
      {}
    } else {
      stryCov_9fa48("3309");
      const existing = await this.repo.findOne(stryMutAct_9fa48("3310") ? {} : (stryCov_9fa48("3310"), {
        where: stryMutAct_9fa48("3311") ? {} : (stryCov_9fa48("3311"), {
          userId,
          learningPathId
        })
      }));
      if (stryMutAct_9fa48("3313") ? false : stryMutAct_9fa48("3312") ? true : (stryCov_9fa48("3312", "3313"), existing)) return existing;
      const txHash = await this.stellarService.issueCredential(stellarPublicKey, stryMutAct_9fa48("3314") ? `` : (stryCov_9fa48("3314"), `learning-path:${learningPathId}`));
      try {
        if (stryMutAct_9fa48("3315")) {
          {}
        } else {
          stryCov_9fa48("3315");
          await this.stellarService.mintReward(stellarPublicKey, 750);
        }
      } catch {
        // Non-fatal
      }
      const credential = this.repo.create(stryMutAct_9fa48("3316") ? {} : (stryCov_9fa48("3316"), {
        userId,
        learningPathId,
        txHash,
        stellarPublicKey
      }));
      return this.repo.save(credential);
    }
  }
  findByUser(userId: string) {
    if (stryMutAct_9fa48("3317")) {
      {}
    } else {
      stryCov_9fa48("3317");
      return this.repo.find(stryMutAct_9fa48("3318") ? {} : (stryCov_9fa48("3318"), {
        where: stryMutAct_9fa48("3319") ? {} : (stryCov_9fa48("3319"), {
          userId
        }),
        order: stryMutAct_9fa48("3320") ? {} : (stryCov_9fa48("3320"), {
          issuedAt: stryMutAct_9fa48("3321") ? "" : (stryCov_9fa48("3321"), 'DESC')
        })
      }));
    }
  }
  async findOne(id: string) {
    if (stryMutAct_9fa48("3322")) {
      {}
    } else {
      stryCov_9fa48("3322");
      const credential = await this.repo.findOne(stryMutAct_9fa48("3323") ? {} : (stryCov_9fa48("3323"), {
        where: stryMutAct_9fa48("3324") ? {} : (stryCov_9fa48("3324"), {
          id
        }),
        relations: stryMutAct_9fa48("3325") ? [] : (stryCov_9fa48("3325"), [stryMutAct_9fa48("3326") ? "" : (stryCov_9fa48("3326"), 'user'), stryMutAct_9fa48("3327") ? "" : (stryCov_9fa48("3327"), 'course')])
      }));
      if (stryMutAct_9fa48("3330") ? false : stryMutAct_9fa48("3329") ? true : stryMutAct_9fa48("3328") ? credential : (stryCov_9fa48("3328", "3329", "3330"), !credential)) {
        if (stryMutAct_9fa48("3331")) {
          {}
        } else {
          stryCov_9fa48("3331");
          throw new NotFoundException(stryMutAct_9fa48("3332") ? "" : (stryCov_9fa48("3332"), 'Credential not found'));
        }
      }
      return credential;
    }
  }
  async verify(txHash: string) {
    if (stryMutAct_9fa48("3333")) {
      {}
    } else {
      stryCov_9fa48("3333");
      const credential = await this.repo.findOne(stryMutAct_9fa48("3334") ? {} : (stryCov_9fa48("3334"), {
        where: stryMutAct_9fa48("3335") ? {} : (stryCov_9fa48("3335"), {
          txHash
        })
      }));
      return stryMutAct_9fa48("3336") ? {} : (stryCov_9fa48("3336"), {
        credential,
        verified: stryMutAct_9fa48("3337") ? !credential : (stryCov_9fa48("3337"), !(stryMutAct_9fa48("3338") ? credential : (stryCov_9fa48("3338"), !credential)))
      });
    }
  }
}