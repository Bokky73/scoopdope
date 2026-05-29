// @ts-nocheck
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Lesson } from '../courses/lesson.entity';
import { AssignmentSubmission } from './submission.entity';
export interface RubricCriterion {
  id: string;
  title: string;
  description: string;
  maxPoints: number;
}
@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  lessonId: string;
  @ManyToOne(() => Lesson, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'lessonId'
  })
  lesson: Lesson;
  @Column()
  title: string;
  @Column('text')
  description: string;
  @Column('timestamp')
  dueDate: Date;
  @Column('int')
  maxPoints: number;
  @Column('jsonb', {
    default: []
  })
  rubric: RubricCriterion[];
  @OneToMany(() => AssignmentSubmission, submission => submission.assignment)
  submissions: AssignmentSubmission[];
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}