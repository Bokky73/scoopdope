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

@Entity('certificates')
@Unique(['userId', 'courseId'])
export class Certificate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  // Why: certificates belong to a user; deleting the user removes them (consider SET NULL to preserve on-chain Stellar records).
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  courseId!: string;

  // Why: if a course is deleted, its issued certificates are removed (consider SET NULL to preserve verifiable credential history).
  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course!: Course;

  @Column()
  certificateHash!: string;

  @Column({ nullable: true })
  ipfsHash!: string;

  @Column({ nullable: true })
  stellarTransactionId!: string;

  @Column({ default: 'pending' })
  status!: 'pending' | 'minted' | 'verified';

  @Column({ nullable: true })
  pdfUrl!: string;

  @Column({ nullable: true, type: 'timestamptz' })
  revokedAt: Date | null;

  @CreateDateColumn()
  issuedAt!: Date;
}
