import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
export enum ImportJobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  DONE = 'done',
  FAILED = 'failed',
}
@Entity('import_jobs')
export class ImportJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  instructorId: string;
  @Column({
    type: 'enum',
    enum: ImportJobStatus,
    default: ImportJobStatus.PENDING
  })
  status: ImportJobStatus;
  @Column({
    default: 0
  })
  total: number;
  @Column({
    default: 0
  })
  processed: number;
  @Column({
    type: 'text',
    nullable: true
  })
  error: string | null;
  @Column({
    type: 'jsonb',
    nullable: true
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}