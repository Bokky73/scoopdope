// @ts-nocheck
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from '../users/user.entity';
import { Bundle } from './bundle.entity';
@Entity('bundle_enrollments')
@Unique(['userId', 'bundleId'])
export class BundleEnrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  userId: string;
  @ManyToOne(() => User, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'userId'
  })
  user: User;
  @Column()
  bundleId: string;
  @ManyToOne(() => Bundle, bundle => bundle.enrollments, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'bundleId'
  })
  bundle: Bundle;
  @CreateDateColumn()
  enrolledAt: Date;
  @Column({
    nullable: true,
    type: 'timestamp'
  })
  completedAt: Date | null;
}