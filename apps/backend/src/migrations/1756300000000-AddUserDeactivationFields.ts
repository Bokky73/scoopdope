import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

/**
 * #872 – Two-Week Inactive User Deactivation
 *
 * Adds four columns to the `users` table:
 *  - isDeactivated            — boolean flag (default false)
 *  - deactivationToken        — nullable varchar; single-use reactivation token
 *  - deactivationTokenExpiresAt — nullable timestamp; token TTL
 *  - deactivationNotifiedAt   — nullable timestamp; when the warning email was sent
 *
 * Also adds an index on (isDeactivated, lastActivityAt) to support the daily
 * cron query efficiently.
 */
export class AddUserDeactivationFields1756300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('users', [
      new TableColumn({
        name: 'isDeactivated',
        type: 'boolean',
        default: false,
      }),
      new TableColumn({
        name: 'deactivationToken',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'deactivationTokenExpiresAt',
        type: 'timestamp',
        isNullable: true,
      }),
      new TableColumn({
        name: 'deactivationNotifiedAt',
        type: 'timestamp',
        isNullable: true,
      }),
    ]);

    // Composite index speeds up the cron job's WHERE clause
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_users_deactivation_scan',
        columnNames: ['isDeactivated', 'lastActivityAt'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'IDX_users_deactivation_scan');
    await queryRunner.dropColumn('users', 'deactivationNotifiedAt');
    await queryRunner.dropColumn('users', 'deactivationTokenExpiresAt');
    await queryRunner.dropColumn('users', 'deactivationToken');
    await queryRunner.dropColumn('users', 'isDeactivated');
  }
}
