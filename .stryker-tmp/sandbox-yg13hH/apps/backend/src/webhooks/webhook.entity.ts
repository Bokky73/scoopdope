import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
@Entity('webhooks')
export class Webhook {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Index()
  @Column()
  userId: string;
  @Column()
  url: string;

  /** Comma-separated event types, e.g. "enrollment.created,enrollment.completed" */
  @Column('text')
  events: string;
  @Column()
  secret: string;
  @Column({
    default: true
  })
  isActive: boolean;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}