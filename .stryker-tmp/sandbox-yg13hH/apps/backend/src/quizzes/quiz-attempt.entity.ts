import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Quiz } from './quiz.entity';
import { User } from '../users/user.entity';
import { QuizAttemptAnswer } from './quiz-attempt-answer.entity';
@Entity('quiz_attempts')
export class QuizAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  quizId: string;
  @ManyToOne(() => Quiz, q => q.attempts, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'quizId'
  })
  quiz: Quiz;
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
    type: 'float',
    nullable: true
  })
  score: number;
  @Column({
    default: false
  })
  isGraded: boolean;
  @Column({
    nullable: true
  })
  gradedBy: string;
  @Column('text', {
    nullable: true
  })
  feedback: string;
  @OneToMany(() => QuizAttemptAnswer, a => a.attempt, {
    cascade: true
  })
  answers: QuizAttemptAnswer[];
  @CreateDateColumn()
  submittedAt: Date;
}