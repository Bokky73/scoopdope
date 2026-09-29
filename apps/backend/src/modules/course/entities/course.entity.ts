import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CourseStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: CourseStatus,
    default: CourseStatus.ACTIVE,
  })
  status: CourseStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * A course can only be enrolled in while it is active.
   * Archived or deleted courses must reject new enrollments.
   */
  isActive(): boolean {
    return this.status === CourseStatus.ACTIVE;
  }

  /**
   * Guard used before enrollment. Returns a clear error message when the
   * course is not active, or null when enrollment is allowed.
   */
  getEnrollmentBlockReason(): string | null {
    if (this.status === CourseStatus.ARCHIVED) {
      return 'Cannot enroll in an archived course.';
    }

    if (this.status === CourseStatus.DELETED) {
      return 'Cannot enroll in a deleted course.';
    }

    if (this.status !== CourseStatus.ACTIVE) {
      return 'Cannot enroll in a course that is not active.';
    }

    return null;
  }
}
