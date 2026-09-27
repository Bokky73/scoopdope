import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStudySessions1760100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "study_sessions" (
        "id"              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId"          uuid NOT NULL,
        "courseId"        uuid,
        "lessonId"        uuid,
        "durationSeconds" int NOT NULL DEFAULT 0,
        "startedAt"       timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "FK_study_sessions_user"
          FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_study_sessions_course"
          FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_study_sessions_user_course" ON "study_sessions" ("userId", "courseId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_study_sessions_user_started" ON "study_sessions" ("userId", "startedAt")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "study_sessions"`);
  }
}
