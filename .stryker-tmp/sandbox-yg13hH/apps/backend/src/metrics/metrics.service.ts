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
import { Counter, Histogram, register } from 'prom-client';
@Injectable()
export class MetricsService {
  private readonly httpRequestsTotal: Counter;
  private readonly credentialIssuedTotal: Counter;
  private readonly bstMintedTotal: Counter;
  private readonly stellarRpcLatency: Histogram;
  private readonly cacheHitsTotal: Counter;
  private readonly cacheMissesTotal: Counter;
  constructor() {
    if (stryMutAct_9fa48("4527")) {
      {}
    } else {
      stryCov_9fa48("4527");
      this.httpRequestsTotal = new Counter(stryMutAct_9fa48("4528") ? {} : (stryCov_9fa48("4528"), {
        name: stryMutAct_9fa48("4529") ? "" : (stryCov_9fa48("4529"), 'http_requests_total'),
        help: stryMutAct_9fa48("4530") ? "" : (stryCov_9fa48("4530"), 'Total number of HTTP requests'),
        labelNames: stryMutAct_9fa48("4531") ? [] : (stryCov_9fa48("4531"), [stryMutAct_9fa48("4532") ? "" : (stryCov_9fa48("4532"), 'method'), stryMutAct_9fa48("4533") ? "" : (stryCov_9fa48("4533"), 'route'), stryMutAct_9fa48("4534") ? "" : (stryCov_9fa48("4534"), 'status_code')]),
        registers: stryMutAct_9fa48("4535") ? [] : (stryCov_9fa48("4535"), [register])
      }));
      this.credentialIssuedTotal = new Counter(stryMutAct_9fa48("4536") ? {} : (stryCov_9fa48("4536"), {
        name: stryMutAct_9fa48("4537") ? "" : (stryCov_9fa48("4537"), 'credential_issued_total'),
        help: stryMutAct_9fa48("4538") ? "" : (stryCov_9fa48("4538"), 'Total number of credentials issued'),
        labelNames: stryMutAct_9fa48("4539") ? [] : (stryCov_9fa48("4539"), [stryMutAct_9fa48("4540") ? "" : (stryCov_9fa48("4540"), 'credential_type')]),
        registers: stryMutAct_9fa48("4541") ? [] : (stryCov_9fa48("4541"), [register])
      }));
      this.bstMintedTotal = new Counter(stryMutAct_9fa48("4542") ? {} : (stryCov_9fa48("4542"), {
        name: stryMutAct_9fa48("4543") ? "" : (stryCov_9fa48("4543"), 'bst_minted_total'),
        help: stryMutAct_9fa48("4544") ? "" : (stryCov_9fa48("4544"), 'Total number of BST tokens minted'),
        labelNames: stryMutAct_9fa48("4545") ? [] : (stryCov_9fa48("4545"), [stryMutAct_9fa48("4546") ? "" : (stryCov_9fa48("4546"), 'user_id')]),
        registers: stryMutAct_9fa48("4547") ? [] : (stryCov_9fa48("4547"), [register])
      }));
      this.stellarRpcLatency = new Histogram(stryMutAct_9fa48("4548") ? {} : (stryCov_9fa48("4548"), {
        name: stryMutAct_9fa48("4549") ? "" : (stryCov_9fa48("4549"), 'stellar_rpc_latency_seconds'),
        help: stryMutAct_9fa48("4550") ? "" : (stryCov_9fa48("4550"), 'Stellar RPC call latency in seconds'),
        labelNames: stryMutAct_9fa48("4551") ? [] : (stryCov_9fa48("4551"), [stryMutAct_9fa48("4552") ? "" : (stryCov_9fa48("4552"), 'method'), stryMutAct_9fa48("4553") ? "" : (stryCov_9fa48("4553"), 'status')]),
        buckets: stryMutAct_9fa48("4554") ? [] : (stryCov_9fa48("4554"), [0.1, 0.5, 1, 2, 5]),
        registers: stryMutAct_9fa48("4555") ? [] : (stryCov_9fa48("4555"), [register])
      }));
      this.cacheHitsTotal = new Counter(stryMutAct_9fa48("4556") ? {} : (stryCov_9fa48("4556"), {
        name: stryMutAct_9fa48("4557") ? "" : (stryCov_9fa48("4557"), 'cache_hits_total'),
        help: stryMutAct_9fa48("4558") ? "" : (stryCov_9fa48("4558"), 'Total number of cache hits'),
        labelNames: stryMutAct_9fa48("4559") ? [] : (stryCov_9fa48("4559"), [stryMutAct_9fa48("4560") ? "" : (stryCov_9fa48("4560"), 'cache')]),
        registers: stryMutAct_9fa48("4561") ? [] : (stryCov_9fa48("4561"), [register])
      }));
      this.cacheMissesTotal = new Counter(stryMutAct_9fa48("4562") ? {} : (stryCov_9fa48("4562"), {
        name: stryMutAct_9fa48("4563") ? "" : (stryCov_9fa48("4563"), 'cache_misses_total'),
        help: stryMutAct_9fa48("4564") ? "" : (stryCov_9fa48("4564"), 'Total number of cache misses'),
        labelNames: stryMutAct_9fa48("4565") ? [] : (stryCov_9fa48("4565"), [stryMutAct_9fa48("4566") ? "" : (stryCov_9fa48("4566"), 'cache')]),
        registers: stryMutAct_9fa48("4567") ? [] : (stryCov_9fa48("4567"), [register])
      }));
    }
  }
  incrementHttpRequests(method: string, route: string, statusCode: number) {
    if (stryMutAct_9fa48("4568")) {
      {}
    } else {
      stryCov_9fa48("4568");
      this.httpRequestsTotal.inc(stryMutAct_9fa48("4569") ? {} : (stryCov_9fa48("4569"), {
        method,
        route,
        status_code: statusCode.toString()
      }));
    }
  }
  incrementCredentialIssued(credentialType: string) {
    if (stryMutAct_9fa48("4570")) {
      {}
    } else {
      stryCov_9fa48("4570");
      this.credentialIssuedTotal.inc(stryMutAct_9fa48("4571") ? {} : (stryCov_9fa48("4571"), {
        credential_type: credentialType
      }));
    }
  }
  incrementBstMinted(userId: string) {
    if (stryMutAct_9fa48("4572")) {
      {}
    } else {
      stryCov_9fa48("4572");
      this.bstMintedTotal.inc(stryMutAct_9fa48("4573") ? {} : (stryCov_9fa48("4573"), {
        user_id: userId
      }));
    }
  }
  observeStellarRpcLatency(method: string, status: string, durationSeconds: number) {
    if (stryMutAct_9fa48("4574")) {
      {}
    } else {
      stryCov_9fa48("4574");
      this.stellarRpcLatency.observe(stryMutAct_9fa48("4575") ? {} : (stryCov_9fa48("4575"), {
        method,
        status
      }), durationSeconds);
    }
  }
  incrementCacheHit(cache: string) {
    if (stryMutAct_9fa48("4576")) {
      {}
    } else {
      stryCov_9fa48("4576");
      this.cacheHitsTotal.inc(stryMutAct_9fa48("4577") ? {} : (stryCov_9fa48("4577"), {
        cache
      }));
    }
  }
  incrementCacheMiss(cache: string) {
    if (stryMutAct_9fa48("4578")) {
      {}
    } else {
      stryCov_9fa48("4578");
      this.cacheMissesTotal.inc(stryMutAct_9fa48("4579") ? {} : (stryCov_9fa48("4579"), {
        cache
      }));
    }
  }
}