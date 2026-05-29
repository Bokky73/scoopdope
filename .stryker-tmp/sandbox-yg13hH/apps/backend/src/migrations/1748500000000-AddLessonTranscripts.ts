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
export class AddLessonTranscripts1748500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (stryMutAct_9fa48("5035")) {
      {}
    } else {
      stryCov_9fa48("5035");
      await queryRunner.query(stryMutAct_9fa48("5036") ? `` : (stryCov_9fa48("5036"), `ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "transcript" jsonb`));
      await queryRunner.query(stryMutAct_9fa48("5037") ? `` : (stryCov_9fa48("5037"), `ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "transcriptSrt" text`));
      await queryRunner.query(stryMutAct_9fa48("5038") ? `` : (stryCov_9fa48("5038"), `ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "transcriptionJobName" text`));
    }
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    if (stryMutAct_9fa48("5039")) {
      {}
    } else {
      stryCov_9fa48("5039");
      await queryRunner.query(stryMutAct_9fa48("5040") ? `` : (stryCov_9fa48("5040"), `ALTER TABLE "lessons" DROP COLUMN IF EXISTS "transcript"`));
      await queryRunner.query(stryMutAct_9fa48("5041") ? `` : (stryCov_9fa48("5041"), `ALTER TABLE "lessons" DROP COLUMN IF EXISTS "transcriptSrt"`));
      await queryRunner.query(stryMutAct_9fa48("5042") ? `` : (stryCov_9fa48("5042"), `ALTER TABLE "lessons" DROP COLUMN IF EXISTS "transcriptionJobName"`));
    }
  }
}