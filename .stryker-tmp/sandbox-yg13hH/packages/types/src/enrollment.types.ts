/**
 * Shared enrollment-related types.
 * @module enrollment.types
 */

/**
 * Enrollment record linking a user to a course.
 */
export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
}

/**
 * Event payload emitted when a user enrolls in a course.
 */
export interface EnrollmentCreatedEvent {
  enrollmentId: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
}

/**
 * DTO for recording lesson/course progress.
 */
export interface RecordProgressDto {
  /** UUID of the course */
  courseId: string;
  /** UUID of the lesson (optional — omit for course-level progress) */
  lessonId?: string;
  /** Progress percentage 0–100 */
  progressPct: number;
}

/**
 * Progress record for a user in a course.
 */
export interface ProgressRecord {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string | null;
  progressPct: number;
  updatedAt: string;
}
