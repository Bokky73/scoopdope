'use client';
import { useEffect, useState } from 'react';
import { fetchAdminStats, AdminStats } from '@/lib/admin-api';
import { Users, BookOpen, UserCheck } from 'lucide-react';

function SkeletonCard() {
  return (
    <div className="animate-pulse border rounded-lg p-6 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-8 bg-gray-200 rounded w-3/4" />
    </div>
  );
}

export function AdminStatsCards() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchAdminStats();
      setStats(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-6">
        <SkeletonCard /><SkeletonCard /><SkeletonCard />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-3">Failed to load statistics.</p>
        <button className="text-blue-600 hover:underline text-sm" onClick={load}>Retry</button>
      </div>
    );
  }

  const cards = [
    { 
      label: 'Total Users', 
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      label: 'Total Courses', 
      value: stats.totalCourses.toLocaleString(),
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      label: 'Total Credentials', 
      value: stats.totalCredentials.toLocaleString(),
      icon: UserCheck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="border rounded-lg p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">{card.label}</p>
              <div className={`p-2 rounded-lg ${card.bgColor} ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold">{card.value}</p>
          </div>
        );
      })}
    </div>
  );
}
