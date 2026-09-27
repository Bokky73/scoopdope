import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCohorts1770000000001 implements MigrationInterface {
  name = 'AddCohorts1770000000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS cohorts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "courseId" UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        name VARCHAR NOT NULL,
        description TEXT,
        "startDate" TIMESTAMPTZ NOT NULL,
        "endDate" TIMESTAMPTZ NOT NULL,
        "maxMembers" INTEGER NOT NULL DEFAULT 0,
        "instructorId" UUID REFERENCES users(id) ON DELETE SET NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_cohorts_course ON cohorts("courseId")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS cohort_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "cohortId" UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
        "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "progressPercentage" FLOAT NOT NULL DEFAULT 0,
        "enrolledAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE ("cohortId", "userId")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_cohort_members_user ON cohort_members("userId")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS cohort_members`);
    await queryRunner.query(`DROP TABLE IF EXISTS cohorts`);
  }
}
