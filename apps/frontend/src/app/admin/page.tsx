'use client';
import { AdminStatsCards } from '@/components/admin/AdminStatsCards';

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <AdminStatsCards />
    </div>
  );
}
