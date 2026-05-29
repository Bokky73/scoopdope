'use client';
import { useEffect, useState } from 'react';
import { adminApi, PlatformStats, ActivityEvent } from '@/lib/adminApi';

function SkeletonCard() {
  return (
    <div className="animate-pulse border rounded-lg p-6 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-8 bg-gray-200 rounded w-3/4" />
    </div>
  );
}

export function StatsCards() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const [s, a] = await Promise.all([adminApi.getStats(), adminApi.getActivity()]);
      setStats(s);
      setActivity(a.slice(0, 20));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4">
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
    { label: 'Total Users', value: stats.totalUsers.toLocaleString() },
    { label: 'Published Courses', value: stats.totalCourses.toLocaleString() },
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}` },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="border rounded-lg p-6">
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="text-3xl font-bold mt-1">{c.value}</p>
          </div>
        ))}
      </div>
      <div>
        <h3 className="font-semibold mb-3">Recent Activity</h3>
        <ul className="space-y-2">
          {activity.map((e) => (
            <li key={e.id} className="text-sm text-gray-600 flex justify-between">
              <span>{e.description}</span>
              <span className="text-gray-400">{new Date(e.createdAt).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
