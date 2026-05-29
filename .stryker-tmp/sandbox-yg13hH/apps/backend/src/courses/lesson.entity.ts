import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { CourseModule } from './course-module.entity';
import { Assignment } from '../assignments/assignment.entity';
@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  moduleId: string;
  @ManyToOne(() => CourseModule, m => m.lessons, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'moduleId'
  })
  module: CourseModule;
  @Column()
  title: string;
  @Column('text')
  content: string;
  @Column({
    nullable: true
  })
  videoUrl: string;
  @Column({
    type: 'jsonb',
    nullable: true
  })
  transcript: any;
  @Column({
    type: 'text',
    nullable: true
  })
  transcriptSrt: string;
  @Column({
    nullable: true
  })
  transcriptionJobName: string;
  @Column({
    default: 0
  })
  order: number;
  @Column({
    default: 0
  })
  durationMinutes: number;
  @OneToMany(() => Assignment, assignment => assignment.lesson)
  assignments: Assignment[];
  @CreateDateColumn()
  createdAt: Date;
}