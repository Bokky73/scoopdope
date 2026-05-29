// @ts-nocheck
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
export enum EmailStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
}
@Entity('email_queue')
export class EmailQueue {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  to: string;
  @Column()
  subject: string;
  @Column('text')
  html: string;
  @Index()
  @Column({
    type: 'varchar',
    default: EmailStatus.PENDING
  })
  status: EmailStatus;
  @Column({
    default: 0
  })
  attempts: number;
  @Column({
    nullable: true,
    type: 'text'
  })
  lastError: string;
  @Column({
    nullable: true,
    type: 'timestamp'
  })
  nextRetryAt: Date;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}