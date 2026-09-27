export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface CourseSummary {
  id: string;
  title: string;
  /** Stored as a free string in the DB; normalized in the logic layer. */
  level: string;
  prerequisiteIds?: string[];
  isPublished?: boolean;
  isDeleted?: boolean;
}

export interface LearningPathRequest {
  courses: CourseSummary[];
  completedCourseIds: string[];
  /** Optional explicit student level; derived from completed courses when omitted. */
  currentLevel?: DifficultyLevel | string;
  /** Course ids the student is already enrolled in (excluded from recommendations). */
  enrolledCourseIds?: string[];
}

export interface RecommendedCourse {
  id: string;
  title: string;
  level: DifficultyLevel;
  reasons: string[];
  unlocked: boolean;
}

export interface LearningPathResponse {
  recommendations: RecommendedCourse[];
  learningPath: { id: string; title: string; level: DifficultyLevel }[];
  completionPercentage: number;
  currentLevel: DifficultyLevel;
}
