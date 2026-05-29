import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { User } from '../users/user.entity';
import { Course } from '../courses/course.entity';
@Entity('waitlist_entries')
@Unique(['userId', 'courseId'])
export class WaitlistEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Index()
  @Column()
  userId: string;
  @ManyToOne(() => User, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'userId'
  })
  user: User;
  @Index()
  @Column()
  courseId: string;
  @ManyToOne(() => Course, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'courseId'
  })
  course: Course;

  /** 1-based position in the waitlist queue for this course */
  @Column({
    type: 'int'
  })
  position: number;
  @CreateDateColumn()
  joinedAt: Date;
}