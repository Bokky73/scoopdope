/**
 * Shared course-related types used by both frontend and backend.
 * @module course.types
 */

/** Possible course difficulty levels */
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

/** Lifecycle status of a course */
export type CourseStatus = 'draft' | 'scheduled' | 'published';

/**
 * Public course summary — used in list views and search results.
 */
export interface CourseSummary {
  id: string;
  title: string;
  description: string;
  level: CourseLevel;
  durationHours: number;
  status: CourseStatus;
  instructorId: string | null;
  requiresKyc: boolean;
  averageRating: number | null;
  createdAt: string;
}

/**
 * DTO for creating a new course.
 */
export interface CreateCourseDto {
  /** Min 3 characters, HTML stripped */
  title: string;
  /** Min 10 characters, HTML stripped */
  description: string;
  level?: CourseLevel;
  durationHours?: number;
  requiresKyc?: boolean;
}

/**
 * DTO for updating an existing course.
 * All fields are optional.
 */
export interface UpdateCourseDto {
  title?: string;
  description?: string;
  level?: CourseLevel;
  durationHours?: number;
  isPublished?: boolean;
}

/**
 * Query parameters for filtering and paginating courses.
 */
export interface CourseQueryDto {
  search?: string;
  level?: CourseLevel;
  status?: CourseStatus;
  instructorId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'title' | 'averageRating';
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * DTO for creating a course module.
 */
export interface CreateModuleDto {
  title: string;
  description?: string;
  order: number;
}

/**
 * DTO for creating a lesson within a module.
 */
export interface CreateLessonDto {
  title: string;
  content?: string;
  videoUrl?: string;
  durationMinutes?: number;
  order: number;
}

/**
 * DTO for scheduling a course to be published at a future time.
 */
export interface ScheduleCourseDto {
  /** ISO 8601 datetime string */
  scheduledAt: string;
}

/**
 * DTO for submitting a course review.
 */
export interface CreateReviewDto {
  /** 1–5 */
  rating: number;
  /** Optional review text */
  comment?: string;
}
