import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Course } from '../courses/course.entity';
import { Bundle } from '../bundles/bundle.entity';
import { LearningPath } from '../learning-paths/learning-path.entity';
@Entity('credentials')
export class Credential {
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
  @Column({
    nullable: true
  })
  courseId: string;
  @ManyToOne(() => Course, {
    onDelete: 'CASCADE',
    nullable: true
  })
  @JoinColumn({
    name: 'courseId'
  })
  course: Course;
  @Column({
    nullable: true
  })
  bundleId: string;
  @ManyToOne(() => Bundle, {
    onDelete: 'CASCADE',
    nullable: true
  })
  @JoinColumn({
    name: 'bundleId'
  })
  bundle: Bundle;
  @Column({
    nullable: true
  })
  learningPathId: string;
  @ManyToOne(() => LearningPath, {
    onDelete: 'CASCADE',
    nullable: true
  })
  @JoinColumn({
    name: 'learningPathId'
  })
  learningPath: LearningPath;
  @Column({
    nullable: true
  })
  txHash: string;
  @Column({
    nullable: true
  })
  stellarPublicKey: string;
  @Column({
    nullable: true
  })
  grade: string;
  @Column({
    nullable: true
  })
  onChainId: string;
  @CreateDateColumn()
  issuedAt: Date;
}