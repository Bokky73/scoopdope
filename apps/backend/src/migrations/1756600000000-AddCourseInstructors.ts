import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class AddCourseInstructors1756600000000 implements MigrationInterface {
  name = 'AddCourseInstructors1756600000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'course_instructors',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'courseId', type: 'uuid', isNullable: false },
          { name: 'instructorId', type: 'uuid', isNullable: false },
          {
            name: 'assignedAt',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
        uniques: [{ columnNames: ['courseId', 'instructorId'] }],
        foreignKeys: [
          {
            columnNames: ['courseId'],
            referencedTableName: 'courses',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['instructorId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'course_instructors',
      new TableIndex({
        name: 'IDX_course_instructors_instructorId',
        columnNames: ['instructorId'],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('course_instructors', true);
  }
}
