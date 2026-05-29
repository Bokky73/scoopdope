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
import { Injectable, Logger, OnModuleDestroy, OnModuleInit, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { SorobanRpc } from '@stellar/stellar-sdk';
import { CredentialsService } from '../credentials/credentials.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
const LAST_LEDGER_KEY = stryMutAct_9fa48("6356") ? "" : (stryCov_9fa48("6356"), 'indexer:last_ledger');
@Injectable()
export class StellarIndexerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(StellarIndexerService.name);
  private readonly sorobanServer: SorobanRpc.Server;
  private readonly analyticsContractId: string;
  private readonly tokenContractId: string;
  private readonly pollInterval: number;
  private timer: NodeJS.Timeout | null = null;
  constructor(private configService: ConfigService, @Inject(CACHE_MANAGER)
  private cacheManager: Cache, private credentialsService: CredentialsService, private notificationsService: NotificationsService, private usersService: UsersService) {
    if (stryMutAct_9fa48("6357")) {
      {}
    } else {
      stryCov_9fa48("6357");
      this.sorobanServer = new SorobanRpc.Server(stryMutAct_9fa48("6358") ? this.configService.get<string>('stellar.sorobanRpcUrl') && '' : (stryCov_9fa48("6358"), this.configService.get<string>(stryMutAct_9fa48("6359") ? "" : (stryCov_9fa48("6359"), 'stellar.sorobanRpcUrl')) ?? (stryMutAct_9fa48("6360") ? "Stryker was here!" : (stryCov_9fa48("6360"), ''))));
      this.analyticsContractId = stryMutAct_9fa48("6361") ? this.configService.get<string>('stellar.analyticsContractId') && '' : (stryCov_9fa48("6361"), this.configService.get<string>(stryMutAct_9fa48("6362") ? "" : (stryCov_9fa48("6362"), 'stellar.analyticsContractId')) ?? (stryMutAct_9fa48("6363") ? "Stryker was here!" : (stryCov_9fa48("6363"), '')));
      this.tokenContractId = stryMutAct_9fa48("6364") ? this.configService.get<string>('stellar.tokenContractId') && '' : (stryCov_9fa48("6364"), this.configService.get<string>(stryMutAct_9fa48("6365") ? "" : (stryCov_9fa48("6365"), 'stellar.tokenContractId')) ?? (stryMutAct_9fa48("6366") ? "Stryker was here!" : (stryCov_9fa48("6366"), '')));
      this.pollInterval = stryMutAct_9fa48("6367") ? this.configService.get<number>('stellar.indexerPollIntervalMs') && 5000 : (stryCov_9fa48("6367"), this.configService.get<number>(stryMutAct_9fa48("6368") ? "" : (stryCov_9fa48("6368"), 'stellar.indexerPollIntervalMs')) ?? 5000);
    }
  }
  onModuleInit() {
    if (stryMutAct_9fa48("6369")) {
      {}
    } else {
      stryCov_9fa48("6369");
      if (stryMutAct_9fa48("6372") ? !this.analyticsContractId || !this.tokenContractId : stryMutAct_9fa48("6371") ? false : stryMutAct_9fa48("6370") ? true : (stryCov_9fa48("6370", "6371", "6372"), (stryMutAct_9fa48("6373") ? this.analyticsContractId : (stryCov_9fa48("6373"), !this.analyticsContractId)) && (stryMutAct_9fa48("6374") ? this.tokenContractId : (stryCov_9fa48("6374"), !this.tokenContractId)))) {
        if (stryMutAct_9fa48("6375")) {
          {}
        } else {
          stryCov_9fa48("6375");
          this.logger.warn(stryMutAct_9fa48("6376") ? "" : (stryCov_9fa48("6376"), 'No contract IDs configured — indexer disabled'));
          return;
        }
      }
      this.timer = setInterval(stryMutAct_9fa48("6377") ? () => undefined : (stryCov_9fa48("6377"), () => this.poll()), this.pollInterval);
      this.logger.log(stryMutAct_9fa48("6378") ? `` : (stryCov_9fa48("6378"), `Indexer started (interval: ${this.pollInterval}ms)`));
    }
  }
  onModuleDestroy() {
    if (stryMutAct_9fa48("6379")) {
      {}
    } else {
      stryCov_9fa48("6379");
      if (stryMutAct_9fa48("6381") ? false : stryMutAct_9fa48("6380") ? true : (stryCov_9fa48("6380", "6381"), this.timer)) clearInterval(this.timer);
    }
  }
  private async poll() {
    if (stryMutAct_9fa48("6382")) {
      {}
    } else {
      stryCov_9fa48("6382");
      try {
        if (stryMutAct_9fa48("6383")) {
          {}
        } else {
          stryCov_9fa48("6383");
          const lastLedger = stryMutAct_9fa48("6384") ? (await this.cacheManager.get<number>(LAST_LEDGER_KEY)) && 0 : (stryCov_9fa48("6384"), (await this.cacheManager.get<number>(LAST_LEDGER_KEY)) ?? 0);
          const contractIds = stryMutAct_9fa48("6385") ? [this.analyticsContractId, this.tokenContractId] : (stryCov_9fa48("6385"), (stryMutAct_9fa48("6386") ? [] : (stryCov_9fa48("6386"), [this.analyticsContractId, this.tokenContractId])).filter(Boolean));
          const {
            events,
            latestLedger
          } = await this.sorobanServer.getEvents({
            startLedger: lastLedger || undefined,
            filters: [{
              type: 'contract',
              contractIds
            }]
          } as any);
          for (const event of stryMutAct_9fa48("6387") ? events && [] : (stryCov_9fa48("6387"), events ?? (stryMutAct_9fa48("6388") ? ["Stryker was here"] : (stryCov_9fa48("6388"), [])))) {
            if (stryMutAct_9fa48("6389")) {
              {}
            } else {
              stryCov_9fa48("6389");
              await this.handleEvent(event).catch(stryMutAct_9fa48("6390") ? () => undefined : (stryCov_9fa48("6390"), err => this.logger.error(stryMutAct_9fa48("6391") ? `` : (stryCov_9fa48("6391"), `Error handling event: ${err.message}`), err.stack)));
            }
          }
          if (stryMutAct_9fa48("6395") ? latestLedger <= lastLedger : stryMutAct_9fa48("6394") ? latestLedger >= lastLedger : stryMutAct_9fa48("6393") ? false : stryMutAct_9fa48("6392") ? true : (stryCov_9fa48("6392", "6393", "6394", "6395"), latestLedger > lastLedger)) {
            if (stryMutAct_9fa48("6396")) {
              {}
            } else {
              stryCov_9fa48("6396");
              await this.cacheManager.set(LAST_LEDGER_KEY, latestLedger, 0);
            }
          }
        }
      } catch (err) {
        if (stryMutAct_9fa48("6397")) {
          {}
        } else {
          stryCov_9fa48("6397");
          this.logger.error(stryMutAct_9fa48("6398") ? `` : (stryCov_9fa48("6398"), `Poll error: ${err.message}`));
        }
      }
    }
  }
  private async handleEvent(event: SorobanRpc.Api.EventResponse) {
    if (stryMutAct_9fa48("6399")) {
      {}
    } else {
      stryCov_9fa48("6399");
      const topic = (stryMutAct_9fa48("6400") ? event.topic && [] : (stryCov_9fa48("6400"), event.topic ?? (stryMutAct_9fa48("6401") ? ["Stryker was here"] : (stryCov_9fa48("6401"), [])))).map(stryMutAct_9fa48("6402") ? () => undefined : (stryCov_9fa48("6402"), (t: any) => stryMutAct_9fa48("6403") ? t?.value?.toString() && '' : (stryCov_9fa48("6403"), (stryMutAct_9fa48("6405") ? t.value?.toString() : stryMutAct_9fa48("6404") ? t?.value.toString() : (stryCov_9fa48("6404", "6405"), t?.value?.toString())) ?? (stryMutAct_9fa48("6406") ? "Stryker was here!" : (stryCov_9fa48("6406"), '')))));
      const [contractType, eventName] = topic;
      if (stryMutAct_9fa48("6409") ? contractType === 'analytics' || eventName === 'completed' : stryMutAct_9fa48("6408") ? false : stryMutAct_9fa48("6407") ? true : (stryCov_9fa48("6407", "6408", "6409"), (stryMutAct_9fa48("6411") ? contractType !== 'analytics' : stryMutAct_9fa48("6410") ? true : (stryCov_9fa48("6410", "6411"), contractType === (stryMutAct_9fa48("6412") ? "" : (stryCov_9fa48("6412"), 'analytics')))) && (stryMutAct_9fa48("6414") ? eventName !== 'completed' : stryMutAct_9fa48("6413") ? true : (stryCov_9fa48("6413", "6414"), eventName === (stryMutAct_9fa48("6415") ? "" : (stryCov_9fa48("6415"), 'completed')))))) {
        if (stryMutAct_9fa48("6416")) {
          {}
        } else {
          stryCov_9fa48("6416");
          await this.handleAnalyticsCompleted(event);
        }
      } else if (stryMutAct_9fa48("6419") ? contractType === 'token' || eventName === 'transfer' : stryMutAct_9fa48("6418") ? false : stryMutAct_9fa48("6417") ? true : (stryCov_9fa48("6417", "6418", "6419"), (stryMutAct_9fa48("6421") ? contractType !== 'token' : stryMutAct_9fa48("6420") ? true : (stryCov_9fa48("6420", "6421"), contractType === (stryMutAct_9fa48("6422") ? "" : (stryCov_9fa48("6422"), 'token')))) && (stryMutAct_9fa48("6424") ? eventName !== 'transfer' : stryMutAct_9fa48("6423") ? true : (stryCov_9fa48("6423", "6424"), eventName === (stryMutAct_9fa48("6425") ? "" : (stryCov_9fa48("6425"), 'transfer')))))) {
        if (stryMutAct_9fa48("6426")) {
          {}
        } else {
          stryCov_9fa48("6426");
          await this.handleTokenTransfer(event);
        }
      }
    }
  }
  private async handleAnalyticsCompleted(event: SorobanRpc.Api.EventResponse) {
    if (stryMutAct_9fa48("6427")) {
      {}
    } else {
      stryCov_9fa48("6427");
      // Expected value shape: { student: publicKey, course: courseId }
      const value = event.value?.value?.() as any;
      const studentPublicKey: string = stryMutAct_9fa48("6429") ? value.student?.toString() : stryMutAct_9fa48("6428") ? value?.student.toString() : (stryCov_9fa48("6428", "6429"), value?.student?.toString());
      const courseId: string = stryMutAct_9fa48("6431") ? value.course?.toString() : stryMutAct_9fa48("6430") ? value?.course.toString() : (stryCov_9fa48("6430", "6431"), value?.course?.toString());
      if (stryMutAct_9fa48("6434") ? !studentPublicKey && !courseId : stryMutAct_9fa48("6433") ? false : stryMutAct_9fa48("6432") ? true : (stryCov_9fa48("6432", "6433", "6434"), (stryMutAct_9fa48("6435") ? studentPublicKey : (stryCov_9fa48("6435"), !studentPublicKey)) || (stryMutAct_9fa48("6436") ? courseId : (stryCov_9fa48("6436"), !courseId)))) return;
      const user = await this.usersService.findByStellarPublicKey(studentPublicKey);
      if (stryMutAct_9fa48("6439") ? false : stryMutAct_9fa48("6438") ? true : stryMutAct_9fa48("6437") ? user : (stryCov_9fa48("6437", "6438", "6439"), !user)) return;
      this.logger.log(stryMutAct_9fa48("6440") ? `` : (stryCov_9fa48("6440"), `analytics:completed — user ${user.id}, course ${courseId}`));
      await this.credentialsService.issue(user.id, courseId, studentPublicKey);
      await this.notificationsService.onCredentialIssued(user.id, courseId);
    }
  }
  private async handleTokenTransfer(event: SorobanRpc.Api.EventResponse) {
    if (stryMutAct_9fa48("6441")) {
      {}
    } else {
      stryCov_9fa48("6441");
      // Expected value shape: { to: publicKey, amount: bigint }
      const value = event.value?.value?.() as any;
      const toPublicKey: string = stryMutAct_9fa48("6443") ? value.to?.toString() : stryMutAct_9fa48("6442") ? value?.to.toString() : (stryCov_9fa48("6442", "6443"), value?.to?.toString());
      if (stryMutAct_9fa48("6446") ? false : stryMutAct_9fa48("6445") ? true : stryMutAct_9fa48("6444") ? toPublicKey : (stryCov_9fa48("6444", "6445", "6446"), !toPublicKey)) return;

      // Bust the cached BST balance so the next read is fresh
      await this.cacheManager.del(stryMutAct_9fa48("6447") ? `` : (stryCov_9fa48("6447"), `token_balance:${toPublicKey}`));
      this.logger.log(stryMutAct_9fa48("6448") ? `` : (stryCov_9fa48("6448"), `token:transfer — busted BST cache for ${toPublicKey}`));
    }
  }
}