import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Course } from '../courses/course.entity';

@Entity('study_sessions')
@Index('IDX_study_sessions_user_course', ['userId', 'courseId'])
@Index('IDX_study_sessions_user_started', ['userId', 'startedAt'])
export class StudySession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  // Deleting a user removes their study sessions (GDPR-compliant).
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  courseId: string;

  // Deleting a course removes associated study sessions.
  @ManyToOne(() => Course, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column({ nullable: true })
  lessonId: string;

  /** Duration in seconds — capped server-side to prevent fake time inflation. */
  @Column({ type: 'int', default: 0 })
  durationSeconds: number;

  @CreateDateColumn({ type: 'timestamptz' })
  startedAt: Date;
}
