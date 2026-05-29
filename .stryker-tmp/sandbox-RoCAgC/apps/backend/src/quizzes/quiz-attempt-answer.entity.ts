// @ts-nocheck
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { QuizAttempt } from './quiz-attempt.entity';
import { QuizQuestion } from './quiz-question.entity';
@Entity('quiz_attempt_answers')
export class QuizAttemptAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  attemptId: string;
  @ManyToOne(() => QuizAttempt, a => a.answers, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'attemptId'
  })
  attempt: QuizAttempt;
  @Column()
  questionId: string;
  @ManyToOne(() => QuizQuestion, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'questionId'
  })
  question: QuizQuestion;
  @Column('text')
  answer: string;
  @Column({
    type: 'float',
    nullable: true
  })
  points: number;
}