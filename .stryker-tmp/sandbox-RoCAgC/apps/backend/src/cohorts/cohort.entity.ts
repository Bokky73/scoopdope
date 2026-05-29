// @ts-nocheck
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Course } from '../courses/course.entity';
import { User } from '../users/user.entity';
import { CohortMember } from './cohort-member.entity';
@Entity('cohorts')
export class Cohort {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  courseId: string;
  @ManyToOne(() => Course, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'courseId'
  })
  course: Course;
  @Column()
  name: string;
  @Column('text', {
    nullable: true
  })
  description: string;
  @Column()
  startDate: Date;
  @Column()
  endDate: Date;
  @Column({
    default: 0
  })
  maxMembers: number;
  @Column()
  instructorId: string;
  @ManyToOne(() => User, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'instructorId'
  })
  instructor: User;
  @OneToMany(() => CohortMember, m => m.cohort, {
    cascade: true
  })
  members: CohortMember[];
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}