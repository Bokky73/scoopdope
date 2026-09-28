import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

/**
 * #960 – Account lockout after failed login attempts
 *
 * Adds three columns to the `users` table:
 *  - failedLoginAttempts  — consecutive failed password attempts (default 0)
 *  - lastFailedLoginAt    — when the most recent failure happened; the counter
 *                           is cleared once it goes stale
 *  - lockedUntil          — end of the cooldown window; non-null means the
 *                           account is locked
 */
export class AddAccountLockoutFields1770000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('users', [
      new TableColumn({
        name: 'failedLoginAttempts',
        type: 'integer',
        default: 0,
      }),
      new TableColumn({
        name: 'lastFailedLoginAt',
        type: 'timestamp',
        isNullable: true,
      }),
      new TableColumn({
        name: 'lockedUntil',
        type: 'timestamp',
        isNullable: true,
      }),
    ]);

    // Admin tooling needs to find currently locked accounts quickly.
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_users_lockedUntil',
        columnNames: ['lockedUntil'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'IDX_users_lockedUntil');
    await queryRunner.dropColumn('users', 'lockedUntil');
    await queryRunner.dropColumn('users', 'lastFailedLoginAt');
    await queryRunner.dropColumn('users', 'failedLoginAttempts');
  }
}
