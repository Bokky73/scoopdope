import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Course } from './course.entity';
@Entity('course_prerequisites')
@Unique(['courseId', 'prerequisiteId'])
export class CoursePrerequisite {
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
  prerequisiteId: string;
  @ManyToOne(() => Course, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'prerequisiteId'
  })
  prerequisite: Course;
  @CreateDateColumn()
  createdAt: Date;
}