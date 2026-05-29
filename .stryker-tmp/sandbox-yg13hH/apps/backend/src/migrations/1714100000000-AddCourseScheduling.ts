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
export class AddCourseScheduling1714100000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    if (stryMutAct_9fa48("4882")) {
      {}
    } else {
      stryCov_9fa48("4882");
      await queryRunner.query(stryMutAct_9fa48("4883") ? `` : (stryCov_9fa48("4883"), `
      CREATE TYPE "courses_status_enum" AS ENUM ('draft', 'scheduled', 'published')
    `));
      await queryRunner.query(stryMutAct_9fa48("4884") ? `` : (stryCov_9fa48("4884"), `
      ALTER TABLE "courses"
        ADD COLUMN "status" "courses_status_enum" NOT NULL DEFAULT 'draft',
        ADD COLUMN "scheduledAt" TIMESTAMPTZ,
        ADD COLUMN "publishedAt" TIMESTAMPTZ
    `));
      // Back-fill: existing published courses → published status
      await queryRunner.query(stryMutAct_9fa48("4885") ? `` : (stryCov_9fa48("4885"), `
      UPDATE "courses" SET "status" = 'published', "publishedAt" = "createdAt" WHERE "isPublished" = true
    `));
    }
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    if (stryMutAct_9fa48("4886")) {
      {}
    } else {
      stryCov_9fa48("4886");
      await queryRunner.query(stryMutAct_9fa48("4887") ? `` : (stryCov_9fa48("4887"), `
      ALTER TABLE "courses"
        DROP COLUMN "status",
        DROP COLUMN "scheduledAt",
        DROP COLUMN "publishedAt"
    `));
      await queryRunner.query(stryMutAct_9fa48("4888") ? `` : (stryCov_9fa48("4888"), `DROP TYPE "courses_status_enum"`));
    }
  }
}