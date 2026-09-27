import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCourseCategory1760100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'courses',
      new TableColumn({
        name: 'category',
        type: 'varchar',
        isNullable: true,
      })
    );

    // Create index on category for faster filtering
    await queryRunner.query(
      `CREATE INDEX idx_courses_category ON courses(category) WHERE category IS NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX idx_courses_category`);
    await queryRunner.dropColumn('courses', 'category');
  }
}
