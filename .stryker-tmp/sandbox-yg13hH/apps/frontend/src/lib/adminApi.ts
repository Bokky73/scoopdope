import api from './api';

export interface PlatformStats {
  totalUsers: number;
  totalCourses: number;
  totalRevenue: number;
}

export interface ActivityEvent {
  id: string;
  type: 'enrollment' | 'completion' | 'new_user';
  description: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  displayName: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  status: 'active' | 'banned';
}

export interface PendingCourse {
  id: string;
  title: string;
  instructorName: string;
  submittedAt: string;
}

export interface HealthStatus {
  api: 'ok' | 'degraded' | 'down';
  database: 'ok' | 'degraded' | 'down';
  stellar: 'ok' | 'degraded' | 'down';
}

export interface GrowthPoint {
  month: string;
  count: number;
}

export interface RevenuePoint {
  month: string;
  amount: number;
}

export interface TopCourse {
  courseId: string;
  title: string;
  enrollments: number;
  completions: number;
  completionRate: number;
}

export interface PlatformAnalytics {
  totalUsers: number;
  totalEnrollments: number;
  totalCompletions: number;
  totalRevenue: number;
  completionRate: number;
  userGrowth: GrowthPoint[];
  enrollmentGrowth: GrowthPoint[];
  completionGrowth: GrowthPoint[];
  revenueGrowth: RevenuePoint[];
  topCourses: TopCourse[];
}

export const adminApi = {
  getStats: () => api.get<PlatformStats>('/admin/stats').then((r) => r.data),
  getActivity: () => api.get<ActivityEvent[]>('/admin/activity').then((r) => r.data),
  getUsers: (page: number, search?: string) =>
    api.get<{ users: AdminUser[]; total: number }>('/admin/users', { params: { page, search } }).then((r) => r.data),
  banUser: (userId: string) => api.post(`/admin/users/${userId}/ban`).then((r) => r.data),
  updateUserRole: (userId: string, role: AdminUser['role']) =>
    api.patch(`/admin/users/${userId}/role`, { role }).then((r) => r.data),
  getPendingCourses: () => api.get<PendingCourse[]>('/admin/courses/pending').then((r) => r.data),
  approveCourse: (courseId: string) => api.post(`/admin/courses/${courseId}/approve`).then((r) => r.data),
  rejectCourse: (courseId: string, reason: string) =>
    api.post(`/admin/courses/${courseId}/reject`, { reason }).then((r) => r.data),
  getHealth: () => api.get<HealthStatus>('/health').then((r) => r.data),
  getPlatformAnalytics: () =>
    api.get<PlatformAnalytics>('/v1/analytics/platform').then((r) => r.data),
};
