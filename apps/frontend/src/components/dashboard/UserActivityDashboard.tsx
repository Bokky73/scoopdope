'use client';

import { useEffect, useState, useCallback } from 'react';
import { studySessionsApi, UserStudyStats } from '@/lib/studySessionsApi';
import api from '@/lib/api';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
}

interface BadgeInfo {
  id: string;
  label: string;
  description: string;
  icon: string;
  earned: boolean;
}

function deriveBadges(stats: UserStudyStats | null, streak: StreakData | null): BadgeInfo[] {
  const hours = stats?.totalHours ?? 0;
  const current = streak?.currentStreak ?? 0;
  const longest = streak?.longestStreak ?? 0;

  return [
    {
      id: 'first-hour',
      label: 'First Hour',
      description: 'Complete 1 hour of study',
      icon: '⏱️',
      earned: hours >= 1,
    },
    {
      id: 'ten-hours',
      label: 'Ten Hours',
      description: 'Complete 10 hours of study',
      icon: '📚',
      earned: hours >= 10,
    },
    {
      id: 'fifty-hours',
      label: 'Scholar',
      description: 'Complete 50 hours of study',
      icon: '🎓',
      earned: hours >= 50,
    },
    {
      id: 'streak-7',
      label: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      icon: '🔥',
      earned: longest >= 7,
    },
    {
      id: 'streak-30',
      label: 'Monthly Master',
      description: 'Maintain a 30-day streak',
      icon: '🏆',
      earned: longest >= 30,
    },
    {
      id: 'active-week',
      label: 'Active Week',
      description: 'Study for 5+ days this week',
      icon: '🌟',
      earned: current >= 5,
    },
  ];
}

function deriveNextMilestone(stats: UserStudyStats | null): { label: string; progress: number; target: number } | null {
  const hours = stats?.totalHours ?? 0;
  const milestones = [1, 5, 10, 25, 50, 100];
  const next = milestones.find((m) => m > hours);
  if (!next) return null;
  return { label: `${next}h of study`, progress: hours, target: next };
}

function formatHours(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  return `${m}m`;
}

// ── Main component ─────────────────────────────────────────────────────────────

export function UserActivityDashboard() {
  const [stats, setStats] = useState<UserStudyStats | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [studyStats, userData] = await Promise.all([
        studySessionsApi.getMyStats(),
        api.get('/v1/users/me').then((r) => r.data).catch(() => null),
      ]);
      setStats(studyStats);
      if (userData) {
        setStreak({
          currentStreak: userData.currentStreak ?? 0,
          longestStreak: userData.longestStreak ?? 0,
        });
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const badges = deriveBadges(stats, streak);
  const milestone = deriveNextMilestone(stats);
  const earnedBadges = badges.filter((b) => b.earned);

  if (loading) {
    return <ActivityDashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 dark:border-red-800 p-6 text-center">
        <p className="text-red-600 dark:text-red-400 mb-2">Failed to load activity data.</p>
        <button
          onClick={load}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          My Learning Activity
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Your progress, streaks, and achievements
        </p>
      </div>

      {/* Top stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Study Time"
          value={stats ? formatHours(stats.totalSeconds) : '—'}
          icon="⏱️"
          color="blue"
        />
        <StatCard
          label="This Week"
          value={stats ? formatHours(stats.last7DaysSeconds) : '—'}
          icon="📅"
          color="purple"
        />
        <StatCard
          label="Current Streak"
          value={`${streak?.currentStreak ?? 0} days`}
          icon="🔥"
          color="orange"
        />
        <StatCard
          label="Longest Streak"
          value={`${streak?.longestStreak ?? 0} days`}
          icon="🏆"
          color="green"
        />
      </div>

      {/* Weekly lessons + monthly hours */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            This Week
          </h3>
          <div className="flex items-end gap-3 mt-3">
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats?.thisWeekLessonsCompleted ?? 0}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              lessons viewed
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {stats ? formatHours(stats.last7DaysSeconds) : '—'} of study time
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            This Month
          </h3>
          <div className="flex items-end gap-3 mt-3">
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats ? formatHours(stats.last30DaysSeconds) : '—'}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              of study
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {stats?.sessionCount ?? 0} total sessions recorded
          </div>
        </div>
      </div>

      {/* Next milestone */}
      {milestone && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Next Milestone — {milestone.label}
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min((milestone.progress / milestone.target) * 100, 100)}%`,
                }}
                role="progressbar"
                aria-valuenow={Math.round(milestone.progress)}
                aria-valuemin={0}
                aria-valuemax={milestone.target}
              />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              {Math.round(milestone.progress * 10) / 10}h / {milestone.target}h
            </span>
          </div>
        </div>
      )}

      {/* Badges */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Badges ({earnedBadges.length}/{badges.length} earned)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {badges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: 'blue' | 'purple' | 'orange' | 'green';
}) {
  const colorMap = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  };

  return (
    <div className={`rounded-lg border p-4 ${colorMap[color]}`}>
      <div className="text-2xl mb-1" aria-hidden="true">{icon}</div>
      <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
    </div>
  );
}

function BadgeCard({ badge }: { badge: BadgeInfo }) {
  return (
    <div
      className={`flex flex-col items-center text-center p-3 rounded-lg border transition-opacity ${
        badge.earned
          ? 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-40'
      }`}
      title={badge.description}
      aria-label={`${badge.label}: ${badge.description}${badge.earned ? ' (earned)' : ' (not yet earned)'}`}
    >
      <span className="text-2xl mb-1" aria-hidden="true">{badge.icon}</span>
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-tight">
        {badge.label}
      </span>
    </div>
  );
}

function ActivityDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading activity data">
      <div className="h-7 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-28 rounded-lg bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
      <div className="h-20 rounded-lg bg-gray-200 dark:bg-gray-700" />
      <div className="h-32 rounded-lg bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}
