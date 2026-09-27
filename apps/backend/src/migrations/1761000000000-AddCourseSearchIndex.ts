import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCourseSearchIndex1761000000000 implements MigrationInterface {
  name = 'AddCourseSearchIndex1761000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_courses_search_tsvector"
      ON "courses"
      USING GIN (to_tsvector('simple', coalesce("title", '') || ' ' || coalesce("description", '')))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_courses_search_tsvector"`);
  }
}
