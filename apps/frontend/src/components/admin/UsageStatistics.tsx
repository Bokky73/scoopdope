'use client';

import useSWR from 'swr';
import { fetchUsageStatistics, UsageStatistics as UsageStatisticsData } from '@/lib/admin-api';
import { LineChart } from './charts/LineChart';
import { MetricCard, SkeletonMetricCard } from './cards/MetricCard';
import { ChartCard, SkeletonChart } from './cards/ChartCard';

// ── Fetcher ───────────────────────────────────────────────────────────────────

const DAYS = 30;

function fetcher() {
  return fetchUsageStatistics(DAYS);
}

// ── Method badge ──────────────────────────────────────────────────────────────

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  POST: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  PUT: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  PATCH: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

function MethodBadge({ method }: { method: string }) {
  const cls = METHOD_COLORS[method.toUpperCase()] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  return (
    <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-semibold font-mono ${cls}`}>
      {method.toUpperCase()}
    </span>
  );
}

// ── Skeleton table row ────────────────────────────────────────────────────────

function SkeletonTableRow() {
  return (
    <tr className="animate-pulse">
      <td className="py-3 pr-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" /></td>
      <td className="py-3 pr-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12" /></td>
      <td className="py-3 pr-4 text-right"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 ml-auto" /></td>
      <td className="py-3 pr-4 text-right"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-14 ml-auto" /></td>
      <td className="py-3 text-right"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8 ml-auto" /></td>
    </tr>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function UsageStatistics() {
  const { data, error, isLoading, mutate } = useSWR<UsageStatisticsData>(
    'usage-statistics',
    fetcher,
    { revalidateOnFocus: false },
  );

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 dark:border-red-800 p-8 text-center">
        <p className="text-red-600 dark:text-red-400 mb-3">Failed to load usage statistics.</p>
        <button
          onClick={() => mutate()}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  // Daily trend line chart data
  const trendData = (data?.dailyTrend ?? []).map((d) => ({
    label: d.date.slice(5), // "MM-DD"
    value: d.requestCount,
  }));

  const errorTrendData = (data?.dailyTrend ?? []).map((d) => ({
    label: d.date.slice(5),
    value: d.errorCount,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Usage Statistics</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Platform API usage over the last {DAYS} days
        </p>
      </div>

      {/* Top metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <SkeletonMetricCard />
            <SkeletonMetricCard />
            <SkeletonMetricCard />
            <SkeletonMetricCard />
          </>
        ) : (
          <>
            <MetricCard
              label="Total Requests"
              value={(data?.totalRequests ?? 0).toLocaleString()}
              color="blue"
            />
            <MetricCard
              label="Error Rate"
              value={`${data?.errorRate ?? 0}%`}
              sub="HTTP 4xx / 5xx"
              color="orange"
            />
            <MetricCard
              label="Avg Response Time"
              value={`${data?.avgResponseTimeMs ?? 0} ms`}
              sub="Mean over period"
              color="purple"
            />
            <MetricCard
              label="MAU / WAU / DAU"
              value={`${data?.monthlyActiveUsers ?? 0}`}
              sub={`WAU ${data?.weeklyActiveUsers ?? 0} · DAU ${data?.dailyActiveUsers ?? 0}`}
              color="green"
            />
          </>
        )}
      </div>

      {/* Percentiles + trend charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <SkeletonChart />
            <SkeletonChart />
            <SkeletonChart />
          </>
        ) : (
          <>
            {/* Response time percentiles card */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Response Time Percentiles
              </h3>
              <dl className="space-y-3">
                {[
                  { label: 'p50 (median)', value: data?.p50ResponseTimeMs ?? 0, color: 'text-green-600 dark:text-green-400' },
                  { label: 'p95', value: data?.p95ResponseTimeMs ?? 0, color: 'text-orange-600 dark:text-orange-400' },
                  { label: 'p99', value: data?.p99ResponseTimeMs ?? 0, color: 'text-red-600 dark:text-red-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt>
                    <dd className={`text-sm font-semibold tabular-nums ${color}`}>{value} ms</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Request trend */}
            <ChartCard title="Daily Requests (30d)">
              <LineChart data={trendData} color="#3b82f6" height={80} />
            </ChartCard>

            {/* Error trend */}
            <ChartCard title="Daily Errors (30d)">
              <LineChart data={errorTrendData} color="#ef4444" height={80} />
            </ChartCard>
          </>
        )}
      </div>

      {/* Top endpoints table */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Top Endpoints by Request Volume
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                <th className="pb-3 pr-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Endpoint
                </th>
                <th className="pb-3 pr-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Method
                </th>
                <th className="pb-3 pr-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide text-right">
                  Requests
                </th>
                <th className="pb-3 pr-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide text-right">
                  Avg Time
                </th>
                <th className="pb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide text-right">
                  Errors
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} />)
                : (data?.topEndpoints ?? []).length === 0
                  ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        No endpoint data available yet.
                      </td>
                    </tr>
                  )
                  : data!.topEndpoints.map((ep) => (
                    <tr
                      key={`${ep.method}-${ep.endpoint}`}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="py-3 pr-4 font-mono text-xs text-gray-800 dark:text-gray-200 truncate max-w-[240px]">
                        {ep.endpoint}
                      </td>
                      <td className="py-3 pr-4">
                        <MethodBadge method={ep.method} />
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums text-gray-700 dark:text-gray-300">
                        {ep.requestCount.toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums text-gray-700 dark:text-gray-300">
                        {ep.avgResponseTimeMs} ms
                      </td>
                      <td className="py-3 text-right tabular-nums">
                        <span
                          className={
                            ep.errorCount > 0
                              ? 'text-red-600 dark:text-red-400 font-medium'
                              : 'text-gray-400 dark:text-gray-500'
                          }
                        >
                          {ep.errorCount.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
