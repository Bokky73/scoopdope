import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';
import { Course } from '../courses/course.entity';
@Entity('qa_questions')
export class QaQuestion {
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
  userId: string;
  @ManyToOne(() => User, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'userId'
  })
  user: User;
  @Column('text')
  body: string;
  @Column({
    nullable: true
  })
  timestampSeconds: number;
  @Column({
    default: 0
  })
  upvotes: number;
  @Column({
    nullable: true,
    type: 'text'
  })
  answer: string;
  @Column({
    nullable: true
  })
  answeredByUserId: string;
  @Column({
    nullable: true,
    type: 'timestamptz'
  })
  answeredAt: Date;
  @CreateDateColumn()
  createdAt: Date;
}