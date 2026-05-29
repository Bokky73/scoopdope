// @ts-nocheck
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';
@Entity('instructor_applications')
export class InstructorApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  userId: string;
  @ManyToOne(() => User, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'userId'
  })
  user: User;
  @Column({
    type: 'text'
  })
  bio: string;
  @Column({
    type: 'text'
  })
  expertise: string;
  @Column({
    type: 'text'
  })
  motivation: string;
  @Column({
    nullable: true,
    type: 'varchar'
  })
  linkedinUrl: string | null;
  @Column({
    nullable: true,
    type: 'varchar'
  })
  portfolioUrl: string | null;

  /** Instructor has accepted the instructor agreement */
  @Column({
    default: false
  })
  agreementAccepted: boolean;
  @Column({
    type: 'varchar',
    default: 'pending'
  })
  status: ApplicationStatus;
  @Column({
    nullable: true,
    type: 'text'
  })
  adminNote: string | null;
  @Column({
    nullable: true
  })
  reviewedBy: string | null;
  @Column({
    nullable: true,
    type: 'timestamp'
  })
  reviewedAt: Date | null;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}