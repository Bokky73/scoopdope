// @ts-nocheck
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Course } from './course.entity';
import { Lesson } from './lesson.entity';
@Entity('course_modules')
export class CourseModule {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  courseId: string;
  @ManyToOne(() => Course, course => course.modules, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'courseId'
  })
  course: Course;
  @OneToMany(() => Lesson, lesson => lesson.module, {
    cascade: true
  })
  lessons: Lesson[];
  @Column()
  title: string;
  @Column({
    default: 0
  })
  order: number;
  @Column({
    type: 'timestamp',
    nullable: true
  })
  releaseDate: Date | null;
  @CreateDateColumn()
  createdAt: Date;
}