import api from './api';

export interface StudyTimeSummary {
  totalSeconds: number;
  totalHours: number;
  sessionCount: number;
}

export interface CourseStudyTime extends StudyTimeSummary {
  courseId: string;
}

export interface UserStudyStats extends StudyTimeSummary {
  byCourse: CourseStudyTime[];
  last30DaysSeconds: number;
  last7DaysSeconds: number;
  thisWeekLessonsCompleted: number;
}

export const studySessionsApi = {
  record: (courseId?: string, lessonId?: string, durationSeconds?: number) =>
    api
      .post('/v1/study-sessions', { courseId, lessonId, durationSeconds })
      .then((r) => r.data),

  getMyStats: () =>
    api.get<UserStudyStats>('/v1/study-sessions/me/stats').then((r) => r.data),

  getCourseTime: (courseId: string) =>
    api
      .get<StudyTimeSummary>(`/v1/study-sessions/me/courses/${courseId}`)
      .then((r) => r.data),
};
