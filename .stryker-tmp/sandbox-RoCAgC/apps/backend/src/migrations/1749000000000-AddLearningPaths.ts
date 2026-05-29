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
export class AddLearningPaths1749000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (stryMutAct_9fa48("5086")) {
      {}
    } else {
      stryCov_9fa48("5086");
      await queryRunner.query(stryMutAct_9fa48("5087") ? `` : (stryCov_9fa48("5087"), `
      CREATE TABLE "learning_paths" (
        "id"           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "title"        varchar NOT NULL,
        "description"  text NOT NULL,
        "isPublished"  boolean NOT NULL DEFAULT false,
        "thumbnailUrl" varchar,
        "courseOrder"  jsonb NOT NULL DEFAULT '[]',
        "createdAt"    timestamptz NOT NULL DEFAULT now(),
        "updatedAt"    timestamptz NOT NULL DEFAULT now()
      )
    `));
      await queryRunner.query(stryMutAct_9fa48("5088") ? `` : (stryCov_9fa48("5088"), `
      CREATE TABLE "learning_path_courses" (
        "learningPathId" uuid NOT NULL REFERENCES "learning_paths"("id") ON DELETE CASCADE,
        "courseId"       uuid NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
        PRIMARY KEY ("learningPathId", "courseId")
      )
    `));
      await queryRunner.query(stryMutAct_9fa48("5089") ? `` : (stryCov_9fa48("5089"), `
      CREATE TABLE "learning_path_enrollments" (
        "id"               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId"           uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "learningPathId"   uuid NOT NULL REFERENCES "learning_paths"("id") ON DELETE CASCADE,
        "enrolledAt"       timestamptz NOT NULL DEFAULT now(),
        "completedAt"      timestamptz,
        UNIQUE ("userId", "learningPathId")
      )
    `));
      await queryRunner.query(stryMutAct_9fa48("5090") ? `` : (stryCov_9fa48("5090"), `
      ALTER TABLE "credentials" ADD COLUMN IF NOT EXISTS "learningPathId" uuid REFERENCES "learning_paths"("id") ON DELETE SET NULL
    `));
    }
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    if (stryMutAct_9fa48("5091")) {
      {}
    } else {
      stryCov_9fa48("5091");
      await queryRunner.query(stryMutAct_9fa48("5092") ? `` : (stryCov_9fa48("5092"), `ALTER TABLE "credentials" DROP COLUMN IF EXISTS "learningPathId"`));
      await queryRunner.query(stryMutAct_9fa48("5093") ? `` : (stryCov_9fa48("5093"), `DROP TABLE IF EXISTS "learning_path_enrollments"`));
      await queryRunner.query(stryMutAct_9fa48("5094") ? `` : (stryCov_9fa48("5094"), `DROP TABLE IF EXISTS "learning_path_courses"`));
      await queryRunner.query(stryMutAct_9fa48("5095") ? `` : (stryCov_9fa48("5095"), `DROP TABLE IF EXISTS "learning_paths"`));
    }
  }
}