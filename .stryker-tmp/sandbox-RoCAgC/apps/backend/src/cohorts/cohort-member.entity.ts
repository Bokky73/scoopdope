// @ts-nocheck
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Cohort } from './cohort.entity';
import { User } from '../users/user.entity';
@Entity('cohort_members')
export class CohortMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  cohortId: string;
  @ManyToOne(() => Cohort, c => c.members, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'cohortId'
  })
  cohort: Cohort;
  @Column()
  userId: string;
  @ManyToOne(() => User, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'userId'
  })
  user: User;
  @Column({
    type: 'float',
    default: 0
  })
  progressPercentage: number;
  @CreateDateColumn()
  enrolledAt: Date;
}