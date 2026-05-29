// @ts-nocheck
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Quiz } from './quiz.entity';
import { QuizAnswer } from './quiz-answer.entity';
export enum QuestionType {
  MCQ = 'mcq',
  TRUE_FALSE = 'true_false',
  ESSAY = 'essay',
}
@Entity('quiz_questions')
export class QuizQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  quizId: string;
  @ManyToOne(() => Quiz, q => q.questions, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'quizId'
  })
  quiz: Quiz;
  @Column('text')
  text: string;
  @Column({
    type: 'enum',
    enum: QuestionType
  })
  type: QuestionType;
  @Column({
    default: 1
  })
  points: number;
  @Column({
    default: 0
  })
  order: number;
  @OneToMany(() => QuizAnswer, a => a.question, {
    cascade: true
  })
  answers: QuizAnswer[];
}