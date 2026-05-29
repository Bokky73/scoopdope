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
export class AddWaitlist1748800000000 implements MigrationInterface {
  name = stryMutAct_9fa48("5057") ? "" : (stryCov_9fa48("5057"), 'AddWaitlist1748800000000');
  async up(queryRunner: QueryRunner): Promise<void> {
    if (stryMutAct_9fa48("5058")) {
      {}
    } else {
      stryCov_9fa48("5058");
      // Add maxEnrollment to courses
      await queryRunner.query(stryMutAct_9fa48("5059") ? `` : (stryCov_9fa48("5059"), `
      ALTER TABLE "courses"
      ADD COLUMN IF NOT EXISTS "maxEnrollment" integer NULL
    `));

      // Create waitlist_entries table
      await queryRunner.query(stryMutAct_9fa48("5060") ? `` : (stryCov_9fa48("5060"), `
      CREATE TABLE IF NOT EXISTS "waitlist_entries" (
        "id"        uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "userId"    uuid              NOT NULL,
        "courseId"  uuid              NOT NULL,
        "position"  integer           NOT NULL,
        "joinedAt"  TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "PK_waitlist_entries" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_waitlist_entries_user_course" UNIQUE ("userId", "courseId"),
        CONSTRAINT "FK_waitlist_entries_user"
          FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_waitlist_entries_course"
          FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE
      )
    `));
      await queryRunner.query(stryMutAct_9fa48("5061") ? `` : (stryCov_9fa48("5061"), `
      CREATE INDEX IF NOT EXISTS "IDX_waitlist_entries_userId"
        ON "waitlist_entries" ("userId")
    `));
      await queryRunner.query(stryMutAct_9fa48("5062") ? `` : (stryCov_9fa48("5062"), `
      CREATE INDEX IF NOT EXISTS "IDX_waitlist_entries_courseId"
        ON "waitlist_entries" ("courseId")
    `));

      // Add new notification types to the enum (Postgres requires ALTER TYPE)
      await queryRunner.query(stryMutAct_9fa48("5063") ? `` : (stryCov_9fa48("5063"), `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum
          WHERE enumlabel = 'waitlist_joined'
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notifications_type_enum')
        ) THEN
          ALTER TYPE "notifications_type_enum" ADD VALUE 'waitlist_joined';
        END IF;
      END$$
    `));
      await queryRunner.query(stryMutAct_9fa48("5064") ? `` : (stryCov_9fa48("5064"), `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum
          WHERE enumlabel = 'waitlist_enrolled'
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notifications_type_enum')
        ) THEN
          ALTER TYPE "notifications_type_enum" ADD VALUE 'waitlist_enrolled';
        END IF;
      END$$
    `));
    }
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    if (stryMutAct_9fa48("5065")) {
      {}
    } else {
      stryCov_9fa48("5065");
      await queryRunner.query(stryMutAct_9fa48("5066") ? `` : (stryCov_9fa48("5066"), `DROP TABLE IF EXISTS "waitlist_entries"`));
      await queryRunner.query(stryMutAct_9fa48("5067") ? `` : (stryCov_9fa48("5067"), `
      ALTER TABLE "courses" DROP COLUMN IF EXISTS "maxEnrollment"
    `));
      // Note: Postgres does not support removing enum values; the enum values
      // waitlist_joined and waitlist_enrolled are left in place on rollback.
    }
  }
}