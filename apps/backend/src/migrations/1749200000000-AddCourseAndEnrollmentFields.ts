import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCourseAndEnrollmentFields1749200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add learningOutcomes and category columns to courses table
    await queryRunner.query(`
      ALTER TABLE "courses"
      ADD COLUMN "category" character varying,
      ADD COLUMN "learningOutcomes" jsonb
    `);

    // Add status column to enrollments table with enum type
    await queryRunner.query(`
      CREATE TYPE "enrollment_status_enum" AS ENUM ('active', 'completed', 'dropped')
    `);

    await queryRunner.query(`
      ALTER TABLE "enrollments"
      ADD COLUMN "status" "enrollment_status_enum" NOT NULL DEFAULT 'active'
    `);

    // Create indexes on userId and courseId for better query performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_enrollments_userId" ON "enrollments"("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_enrollments_courseId" ON "enrollments"("courseId")
    `);

    // Create index for status column queries
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_enrollments_status" ON "enrollments"("status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_enrollments_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_enrollments_courseId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_enrollments_userId"`);

    // Remove status column and enum
    await queryRunner.query(`
      ALTER TABLE "enrollments"
      DROP COLUMN "status"
    `);

    await queryRunner.query(`DROP TYPE IF EXISTS "enrollment_status_enum"`);

    // Remove category and learningOutcomes columns
    await queryRunner.query(`
      ALTER TABLE "courses"
      DROP COLUMN "learningOutcomes",
      DROP COLUMN "category"
    `);
  }
}
