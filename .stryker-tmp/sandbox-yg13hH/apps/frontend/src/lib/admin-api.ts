import api from './api';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  isBanned: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface AdminCourse {
  id: string;
  title: string;
  level: string;
  durationHours: number;
  isPublished: boolean;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  totalCredentials: number;
  totalBstMinted: number;
}

// ── Stats ─────────────────────────────────────────────────────────────────────
export async function fetchAdminStats(): Promise<AdminStats> {
  const [usersRes, coursesRes, credsRes] = await Promise.all([
    api.get('/admin/users?limit=1'),
    api.get('/courses?limit=1'),
    api.get('/admin/stats').catch(() => ({ data: { totalCredentials: 0, totalBstMinted: 0 } })),
  ]);
  return {
    totalUsers: usersRes.data?.meta?.total ?? 0,
    totalCourses: coursesRes.data?.total ?? 0,
    totalCredentials: credsRes.data?.totalCredentials ?? 0,
    totalBstMinted: credsRes.data?.totalBstMinted ?? 0,
  };
}

// ── Users ─────────────────────────────────────────────────────────────────────
export async function fetchAdminUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}) {
  const { data } = await api.get('/admin/users', { params });
  return data as { data: AdminUser[]; meta: { total: number; page: number; totalPages: number } };
}

export const changeUserRole = (id: string, role: string) =>
  api.patch(`/admin/users/${id}/role`, { role });

export const banUser = (id: string, isBanned: boolean) =>
  api.patch(`/admin/users/${id}/ban`, { isBanned });

export const deleteUser = (id: string) => api.delete(`/admin/users/${id}`);

// ── Courses ───────────────────────────────────────────────────────────────────
export async function fetchAdminCourses(params: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const { data } = await api.get('/courses', { params });
  return data as { data: AdminCourse[]; total: number };
}

export const togglePublish = (id: string, isPublished: boolean) =>
  api.patch(`/courses/${id}`, { isPublished });

export const deleteCourse = (id: string) => api.delete(`/courses/${id}`);
