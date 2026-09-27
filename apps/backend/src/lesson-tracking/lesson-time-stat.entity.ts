import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Lesson } from '../courses/lesson.entity';
import { Course } from '../courses/course.entity';

@Entity('lesson_time_stats')
export class LessonTimeStat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  lessonId: string;

  @ManyToOne(() => Lesson, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lessonId' })
  lesson: Lesson;

  @Column()
  courseId: string;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  /** Total cumulative time across all students */
  @Column({ default: 0 })
  totalTimeSeconds: number;

  /** Average time per student */
  @Column({ default: 0 })
  averageTimeSeconds: number;

  /** Maximum single student time */
  @Column({ default: 0 })
  maxTimeSeconds: number;

  /** Minimum single student time (non-zero) */
  @Column({ default: 0 })
  minTimeSeconds: number;

  /** Number of unique students who studied this lesson */
  @Column({ default: 0 })
  studentCount: number;

  /** Flag: true if averageTime > course-median (potential difficulty marker) */
  @Column({ default: false })
  isDifficult: boolean;

  @UpdateDateColumn()
  lastUpdatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
