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
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { SecretRotation, SecretType } from './secret-rotation.entity';
import { ApiKey } from '../auth/api-key.entity';
import * as crypto from 'crypto';
@Injectable()
export class SecretRotationService {
  private readonly logger = new Logger(SecretRotationService.name);
  constructor(@InjectRepository(SecretRotation)
  private rotationRepo: Repository<SecretRotation>, @InjectRepository(ApiKey)
  private apiKeyRepo: Repository<ApiKey>, private configService: ConfigService) {}
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async autoRotateExpiredApiKeys() {
    if (stryMutAct_9fa48("6253")) {
      {}
    } else {
      stryCov_9fa48("6253");
      const ninetyDaysAgo = new Date(stryMutAct_9fa48("6254") ? Date.now() + 90 * 24 * 60 * 60 * 1000 : (stryCov_9fa48("6254"), Date.now() - (stryMutAct_9fa48("6255") ? 90 * 24 * 60 * 60 / 1000 : (stryCov_9fa48("6255"), (stryMutAct_9fa48("6256") ? 90 * 24 * 60 / 60 : (stryCov_9fa48("6256"), (stryMutAct_9fa48("6257") ? 90 * 24 / 60 : (stryCov_9fa48("6257"), (stryMutAct_9fa48("6258") ? 90 / 24 : (stryCov_9fa48("6258"), 90 * 24)) * 60)) * 60)) * 1000))));
      const oldKeys = await this.apiKeyRepo.find(stryMutAct_9fa48("6259") ? {} : (stryCov_9fa48("6259"), {
        where: stryMutAct_9fa48("6260") ? {} : (stryCov_9fa48("6260"), {
          isActive: stryMutAct_9fa48("6261") ? false : (stryCov_9fa48("6261"), true),
          createdAt: LessThan(ninetyDaysAgo)
        })
      }));
      for (const key of oldKeys) {
        if (stryMutAct_9fa48("6262")) {
          {}
        } else {
          stryCov_9fa48("6262");
          await this.apiKeyRepo.update(key.id, stryMutAct_9fa48("6263") ? {} : (stryCov_9fa48("6263"), {
            isActive: stryMutAct_9fa48("6264") ? true : (stryCov_9fa48("6264"), false)
          }));
          await this.logRotation(SecretType.API_KEY, key.id, null, stryMutAct_9fa48("6265") ? false : (stryCov_9fa48("6265"), true));
          this.logger.warn(stryMutAct_9fa48("6266") ? `` : (stryCov_9fa48("6266"), `Auto-rotated API key ${key.id} (older than 90 days)`));
        }
      }
    }
  }
  async rotateApiKey(keyId: string, userId: string): Promise<string> {
    if (stryMutAct_9fa48("6267")) {
      {}
    } else {
      stryCov_9fa48("6267");
      const key = await this.apiKeyRepo.findOne(stryMutAct_9fa48("6268") ? {} : (stryCov_9fa48("6268"), {
        where: stryMutAct_9fa48("6269") ? {} : (stryCov_9fa48("6269"), {
          id: keyId,
          userId
        })
      }));
      if (stryMutAct_9fa48("6272") ? false : stryMutAct_9fa48("6271") ? true : stryMutAct_9fa48("6270") ? key : (stryCov_9fa48("6270", "6271", "6272"), !key)) throw new Error(stryMutAct_9fa48("6273") ? "" : (stryCov_9fa48("6273"), 'API key not found'));
      const rawKey = stryMutAct_9fa48("6274") ? `` : (stryCov_9fa48("6274"), `bst_${crypto.randomBytes(32).toString(stryMutAct_9fa48("6275") ? "" : (stryCov_9fa48("6275"), 'hex'))}`);
      const hash = crypto.createHash(stryMutAct_9fa48("6276") ? "" : (stryCov_9fa48("6276"), 'sha256')).update(rawKey).digest(stryMutAct_9fa48("6277") ? "" : (stryCov_9fa48("6277"), 'hex'));
      await this.apiKeyRepo.update(keyId, stryMutAct_9fa48("6278") ? {} : (stryCov_9fa48("6278"), {
        keyHash: hash,
        lastUsedAt: null
      }));
      await this.logRotation(SecretType.API_KEY, keyId, userId, stryMutAct_9fa48("6279") ? true : (stryCov_9fa48("6279"), false));
      this.logger.log(stryMutAct_9fa48("6280") ? `` : (stryCov_9fa48("6280"), `API key ${keyId} rotated by user ${userId}`));
      return rawKey;
    }
  }
  async getRotationHistory(secretType?: string, limit = 50) {
    if (stryMutAct_9fa48("6281")) {
      {}
    } else {
      stryCov_9fa48("6281");
      const qb = this.rotationRepo.createQueryBuilder(stryMutAct_9fa48("6282") ? "" : (stryCov_9fa48("6282"), 'r'));
      if (stryMutAct_9fa48("6284") ? false : stryMutAct_9fa48("6283") ? true : (stryCov_9fa48("6283", "6284"), secretType)) qb.where(stryMutAct_9fa48("6285") ? "" : (stryCov_9fa48("6285"), 'r.secretType = :secretType'), stryMutAct_9fa48("6286") ? {} : (stryCov_9fa48("6286"), {
        secretType
      }));
      qb.orderBy(stryMutAct_9fa48("6287") ? "" : (stryCov_9fa48("6287"), 'r.rotatedAt'), stryMutAct_9fa48("6288") ? "" : (stryCov_9fa48("6288"), 'DESC')).limit(limit);
      return qb.getMany();
    }
  }
  private async logRotation(secretType: SecretType, identifier: string | null, rotatedBy: string | null, automated: boolean) {
    if (stryMutAct_9fa48("6289")) {
      {}
    } else {
      stryCov_9fa48("6289");
      await this.rotationRepo.save(stryMutAct_9fa48("6290") ? {} : (stryCov_9fa48("6290"), {
        secretType,
        identifier,
        rotatedBy,
        automated,
        rotatedAt: new Date()
      }));
    }
  }
}