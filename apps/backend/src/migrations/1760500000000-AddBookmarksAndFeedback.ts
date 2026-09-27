import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBookmarksAndFeedback1760500000000 implements MigrationInterface {
  name = 'AddBookmarksAndFeedback1760500000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // user_bookmarks table
    await queryRunner.query(`
      CREATE TABLE "user_bookmarks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "lessonId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_user_bookmarks_userId_lessonId" UNIQUE ("userId", "lessonId"),
        CONSTRAINT "PK_user_bookmarks" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "user_bookmarks"
        ADD CONSTRAINT "FK_user_bookmarks_userId"
          FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        ADD CONSTRAINT "FK_user_bookmarks_lessonId"
          FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_user_bookmarks_userId" ON "user_bookmarks" ("userId")
    `);

    // course_feedback table
    await queryRunner.query(`
      CREATE TABLE "course_feedback" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "courseId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "contentQuality" integer NOT NULL,
        "difficulty" integer NOT NULL,
        "relevance" integer NOT NULL,
        "instructorRating" integer NOT NULL,
        "overallRating" integer NOT NULL,
        "comment" text,
        "submittedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_course_feedback" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "course_feedback"
        ADD CONSTRAINT "FK_course_feedback_courseId"
          FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE,
        ADD CONSTRAINT "FK_course_feedback_userId"
          FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_course_feedback_courseId" ON "course_feedback" ("courseId")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_course_feedback_userId_courseId"
        ON "course_feedback" ("userId", "courseId")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "course_feedback"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_bookmarks"`);
  }
}
