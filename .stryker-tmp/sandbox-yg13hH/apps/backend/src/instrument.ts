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
import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

// Initialize Sentry before any other imports
Sentry.init(stryMutAct_9fa48("3990") ? {} : (stryCov_9fa48("3990"), {
  dsn: process.env.SENTRY_DSN,
  environment: stryMutAct_9fa48("3993") ? process.env.NODE_ENV && 'development' : stryMutAct_9fa48("3992") ? false : stryMutAct_9fa48("3991") ? true : (stryCov_9fa48("3991", "3992", "3993"), process.env.NODE_ENV || (stryMutAct_9fa48("3994") ? "" : (stryCov_9fa48("3994"), 'development'))),
  release: stryMutAct_9fa48("3997") ? process.env.GIT_COMMIT_SHA && 'unknown' : stryMutAct_9fa48("3996") ? false : stryMutAct_9fa48("3995") ? true : (stryCov_9fa48("3995", "3996", "3997"), process.env.GIT_COMMIT_SHA || (stryMutAct_9fa48("3998") ? "" : (stryCov_9fa48("3998"), 'unknown'))),
  integrations: stryMutAct_9fa48("3999") ? [] : (stryCov_9fa48("3999"), [nodeProfilingIntegration()]),
  tracesSampleRate: (stryMutAct_9fa48("4002") ? process.env.NODE_ENV !== 'production' : stryMutAct_9fa48("4001") ? false : stryMutAct_9fa48("4000") ? true : (stryCov_9fa48("4000", "4001", "4002"), process.env.NODE_ENV === (stryMutAct_9fa48("4003") ? "" : (stryCov_9fa48("4003"), 'production')))) ? 0.1 : 1.0,
  profilesSampleRate: (stryMutAct_9fa48("4006") ? process.env.NODE_ENV !== 'production' : stryMutAct_9fa48("4005") ? false : stryMutAct_9fa48("4004") ? true : (stryCov_9fa48("4004", "4005", "4006"), process.env.NODE_ENV === (stryMutAct_9fa48("4007") ? "" : (stryCov_9fa48("4007"), 'production')))) ? 0.1 : 1.0,
  beforeSend(event, _hint) {
    if (stryMutAct_9fa48("4008")) {
      {}
    } else {
      stryCov_9fa48("4008");
      // Filter out sensitive data
      if (stryMutAct_9fa48("4010") ? false : stryMutAct_9fa48("4009") ? true : (stryCov_9fa48("4009", "4010"), event.request)) {
        if (stryMutAct_9fa48("4011")) {
          {}
        } else {
          stryCov_9fa48("4011");
          delete event.request.cookies;
          if (stryMutAct_9fa48("4013") ? false : stryMutAct_9fa48("4012") ? true : (stryCov_9fa48("4012", "4013"), event.request.headers)) {
            if (stryMutAct_9fa48("4014")) {
              {}
            } else {
              stryCov_9fa48("4014");
              delete event.request.headers[stryMutAct_9fa48("4015") ? "" : (stryCov_9fa48("4015"), 'authorization')];
            }
          }
        }
      }
      return event;
    }
  }
}));