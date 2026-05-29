// @ts-nocheck
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
@Entity('api_usage_logs')
@Index(['endpoint', 'createdAt'])
@Index(['userId', 'createdAt'])
export class ApiUsageLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  @Index()
  endpoint: string;
  @Column()
  method: string;
  @Column({
    nullable: true
  })
  @Index()
  userId: string | null;
  @Column({
    nullable: true
  })
  ip: string;
  @Column()
  statusCode: number;
  @Column({
    default: 0
  })
  responseTimeMs: number;
  @Column({
    nullable: true,
    type: 'text'
  })
  userAgent: string;
  @CreateDateColumn()
  createdAt: Date;
}