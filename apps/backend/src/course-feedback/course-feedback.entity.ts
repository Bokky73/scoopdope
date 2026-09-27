import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Course } from '../courses/course.entity';

/**
 * Structured course feedback submitted by a student after course completion.
 * Ratings are on a 1–5 scale.
 */
@Entity('course_feedback')
export class CourseFeedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  courseId: string;

  // Why: if the course is deleted, associated feedback is removed to prevent orphan records.
  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column()
  userId: string;

  // Why: feedback belongs to a user; deleting the user removes their feedback (GDPR).
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  /** Rating for content quality (1–5) */
  @Column({ type: 'int' })
  contentQuality: number;

  /** Rating for course difficulty appropriateness (1–5) */
  @Column({ type: 'int' })
  difficulty: number;

  /** Rating for relevance to learner goals (1–5) */
  @Column({ type: 'int' })
  relevance: number;

  /** Rating for instructor quality (1–5) */
  @Column({ type: 'int' })
  instructorRating: number;

  /** Overall satisfaction rating (1–5) */
  @Column({ type: 'int' })
  overallRating: number;

  /** Optional freeform comment */
  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @CreateDateColumn()
  submittedAt: Date;
}
