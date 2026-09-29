import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCourseTags1760100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "tags" jsonb NOT NULL DEFAULT '[]'`,
    );
    // GIN index for fast containment queries: course.tags @> '["defi"]'
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_courses_tags" ON "courses" USING GIN ("tags")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_courses_tags"`);
    await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN IF EXISTS "tags"`);
  }
}
