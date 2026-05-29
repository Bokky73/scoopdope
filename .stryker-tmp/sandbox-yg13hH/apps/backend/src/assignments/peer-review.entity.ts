import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from '../users/user.entity';
import { AssignmentSubmission } from './submission.entity';
export interface RubricScore {
  criterionId: string;
  score: number;
  feedback: string;
}
@Entity('peer_reviews')
@Unique(['submissionId', 'reviewerId'])
export class PeerReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  submissionId: string;
  @ManyToOne(() => AssignmentSubmission, submission => submission.peerReviews, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'submissionId'
  })
  submission: AssignmentSubmission;
  @Column()
  reviewerId: string;
  @ManyToOne(() => User, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'reviewerId'
  })
  reviewer: User;
  @Column('jsonb', {
    default: []
  })
  scores: RubricScore[];
  @Column('text', {
    nullable: true
  })
  overallFeedback: string;
  @Column('boolean', {
    default: false
  })
  isSubmitted: boolean;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}