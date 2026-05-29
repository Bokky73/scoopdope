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
import { NodeSDK } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { IORedisInstrumentation } from '@opentelemetry/instrumentation-ioredis';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
const exporterUrl = stryMutAct_9fa48("7068") ? process.env.OTEL_EXPORTER_OTLP_ENDPOINT && 'http://localhost:4318/v1/traces' : stryMutAct_9fa48("7067") ? false : stryMutAct_9fa48("7066") ? true : (stryCov_9fa48("7066", "7067", "7068"), process.env.OTEL_EXPORTER_OTLP_ENDPOINT || (stryMutAct_9fa48("7069") ? "" : (stryCov_9fa48("7069"), 'http://localhost:4318/v1/traces')));
const exporter = new OTLPTraceExporter(stryMutAct_9fa48("7070") ? {} : (stryCov_9fa48("7070"), {
  url: exporterUrl
}));
const sdk = new NodeSDK(stryMutAct_9fa48("7071") ? {} : (stryCov_9fa48("7071"), {
  resource: new Resource(stryMutAct_9fa48("7072") ? {} : (stryCov_9fa48("7072"), {
    [SEMRESATTRS_SERVICE_NAME]: stryMutAct_9fa48("7073") ? "" : (stryCov_9fa48("7073"), 'scoopdope-backend'),
    [SEMRESATTRS_SERVICE_VERSION]: stryMutAct_9fa48("7076") ? process.env.GIT_COMMIT_SHA && '0.0.0' : stryMutAct_9fa48("7075") ? false : stryMutAct_9fa48("7074") ? true : (stryCov_9fa48("7074", "7075", "7076"), process.env.GIT_COMMIT_SHA || (stryMutAct_9fa48("7077") ? "" : (stryCov_9fa48("7077"), '0.0.0')))
  })),
  traceExporter: exporter,
  instrumentations: stryMutAct_9fa48("7078") ? [] : (stryCov_9fa48("7078"), [new HttpInstrumentation(), new PgInstrumentation(), new IORedisInstrumentation()])
}));
sdk.start();
process.on(stryMutAct_9fa48("7079") ? "" : (stryCov_9fa48("7079"), 'SIGTERM'), () => {
  if (stryMutAct_9fa48("7080")) {
    {}
  } else {
    stryCov_9fa48("7080");
    sdk.shutdown().finally(stryMutAct_9fa48("7081") ? () => undefined : (stryCov_9fa48("7081"), () => process.exit(0)));
  }
});