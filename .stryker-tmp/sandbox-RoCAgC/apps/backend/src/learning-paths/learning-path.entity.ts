// @ts-nocheck
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Course } from '../courses/course.entity';
import { LearningPathEnrollment } from './learning-path-enrollment.entity';
@Entity('learning_paths')
export class LearningPath {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  title: string;
  @Column('text')
  description: string;
  @Column({
    default: false
  })
  isPublished: boolean;
  @Column({
    nullable: true
  })
  thumbnailUrl: string;

  /** Ordered list of course IDs defining the curriculum sequence */
  @Column({
    type: 'jsonb',
    default: []
  })
  courseOrder: string[];
  @ManyToMany(() => Course)
  @JoinTable({
    name: 'learning_path_courses',
    joinColumn: {
      name: 'learningPathId',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'courseId',
      referencedColumnName: 'id'
    }
  })
  courses: Course[];
  @OneToMany(() => LearningPathEnrollment, e => e.learningPath)
  enrollments: LearningPathEnrollment[];
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}