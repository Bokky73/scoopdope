// @ts-nocheck
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Unique } from 'typeorm';
import { User } from '../users/user.entity';
import { Assignment } from './assignment.entity';
import { PeerReview } from './peer-review.entity';
@Entity('assignment_submissions')
@Unique(['assignmentId', 'userId'])
export class AssignmentSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  assignmentId: string;
  @ManyToOne(() => Assignment, assignment => assignment.submissions, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'assignmentId'
  })
  assignment: Assignment;
  @Column()
  userId: string;
  @ManyToOne(() => User, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'userId'
  })
  user: User;
  @Column()
  fileUrl: string;
  @CreateDateColumn()
  submittedAt: Date;
  @Column('float', {
    nullable: true
  })
  instructorGrade: number;
  @Column('text', {
    nullable: true
  })
  instructorFeedback: string;
  @Column('float', {
    nullable: true
  })
  finalGrade: number;
  @OneToMany(() => PeerReview, review => review.submission)
  peerReviews: PeerReview[];
  @UpdateDateColumn()
  updatedAt: Date;
}