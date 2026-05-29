// @ts-nocheck
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from '../users/user.entity';
import { LearningPath } from './learning-path.entity';
@Entity('learning_path_enrollments')
@Unique(['userId', 'learningPathId'])
export class LearningPathEnrollment {
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
  @Column()
  learningPathId: string;
  @ManyToOne(() => LearningPath, lp => lp.enrollments, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'learningPathId'
  })
  learningPath: LearningPath;
  @CreateDateColumn()
  enrolledAt: Date;
  @Column({
    nullable: true,
    type: 'timestamptz'
  })
  completedAt: Date | null;
}