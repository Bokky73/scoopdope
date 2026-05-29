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
import { Repository, LessThan } from 'typeorm';
import { CourseAccessControl, AccessRole } from './course-access-control.entity';
import { AccessLog } from './access-log.entity';
@Injectable()
export class AccessControlService {
  constructor(@InjectRepository(CourseAccessControl)
  private accessRepo: Repository<CourseAccessControl>, @InjectRepository(AccessLog)
  private logRepo: Repository<AccessLog>) {}
  async grantAccess(courseId: string, userId: string, role: AccessRole, subscriptionExpiryDate?: Date, allowedIpAddresses?: string[]) {
    if (stryMutAct_9fa48("15")) {
      {}
    } else {
      stryCov_9fa48("15");
      const access = this.accessRepo.create(stryMutAct_9fa48("16") ? {} : (stryCov_9fa48("16"), {
        courseId,
        userId,
        role,
        subscriptionExpiryDate,
        allowedIpAddresses
      }));
      return this.accessRepo.save(access);
    }
  }
  async checkAccess(courseId: string, userId: string, ipAddress?: string): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    if (stryMutAct_9fa48("17")) {
      {}
    } else {
      stryCov_9fa48("17");
      const access = await this.accessRepo.findOne(stryMutAct_9fa48("18") ? {} : (stryCov_9fa48("18"), {
        where: stryMutAct_9fa48("19") ? {} : (stryCov_9fa48("19"), {
          courseId,
          userId,
          isActive: stryMutAct_9fa48("20") ? false : (stryCov_9fa48("20"), true)
        })
      }));
      if (stryMutAct_9fa48("23") ? false : stryMutAct_9fa48("22") ? true : stryMutAct_9fa48("21") ? access : (stryCov_9fa48("21", "22", "23"), !access)) {
        if (stryMutAct_9fa48("24")) {
          {}
        } else {
          stryCov_9fa48("24");
          await this.logAccess(courseId, userId, stryMutAct_9fa48("25") ? "" : (stryCov_9fa48("25"), 'access_denied'), ipAddress, stryMutAct_9fa48("26") ? true : (stryCov_9fa48("26"), false), stryMutAct_9fa48("27") ? "" : (stryCov_9fa48("27"), 'No access granted'));
          return stryMutAct_9fa48("28") ? {} : (stryCov_9fa48("28"), {
            allowed: stryMutAct_9fa48("29") ? true : (stryCov_9fa48("29"), false),
            reason: stryMutAct_9fa48("30") ? "" : (stryCov_9fa48("30"), 'No access granted')
          });
        }
      }
      if (stryMutAct_9fa48("33") ? access.subscriptionExpiryDate || new Date() > access.subscriptionExpiryDate : stryMutAct_9fa48("32") ? false : stryMutAct_9fa48("31") ? true : (stryCov_9fa48("31", "32", "33"), access.subscriptionExpiryDate && (stryMutAct_9fa48("36") ? new Date() <= access.subscriptionExpiryDate : stryMutAct_9fa48("35") ? new Date() >= access.subscriptionExpiryDate : stryMutAct_9fa48("34") ? true : (stryCov_9fa48("34", "35", "36"), new Date() > access.subscriptionExpiryDate)))) {
        if (stryMutAct_9fa48("37")) {
          {}
        } else {
          stryCov_9fa48("37");
          await this.logAccess(courseId, userId, stryMutAct_9fa48("38") ? "" : (stryCov_9fa48("38"), 'access_denied'), ipAddress, stryMutAct_9fa48("39") ? true : (stryCov_9fa48("39"), false), stryMutAct_9fa48("40") ? "" : (stryCov_9fa48("40"), 'Subscription expired'));
          return stryMutAct_9fa48("41") ? {} : (stryCov_9fa48("41"), {
            allowed: stryMutAct_9fa48("42") ? true : (stryCov_9fa48("42"), false),
            reason: stryMutAct_9fa48("43") ? "" : (stryCov_9fa48("43"), 'Subscription expired')
          });
        }
      }
      if (stryMutAct_9fa48("46") ? access.allowedIpAddresses || access.allowedIpAddresses.length > 0 : stryMutAct_9fa48("45") ? false : stryMutAct_9fa48("44") ? true : (stryCov_9fa48("44", "45", "46"), access.allowedIpAddresses && (stryMutAct_9fa48("49") ? access.allowedIpAddresses.length <= 0 : stryMutAct_9fa48("48") ? access.allowedIpAddresses.length >= 0 : stryMutAct_9fa48("47") ? true : (stryCov_9fa48("47", "48", "49"), access.allowedIpAddresses.length > 0)))) {
        if (stryMutAct_9fa48("50")) {
          {}
        } else {
          stryCov_9fa48("50");
          if (stryMutAct_9fa48("53") ? false : stryMutAct_9fa48("52") ? true : stryMutAct_9fa48("51") ? access.allowedIpAddresses.includes(ipAddress) : (stryCov_9fa48("51", "52", "53"), !access.allowedIpAddresses.includes(ipAddress))) {
            if (stryMutAct_9fa48("54")) {
              {}
            } else {
              stryCov_9fa48("54");
              await this.logAccess(courseId, userId, stryMutAct_9fa48("55") ? "" : (stryCov_9fa48("55"), 'access_denied'), ipAddress, stryMutAct_9fa48("56") ? true : (stryCov_9fa48("56"), false), stryMutAct_9fa48("57") ? "" : (stryCov_9fa48("57"), 'IP not allowed'));
              return stryMutAct_9fa48("58") ? {} : (stryCov_9fa48("58"), {
                allowed: stryMutAct_9fa48("59") ? true : (stryCov_9fa48("59"), false),
                reason: stryMutAct_9fa48("60") ? "" : (stryCov_9fa48("60"), 'IP not allowed')
              });
            }
          }
        }
      }
      await this.logAccess(courseId, userId, stryMutAct_9fa48("61") ? "" : (stryCov_9fa48("61"), 'access_granted'), ipAddress, stryMutAct_9fa48("62") ? false : (stryCov_9fa48("62"), true));
      return stryMutAct_9fa48("63") ? {} : (stryCov_9fa48("63"), {
        allowed: stryMutAct_9fa48("64") ? false : (stryCov_9fa48("64"), true)
      });
    }
  }
  async revokeAccess(courseId: string, userId: string) {
    if (stryMutAct_9fa48("65")) {
      {}
    } else {
      stryCov_9fa48("65");
      return this.accessRepo.update(stryMutAct_9fa48("66") ? {} : (stryCov_9fa48("66"), {
        courseId,
        userId
      }), stryMutAct_9fa48("67") ? {} : (stryCov_9fa48("67"), {
        isActive: stryMutAct_9fa48("68") ? true : (stryCov_9fa48("68"), false)
      }));
    }
  }
  async updateSubscription(courseId: string, userId: string, expiryDate: Date) {
    if (stryMutAct_9fa48("69")) {
      {}
    } else {
      stryCov_9fa48("69");
      return this.accessRepo.update(stryMutAct_9fa48("70") ? {} : (stryCov_9fa48("70"), {
        courseId,
        userId
      }), stryMutAct_9fa48("71") ? {} : (stryCov_9fa48("71"), {
        subscriptionExpiryDate: expiryDate
      }));
    }
  }
  async logAccess(courseId: string, userId: string, action: string, ipAddress?: string, isAllowed: boolean = stryMutAct_9fa48("72") ? false : (stryCov_9fa48("72"), true), denialReason?: string) {
    if (stryMutAct_9fa48("73")) {
      {}
    } else {
      stryCov_9fa48("73");
      const log = this.logRepo.create(stryMutAct_9fa48("74") ? {} : (stryCov_9fa48("74"), {
        courseId,
        userId,
        action,
        ipAddress,
        isAllowed,
        denialReason
      }));
      return this.logRepo.save(log);
    }
  }
  async getAccessLogs(courseId: string, userId?: string, days: number = 30) {
    if (stryMutAct_9fa48("75")) {
      {}
    } else {
      stryCov_9fa48("75");
      const query = this.logRepo.createQueryBuilder(stryMutAct_9fa48("76") ? "" : (stryCov_9fa48("76"), 'log')).where(stryMutAct_9fa48("77") ? "" : (stryCov_9fa48("77"), 'log.courseId = :courseId'), stryMutAct_9fa48("78") ? {} : (stryCov_9fa48("78"), {
        courseId
      }));
      if (stryMutAct_9fa48("80") ? false : stryMutAct_9fa48("79") ? true : (stryCov_9fa48("79", "80"), userId)) {
        if (stryMutAct_9fa48("81")) {
          {}
        } else {
          stryCov_9fa48("81");
          query.andWhere(stryMutAct_9fa48("82") ? "" : (stryCov_9fa48("82"), 'log.userId = :userId'), stryMutAct_9fa48("83") ? {} : (stryCov_9fa48("83"), {
            userId
          }));
        }
      }
      const startDate = new Date();
      stryMutAct_9fa48("84") ? startDate.setTime(startDate.getDate() - days) : (stryCov_9fa48("84"), startDate.setDate(stryMutAct_9fa48("85") ? startDate.getDate() + days : (stryCov_9fa48("85"), startDate.getDate() - days)));
      query.andWhere(stryMutAct_9fa48("86") ? "" : (stryCov_9fa48("86"), 'log.timestamp >= :startDate'), stryMutAct_9fa48("87") ? {} : (stryCov_9fa48("87"), {
        startDate
      }));
      return query.orderBy(stryMutAct_9fa48("88") ? "" : (stryCov_9fa48("88"), 'log.timestamp'), stryMutAct_9fa48("89") ? "" : (stryCov_9fa48("89"), 'DESC')).getMany();
    }
  }
  async getAccessControl(courseId: string, userId: string) {
    if (stryMutAct_9fa48("90")) {
      {}
    } else {
      stryCov_9fa48("90");
      return this.accessRepo.findOne(stryMutAct_9fa48("91") ? {} : (stryCov_9fa48("91"), {
        where: stryMutAct_9fa48("92") ? {} : (stryCov_9fa48("92"), {
          courseId,
          userId
        })
      }));
    }
  }
  async getCourseAccessList(courseId: string) {
    if (stryMutAct_9fa48("93")) {
      {}
    } else {
      stryCov_9fa48("93");
      return this.accessRepo.find(stryMutAct_9fa48("94") ? {} : (stryCov_9fa48("94"), {
        where: stryMutAct_9fa48("95") ? {} : (stryCov_9fa48("95"), {
          courseId,
          isActive: stryMutAct_9fa48("96") ? false : (stryCov_9fa48("96"), true)
        }),
        relations: stryMutAct_9fa48("97") ? [] : (stryCov_9fa48("97"), [stryMutAct_9fa48("98") ? "" : (stryCov_9fa48("98"), 'user')])
      }));
    }
  }
}