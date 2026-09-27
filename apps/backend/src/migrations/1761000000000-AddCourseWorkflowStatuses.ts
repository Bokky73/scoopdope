import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the `pending_review` and `archived` values to `courses_status_enum` so
 * courses can move through the DRAFT -> PENDING_REVIEW -> PUBLISHED workflow and
 * be archived afterwards. Also backfills `status` for any legacy rows that were
 * flagged published via the deprecated `isPublished` boolean only.
 */
export class AddCourseWorkflowStatuses1761000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum
          WHERE enumlabel = 'pending_review'
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'courses_status_enum')
        ) THEN
          ALTER TYPE "courses_status_enum" ADD VALUE 'pending_review';
        END IF;
      END$$
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum
          WHERE enumlabel = 'archived'
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'courses_status_enum')
        ) THEN
          ALTER TYPE "courses_status_enum" ADD VALUE 'archived';
        END IF;
      END$$
    `);

    await queryRunner.query(`
      UPDATE "courses"
      SET "status" = 'published'
      WHERE "isPublished" = true AND "status" <> 'published'
    `);
  }

  public async down(): Promise<void> {
    // Postgres does not support removing values from an enum type, so the
    // 'pending_review' and 'archived' labels are intentionally left in place.
  }
}
