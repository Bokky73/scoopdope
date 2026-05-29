import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Course } from '../courses/course.entity';
@Entity('progress')
export class Progress {
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
    nullable: true
  })
  lessonId: string;
  @Column({
    type: 'int',
    default: 0
  })
  progressPct: number;
  @Column({
    nullable: true,
    type: 'timestamp'
  })
  completedAt: Date;
  @Column({
    nullable: true
  })
  txHash: string;
  @UpdateDateColumn()
  updatedAt: Date;
}