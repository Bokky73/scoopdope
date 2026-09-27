'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

// ─── Types ─────────────────────────────────────────────────────────────────

interface CourseAssignment {
  id: string;
  courseId: string;
  assignedAt: string;
  course: {
    id: string;
    title: string;
    status: string;
    level: string;
    thumbnailUrl: string | null;
  };
}

interface CourseAnalytics {
  courseId: string;
  totalEnrollments: number;
  totalCompletions: number;
  completionRate: number;
  averageRating: number;
  totalReviews: number;
  averageProgressPct: number;
  activeLearnersLast30Days: number;
}

interface StudentProgress {
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  progressPct: number;
}

interface EnrichedCourse {
  id: string;
  title: string;
  status: string;
  level: string;
  thumbnailUrl: string | null;
  enrollments: number;
  completionRate: number;
  rating: number;
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div
      className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5"
      role="group"
      aria-label={label}
    >
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

function CompletionBar({ pct }: { pct: number }) {
  return (
    <div className="flex items-center gap-2 min-w-[90px]">
      <div
        className="h-2 w-16 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${pct}% complete`}
      >
        <div
          className="h-full rounded-full bg-green-500 transition-all duration-300"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-300 tabular-nums">{pct}%</span>
    </div>
  );
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr aria-hidden="true">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────────

export default function InstructorDashboardPage() {
  const { state } = useAuth();
  const router = useRouter();

  const [courses, setCourses] = useState<EnrichedCourse[]>([]);
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  // ── Role guard ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (state.isLoading) return;

    // Unauthenticated → login
    if (!state.token) {
      router.replace('/auth/login');
      return;
    }

    // Wrong role → home
    if (state.user?.role !== 'instructor' && state.user?.role !== 'admin') {
      router.replace('/');
    }
  }, [state.isLoading, state.token, state.user?.role, router]);

  // ── Data fetching ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!state.user?.id || (state.user.role !== 'instructor' && state.user.role !== 'admin')) {
      return;
    }

    async function load() {
      setIsLoading(true);
      try {
        // Fetch courses assigned to this instructor
        const assignmentsRes = await api.get<CourseAssignment[]>(
          `/v1/instructors/${state.user!.id}/courses`,
        );
        const assignments: CourseAssignment[] = assignmentsRes.data ?? [];

        if (assignments.length === 0) {
          setCourses([]);
          setIsLoading(false);
          return;
        }

        // Fetch analytics for each course in parallel
        const analyticsResults = await Promise.allSettled(
          assignments.map((a) => api.get<CourseAnalytics>(`/v1/courses/${a.courseId}/analytics`)),
        );

        const enriched: EnrichedCourse[] = assignments.map((a, i) => {
          const analyticsSettled = analyticsResults[i];
          const analytics: Partial<CourseAnalytics> =
            analyticsSettled.status === 'fulfilled'
              ? analyticsSettled.value.data
              : {};

          return {
            id: a.courseId,
            title: a.course?.title ?? 'Untitled Course',
            status: a.course?.status ?? 'draft',
            level: a.course?.level ?? 'beginner',
            thumbnailUrl: a.course?.thumbnailUrl ?? null,
            enrollments: analytics.totalEnrollments ?? 0,
            completionRate: Math.round(analytics.completionRate ?? 0),
            rating: analytics.averageRating ?? 0,
          };
        });

        setCourses(enriched);

        // Fetch student progress — gracefully degraded if endpoint not available
        try {
          const progressRes = await api.get<StudentProgress[]>(
            '/v1/instructor/students/progress',
          );
          setStudentProgress(progressRes.data ?? []);
        } catch {
          setStudentProgress([]);
        }
      } catch {
        // Show empty state on error rather than crashing
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [state.user?.id, state.user?.role]);

  // ── Derived stats ───────────────────────────────────────────────────────
  const totalEnrollments = useMemo(
    () => courses.reduce((s, c) => s + c.enrollments, 0),
    [courses],
  );
  const avgCompletionRate = useMemo(() => {
    if (courses.length === 0) return 0;
    return Math.round(courses.reduce((s, c) => s + c.completionRate, 0) / courses.length);
  }, [courses]);

  // ── Course filter ───────────────────────────────────────────────────────
  const filteredProgress = useMemo(
    () =>
      selectedCourseId
        ? studentProgress.filter((sp) => sp.courseId === selectedCourseId)
        : studentProgress,
    [studentProgress, selectedCourseId],
  );

  const filteredCourses = useMemo(
    () => (selectedCourseId ? courses.filter((c) => c.id === selectedCourseId) : courses),
    [courses, selectedCourseId],
  );

  // ── Loading / redirect guards ───────────────────────────────────────────
  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" aria-live="polite">
        <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!state.user || (state.user.role !== 'instructor' && state.user.role !== 'admin')) {
    return null; // router.replace in progress
  }

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Instructor Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Welcome back, {state.user.username ?? state.user.email}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/instructor/courses/new"
            className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            + New Course
          </Link>
          <Link
            href="/instructor/revenue"
            className="rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Revenue Analytics
          </Link>
        </div>
      </div>

      {/* ── Summary stats ──────────────────────────────────────────────── */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">
          Summary Statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Courses" value={isLoading ? '…' : courses.length} />
          <StatCard
            label="Total Enrollments"
            value={isLoading ? '…' : totalEnrollments.toLocaleString()}
          />
          <StatCard
            label="Avg Completion"
            value={isLoading ? '…' : `${avgCompletionRate}%`}
            sub="across all courses"
          />
          <StatCard
            label="Active Learners"
            value={isLoading ? '…' : studentProgress.length.toLocaleString()}
            sub="with recorded progress"
          />
        </div>
      </section>

      {/* ── Course filter ───────────────────────────────────────────────── */}
      {courses.length > 0 && (
        <div className="flex items-center gap-3">
          <label
            htmlFor="course-filter"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
          >
            Filter by course:
          </label>
          <select
            id="course-filter"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-xs w-full"
          >
            <option value="">All courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          {selectedCourseId && (
            <button
              onClick={() => setSelectedCourseId('')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* ── Course table ─────────────────────────────────────────────────── */}
      <section aria-labelledby="courses-heading">
        <h2
          id="courses-heading"
          className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3"
        >
          {selectedCourseId ? 'Selected Course' : 'Your Courses'}
        </h2>

        {!isLoading && courses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-10 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              You haven&apos;t been assigned to any courses yet.
            </p>
            <Link
              href="/instructor/courses/new"
              className="mt-4 inline-block rounded-lg bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700"
            >
              Create your first course
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm" aria-label="Course performance table">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                <tr>
                  {['Course', 'Status', 'Enrollments', 'Completion', 'Rating', 'Actions'].map(
                    (h) => (
                      <th
                        key={h}
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                {isLoading
                  ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
                  : filteredCourses.map((c) => (
                      <tr
                        key={c.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/courses/${c.id}`}
                            className="font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            {c.title}
                          </Link>
                          <p className="text-xs text-gray-400 capitalize">{c.level}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              c.status === 'published'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : c.status === 'draft'
                                  ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 tabular-nums">
                          {c.enrollments.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <CompletionBar pct={c.completionRate} />
                        </td>
                        <td className="px-4 py-3">
                          {c.rating > 0 ? (
                            <span className="flex items-center gap-1 text-yellow-500">
                              <span aria-hidden="true">★</span>
                              <span className="text-gray-700 dark:text-gray-300 tabular-nums">
                                {c.rating.toFixed(1)}
                              </span>
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">No ratings</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <Link
                              href={`/instructor/courses/${c.id}/edit`}
                              className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-medium"
                            >
                              Edit
                            </Link>
                            <Link
                              href={`/courses/${c.id}/forum`}
                              className="text-gray-500 dark:text-gray-400 hover:underline text-xs"
                            >
                              Forum
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Student Progress ─────────────────────────────────────────────── */}
      {(isLoading || studentProgress.length > 0) && (
        <section aria-labelledby="progress-heading">
          <h2
            id="progress-heading"
            className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3"
          >
            Student Progress
            {selectedCourseId && courses.find((c) => c.id === selectedCourseId) && (
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                — {courses.find((c) => c.id === selectedCourseId)?.title}
              </span>
            )}
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
                  aria-hidden="true"
                />
              ))}
            </div>
          ) : filteredProgress.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedCourseId
                ? 'No student progress data for this course yet.'
                : 'No student progress data available yet.'}
            </p>
          ) : (
            <div className="space-y-2">
              {filteredProgress.map((sp) => (
                <div
                  key={`${sp.studentId}-${sp.courseId}`}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {sp.studentName}
                    </p>
                    {!selectedCourseId && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {sp.courseTitle}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 sm:w-48">
                    <div
                      className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden"
                      role="progressbar"
                      aria-valuenow={sp.progressPct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${sp.studentName} progress: ${sp.progressPct}%`}
                    >
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${sp.progressPct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right tabular-nums">
                      {sp.progressPct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
