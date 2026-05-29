// @ts-nocheck
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Course } from '../courses/course.entity';
import { SurveyQuestion } from './survey-question.entity';
import { SurveyResponse } from './survey-response.entity';
@Entity('surveys')
export class Survey {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  courseId: string;
  @ManyToOne(() => Course, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'courseId'
  })
  course: Course;
  @Column()
  title: string;
  @Column('text')
  description: string;
  @Column({
    type: 'enum',
    enum: ['completion', 'milestone'],
    default: 'completion'
  })
  triggerType: 'completion' | 'milestone';
  @Column({
    nullable: true
  })
  triggerMilestone: number;
  @Column({
    default: true
  })
  isActive: boolean;
  @Column({
    default: false
  })
  allowAnonymous: boolean;
  @OneToMany(() => SurveyQuestion, q => q.survey, {
    cascade: true
  })
  questions: SurveyQuestion[];
  @OneToMany(() => SurveyResponse, r => r.survey)
  responses: SurveyResponse[];
  @CreateDateColumn()
  createdAt: Date;
}