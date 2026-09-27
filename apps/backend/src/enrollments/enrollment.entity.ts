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
import { Course } from '../courses/course.entity';

export enum EnrollmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DROPPED = 'dropped',
}

@Entity('enrollments')
@Unique(['userId', 'courseId'])
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  // Why: enrollments belong to a user; deleting the user removes their course enrollments.
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  courseId: string;

  // Why: if a course is deleted, all enrollments in it are removed to prevent orphan records.
  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @CreateDateColumn()
  enrolledAt: Date;

  @Column({ nullable: true, type: 'timestamp' })
  completedAt: Date | null;

  /** The course version number the student enrolled on. Null = pre-versioning. */
  @Column({ nullable: true, type: 'int' })
  enrolledVersionNumber: number | null;

  /**
   * Soroban transaction hash recorded when the enrollment was confirmed on-chain.
   * Null if the on-chain call was not attempted or is pending.
   */
  @Column({ nullable: true, type: 'varchar', length: 64 })
  transactionHash: string | null;

  /** Enrollment status: ACTIVE, COMPLETED, or DROPPED */
  @Column({ type: 'enum', enum: EnrollmentStatus, default: EnrollmentStatus.ACTIVE })
  status: EnrollmentStatus;
}
