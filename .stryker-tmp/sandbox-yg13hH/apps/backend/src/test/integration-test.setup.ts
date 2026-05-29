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
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { DataSource } from 'typeorm';
import * as path from 'path';
let container: StartedPostgreSqlContainer;
let dataSource: DataSource;
export async function setupTestDatabase(): Promise<DataSource> {
  if (stryMutAct_9fa48("7046")) {
    {}
  } else {
    stryCov_9fa48("7046");
    container = await new PostgreSqlContainer().withDatabase(stryMutAct_9fa48("7047") ? "" : (stryCov_9fa48("7047"), 'scoopdope-test')).withUsername(stryMutAct_9fa48("7048") ? "" : (stryCov_9fa48("7048"), 'test-user')).withPassword(stryMutAct_9fa48("7049") ? "" : (stryCov_9fa48("7049"), 'test-password')).start();
    const host = container.getHost();
    const port = container.getPort();
    const username = container.getUsername();
    const password = container.getPassword();
    const database = container.getDatabase();
    dataSource = new DataSource(stryMutAct_9fa48("7050") ? {} : (stryCov_9fa48("7050"), {
      type: stryMutAct_9fa48("7051") ? "" : (stryCov_9fa48("7051"), 'postgres'),
      host,
      port,
      username,
      password,
      database,
      entities: stryMutAct_9fa48("7052") ? [] : (stryCov_9fa48("7052"), [path.join(__dirname, stryMutAct_9fa48("7053") ? "" : (stryCov_9fa48("7053"), '../**/*.entity.ts'))]),
      migrations: stryMutAct_9fa48("7054") ? [] : (stryCov_9fa48("7054"), [path.join(__dirname, stryMutAct_9fa48("7055") ? "" : (stryCov_9fa48("7055"), '../migrations/*.ts'))]),
      synchronize: stryMutAct_9fa48("7056") ? true : (stryCov_9fa48("7056"), false),
      logging: stryMutAct_9fa48("7057") ? true : (stryCov_9fa48("7057"), false)
    }));
    await dataSource.initialize();
    await dataSource.runMigrations();
    return dataSource;
  }
}
export async function teardownTestDatabase(): Promise<void> {
  if (stryMutAct_9fa48("7058")) {
    {}
  } else {
    stryCov_9fa48("7058");
    if (stryMutAct_9fa48("7060") ? false : stryMutAct_9fa48("7059") ? true : (stryCov_9fa48("7059", "7060"), dataSource)) {
      if (stryMutAct_9fa48("7061")) {
        {}
      } else {
        stryCov_9fa48("7061");
        await dataSource.destroy();
      }
    }
    if (stryMutAct_9fa48("7063") ? false : stryMutAct_9fa48("7062") ? true : (stryCov_9fa48("7062", "7063"), container)) {
      if (stryMutAct_9fa48("7064")) {
        {}
      } else {
        stryCov_9fa48("7064");
        await container.stop();
      }
    }
  }
}
export function getTestDataSource(): DataSource {
  if (stryMutAct_9fa48("7065")) {
    {}
  } else {
    stryCov_9fa48("7065");
    return dataSource;
  }
}