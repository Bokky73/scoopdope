import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Course } from '../courses/course.entity';
@Entity('payouts')
export class Payout {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  instructorId: string;
  @ManyToOne(() => User, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'instructorId'
  })
  instructor: User;
  @Column()
  courseId: string;
  @ManyToOne(() => Course, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'courseId'
  })
  course: Course;
  @Column('decimal', {
    precision: 12,
    scale: 2
  })
  totalRevenue: number;
  @Column('decimal', {
    precision: 12,
    scale: 2
  })
  platformFee: number;
  @Column('decimal', {
    precision: 12,
    scale: 2
  })
  instructorShare: number;
  @Column({
    default: 'pending'
  })
  status: 'pending' | 'processed' | 'failed';
  @Column({
    nullable: true
  })
  transactionId: string;
  @Column({
    type: 'timestamp'
  })
  payoutDate: Date;
  @CreateDateColumn()
  createdAt: Date;
}