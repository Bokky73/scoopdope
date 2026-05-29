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
import { MigrationInterface, QueryRunner } from 'typeorm';
export class AddNotes1749000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (stryMutAct_9fa48("5096")) {
      {}
    } else {
      stryCov_9fa48("5096");
      await queryRunner.query(stryMutAct_9fa48("5097") ? `` : (stryCov_9fa48("5097"), `
      CREATE TABLE "notes" (
        "id"        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId"    uuid NOT NULL,
        "lessonId"  uuid NOT NULL,
        "content"   text NOT NULL,
        "timestamp" float NOT NULL DEFAULT 0,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      )
    `));
      await queryRunner.query(stryMutAct_9fa48("5098") ? `` : (stryCov_9fa48("5098"), `CREATE INDEX "IDX_notes_user_lesson" ON "notes" ("userId", "lessonId")`));
    }
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    if (stryMutAct_9fa48("5099")) {
      {}
    } else {
      stryCov_9fa48("5099");
      await queryRunner.query(stryMutAct_9fa48("5100") ? `` : (stryCov_9fa48("5100"), `DROP TABLE IF EXISTS "notes"`));
    }
  }
}