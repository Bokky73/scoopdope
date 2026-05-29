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
import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from './certificate.entity';
import { Enrollment } from '../enrollments/enrollment.entity';
import { StellarService } from '../stellar/stellar.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
@Injectable()
export class CertificatesService {
  private readonly logger = new Logger(CertificatesService.name);
  constructor(@InjectRepository(Certificate)
  private certificatesRepository: Repository<Certificate>, @InjectRepository(Enrollment)
  private enrollmentsRepository: Repository<Enrollment>, private stellarService: StellarService, private configService: ConfigService) {}
  async issueCertificate(userId: string, courseId: string): Promise<Certificate> {
    if (stryMutAct_9fa48("1690")) {
      {}
    } else {
      stryCov_9fa48("1690");
      const enrollment = await this.enrollmentsRepository.findOne(stryMutAct_9fa48("1691") ? {} : (stryCov_9fa48("1691"), {
        where: stryMutAct_9fa48("1692") ? {} : (stryCov_9fa48("1692"), {
          userId,
          courseId,
          completedAt: null
        }),
        relations: stryMutAct_9fa48("1693") ? [] : (stryCov_9fa48("1693"), [stryMutAct_9fa48("1694") ? "" : (stryCov_9fa48("1694"), 'user'), stryMutAct_9fa48("1695") ? "" : (stryCov_9fa48("1695"), 'course')])
      }));
      if (stryMutAct_9fa48("1698") ? false : stryMutAct_9fa48("1697") ? true : stryMutAct_9fa48("1696") ? enrollment : (stryCov_9fa48("1696", "1697", "1698"), !enrollment)) {
        if (stryMutAct_9fa48("1699")) {
          {}
        } else {
          stryCov_9fa48("1699");
          throw new BadRequestException(stryMutAct_9fa48("1700") ? "" : (stryCov_9fa48("1700"), 'Enrollment not found or course not completed'));
        }
      }
      const existingCert = await this.certificatesRepository.findOne(stryMutAct_9fa48("1701") ? {} : (stryCov_9fa48("1701"), {
        where: stryMutAct_9fa48("1702") ? {} : (stryCov_9fa48("1702"), {
          userId,
          courseId
        })
      }));
      if (stryMutAct_9fa48("1704") ? false : stryMutAct_9fa48("1703") ? true : (stryCov_9fa48("1703", "1704"), existingCert)) {
        if (stryMutAct_9fa48("1705")) {
          {}
        } else {
          stryCov_9fa48("1705");
          throw new BadRequestException(stryMutAct_9fa48("1706") ? "" : (stryCov_9fa48("1706"), 'Certificate already issued for this course'));
        }
      }
      const certificateHash = this.generateCertificateHash(userId, courseId);
      const certificate = this.certificatesRepository.create(stryMutAct_9fa48("1707") ? {} : (stryCov_9fa48("1707"), {
        userId,
        courseId,
        certificateHash,
        status: stryMutAct_9fa48("1708") ? "" : (stryCov_9fa48("1708"), 'pending')
      }));
      const saved = await this.certificatesRepository.save(certificate);
      try {
        if (stryMutAct_9fa48("1709")) {
          {}
        } else {
          stryCov_9fa48("1709");
          const txId = await this.stellarService.mintCertificateNFT(enrollment.user.stellarPublicKey, certificateHash, enrollment.course.title);
          saved.stellarTransactionId = txId;
          saved.status = stryMutAct_9fa48("1710") ? "" : (stryCov_9fa48("1710"), 'minted');
          await this.certificatesRepository.save(saved);
          this.logger.log(stryMutAct_9fa48("1711") ? `` : (stryCov_9fa48("1711"), `Certificate minted for user ${userId} on course ${courseId}`));
        }
      } catch (error) {
        if (stryMutAct_9fa48("1712")) {
          {}
        } else {
          stryCov_9fa48("1712");
          this.logger.error(stryMutAct_9fa48("1713") ? `` : (stryCov_9fa48("1713"), `Failed to mint certificate: ${error.message}`));
        }
      }
      return saved;
    }
  }
  async getCertificate(id: string): Promise<Certificate> {
    if (stryMutAct_9fa48("1714")) {
      {}
    } else {
      stryCov_9fa48("1714");
      const cert = await this.certificatesRepository.findOne(stryMutAct_9fa48("1715") ? {} : (stryCov_9fa48("1715"), {
        where: stryMutAct_9fa48("1716") ? {} : (stryCov_9fa48("1716"), {
          id
        })
      }));
      if (stryMutAct_9fa48("1719") ? false : stryMutAct_9fa48("1718") ? true : stryMutAct_9fa48("1717") ? cert : (stryCov_9fa48("1717", "1718", "1719"), !cert)) {
        if (stryMutAct_9fa48("1720")) {
          {}
        } else {
          stryCov_9fa48("1720");
          throw new NotFoundException(stryMutAct_9fa48("1721") ? "" : (stryCov_9fa48("1721"), 'Certificate not found'));
        }
      }
      return cert;
    }
  }
  async getCertificateWithRelations(id: string): Promise<Certificate> {
    if (stryMutAct_9fa48("1722")) {
      {}
    } else {
      stryCov_9fa48("1722");
      const cert = await this.certificatesRepository.findOne(stryMutAct_9fa48("1723") ? {} : (stryCov_9fa48("1723"), {
        where: stryMutAct_9fa48("1724") ? {} : (stryCov_9fa48("1724"), {
          id
        }),
        relations: stryMutAct_9fa48("1725") ? [] : (stryCov_9fa48("1725"), [stryMutAct_9fa48("1726") ? "" : (stryCov_9fa48("1726"), 'user'), stryMutAct_9fa48("1727") ? "" : (stryCov_9fa48("1727"), 'course')])
      }));
      if (stryMutAct_9fa48("1730") ? false : stryMutAct_9fa48("1729") ? true : stryMutAct_9fa48("1728") ? cert : (stryCov_9fa48("1728", "1729", "1730"), !cert)) {
        if (stryMutAct_9fa48("1731")) {
          {}
        } else {
          stryCov_9fa48("1731");
          throw new NotFoundException(stryMutAct_9fa48("1732") ? "" : (stryCov_9fa48("1732"), 'Certificate not found'));
        }
      }
      return cert;
    }
  }
  async getUserCertificates(userId: string): Promise<Certificate[]> {
    if (stryMutAct_9fa48("1733")) {
      {}
    } else {
      stryCov_9fa48("1733");
      return this.certificatesRepository.find(stryMutAct_9fa48("1734") ? {} : (stryCov_9fa48("1734"), {
        where: stryMutAct_9fa48("1735") ? {} : (stryCov_9fa48("1735"), {
          userId
        }),
        relations: stryMutAct_9fa48("1736") ? [] : (stryCov_9fa48("1736"), [stryMutAct_9fa48("1737") ? "" : (stryCov_9fa48("1737"), 'course')])
      }));
    }
  }
  async verifyCertificate(certificateHash: string): Promise<{
    valid: boolean;
    certificate?: Certificate;
  }> {
    if (stryMutAct_9fa48("1738")) {
      {}
    } else {
      stryCov_9fa48("1738");
      const cert = await this.certificatesRepository.findOne(stryMutAct_9fa48("1739") ? {} : (stryCov_9fa48("1739"), {
        where: stryMutAct_9fa48("1740") ? {} : (stryCov_9fa48("1740"), {
          certificateHash
        }),
        relations: stryMutAct_9fa48("1741") ? [] : (stryCov_9fa48("1741"), [stryMutAct_9fa48("1742") ? "" : (stryCov_9fa48("1742"), 'user'), stryMutAct_9fa48("1743") ? "" : (stryCov_9fa48("1743"), 'course')])
      }));
      if (stryMutAct_9fa48("1746") ? false : stryMutAct_9fa48("1745") ? true : stryMutAct_9fa48("1744") ? cert : (stryCov_9fa48("1744", "1745", "1746"), !cert)) {
        if (stryMutAct_9fa48("1747")) {
          {}
        } else {
          stryCov_9fa48("1747");
          return stryMutAct_9fa48("1748") ? {} : (stryCov_9fa48("1748"), {
            valid: stryMutAct_9fa48("1749") ? true : (stryCov_9fa48("1749"), false)
          });
        }
      }
      return stryMutAct_9fa48("1750") ? {} : (stryCov_9fa48("1750"), {
        valid: stryMutAct_9fa48("1753") ? cert.status === 'minted' && cert.status === 'verified' : stryMutAct_9fa48("1752") ? false : stryMutAct_9fa48("1751") ? true : (stryCov_9fa48("1751", "1752", "1753"), (stryMutAct_9fa48("1755") ? cert.status !== 'minted' : stryMutAct_9fa48("1754") ? false : (stryCov_9fa48("1754", "1755"), cert.status === (stryMutAct_9fa48("1756") ? "" : (stryCov_9fa48("1756"), 'minted')))) || (stryMutAct_9fa48("1758") ? cert.status !== 'verified' : stryMutAct_9fa48("1757") ? false : (stryCov_9fa48("1757", "1758"), cert.status === (stryMutAct_9fa48("1759") ? "" : (stryCov_9fa48("1759"), 'verified'))))),
        certificate: cert
      });
    }
  }
  private generateCertificateHash(userId: string, courseId: string): string {
    if (stryMutAct_9fa48("1760")) {
      {}
    } else {
      stryCov_9fa48("1760");
      const data = stryMutAct_9fa48("1761") ? `` : (stryCov_9fa48("1761"), `${userId}:${courseId}:${Date.now()}`);
      return crypto.createHash(stryMutAct_9fa48("1762") ? "" : (stryCov_9fa48("1762"), 'sha256')).update(data).digest(stryMutAct_9fa48("1763") ? "" : (stryCov_9fa48("1763"), 'hex'));
    }
  }
}