import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum PushQueueStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
}

/**
 * Persistent queue for push notification delivery attempts.
 * Failed deliveries are retried with exponential backoff up to MAX_ATTEMPTS.
 */
@Entity('push_notification_queue')
export class PushNotificationQueue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  /** The push subscription endpoint this payload is destined for. */
  @Column('text')
  endpoint: string;

  /** JSON-serialised payload: { title, body, icon?, url? } */
  @Column('text')
  payload: string;

  @Index()
  @Column({ type: 'varchar', default: PushQueueStatus.PENDING })
  status: PushQueueStatus;

  /** How many send attempts have been made (including the initial one). */
  @Column({ default: 0 })
  attempts: number;

  @Column({ nullable: true, type: 'text' })
  lastError: string | null;

  /** When null the job is ready for immediate processing. */
  @Index()
  @Column({ nullable: true, type: 'timestamp' })
  nextRetryAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
