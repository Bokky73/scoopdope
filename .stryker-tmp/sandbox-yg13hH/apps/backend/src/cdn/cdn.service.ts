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
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CdnAsset, ContentType } from './cdn-asset.entity';
import * as crypto from 'crypto';
@Injectable()
export class CdnService {
  private cdnProvider: string;
  private cdnDomain: string;
  private cdnAccessKey: string;
  private cdnSecretKey: string;
  constructor(private configService: ConfigService, @InjectRepository(CdnAsset)
  private assetRepo: Repository<CdnAsset>) {
    if (stryMutAct_9fa48("1545")) {
      {}
    } else {
      stryCov_9fa48("1545");
      this.cdnProvider = this.configService.get(stryMutAct_9fa48("1546") ? "" : (stryCov_9fa48("1546"), 'CDN_PROVIDER'), stryMutAct_9fa48("1547") ? "" : (stryCov_9fa48("1547"), 'cloudfront'));
      this.cdnDomain = this.configService.get(stryMutAct_9fa48("1548") ? "" : (stryCov_9fa48("1548"), 'CDN_DOMAIN'));
      this.cdnAccessKey = this.configService.get(stryMutAct_9fa48("1549") ? "" : (stryCov_9fa48("1549"), 'CDN_ACCESS_KEY'));
      this.cdnSecretKey = this.configService.get(stryMutAct_9fa48("1550") ? "" : (stryCov_9fa48("1550"), 'CDN_SECRET_KEY'));
    }
  }
  async uploadAsset(lessonId: string, fileName: string, contentType: ContentType, fileSize: number) {
    if (stryMutAct_9fa48("1551")) {
      {}
    } else {
      stryCov_9fa48("1551");
      const cdnUrl = stryMutAct_9fa48("1552") ? `` : (stryCov_9fa48("1552"), `${this.cdnDomain}/${lessonId}/${fileName}`);
      const asset = this.assetRepo.create(stryMutAct_9fa48("1553") ? {} : (stryCov_9fa48("1553"), {
        lessonId,
        fileName,
        contentType,
        fileSize,
        cdnUrl
      }));
      return this.assetRepo.save(asset);
    }
  }
  generateSignedUrl(assetId: string, expirationMinutes: number = 60): string {
    if (stryMutAct_9fa48("1554")) {
      {}
    } else {
      stryCov_9fa48("1554");
      const asset = this.assetRepo.findOne(stryMutAct_9fa48("1555") ? {} : (stryCov_9fa48("1555"), {
        where: stryMutAct_9fa48("1556") ? {} : (stryCov_9fa48("1556"), {
          id: assetId
        })
      }));
      if (stryMutAct_9fa48("1559") ? false : stryMutAct_9fa48("1558") ? true : stryMutAct_9fa48("1557") ? asset : (stryCov_9fa48("1557", "1558", "1559"), !asset)) throw new Error(stryMutAct_9fa48("1560") ? "" : (stryCov_9fa48("1560"), 'Asset not found'));
      const expirationTime = stryMutAct_9fa48("1561") ? Math.floor(Date.now() / 1000) - expirationMinutes * 60 : (stryCov_9fa48("1561"), Math.floor(stryMutAct_9fa48("1562") ? Date.now() * 1000 : (stryCov_9fa48("1562"), Date.now() / 1000)) + (stryMutAct_9fa48("1563") ? expirationMinutes / 60 : (stryCov_9fa48("1563"), expirationMinutes * 60)));
      const stringToSign = stryMutAct_9fa48("1564") ? `` : (stryCov_9fa48("1564"), `GET\n\n\n${expirationTime}\n${asset.cdnUrl}`);
      const signature = crypto.createHmac(stryMutAct_9fa48("1565") ? "" : (stryCov_9fa48("1565"), 'sha1'), this.cdnSecretKey).update(stringToSign).digest(stryMutAct_9fa48("1566") ? "" : (stryCov_9fa48("1566"), 'base64'));
      const encodedSignature = encodeURIComponent(signature);
      return stryMutAct_9fa48("1567") ? `` : (stryCov_9fa48("1567"), `${asset.cdnUrl}?Expires=${expirationTime}&Signature=${encodedSignature}&Key-Pair-Id=${this.cdnAccessKey}`);
    }
  }
  async markAsTranscoded(assetId: string, bitrates: string[], thumbnailUrl?: string) {
    if (stryMutAct_9fa48("1568")) {
      {}
    } else {
      stryCov_9fa48("1568");
      return this.assetRepo.update(stryMutAct_9fa48("1569") ? {} : (stryCov_9fa48("1569"), {
        id: assetId
      }), stryMutAct_9fa48("1570") ? {} : (stryCov_9fa48("1570"), {
        isTranscoded: stryMutAct_9fa48("1571") ? false : (stryCov_9fa48("1571"), true),
        availableBitrates: bitrates,
        thumbnailUrl
      }));
    }
  }
  async invalidateCache(assetId: string) {
    if (stryMutAct_9fa48("1572")) {
      {}
    } else {
      stryCov_9fa48("1572");
      const asset = await this.assetRepo.findOne(stryMutAct_9fa48("1573") ? {} : (stryCov_9fa48("1573"), {
        where: stryMutAct_9fa48("1574") ? {} : (stryCov_9fa48("1574"), {
          id: assetId
        })
      }));
      if (stryMutAct_9fa48("1577") ? false : stryMutAct_9fa48("1576") ? true : stryMutAct_9fa48("1575") ? asset : (stryCov_9fa48("1575", "1576", "1577"), !asset)) throw new Error(stryMutAct_9fa48("1578") ? "" : (stryCov_9fa48("1578"), 'Asset not found'));

      // Invalidate CDN cache (implementation depends on CDN provider)
      // For CloudFront: create invalidation request
      // For Cloudflare: purge cache
      console.log(stryMutAct_9fa48("1579") ? `` : (stryCov_9fa48("1579"), `Invalidating cache for ${asset.cdnUrl}`));
      return stryMutAct_9fa48("1580") ? {} : (stryCov_9fa48("1580"), {
        success: stryMutAct_9fa48("1581") ? false : (stryCov_9fa48("1581"), true),
        assetId
      });
    }
  }
  async getAsset(assetId: string) {
    if (stryMutAct_9fa48("1582")) {
      {}
    } else {
      stryCov_9fa48("1582");
      return this.assetRepo.findOne(stryMutAct_9fa48("1583") ? {} : (stryCov_9fa48("1583"), {
        where: stryMutAct_9fa48("1584") ? {} : (stryCov_9fa48("1584"), {
          id: assetId
        })
      }));
    }
  }
  async getLessonAssets(lessonId: string) {
    if (stryMutAct_9fa48("1585")) {
      {}
    } else {
      stryCov_9fa48("1585");
      return this.assetRepo.find(stryMutAct_9fa48("1586") ? {} : (stryCov_9fa48("1586"), {
        where: stryMutAct_9fa48("1587") ? {} : (stryCov_9fa48("1587"), {
          lessonId
        })
      }));
    }
  }
}