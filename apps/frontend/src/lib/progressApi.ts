import api from './api';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface QuizScore {
  quizId: string;
  title: string;
  /** 0–100 */
  score: number;
  /** Total possible points */
  maxScore: number;
  completedAt: string;
}

export interface LessonProgressDetail {
  lessonId: string;
  title: string;
  completed: boolean;
  completedAt: string | null;
}

export interface ModuleProgress {
  moduleId: string;
  title: string;
  order: number;
  lessons: LessonProgressDetail[];
  /** 0–100 derived from completed/total lessons */
  progressPct: number;
  quizScores: QuizScore[];
}

/** Estimated time left in the course, based on the student's own completion pace. */
export interface EstimatedCompletionTime {
  remainingLessons: number;
  remainingMinutes: number;
  /** null when there isn't enough history yet to estimate a pace */
  estimatedDaysRemaining: number | null;
}

export interface CourseProgressPayload {
  courseId: string;
  courseTitle: string;
  /** 0–100 overall */
  overallProgressPct: number;
  totalLessons: number;
  completedLessons: number;
  modules: ModuleProgress[];
  /** ISO timestamp of the last recorded activity */
  lastActivityAt: string | null;
  estimatedCompletionTime: EstimatedCompletionTime;
}

// ── Backend response shape ───────────────────────────────────────────────────

interface CourseProgressResponse {
  courseId: string;
  courseTitle: string;
  overall_completion_percentage: number;
  modules: Array<{
    id: string;
    title: string;
    status: 'completed' | 'in_progress' | 'not_started';
    completionPercentage: number;
  }>;
  lessons: Array<{
    id: string;
    title: string;
    moduleId: string;
    status: 'completed' | 'in_progress' | 'not_started';
    last_accessed_at: string | null;
  }>;
  estimatedCompletionTime: EstimatedCompletionTime;
  lastActivityAt: string | null;
}

// ── Fetcher ───────────────────────────────────────────────────────────────────

/** Fetches per-module/per-lesson progress for a course from `GET /courses/:courseId/progress`. */
export async function fetchCourseProgress(
  courseId: string,
  _userId: string,
): Promise<CourseProgressPayload> {
  const { data } = await api.get<CourseProgressResponse>(`/courses/${courseId}/progress`);

  const lessonsByModule = new Map<string, LessonProgressDetail[]>();
  for (const lesson of data.lessons) {
    const list = lessonsByModule.get(lesson.moduleId) ?? [];
    list.push({
      lessonId: lesson.id,
      title: lesson.title,
      completed: lesson.status === 'completed',
      completedAt: lesson.status === 'completed' ? lesson.last_accessed_at : null,
    });
    lessonsByModule.set(lesson.moduleId, list);
  }

  const modules: ModuleProgress[] = data.modules.map((mod, index) => ({
    moduleId: mod.id,
    title: mod.title,
    order: index,
    lessons: lessonsByModule.get(mod.id) ?? [],
    progressPct: mod.completionPercentage,
    // Quiz scores are fetched separately if available; default to empty
    quizScores: [],
  }));

  const totalLessons = data.lessons.length;
  const completedLessons = data.lessons.filter((l) => l.status === 'completed').length;

  return {
    courseId,
    courseTitle: data.courseTitle ?? courseId,
    overallProgressPct: data.overall_completion_percentage,
    totalLessons,
    completedLessons,
    modules,
    lastActivityAt: data.lastActivityAt ?? null,
    estimatedCompletionTime: data.estimatedCompletionTime,
  };
}
