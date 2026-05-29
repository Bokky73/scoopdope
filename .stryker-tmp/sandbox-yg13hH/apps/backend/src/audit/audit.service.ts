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
import { AuditLog, AuditAction } from './audit-log.entity';
import { CustomLoggerService } from '../common/logger/logger.service';
@Injectable()
export class AuditService {
  constructor(@InjectRepository(AuditLog)
  private auditRepo: Repository<AuditLog>, private logger: CustomLoggerService) {
    if (stryMutAct_9fa48("675")) {
      {}
    } else {
      stryCov_9fa48("675");
      this.logger.setContext(stryMutAct_9fa48("676") ? "" : (stryCov_9fa48("676"), 'AuditService'));
    }
  }
  async log(action: AuditAction | string, userId: string | null, success: boolean, metadata?: Record<string, any>, ipAddress?: string, userAgent?: string): Promise<void> {
    if (stryMutAct_9fa48("677")) {
      {}
    } else {
      stryCov_9fa48("677");
      try {
        if (stryMutAct_9fa48("678")) {
          {}
        } else {
          stryCov_9fa48("678");
          await this.auditRepo.save(stryMutAct_9fa48("679") ? {} : (stryCov_9fa48("679"), {
            action,
            userId,
            success,
            metadata,
            ipAddress,
            userAgent
          }));
          this.logger.info(stryMutAct_9fa48("680") ? `` : (stryCov_9fa48("680"), `Audit: ${action}`), stryMutAct_9fa48("681") ? {} : (stryCov_9fa48("681"), {
            userId,
            success,
            metadata
          }));
        }
      } catch (err) {
        if (stryMutAct_9fa48("682")) {
          {}
        } else {
          stryCov_9fa48("682");
          this.logger.error(stryMutAct_9fa48("683") ? "" : (stryCov_9fa48("683"), 'Failed to write audit log'), err);
        }
      }
    }
  }
  async getLogs(filters: {
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    if (stryMutAct_9fa48("684")) {
      {}
    } else {
      stryCov_9fa48("684");
      const qb = this.auditRepo.createQueryBuilder(stryMutAct_9fa48("685") ? "" : (stryCov_9fa48("685"), 'log'));
      if (stryMutAct_9fa48("687") ? false : stryMutAct_9fa48("686") ? true : (stryCov_9fa48("686", "687"), filters.userId)) qb.andWhere(stryMutAct_9fa48("688") ? "" : (stryCov_9fa48("688"), 'log.userId = :userId'), stryMutAct_9fa48("689") ? {} : (stryCov_9fa48("689"), {
        userId: filters.userId
      }));
      if (stryMutAct_9fa48("691") ? false : stryMutAct_9fa48("690") ? true : (stryCov_9fa48("690", "691"), filters.action)) qb.andWhere(stryMutAct_9fa48("692") ? "" : (stryCov_9fa48("692"), 'log.action = :action'), stryMutAct_9fa48("693") ? {} : (stryCov_9fa48("693"), {
        action: filters.action
      }));
      if (stryMutAct_9fa48("695") ? false : stryMutAct_9fa48("694") ? true : (stryCov_9fa48("694", "695"), filters.startDate)) qb.andWhere(stryMutAct_9fa48("696") ? "" : (stryCov_9fa48("696"), 'log.createdAt >= :start'), stryMutAct_9fa48("697") ? {} : (stryCov_9fa48("697"), {
        start: filters.startDate
      }));
      if (stryMutAct_9fa48("699") ? false : stryMutAct_9fa48("698") ? true : (stryCov_9fa48("698", "699"), filters.endDate)) qb.andWhere(stryMutAct_9fa48("700") ? "" : (stryCov_9fa48("700"), 'log.createdAt <= :end'), stryMutAct_9fa48("701") ? {} : (stryCov_9fa48("701"), {
        end: filters.endDate
      }));
      qb.orderBy(stryMutAct_9fa48("702") ? "" : (stryCov_9fa48("702"), 'log.createdAt'), stryMutAct_9fa48("703") ? "" : (stryCov_9fa48("703"), 'DESC')).limit(stryMutAct_9fa48("706") ? filters.limit && 100 : stryMutAct_9fa48("705") ? false : stryMutAct_9fa48("704") ? true : (stryCov_9fa48("704", "705", "706"), filters.limit || 100));
      return qb.getMany();
    }
  }
}