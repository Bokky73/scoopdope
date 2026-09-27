import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

/**
 * #871 – Student Study Groups
 *
 * Creates:
 *  1. `study_groups` table
 *  2. `study_group_members` join table with a unique constraint on (studyGroupId, userId)
 */
export class AddStudyGroups1756200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. study_groups
    await queryRunner.createTable(
      new Table({
        name: 'study_groups',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'name', type: 'varchar' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'courseId', type: 'uuid' },
          { name: 'creatorId', type: 'uuid' },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
          { name: 'updatedAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    // Index for quick course-level lookups
    await queryRunner.createIndex(
      'study_groups',
      new TableIndex({ name: 'IDX_study_groups_courseId', columnNames: ['courseId'] }),
    );

    // 2. study_group_members
    await queryRunner.createTable(
      new Table({
        name: 'study_group_members',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'studyGroupId', type: 'uuid' },
          { name: 'userId', type: 'uuid' },
          { name: 'joinedAt', type: 'timestamptz', default: 'now()' },
        ],
        // Unique constraint: a user can only be in a group once
        uniques: [{ name: 'UQ_study_group_member', columnNames: ['studyGroupId', 'userId'] }],
      }),
      true,
    );

    // FK: study_group_members → study_groups (CASCADE on group delete)
    await queryRunner.createForeignKey(
      'study_group_members',
      new TableForeignKey({
        name: 'FK_sgm_studyGroup',
        columnNames: ['studyGroupId'],
        referencedTableName: 'study_groups',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('study_group_members', 'FK_sgm_studyGroup');
    await queryRunner.dropTable('study_group_members');
    await queryRunner.dropIndex('study_groups', 'IDX_study_groups_courseId');
    await queryRunner.dropTable('study_groups');
  }
}
