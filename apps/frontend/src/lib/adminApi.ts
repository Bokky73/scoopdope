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
  status: 'active' | 'suspended' | 'deactivated' | 'banned';
  isVerified: boolean;
  createdAt: string;
}

export interface PendingCourse {
  id: string;
  title: string;
  instructorName: string;
  submittedAt: string;
}

export interface AdminCourse {
  id: string;
  title: string;
  status: 'draft' | 'pending' | 'published' | 'archived';
  instructorName: string;
  enrollmentCount: number;
  completionCount: number;
  averageRating: number | null;
  createdAt: string;
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
  totalCourses: number;
  totalEnrollments: number;
  totalCompletions: number;
  totalRevenue: number;
  completionRate: number;
  userGrowth: GrowthPoint[];
  enrollmentGrowth: GrowthPoint[];
  completionGrowth: GrowthPoint[];
  revenueGrowth: RevenuePoint[];
  topCourses: TopCourse[];
  enrollmentByCourse: { courseId: string; title: string; enrollments: number }[];
}

export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  resourceType: string | null;
  resourceId: string | null;
  changes: Record<string, { from: unknown; to: unknown }> | null;
  success: boolean;
  createdAt: string;
}

export const adminApi = {
  // User Management
  getUsers: (page: number, search?: string, role?: string, status?: string) =>
    api.get<{ data: { users: AdminUser[]; total: number; page: number; limit: number } }>('/v1/admin/users', { params: { page, search, role, status } }).then((r) => r.data.data),
  
  getUserById: (userId: string) =>
    api.get<{ data: AdminUser }>(`/v1/admin/users/${userId}`).then((r) => r.data.data),
  
  changeUserRole: (userId: string, role: AdminUser['role']) =>
    api.patch<{ data: AdminUser }>(`/v1/admin/users/${userId}/role`, { role }).then((r) => r.data.data),
  
  setUserStatus: (userId: string, status: AdminUser['status']) =>
    api.patch<{ data: AdminUser }>(`/v1/admin/users/${userId}/status`, { status }).then((r) => r.data.data),
  
  banUser: (userId: string) => 
    api.patch<{ data: AdminUser }>(`/v1/admin/users/${userId}/status`, { status: 'banned' }).then((r) => r.data.data),
  
  suspendUser: (userId: string) =>
    api.patch<{ data: AdminUser }>(`/v1/admin/users/${userId}/status`, { status: 'suspended' }).then((r) => r.data.data),
  
  deactivateUser: (userId: string) =>
    api.patch<{ data: AdminUser }>(`/v1/admin/users/${userId}/status`, { status: 'deactivated' }).then((r) => r.data.data),

  deleteUser: (userId: string) =>
    api.delete(`/v1/admin/users/${userId}`).then((r) => r.data),

  // Course Management
  getCourses: (page: number, status?: string, instructorId?: string) =>
    api.get<{ data: { courses: AdminCourse[]; total: number; page: number; limit: number } }>('/v1/admin/courses', { params: { page, status, instructorId } }).then((r) => r.data.data),
  
  getCourseById: (courseId: string) =>
    api.get<{ data: AdminCourse }>(`/v1/admin/courses/${courseId}`).then((r) => r.data.data),
  
  approveCourse: (courseId: string) =>
    api.post<{ data: AdminCourse }>(`/v1/admin/courses/${courseId}/approve`).then((r) => r.data.data),
  
  rejectCourse: (courseId: string, reason: string) =>
    api.post<{ data: AdminCourse }>(`/v1/admin/courses/${courseId}/reject`, { reason }).then((r) => r.data.data),
  
  archiveCourse: (courseId: string) =>
    api.patch<{ data: AdminCourse }>(`/v1/admin/courses/${courseId}/archive`, {}).then((r) => r.data.data),
  
  unarchiveCourse: (courseId: string) =>
    api.patch<{ data: AdminCourse }>(`/v1/admin/courses/${courseId}/unarchive`, {}).then((r) => r.data.data),
  
  deleteCourse: (courseId: string) =>
    api.delete(`/v1/admin/courses/${courseId}`).then((r) => r.data),
  
  getCourseStats: (courseId: string) =>
    api.get<{ data: { enrollmentCount: number; completionCount: number; averageRating: number | null } }>(`/v1/admin/courses/${courseId}/stats`).then((r) => r.data.data),

  // Audit Logs
  getAuditLogs: (page: number, filters?: { userId?: string; action?: string; resourceType?: string; startDate?: string; endDate?: string }) =>
    api.get<{ data: { data: AuditLog[]; meta: { total: number; page: number; limit: number; totalPages: number } } }>('/v1/audit', { params: { ...filters, page } }).then((r) => r.data.data),

  // Legacy endpoints (for compatibility)
  getStats: () => api.get<PlatformStats>('/admin/stats').then((r) => r.data),
  getActivity: () => api.get<ActivityEvent[]>('/admin/activity').then((r) => r.data),
  getPendingCourses: () => api.get<PendingCourse[]>('/admin/courses/pending').then((r) => r.data),
  getHealth: () => api.get<HealthStatus>('/health').then((r) => r.data),
  getPlatformAnalytics: (params?: { from?: string; to?: string }) =>
    api
      .get<PlatformAnalytics>('/v1/analytics/platform', { params })
      .then((r) => r.data),
};
