import api from './api';

export interface Cohort {
  id: string;
  courseId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  maxMembers: number;
  instructorId: string;
  members?: CohortMember[];
  course?: { id: string; title: string };
  instructor?: { id: string; username?: string };
  progressPercentage?: number;
  enrolledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CohortMember {
  id: string;
  cohortId: string;
  userId: string;
  progressPercentage: number;
  enrolledAt: string;
  user?: { id: string; username?: string; email?: string };
}

export interface CreateCohortPayload {
  courseId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  maxMembers?: number;
}

export const cohortsApi = {
  // Admin / Instructor
  listAll: () => api.get<Cohort[]>('/cohorts').then((r) => r.data),
  createCohort: (data: CreateCohortPayload) =>
    api.post<Cohort>('/cohorts', data).then((r) => r.data),
  getCohort: (id: string) => api.get<Cohort>(`/cohorts/${id}`).then((r) => r.data),
  addMember: (cohortId: string, userId: string) =>
    api.post<CohortMember>(`/cohorts/${cohortId}/members`, { userId }).then((r) => r.data),
  removeMember: (cohortId: string, userId: string) =>
    api.delete(`/cohorts/${cohortId}/members/${userId}`).then((r) => r.data),
  getCohortProgress: (cohortId: string) =>
    api.get(`/cohorts/${cohortId}/progress`).then((r) => r.data),
  exportAnalytics: async (cohortId: string, cohortName: string) => {
    const response = await api.get(`/cohorts/${cohortId}/analytics/export`, {
      responseType: 'blob',
    });
    const url = URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `cohort-${cohortName}-analytics.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Student
  getMyCohorts: () => api.get<Cohort[]>('/cohorts/me').then((r) => r.data),
};
