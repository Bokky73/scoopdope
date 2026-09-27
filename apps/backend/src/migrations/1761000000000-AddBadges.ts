import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBadges1761000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "badges" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "slug" varchar NOT NULL UNIQUE,
        "name" varchar NOT NULL,
        "description" text NOT NULL,
        "icon" varchar NOT NULL,
        "tier" varchar(10) NOT NULL,
        "criteria" jsonb NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "user_badges" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "badgeId" uuid NOT NULL REFERENCES "badges"("id") ON DELETE CASCADE,
        "earnedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_user_badges_user_badge" UNIQUE ("userId", "badgeId")
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_user_badges_user_id" ON "user_badges" ("userId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_badges_user_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_badges"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "badges"`);
  }
}
