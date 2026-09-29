import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * #1020 – Push Notification Retry Queue
 *
 * Creates the `push_notification_queue` table used to persist push
 * notification delivery attempts and enable exponential-backoff retries.
 */
export class AddPushNotificationQueue1780000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'push_notification_queue',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'endpoint',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'payload',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'pending'",
            isNullable: false,
          },
          {
            name: 'attempts',
            type: 'integer',
            default: 0,
            isNullable: false,
          },
          {
            name: 'lastError',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'nextRetryAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true, // ifNotExists
    );

    // Index on status for the queue worker's polling query
    await queryRunner.createIndex(
      'push_notification_queue',
      new TableIndex({
        name: 'IDX_push_queue_status',
        columnNames: ['status'],
      }),
    );

    // Index on nextRetryAt to efficiently find due jobs
    await queryRunner.createIndex(
      'push_notification_queue',
      new TableIndex({
        name: 'IDX_push_queue_next_retry',
        columnNames: ['nextRetryAt'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('push_notification_queue', true);
  }
}
