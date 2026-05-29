'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminApi, PlatformAnalytics, GrowthPoint, RevenuePoint, TopCourse } from '@/lib/adminApi';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatMonth(yyyyMM: string): string {
  const [year, month] = yyyyMM.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleString('default', { month: 'short', year: '2-digit' });
}

function exportCSV(data: PlatformAnalytics): void {
  const rows: string[][] = [];

  // Summary
  rows.push(['Summary']);
  rows.push(['Metric', 'Value']);
  rows.push(['Total Users', String(data.totalUsers)]);
  rows.push(['Total Enrollments', String(data.totalEnrollments)]);
  rows.push(['Total Completions', String(data.totalCompletions)]);
  rows.push(['Completion Rate (%)', String(data.completionRate)]);
  rows.push([]);

  // User growth
  rows.push(['User Growth (Monthly)']);
  rows.push(['Month', 'New Users']);
  data.userGrowth.forEach((p) => rows.push([p.month, String(p.count)]));
  rows.push([]);

  // Enrollment growth
  rows.push(['Enrollment Growth (Monthly)']);
  rows.push(['Month', 'New Enrollments']);
  data.enrollmentGrowth.forEach((p) => rows.push([p.month, String(p.count)]));
  rows.push([]);

  // Completion growth
  rows.push(['Completion Growth (Monthly)']);
  rows.push(['Month', 'Completions']);
  data.completionGrowth.forEach((p) => rows.push([p.month, String(p.count)]));
  rows.push([]);

  // Top courses
  rows.push(['Top Courses by Enrollment']);
  rows.push(['Course', 'Enrollments', 'Completions', 'Completion Rate (%)']);
  data.topCourses.forEach((c) =>
    rows.push([c.title, String(c.enrollments), String(c.completions), String(c.completionRate)])
  );

  const csv = rows.map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `platform-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  sub,
  color = 'blue',
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const accent: Record<string, string> = {
    blue: 'border-blue-500 bg-blue-50 dark:bg-blue-950/30',
    green: 'border-green-500 bg-green-50 dark:bg-green-950/30',
    purple: 'border-purple-500 bg-purple-50 dark:bg-purple-950/30',
    orange: 'border-orange-500 bg-orange-50 dark:bg-orange-950/30',
  };
  const text: Record<string, string> = {
    blue: 'text-blue-700 dark:text-blue-300',
    green: 'text-green-700 dark:text-green-300',
    purple: 'text-purple-700 dark:text-purple-300',
    orange: 'text-orange-700 dark:text-orange-300',
  };
  return (
    <div className={`rounded-lg border-l-4 p-5 ${accent[color]}`}>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${text[color]}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function SkeletonMetricCard() {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-5 animate-pulse space-y-2">
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
    </div>
  );
}

interface LineChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}

function LineChart({ data, color = '#3b82f6', height = 80 }: LineChartProps) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  const w = 100 / (data.length - 1 || 1);

  const points = data.map((d, i) => ({
    x: i * w,
    y: height - (d.value / max) * (height - 8),
  }));

  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="relative w-full" style={{ height }}>
      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        className="w-full h-full"
        aria-hidden="true"
      >
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1="0"
            y1={height - t * (height - 8)}
            x2="100"
            y2={height - t * (height - 8)}
            stroke="currentColor"
            strokeWidth="0.3"
            className="text-gray-200 dark:text-gray-700"
          />
        ))}
        {/* Area fill */}
        <polygon
          points={`0,${height} ${polyline} 100,${height}`}
          fill={color}
          fillOpacity="0.1"
        />
        {/* Line */}
        <polyline
          points={polyline}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {/* Dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1.5" fill={color} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      {/* X-axis labels — show first, middle, last */}
      <div className="flex justify-between mt-1">
        {data.map((d, i) => {
          const show = i === 0 || i === Math.floor(data.length / 2) || i === data.length - 1;
          return (
            <span
              key={i}
              className={`text-xs text-gray-400 dark:text-gray-500 ${show ? '' : 'invisible'}`}
              style={{ width: `${w}%`, textAlign: i === 0 ? 'left' : i === data.length - 1 ? 'right' : 'center' }}
            >
              {d.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-5 animate-pulse space-y-3">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  );
}

function TopCoursesTable({ courses }: { courses: TopCourse[] }) {
  const max = Math.max(...courses.map((c) => c.enrollments), 1);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" aria-label="Top courses by enrollment">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-2 pr-4 font-medium text-gray-500 dark:text-gray-400">Course</th>
            <th className="text-right py-2 px-4 font-medium text-gray-500 dark:text-gray-400">Enrollments</th>
            <th className="text-right py-2 px-4 font-medium text-gray-500 dark:text-gray-400">Completions</th>
            <th className="text-left py-2 pl-4 font-medium text-gray-500 dark:text-gray-400 w-32">Completion Rate</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {courses.map((c) => (
            <tr key={c.courseId} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
              <td className="py-2 pr-4 text-gray-900 dark:text-gray-100 font-medium max-w-xs truncate">
                {c.title}
              </td>
              <td className="py-2 px-4 text-right text-gray-600 dark:text-gray-300">
                <div className="flex items-center justify-end gap-2">
                  <div className="h-1.5 w-16 rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${(c.enrollments / max) * 100}%` }}
                    />
                  </div>
                  {c.enrollments.toLocaleString()}
                </div>
              </td>
              <td className="py-2 px-4 text-right text-gray-600 dark:text-gray-300">
                {c.completions.toLocaleString()}
              </td>
              <td className="py-2 pl-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{ width: `${c.completionRate}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">
                    {c.completionRate.toFixed(1)}%
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function AnalyticsDashboard() {
  const [data, setData] = useState<PlatformAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await adminApi.getPlatformAnalytics();
      setData(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function handleExport() {
    if (!data) return;
    setExporting(true);
    try {
      exportCSV(data);
    } finally {
      setExporting(false);
    }
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 dark:border-red-800 p-8 text-center">
        <p className="text-red-600 dark:text-red-400 mb-3">Failed to load analytics data.</p>
        <button
          onClick={load}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const userGrowthData = (data?.userGrowth ?? []).map((p) => ({
    label: formatMonth(p.month),
    value: p.count,
  }));
  const enrollmentGrowthData = (data?.enrollmentGrowth ?? []).map((p) => ({
    label: formatMonth(p.month),
    value: p.count,
  }));
  const completionGrowthData = (data?.completionGrowth ?? []).map((p) => ({
    label: formatMonth(p.month),
    value: p.count,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Platform Analytics</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Platform-wide metrics and 12-month trends
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={!data || exporting}
          aria-label="Export analytics as CSV"
          className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {exporting ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          <>
            <SkeletonMetricCard />
            <SkeletonMetricCard />
            <SkeletonMetricCard />
            <SkeletonMetricCard />
          </>
        ) : (
          <>
            <MetricCard
              label="Total Users"
              value={(data?.totalUsers ?? 0).toLocaleString()}
              color="blue"
            />
            <MetricCard
              label="Total Enrollments"
              value={(data?.totalEnrollments ?? 0).toLocaleString()}
              color="purple"
            />
            <MetricCard
              label="Total Completions"
              value={(data?.totalCompletions ?? 0).toLocaleString()}
              color="green"
            />
            <MetricCard
              label="Completion Rate"
              value={`${data?.completionRate ?? 0}%`}
              sub="Enrollments → completions"
              color="orange"
            />
          </>
        )}
      </div>

      {/* Growth charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <>
            <SkeletonChart />
            <SkeletonChart />
            <SkeletonChart />
          </>
        ) : (
          <>
            <ChartCard title="New Users (Monthly)">
              <LineChart data={userGrowthData} color="#3b82f6" height={80} />
            </ChartCard>
            <ChartCard title="New Enrollments (Monthly)">
              <LineChart data={enrollmentGrowthData} color="#8b5cf6" height={80} />
            </ChartCard>
            <ChartCard title="Completions (Monthly)">
              <LineChart data={completionGrowthData} color="#22c55e" height={80} />
            </ChartCard>
          </>
        )}
      </div>

      {/* Top courses */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Top Courses by Enrollment
        </h3>
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        ) : data?.topCourses.length ? (
          <TopCoursesTable courses={data.topCourses} />
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
            No course data available yet.
          </p>
        )}
      </div>
    </div>
  );
}
