// @ts-nocheck
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
@Entity('student_performance')
export class StudentPerformance {
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
  topicId: string;
  @Column({
    type: 'float',
    default: 0
  })
  averageScore: number;
  @Column({
    type: 'int',
    default: 0
  })
  attemptCount: number;
  @Column({
    type: 'enum',
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  })
  currentDifficulty: 'easy' | 'medium' | 'hard';
  @Column({
    type: 'float',
    default: 0
  })
  masteryLevel: number; // 0-1

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}