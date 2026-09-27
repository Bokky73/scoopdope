'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cohortsApi, Cohort } from '@/lib/cohortsApi';
import { useAuth } from '@/hooks/useAuth';

function isActive(cohort: Cohort): boolean {
  const now = Date.now();
  return new Date(cohort.startDate).getTime() <= now && now <= new Date(cohort.endDate).getTime();
}

function ProgressBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div
        className="bg-blue-600 h-2 rounded-full transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function CohortsPage() {
  const { user } = useAuth();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    cohortsApi.getMyCohorts()
      .then(setCohorts)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <main className="max-w-2xl mx-auto p-8 text-center">
        <p className="text-gray-500">Please log in to view your cohorts.</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Cohorts</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Groups you've been assigned to
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 rounded-xl border animate-pulse bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      ) : cohorts.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          You haven't been assigned to any cohorts yet.
        </div>
      ) : (
        <ul className="space-y-4" aria-label="My cohorts">
          {cohorts.map((cohort) => {
            const active = isActive(cohort);
            const progress = cohort.progressPercentage ?? 0;
            return (
              <li key={cohort.id} className="border rounded-xl p-5 bg-white dark:bg-gray-900 dark:border-gray-700 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-gray-900 dark:text-white">{cohort.name}</h2>
                      {active ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Active</span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                          {new Date(cohort.startDate) > new Date() ? 'Upcoming' : 'Ended'}
                        </span>
                      )}
                    </div>
                    {cohort.course && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {cohort.course.title}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/cohorts/${cohort.id}/live-sessions`}
                    className="shrink-0 text-sm text-blue-600 hover:underline"
                  >
                    Live Sessions →
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Start: </span>
                    {new Date(cohort.startDate).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">End: </span>
                    {new Date(cohort.endDate).toLocaleDateString()}
                  </div>
                  {cohort.enrolledAt && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Joined: </span>
                      {new Date(cohort.enrolledAt).toLocaleDateString()}
                    </div>
                  )}
                  {cohort.instructor?.username && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Instructor: </span>
                      {cohort.instructor.username}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Your progress</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <ProgressBar value={progress} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
