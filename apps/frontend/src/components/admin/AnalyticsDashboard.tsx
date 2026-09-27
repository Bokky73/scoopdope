'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminApi, PlatformAnalytics } from '@/lib/adminApi';
import { LineChart } from './charts/LineChart';
import { TopCoursesTable } from './charts/TopCoursesTable';
import { MetricCard, SkeletonMetricCard } from './cards/MetricCard';
import { ChartCard, SkeletonChart } from './cards/ChartCard';
import { formatMonth, exportCSV } from './analytics.utils';

// ── Date-range helpers ────────────────────────────────────────────────────────

type RangePreset = '30d' | '90d' | '180d' | '1y' | 'custom';

interface DateRange {
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
}

function toIsoDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function presetToRange(preset: RangePreset): DateRange {
  const to = new Date();
  const from = new Date();
  switch (preset) {
    case '30d':  from.setDate(to.getDate() - 30); break;
    case '90d':  from.setDate(to.getDate() - 90); break;
    case '180d': from.setDate(to.getDate() - 180); break;
    case '1y':
    default:
      from.setFullYear(to.getFullYear() - 1);
      break;
  }
  return { from: toIsoDate(from), to: toIsoDate(to) };
}

// ── Enrollment-by-course bar chart ───────────────────────────────────────────

function EnrollmentByCourseBar({
  data,
}: {
  data: { courseId: string; title: string; enrollments: number }[];
}) {
  if (!data.length)
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
        No enrollment data available yet.
      </p>
    );

  const max = Math.max(...data.map((d) => d.enrollments), 1);

  return (
    <div className="space-y-2" role="list" aria-label="Enrollments by course">
      {data.map((item) => (
        <div key={item.courseId} role="listitem" className="flex items-center gap-3">
          <span
            className="text-xs text-gray-600 dark:text-gray-400 w-36 truncate flex-shrink-0"
            title={item.title}
          >
            {item.title}
          </span>
          <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
            <div
              className="bg-indigo-500 dark:bg-indigo-400 h-full rounded-full transition-all"
              style={{ width: `${(item.enrollments / max) * 100}%` }}
              role="progressbar"
              aria-valuenow={item.enrollments}
              aria-valuemin={0}
              aria-valuemax={max}
            />
          </div>
          <span className="text-xs text-gray-700 dark:text-gray-300 w-8 text-right flex-shrink-0">
            {item.enrollments}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function AnalyticsDashboard() {
  const [data, setData] = useState<PlatformAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Date-range state
  const [preset, setPreset] = useState<RangePreset>('1y');
  const [range, setRange] = useState<DateRange>(presetToRange('1y'));
  const [customFrom, setCustomFrom] = useState(range.from);
  const [customTo, setCustomTo] = useState(range.to);

  const load = useCallback(
    async (r: DateRange) => {
      setLoading(true);
      setError(false);
      try {
        const result = await adminApi.getPlatformAnalytics({ from: r.from, to: r.to });
        setData(result);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    load(range);
  }, [load, range]);

  const handlePresetChange = (p: RangePreset) => {
    setPreset(p);
    if (p !== 'custom') {
      const r = presetToRange(p);
      setRange(r);
      setCustomFrom(r.from);
      setCustomTo(r.to);
    }
  };

  const handleApplyCustom = () => {
    if (customFrom && customTo && customFrom <= customTo) {
      setRange({ from: customFrom, to: customTo });
    }
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 dark:border-red-800 p-8 text-center">
        <p className="text-red-600 dark:text-red-400 mb-3">Failed to load analytics data.</p>
        <button
          onClick={() => load(range)}
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

  const PRESETS: { value: RangePreset; label: string }[] = [
    { value: '30d', label: '30 days' },
    { value: '90d', label: '90 days' },
    { value: '180d', label: '6 months' },
    { value: '1y', label: '1 year' },
    { value: 'custom', label: 'Custom' },
  ];

  return (
    <div className="space-y-6">
      {/* Header + controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Platform Analytics
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Platform-wide metrics and trends
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Preset buttons */}
          <div
            className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden"
            role="group"
            aria-label="Date range presets"
          >
            {PRESETS.map((p) => (
              <button
                key={p.value}
                onClick={() => handlePresetChange(p.value)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  preset === p.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                aria-pressed={preset === p.value}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom range inputs */}
          {preset === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customFrom}
                max={customTo}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 text-xs"
                aria-label="From date"
              />
              <span className="text-xs text-gray-500">–</span>
              <input
                type="date"
                value={customTo}
                min={customFrom}
                onChange={(e) => setCustomTo(e.target.value)}
                className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 text-xs"
                aria-label="To date"
              />
              <button
                onClick={handleApplyCustom}
                disabled={!customFrom || !customTo || customFrom > customTo}
                className="rounded bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs font-medium disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          )}

          {/* Export */}
          <button
            onClick={() => {
              if (data) {
                setExporting(true);
                exportCSV(data);
                setExporting(false);
              }
            }}
            disabled={!data || exporting}
            aria-label="Export analytics as CSV"
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
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
      </div>

      {/* Metric cards — now 5 cards including Total Courses */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonMetricCard key={i} />)
        ) : (
          <>
            <MetricCard
              label="Total Users"
              value={(data?.totalUsers ?? 0).toLocaleString()}
              color="blue"
            />
            <MetricCard
              label="Total Courses"
              value={(data?.totalCourses ?? 0).toLocaleString()}
              color="indigo"
            />
            <MetricCard
              label="Enrollments"
              value={(data?.totalEnrollments ?? 0).toLocaleString()}
              color="purple"
            />
            <MetricCard
              label="Completions"
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

      {/* Growth trend charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonChart key={i} />)
        ) : (
          <>
            <ChartCard title="New Users">
              <LineChart data={userGrowthData} color="#3b82f6" height={80} />
            </ChartCard>
            <ChartCard title="New Enrollments">
              <LineChart data={enrollmentGrowthData} color="#8b5cf6" height={80} />
            </ChartCard>
            <ChartCard title="Completions">
              <LineChart data={completionGrowthData} color="#22c55e" height={80} />
            </ChartCard>
          </>
        )}
      </div>

      {/* Enrollment by course */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Enrollments by Course (selected window)
        </h3>
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-5 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        ) : (
          <EnrollmentByCourseBar data={data?.enrollmentByCourse ?? []} />
        )}
      </div>

      {/* Top courses table */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Top Courses by Enrollment (all-time)
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
