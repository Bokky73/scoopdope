import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Course } from '../courses/course.entity';
import { User } from '../users/user.entity';
export enum AccessRole {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin',
}
@Entity('course_access_controls')
export class CourseAccessControl {
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
  @Column({
    type: 'enum',
    enum: AccessRole
  })
  role: AccessRole;
  @Column({
    nullable: true
  })
  subscriptionExpiryDate: Date;
  @Column('simple-array', {
    nullable: true
  })
  allowedIpAddresses: string[];
  @Column({
    default: true
  })
  isActive: boolean;
  @CreateDateColumn()
  grantedAt: Date;
}