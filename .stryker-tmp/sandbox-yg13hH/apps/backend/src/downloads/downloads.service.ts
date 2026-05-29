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
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DownloadItem, DownloadStatus } from './download-item.entity';
@Injectable()
export class DownloadsService {
  constructor(@InjectRepository(DownloadItem)
  private repo: Repository<DownloadItem>) {}
  async queueDownload(userId: string, courseId: string, lessonId?: string, lessonTitle?: string, fileUrl?: string, fileSizeBytes?: number): Promise<DownloadItem> {
    if (stryMutAct_9fa48("3363")) {
      {}
    } else {
      stryCov_9fa48("3363");
      const item = this.repo.create(stryMutAct_9fa48("3364") ? {} : (stryCov_9fa48("3364"), {
        userId,
        courseId,
        lessonId,
        lessonTitle,
        fileUrl,
        fileSizeBytes: stryMutAct_9fa48("3365") ? fileSizeBytes && 0 : (stryCov_9fa48("3365"), fileSizeBytes ?? 0),
        status: DownloadStatus.PENDING
      }));
      return this.repo.save(item);
    }
  }
  async findByUser(userId: string): Promise<DownloadItem[]> {
    if (stryMutAct_9fa48("3366")) {
      {}
    } else {
      stryCov_9fa48("3366");
      return this.repo.find(stryMutAct_9fa48("3367") ? {} : (stryCov_9fa48("3367"), {
        where: stryMutAct_9fa48("3368") ? {} : (stryCov_9fa48("3368"), {
          userId
        }),
        order: stryMutAct_9fa48("3369") ? {} : (stryCov_9fa48("3369"), {
          createdAt: stryMutAct_9fa48("3370") ? "" : (stryCov_9fa48("3370"), 'DESC')
        })
      }));
    }
  }
  async markCompleted(id: string, userId: string): Promise<DownloadItem> {
    if (stryMutAct_9fa48("3371")) {
      {}
    } else {
      stryCov_9fa48("3371");
      const item = await this.repo.findOne(stryMutAct_9fa48("3372") ? {} : (stryCov_9fa48("3372"), {
        where: stryMutAct_9fa48("3373") ? {} : (stryCov_9fa48("3373"), {
          id,
          userId
        })
      }));
      if (stryMutAct_9fa48("3376") ? false : stryMutAct_9fa48("3375") ? true : stryMutAct_9fa48("3374") ? item : (stryCov_9fa48("3374", "3375", "3376"), !item)) throw new NotFoundException(stryMutAct_9fa48("3377") ? "" : (stryCov_9fa48("3377"), 'Download not found'));
      item.status = DownloadStatus.COMPLETED;
      return this.repo.save(item);
    }
  }
  async remove(id: string, userId: string): Promise<void> {
    if (stryMutAct_9fa48("3378")) {
      {}
    } else {
      stryCov_9fa48("3378");
      const item = await this.repo.findOne(stryMutAct_9fa48("3379") ? {} : (stryCov_9fa48("3379"), {
        where: stryMutAct_9fa48("3380") ? {} : (stryCov_9fa48("3380"), {
          id,
          userId
        })
      }));
      if (stryMutAct_9fa48("3383") ? false : stryMutAct_9fa48("3382") ? true : stryMutAct_9fa48("3381") ? item : (stryCov_9fa48("3381", "3382", "3383"), !item)) throw new NotFoundException(stryMutAct_9fa48("3384") ? "" : (stryCov_9fa48("3384"), 'Download not found'));
      await this.repo.remove(item);
    }
  }
  async getStorageStats(userId: string): Promise<{
    totalBytes: number;
    count: number;
  }> {
    if (stryMutAct_9fa48("3385")) {
      {}
    } else {
      stryCov_9fa48("3385");
      const items = await this.repo.find(stryMutAct_9fa48("3386") ? {} : (stryCov_9fa48("3386"), {
        where: stryMutAct_9fa48("3387") ? {} : (stryCov_9fa48("3387"), {
          userId,
          status: DownloadStatus.COMPLETED
        })
      }));
      const totalBytes = items.reduce(stryMutAct_9fa48("3388") ? () => undefined : (stryCov_9fa48("3388"), (sum, i) => stryMutAct_9fa48("3389") ? sum - Number(i.fileSizeBytes) : (stryCov_9fa48("3389"), sum + Number(i.fileSizeBytes))), 0);
      return stryMutAct_9fa48("3390") ? {} : (stryCov_9fa48("3390"), {
        totalBytes,
        count: items.length
      });
    }
  }
}