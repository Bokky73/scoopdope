import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * #867 – Notification Center
 *
 * Changes:
 * 1. Add `title` column (nullable varchar) to `notifications`.
 * 2. Add new enum values `certificate` and `update` to the
 *    `notifications_type_enum` Postgres enum type.
 */
export class AddNotificationTitleAndTypes1756000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new enum values to the existing Postgres enum type.
    // ALTER TYPE … ADD VALUE is non-transactional in Postgres — it must run
    // outside a transaction block, but TypeORM migrations run in one by default.
    // We use raw queries with IF NOT EXISTS guards (PG 14+) for idempotency.
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum
          WHERE enumlabel = 'certificate'
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notifications_type_enum')
        ) THEN
          ALTER TYPE notifications_type_enum ADD VALUE 'certificate';
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum
          WHERE enumlabel = 'update'
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notifications_type_enum')
        ) THEN
          ALTER TYPE notifications_type_enum ADD VALUE 'update';
        END IF;
      END
      $$;
    `);

    // Add the `title` column (nullable – existing rows will be NULL).
    await queryRunner.query(`
      ALTER TABLE notifications
        ADD COLUMN IF NOT EXISTS title varchar NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the title column.
    await queryRunner.query(`
      ALTER TABLE notifications
        DROP COLUMN IF EXISTS title;
    `);

    // NOTE: Postgres does not support removing enum values without recreating
    // the type. Reversing the enum additions would require a full table rewrite
    // and is intentionally omitted here. The down migration merely removes the
    // column added in this step.
  }
}
