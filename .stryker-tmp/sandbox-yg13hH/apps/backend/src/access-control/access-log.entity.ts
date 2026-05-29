import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Course } from '../courses/course.entity';
import { User } from '../users/user.entity';
@Entity('access_logs')
export class AccessLog {
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
  @Column()
  action: string;
  @Column({
    nullable: true
  })
  ipAddress: string;
  @Column({
    default: true
  })
  isAllowed: boolean;
  @Column({
    nullable: true
  })
  denialReason: string;
  @CreateDateColumn()
  timestamp: Date;
}