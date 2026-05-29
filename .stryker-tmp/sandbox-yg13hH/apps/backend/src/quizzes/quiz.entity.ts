import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Lesson } from '../courses/lesson.entity';
import { QuizQuestion } from './quiz-question.entity';
import { QuizAttempt } from './quiz-attempt.entity';
@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  lessonId: string;
  @ManyToOne(() => Lesson, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'lessonId'
  })
  lesson: Lesson;
  @Column()
  title: string;
  @Column('text', {
    nullable: true
  })
  description: string;
  @Column({
    default: 0
  })
  passingScore: number;
  @Column({
    default: false
  })
  isPublished: boolean;
  @OneToMany(() => QuizQuestion, q => q.quiz, {
    cascade: true
  })
  questions: QuizQuestion[];
  @OneToMany(() => QuizAttempt, a => a.quiz)
  attempts: QuizAttempt[];
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}