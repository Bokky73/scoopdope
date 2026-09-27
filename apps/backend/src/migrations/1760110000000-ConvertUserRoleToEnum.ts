import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertUserRoleToEnum1760110000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the enum type
    await queryRunner.query(`
      CREATE TYPE user_role_enum AS ENUM('admin', 'instructor', 'student')
    `);

    // Alter the column to use the enum type
    await queryRunner.query(`
      ALTER TABLE users 
      ALTER COLUMN role TYPE user_role_enum USING role::user_role_enum,
      ALTER COLUMN role SET DEFAULT 'student'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert back to varchar
    await queryRunner.query(`
      ALTER TABLE users 
      ALTER COLUMN role TYPE varchar USING role::varchar,
      ALTER COLUMN role SET DEFAULT 'student'
    `);

    // Drop the enum type
    await queryRunner.query(`DROP TYPE user_role_enum`);
  }
}
