import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CourseModule } from './course-module.entity';
import { User } from '../users/user.entity';
import { Review } from './review.entity';
import { CoursePrerequisite } from './course-prerequisite.entity';
import { Category } from './category.entity';

export enum CourseStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  SCHEDULED = 'scheduled',
  PENDING = 'pending',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  category: string;

  @Column({ default: 'beginner' })
  level: string;

  /** BCP-47 language code, e.g. "en", "es", "fr", "ar" */
  @Column({ default: 'en' })
  language: string;

  @Column({ default: 0 })
  durationHours: number;

  @Column({ type: 'enum', enum: CourseStatus, default: CourseStatus.DRAFT })
  status: CourseStatus;

  /** @deprecated use status instead */
  @Column({ default: false })
  isPublished: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ default: false })
  requiresKyc: boolean;

  @Column({ nullable: true })
  instructorId: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  /** Base price in USD; null or 0 means free */
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, default: null })
  priceUsd: number | null;

  @Column({ type: 'jsonb', nullable: true })
  skills: string[];

  /** Course tags/categories for discovery and filtering (e.g. "defi", "nft", "stellar-basics") */
  @Column({ type: 'jsonb', nullable: true, default: () => "'[]'" })
  tags: string[];

  @Column({ nullable: true, type: 'timestamptz' })
  scheduledAt: Date | null;

  @Column({ nullable: true, type: 'timestamptz' })
  publishedAt: Date | null;

  /**
   * Maximum number of students that can be enrolled simultaneously.
   * Null means unlimited.
   */
  @Column({ nullable: true, type: 'int' })
  maxEnrollment: number | null;

  /** Category for course classification */
  @Column({ nullable: true })
  category: string;

  /** Array of learning outcomes for the course */
  @Column({ type: 'jsonb', nullable: true })
  learningOutcomes: string[];

  // Why: SET NULL preserves course when instructor is deleted; course remains accessible but unassigned.
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'instructorId' })
  instructor: User;

  /** Optional category. SET NULL on category deletion so courses become uncategorised. */
  @Column({ nullable: true, type: 'uuid' })
  categoryId: string | null;

  @ManyToOne(() => Category, { nullable: true, eager: false, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category: Category | null;

  @OneToMany(() => CourseModule, (m) => m.course)
  modules: CourseModule[];

  @OneToMany(() => Review, (review) => review.course)
  reviews: Review[];

  @OneToMany(() => CoursePrerequisite, (cp) => cp.course)
  prerequisites: CoursePrerequisite[];

  averageRating?: number | null;

  @CreateDateColumn()
  createdAt: Date;
}

