import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class AddModuleCompletions1756700000000 implements MigrationInterface {
  name = 'AddModuleCompletions1756700000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'module_completions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'userId', type: 'uuid', isNullable: false },
          { name: 'moduleId', type: 'uuid', isNullable: false },
          { name: 'courseId', type: 'uuid', isNullable: false },
          {
            name: 'completedAt',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
        uniques: [{ columnNames: ['userId', 'moduleId'] }],
        foreignKeys: [
          {
            columnNames: ['userId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['moduleId'],
            referencedTableName: 'course_modules',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'module_completions',
      new TableIndex({
        name: 'IDX_module_completions_userId_courseId',
        columnNames: ['userId', 'courseId'],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('module_completions', true);
  }
}
