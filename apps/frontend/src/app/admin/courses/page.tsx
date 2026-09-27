'use client';
import { AdminCourseTable } from '@/components/admin/AdminCourseTable';

export default function AdminCoursesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Course Management</h1>
      <AdminCourseTable />
    </div>
  );
}
