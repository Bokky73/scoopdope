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
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
config();
export const AppDataSource = new DataSource(stryMutAct_9fa48("3339") ? {} : (stryCov_9fa48("3339"), {
  type: stryMutAct_9fa48("3340") ? "" : (stryCov_9fa48("3340"), 'postgres'),
  host: stryMutAct_9fa48("3343") ? process.env.DATABASE_HOST && 'localhost' : stryMutAct_9fa48("3342") ? false : stryMutAct_9fa48("3341") ? true : (stryCov_9fa48("3341", "3342", "3343"), process.env.DATABASE_HOST || (stryMutAct_9fa48("3344") ? "" : (stryCov_9fa48("3344"), 'localhost'))),
  port: parseInt(stryMutAct_9fa48("3347") ? process.env.DATABASE_PORT && '5432' : stryMutAct_9fa48("3346") ? false : stryMutAct_9fa48("3345") ? true : (stryCov_9fa48("3345", "3346", "3347"), process.env.DATABASE_PORT || (stryMutAct_9fa48("3348") ? "" : (stryCov_9fa48("3348"), '5432')))),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: stryMutAct_9fa48("3351") ? process.env.DATABASE_NAME && 'scoopdope' : stryMutAct_9fa48("3350") ? false : stryMutAct_9fa48("3349") ? true : (stryCov_9fa48("3349", "3350", "3351"), process.env.DATABASE_NAME || (stryMutAct_9fa48("3352") ? "" : (stryCov_9fa48("3352"), 'scoopdope'))),
  entities: stryMutAct_9fa48("3353") ? [] : (stryCov_9fa48("3353"), [stryMutAct_9fa48("3354") ? "" : (stryCov_9fa48("3354"), 'dist/**/*.entity.js')]),
  migrations: stryMutAct_9fa48("3355") ? [] : (stryCov_9fa48("3355"), [stryMutAct_9fa48("3356") ? "" : (stryCov_9fa48("3356"), 'dist/migrations/*.js')]),
  synchronize: stryMutAct_9fa48("3357") ? true : (stryCov_9fa48("3357"), false)
}));