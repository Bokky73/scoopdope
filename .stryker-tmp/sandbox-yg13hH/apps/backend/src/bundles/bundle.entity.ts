import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Course } from '../courses/course.entity';
import { BundleEnrollment } from './bundle-enrollment.entity';
@Entity('bundles')
export class Bundle {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  title: string;
  @Column('text')
  description: string;
  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0
  })
  price: number;
  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: true
  })
  discountPrice: number | null;
  @Column({
    default: false
  })
  isPublished: boolean;
  @Column({
    nullable: true
  })
  thumbnailUrl: string;
  @ManyToMany(() => Course)
  @JoinTable({
    name: 'bundle_courses',
    joinColumn: {
      name: 'bundleId',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'courseId',
      referencedColumnName: 'id'
    }
  })
  courses: Course[];
  @OneToMany(() => BundleEnrollment, enrollment => enrollment.bundle)
  enrollments: BundleEnrollment[];
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}