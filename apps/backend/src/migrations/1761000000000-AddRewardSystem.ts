import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRewardSystem1761000000000 implements MigrationInterface {
  name = 'AddRewardSystem1761000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN IF NOT EXISTS "rewardBalance" integer NOT NULL DEFAULT 0;
    `);

    await queryRunner.query(`
      CREATE TYPE "reward_type_enum" AS ENUM ('module', 'course');
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "reward_history" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "type" "reward_type_enum" NOT NULL,
        "referenceId" character varying NOT NULL,
        "amount" integer NOT NULL,
        "reason" character varying NOT NULL,
        "txHash" character varying,
        "claimedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reward_history" PRIMARY KEY ("id"),
        CONSTRAINT "FK_reward_history_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_reward_history_user_claimedAt"
        ON "reward_history" ("userId", "claimedAt" DESC);
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_reward_history_user_reference"
        ON "reward_history" ("userId", "type", "referenceId");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_reward_history_user_reference";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_reward_history_user_claimedAt";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "reward_history";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "reward_type_enum";`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "rewardBalance";`);
  }
}
