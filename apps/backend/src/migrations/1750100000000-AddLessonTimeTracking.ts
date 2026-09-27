import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddLessonTimeTracking1750100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add time_spent_seconds to lessons (calculated from study sessions)
    await queryRunner.addColumn(
      'lessons',
      new TableColumn({
        name: 'timeSpentSeconds',
        type: 'int',
        default: 0,
        comment: 'Total time spent on this lesson across all students (calculated)',
      }),
    );

    // Create study_sessions table for tracking individual lesson study time
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS study_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID NOT NULL,
        "lessonId" UUID NOT NULL,
        "courseId" UUID NOT NULL,
        "startedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "endedAt" TIMESTAMP WITH TIME ZONE,
        "durationSeconds" INT NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_study_sessions_user FOREIGN KEY ("userId")
          REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_study_sessions_lesson FOREIGN KEY ("lessonId")
          REFERENCES lessons(id) ON DELETE CASCADE,
        CONSTRAINT fk_study_sessions_course FOREIGN KEY ("courseId")
          REFERENCES courses(id) ON DELETE CASCADE
      );
    `);

    // Create indices for efficient queries
    await queryRunner.query(`
      CREATE INDEX idx_study_sessions_user ON study_sessions("userId");
    `);

    await queryRunner.query(`
      CREATE INDEX idx_study_sessions_lesson ON study_sessions("lessonId");
    `);

    await queryRunner.query(`
      CREATE INDEX idx_study_sessions_course ON study_sessions("courseId");
    `);

    await queryRunner.query(`
      CREATE INDEX idx_study_sessions_user_lesson ON study_sessions("userId", "lessonId");
    `);

    // Create lesson_time_stats table for aggregated instructor reports
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS lesson_time_stats (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "lessonId" UUID NOT NULL UNIQUE,
        "courseId" UUID NOT NULL,
        "totalTimeSeconds" INT NOT NULL DEFAULT 0,
        "averageTimeSeconds" INT NOT NULL DEFAULT 0,
        "maxTimeSeconds" INT NOT NULL DEFAULT 0,
        "minTimeSeconds" INT NOT NULL DEFAULT 0,
        "studentCount" INT NOT NULL DEFAULT 0,
        "isDifficult" BOOLEAN NOT NULL DEFAULT false,
        "lastUpdatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_lesson_time_stats_lesson FOREIGN KEY ("lessonId")
          REFERENCES lessons(id) ON DELETE CASCADE,
        CONSTRAINT fk_lesson_time_stats_course FOREIGN KEY ("courseId")
          REFERENCES courses(id) ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_lesson_time_stats_course ON lesson_time_stats("courseId");
    `);

    await queryRunner.query(`
      CREATE INDEX idx_lesson_time_stats_difficult ON lesson_time_stats("isDifficult");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS lesson_time_stats CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS study_sessions CASCADE;`);
    await queryRunner.dropColumn('lessons', 'timeSpentSeconds');
  }
}
