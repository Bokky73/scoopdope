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
import { MigrationInterface, QueryRunner } from 'typeorm';
export class AddLiveSessions1748900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (stryMutAct_9fa48("5068")) {
      {}
    } else {
      stryCov_9fa48("5068");
      await queryRunner.query(stryMutAct_9fa48("5069") ? `` : (stryCov_9fa48("5069"), `
      CREATE TYPE "live_session_status_enum" AS ENUM ('scheduled', 'cancelled', 'completed')
    `));
      await queryRunner.query(stryMutAct_9fa48("5070") ? `` : (stryCov_9fa48("5070"), `
      CREATE TABLE "live_sessions" (
        "id"              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "cohortId"        uuid NOT NULL REFERENCES "cohorts"("id") ON DELETE CASCADE,
        "instructorId"    uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "title"           varchar NOT NULL,
        "description"     text,
        "scheduledAt"     timestamptz NOT NULL,
        "durationMinutes" int NOT NULL DEFAULT 60,
        "meetingUrl"      varchar,
        "status"          "live_session_status_enum" NOT NULL DEFAULT 'scheduled',
        "remindersSent"   text,
        "createdAt"       timestamptz NOT NULL DEFAULT now(),
        "updatedAt"       timestamptz NOT NULL DEFAULT now()
      )
    `));
    }
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    if (stryMutAct_9fa48("5071")) {
      {}
    } else {
      stryCov_9fa48("5071");
      await queryRunner.query(stryMutAct_9fa48("5072") ? `` : (stryCov_9fa48("5072"), `DROP TABLE IF EXISTS "live_sessions"`));
      await queryRunner.query(stryMutAct_9fa48("5073") ? `` : (stryCov_9fa48("5073"), `DROP TYPE IF EXISTS "live_session_status_enum"`));
    }
  }
}