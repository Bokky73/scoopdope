import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Course } from './course.entity';

/**
 * Join table that tracks which instructors are assigned to which courses.
 * A course can have multiple assigned instructors (m:n with audit info).
 */
@Entity('course_instructors')
@Unique(['courseId', 'instructorId'])
export class CourseInstructor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  courseId: string;

  // Why: if a course is deleted, remove all instructor assignments for it.
  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column()
  instructorId: string;

  // Why: if a user is deleted, remove their instructor assignments.
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'instructorId' })
  instructor: User;

  @CreateDateColumn()
  assignedAt: Date;
}
