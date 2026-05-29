import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { User } from '../users/user.entity';
import { Course } from './course.entity';
@Entity('reviews')
@Unique(['userId', 'courseId'])
export class Review {
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
  courseId: string;
  @ManyToOne(() => Course, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'courseId'
  })
  course: Course;
  @Column({
    type: 'int'
  })
  rating: number;
  @Column({
    type: 'text',
    nullable: true
  })
  comment: string | null;
  @CreateDateColumn()
  createdAt: Date;
}