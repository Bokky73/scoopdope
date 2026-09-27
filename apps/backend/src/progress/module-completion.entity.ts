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
import { CourseModule } from '../courses/course-module.entity';

/**
 * Records when a student has completed a module (all lessons done).
 * Idempotent: a student can only have one completion record per module.
 */
@Entity('module_completions')
@Unique(['userId', 'moduleId'])
export class ModuleCompletion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  // Why: deleting a user removes their completion records (GDPR-compliant).
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  moduleId: string;

  // Why: deleting a module removes all completion records for it.
  @ManyToOne(() => CourseModule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'moduleId' })
  module: CourseModule;

  /** courseId is denormalized for efficient per-course progress queries */
  @Column()
  courseId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  completedAt: Date;
}
