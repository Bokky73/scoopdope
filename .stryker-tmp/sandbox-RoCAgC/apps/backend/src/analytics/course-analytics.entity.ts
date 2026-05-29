// @ts-nocheck
import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, Index } from 'typeorm';
@Entity('course_analytics')
export class CourseAnalytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Index({
    unique: true
  })
  @Column()
  courseId: string;
  @Column({
    default: 0
  })
  totalEnrollments: number;
  @Column({
    default: 0
  })
  totalCompletions: number;
  @Column({
    type: 'float',
    default: 0
  })
  completionRate: number;
  @Column({
    type: 'float',
    default: 0
  })
  averageRating: number;
  @Column({
    default: 0
  })
  totalReviews: number;
  @Column({
    type: 'float',
    default: 0
  })
  averageProgressPct: number;
  @Column({
    default: 0
  })
  activeLearnersLast30Days: number;
  @UpdateDateColumn()
  lastAggregatedAt: Date;
}