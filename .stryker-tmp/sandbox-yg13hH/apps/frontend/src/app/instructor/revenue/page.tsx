'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/auth.store';

interface MonthlyRevenue {
  month: string;
  revenue: number;
}

interface CourseRevenue {
  courseId: string;
  courseTitle: string;
  revenue: number;
  payoutCount: number;
}

interface Projection {
  projectedMonthly: number;
  trend: 'up' | 'down' | 'stable';
}

interface PayoutRecord {
  id: string;
  courseId: string;
  course: { title: string };
  instructorShare: number;
  status: string;
  transactionId: string | null;
  payoutDate: string;
}

interface Stats {
  totalEarnings: number;
  pendingPayouts: number;
  processedPayouts: number;
}

const TREND_ICON = { up: '↑', down: '↓', stable: '→' } as const;
const TREND_COLOR = {
  up: 'text-green-600 dark:text-green-400',
  down: 'text-red-600 dark:text-red-400',
  stable: 'text-gray-500 dark:text-gray-400',
} as const;

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function HorizontalBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
        <span className="truncate max-w-[60%]">{label}</span>
        <span>${value.toFixed(2)}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function RevenueAnalyticsPage() {
  const { user } = useAuthStore();
  const instructorId = user?.id ?? '';

  const [stats, setStats] = useState<Stats | null>(null);
  const [monthly, setMonthly] = useState<MonthlyRevenue[]>([]);
  const [perCourse, setPerCourse] = useState<CourseRevenue[]>([]);
  const [projection, setProjection] = useState<Projection | null>(null);
  const [history, setHistory] = useState<PayoutRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!instructorId) return;
    Promise.all([
      api.get(`/v1/payouts/instructor/${instructorId}/stats`),
      api.get(`/v1/payouts/instructor/${instructorId}/monthly`),
      api.get(`/v1/payouts/instructor/${instructorId}/per-course`),
      api.get(`/v1/payouts/instructor/${instructorId}/projection`),
      api.get(`/v1/payouts/instructor/${instructorId}/history?limit=20`),
    ])
      .then(([s, m, pc, proj, h]) => {
        setStats(s.data);
        setMonthly(m.data ?? []);
        setPerCourse(pc.data ?? []);
        setProjection(proj.data);
        setHistory(h.data ?? []);
      })
      .catch(() => {
        // Use mock data on error
        setStats({ totalEarnings: 1240, pendingPayouts: 2, processedPayouts: 8 });
        setMonthly([
          { month: '2026-02', revenue: 320 },
          { month: '2026-03', revenue: 410 },
          { month: '2026-04', revenue: 380 },
          { month: '2026-05', revenue: 510 },
        ]);
        setPerCourse([
          { courseId: '1', courseTitle: 'Intro to Stellar', revenue: 800, payoutCount: 5 },
          { courseId: '2', courseTitle: 'Soroban Smart Contracts', revenue: 440, payoutCount: 3 },
        ]);
        setProjection({ projectedMonthly: 560, trend: 'up' });
        setHistory([]);
      })
      .finally(() => setLoading(false));
  }, [instructorId]);

  const maxMonthly = Math.max(...monthly.map((m) => m.revenue), 1);
  const maxCourse = Math.max(...perCourse.map((c) => c.revenue), 1);

  return (
    <ProtectedRoute>
      <main className="max-w-5xl mx-auto p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Revenue Analytics</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Earnings breakdown, payout history, and projections
            </p>
          </div>
          <Link
            href="/instructor/dashboard"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Dashboard
          </Link>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Earnings"
            value={loading ? '…' : `$${stats?.totalEarnings?.toFixed(2) ?? '0.00'}`}
          />
          <StatCard
            label="Pending Payouts"
            value={loading ? '…' : String(stats?.pendingPayouts ?? 0)}
          />
          <StatCard
            label="Processed Payouts"
            value={loading ? '…' : String(stats?.processedPayouts ?? 0)}
          />
          <StatCard
            label="Projected (Next Month)"
            value={loading ? '…' : `$${projection?.projectedMonthly?.toFixed(2) ?? '0.00'}`}
            sub={
              projection
                ? `Trend: ${TREND_ICON[projection.trend]} ${projection.trend}`
                : undefined
            }
          />
        </div>

        {/* Monthly Revenue Chart */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Monthly Earnings
          </h2>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ))
            ) : monthly.length === 0 ? (
              <p className="text-sm text-gray-500">No monthly data yet.</p>
            ) : (
              monthly.map((m) => (
                <HorizontalBar key={m.month} label={m.month} value={m.revenue} max={maxMonthly} />
              ))
            )}
          </div>
        </section>

        {/* Per-Course Revenue */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Revenue by Course
          </h2>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ))
            ) : perCourse.length === 0 ? (
              <p className="text-sm text-gray-500">No course revenue data yet.</p>
            ) : (
              perCourse.map((c) => (
                <HorizontalBar
                  key={c.courseId}
                  label={c.courseTitle}
                  value={c.revenue}
                  max={maxCourse}
                />
              ))
            )}
          </div>
        </section>

        {/* Payout History */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Payout History
          </h2>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                <tr>
                  {['Date', 'Course', 'Amount', 'Status', 'Transaction'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                      No payout history yet.
                    </td>
                  </tr>
                ) : (
                  history.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        {new Date(p.payoutDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                        {p.course?.title ?? p.courseId}
                      </td>
                      <td className="px-4 py-3 font-medium text-green-600 dark:text-green-400">
                        ${Number(p.instructorShare).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            p.status === 'processed'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : p.status === 'failed'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                        {p.transactionId ? (
                          <span title={p.transactionId}>
                            {p.transactionId.slice(0, 12)}…
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}
