import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSupportTickets1770000000000 implements MigrationInterface {
  name = 'AddSupportTickets1770000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // Add new value to notification type enum
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum
          WHERE enumlabel = 'support_ticket_update'
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notifications_type_enum')
        ) THEN
          ALTER TYPE notifications_type_enum ADD VALUE 'support_ticket_update';
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'support_tickets_status_enum') THEN
          CREATE TYPE support_tickets_status_enum AS ENUM ('open', 'in_progress', 'resolved', 'closed');
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "studentId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        subject VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        status support_tickets_status_enum NOT NULL DEFAULT 'open',
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_support_tickets_student
        ON support_tickets("studentId")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_support_tickets_status
        ON support_tickets(status)
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ticket_replies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "ticketId" UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
        "authorId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_ticket_replies_ticket
        ON ticket_replies("ticketId")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS ticket_replies`);
    await queryRunner.query(`DROP TABLE IF EXISTS support_tickets`);
    await queryRunner.query(`DROP TYPE IF EXISTS support_tickets_status_enum`);
  }
}
