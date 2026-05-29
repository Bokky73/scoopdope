import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
export type BatchJobStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type BatchJobType = 'users' | 'courses';
@Entity('batch_jobs')
export class BatchJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  type: BatchJobType;
  @Column({
    default: 'pending'
  })
  status: BatchJobStatus;
  @Column('jsonb')
  payload: Record<string, any>[];
  @Column('jsonb', {
    nullable: true
  })
  results: Record<string, any>[] | null;
  @Column('jsonb', {
    nullable: true
  })
  errors: Record<string, any>[] | null;
  @Column({
    default: 0
  })
  totalItems: number;
  @Column({
    default: 0
  })
  processedItems: number;
  @Column({
    default: 0
  })
  failedItems: number;
  @Column({
    nullable: true
  })
  createdById: string;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}