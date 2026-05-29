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
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { NetworkStatus, ServiceStatus } from './types/network-status.types';
@Injectable()
export class NetworkMonitorService implements OnModuleInit {
  private readonly logger = new Logger(NetworkMonitorService.name);
  private status: NetworkStatus;
  constructor(private configService: ConfigService) {
    if (stryMutAct_9fa48("6291")) {
      {}
    } else {
      stryCov_9fa48("6291");
      this.status = stryMutAct_9fa48("6292") ? {} : (stryCov_9fa48("6292"), {
        horizon: stryMutAct_9fa48("6293") ? {} : (stryCov_9fa48("6293"), {
          status: stryMutAct_9fa48("6294") ? "" : (stryCov_9fa48("6294"), 'down'),
          url: stryMutAct_9fa48("6295") ? "Stryker was here!" : (stryCov_9fa48("6295"), ''),
          latencyMs: 0,
          lastChecked: stryMutAct_9fa48("6296") ? "Stryker was here!" : (stryCov_9fa48("6296"), '')
        }),
        soroban: stryMutAct_9fa48("6297") ? {} : (stryCov_9fa48("6297"), {
          status: stryMutAct_9fa48("6298") ? "" : (stryCov_9fa48("6298"), 'down'),
          url: stryMutAct_9fa48("6299") ? "Stryker was here!" : (stryCov_9fa48("6299"), ''),
          latencyMs: 0,
          lastChecked: stryMutAct_9fa48("6300") ? "Stryker was here!" : (stryCov_9fa48("6300"), '')
        }),
        timestamp: new Date().toISOString(),
        network: stryMutAct_9fa48("6303") ? this.configService.get('STELLAR_NETWORK') && 'testnet' : stryMutAct_9fa48("6302") ? false : stryMutAct_9fa48("6301") ? true : (stryCov_9fa48("6301", "6302", "6303"), this.configService.get(stryMutAct_9fa48("6304") ? "" : (stryCov_9fa48("6304"), 'STELLAR_NETWORK')) || (stryMutAct_9fa48("6305") ? "" : (stryCov_9fa48("6305"), 'testnet')))
      });
    }
  }
  async onModuleInit() {
    if (stryMutAct_9fa48("6306")) {
      {}
    } else {
      stryCov_9fa48("6306");
      await this.checkHealth();
      // Regular health checks every 60 seconds
      setInterval(stryMutAct_9fa48("6307") ? () => undefined : (stryCov_9fa48("6307"), () => this.checkHealth()), 60000);
    }
  }
  private async checkService(url: string, _type: 'horizon' | 'soroban'): Promise<ServiceStatus> {
    if (stryMutAct_9fa48("6308")) {
      {}
    } else {
      stryCov_9fa48("6308");
      const start = Date.now();
      try {
        if (stryMutAct_9fa48("6309")) {
          {}
        } else {
          stryCov_9fa48("6309");
          const response = await axios.get(url, stryMutAct_9fa48("6310") ? {} : (stryCov_9fa48("6310"), {
            timeout: 5000
          }));
          const latency = stryMutAct_9fa48("6311") ? Date.now() + start : (stryCov_9fa48("6311"), Date.now() - start);
          return stryMutAct_9fa48("6312") ? {} : (stryCov_9fa48("6312"), {
            status: (stryMutAct_9fa48("6315") ? response.status !== 200 : stryMutAct_9fa48("6314") ? false : stryMutAct_9fa48("6313") ? true : (stryCov_9fa48("6313", "6314", "6315"), response.status === 200)) ? stryMutAct_9fa48("6316") ? "" : (stryCov_9fa48("6316"), 'healthy') : stryMutAct_9fa48("6317") ? "" : (stryCov_9fa48("6317"), 'unstable'),
            url,
            latencyMs: latency,
            lastChecked: new Date().toISOString()
          });
        }
      } catch (error) {
        if (stryMutAct_9fa48("6318")) {
          {}
        } else {
          stryCov_9fa48("6318");
          return stryMutAct_9fa48("6319") ? {} : (stryCov_9fa48("6319"), {
            status: stryMutAct_9fa48("6320") ? "" : (stryCov_9fa48("6320"), 'down'),
            url,
            latencyMs: stryMutAct_9fa48("6321") ? Date.now() + start : (stryCov_9fa48("6321"), Date.now() - start),
            lastChecked: new Date().toISOString(),
            error: error.message
          });
        }
      }
    }
  }
  async checkHealth() {
    if (stryMutAct_9fa48("6322")) {
      {}
    } else {
      stryCov_9fa48("6322");
      const isTestnet = stryMutAct_9fa48("6325") ? this.configService.get('STELLAR_NETWORK') === 'mainnet' : stryMutAct_9fa48("6324") ? false : stryMutAct_9fa48("6323") ? true : (stryCov_9fa48("6323", "6324", "6325"), this.configService.get(stryMutAct_9fa48("6326") ? "" : (stryCov_9fa48("6326"), 'STELLAR_NETWORK')) !== (stryMutAct_9fa48("6327") ? "" : (stryCov_9fa48("6327"), 'mainnet')));
      const horizonUrl = isTestnet ? stryMutAct_9fa48("6328") ? "" : (stryCov_9fa48("6328"), 'https://horizon-testnet.stellar.org') : stryMutAct_9fa48("6329") ? "" : (stryCov_9fa48("6329"), 'https://horizon.stellar.org');
      const sorobanUrl = stryMutAct_9fa48("6332") ? this.configService.get('SOROBAN_RPC_URL') && 'https://soroban-testnet.stellar.org' : stryMutAct_9fa48("6331") ? false : stryMutAct_9fa48("6330") ? true : (stryCov_9fa48("6330", "6331", "6332"), this.configService.get(stryMutAct_9fa48("6333") ? "" : (stryCov_9fa48("6333"), 'SOROBAN_RPC_URL')) || (stryMutAct_9fa48("6334") ? "" : (stryCov_9fa48("6334"), 'https://soroban-testnet.stellar.org')));
      this.logger.log(stryMutAct_9fa48("6335") ? "" : (stryCov_9fa48("6335"), 'Performing network health checks...'));
      const [horizonStatus, sorobanStatus] = await Promise.all(stryMutAct_9fa48("6336") ? [] : (stryCov_9fa48("6336"), [this.checkService(horizonUrl, stryMutAct_9fa48("6337") ? "" : (stryCov_9fa48("6337"), 'horizon')), this.checkService(sorobanUrl, stryMutAct_9fa48("6338") ? "" : (stryCov_9fa48("6338"), 'soroban'))]));
      this.status = stryMutAct_9fa48("6339") ? {} : (stryCov_9fa48("6339"), {
        horizon: horizonStatus,
        soroban: sorobanStatus,
        timestamp: new Date().toISOString(),
        network: isTestnet ? stryMutAct_9fa48("6340") ? "" : (stryCov_9fa48("6340"), 'testnet') : stryMutAct_9fa48("6341") ? "" : (stryCov_9fa48("6341"), 'mainnet')
      });
      if (stryMutAct_9fa48("6344") ? this.status.horizon.status !== 'healthy' && this.status.soroban.status !== 'healthy' : stryMutAct_9fa48("6343") ? false : stryMutAct_9fa48("6342") ? true : (stryCov_9fa48("6342", "6343", "6344"), (stryMutAct_9fa48("6346") ? this.status.horizon.status === 'healthy' : stryMutAct_9fa48("6345") ? false : (stryCov_9fa48("6345", "6346"), this.status.horizon.status !== (stryMutAct_9fa48("6347") ? "" : (stryCov_9fa48("6347"), 'healthy')))) || (stryMutAct_9fa48("6349") ? this.status.soroban.status === 'healthy' : stryMutAct_9fa48("6348") ? false : (stryCov_9fa48("6348", "6349"), this.status.soroban.status !== (stryMutAct_9fa48("6350") ? "" : (stryCov_9fa48("6350"), 'healthy')))))) {
        if (stryMutAct_9fa48("6351")) {
          {}
        } else {
          stryCov_9fa48("6351");
          this.logger.warn(stryMutAct_9fa48("6352") ? `` : (stryCov_9fa48("6352"), `Network monitoring alert: Horizon ${this.status.horizon.status}, Soroban ${this.status.soroban.status}`));
        }
      } else {
        if (stryMutAct_9fa48("6353")) {
          {}
        } else {
          stryCov_9fa48("6353");
          this.logger.log(stryMutAct_9fa48("6354") ? `` : (stryCov_9fa48("6354"), `Network health check passed: Horizon ${horizonStatus.latencyMs}ms, Soroban ${sorobanStatus.latencyMs}ms`));
        }
      }
    }
  }
  getNetworkStatus(): NetworkStatus {
    if (stryMutAct_9fa48("6355")) {
      {}
    } else {
      stryCov_9fa48("6355");
      return this.status;
    }
  }
}