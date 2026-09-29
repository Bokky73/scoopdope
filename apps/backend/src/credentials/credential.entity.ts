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
import { Bundle } from '../bundles/bundle.entity';
import { LearningPath } from '../learning-paths/learning-path.entity';

@Entity('credentials')
export class Credential {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  // Why: a credential belongs to its user; deleting the user removes ownerless credential records.
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  courseId: string;

  // Why: if a course is deleted, associated credentials are removed; consider SET NULL to preserve on-chain proof records.
  @ManyToOne(() => Course, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column({ nullable: true })
  bundleId: string;

  // Why: if a bundle is deleted, its issued credentials are removed; consider SET NULL to preserve on-chain proof records.
  @ManyToOne(() => Bundle, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'bundleId' })
  bundle: Bundle;

  @Column({ nullable: true })
  learningPathId: string;

  // Why: if a learning path is deleted, its issued credentials are removed; consider SET NULL to preserve on-chain proof records.
  @ManyToOne(() => LearningPath, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'learningPathId' })
  learningPath: LearningPath;

  @Column({ nullable: true })
  txHash: string;

  @Column({ nullable: true })
  stellarPublicKey: string;

  @Column({ nullable: true })
  grade: string;

  @Column({ nullable: true })
  onChainId: string;

  @Column({ nullable: true, type: 'timestamp' })
  expiresAt: Date | null;

  @CreateDateColumn()
  issuedAt: Date;
}
