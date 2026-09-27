'use client';

/**
 * Student Dashboard — issue #857
 *
 * Shows:
 *  • Welcome + streak + token balance
 *  • In-progress courses with progress bars & "Continue" links
 *  • Completed courses (separate section) with certificate download links
 *  • Certificate count badge
 *  • Recently accessed courses (sorted by last activity)
 *  • Active bundles & learning paths
 *  • Recommended courses
 *  • Mobile-responsive layout (single-column on small screens)
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { Skeleton } from '@/components/ui/Skeleton';
import { StreakWidget } from '@/components/ui/StreakWidget';
import { TokenBalanceWidget } from '@/components/dashboard/TokenBalanceWidget';
import { BalanceWidget } from '@/components/dashboard/BalanceWidget';
import { CheckCircle2 } from 'lucide-react';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { useOnboardingStore } from '@/store/onboarding.store';
import { UserActivityDashboard } from '@/components/dashboard/UserActivityDashboard';
import BadgeDisplay, { type BadgeProgress } from '@/components/profile/BadgeDisplay';

// ── Types ─────────────────────────────────────────────────────────────────────

interface UserData {
  id: string;
  username: string;
  email: string;
  currentStreak?: number;
  longestStreak?: number;
}

interface ProgressRecord {
  id: string;
  courseId: string;
  progressPct: number;
  /** ISO date of last activity — used for "recently accessed" sort */
  updatedAt?: string;
}

interface CertificateRecord {
  id: string;
  courseId: string;
  issuedAt: string;
  course?: { id: string; title: string };
}

interface CourseData {
  id: string;
  title: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { state } = useAuth();
  const [user, setUser] = useState<UserData | null>(
    state.user
      ? {
          id: state.user.id,
          username: state.user.username,
          email: state.user.email,
          currentStreak: (state.user as any).currentStreak,
          longestStreak: (state.user as any).longestStreak,
        }
      : null,
  );
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [courses, setCourses] = useState<Record<string, CourseData>>({});
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [bundleEnrollments, setBundleEnrollments] = useState<any[]>([]);
  const [pathEnrollments, setPathEnrollments] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [badges, setBadges] = useState<BadgeProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Data fetching ────────────────────────────────────────────────────────

  useEffect(() => {
    async function loadDashboard() {
      try {
        if (!state.token && !state.isLoading) return;

        let currentUser = user;
        if (!currentUser) {
          const { data } = await api.get('/users/me');
          currentUser = {
            id: data.id,
            username: data.username,
            email: data.email,
            currentStreak: data.currentStreak,
            longestStreak: data.longestStreak,
          };
          setUser(currentUser);
        }

        if (!currentUser?.id) throw new Error('User information is missing.');

        const [progressRes, certsRes, bundlesRes, pathsRes, recsRes] =
          await Promise.all([
            api.get(`/users/${currentUser.id}/progress`),
            // Use the certificates endpoint (#874) with user-scoped list
            api
              .get(`/v1/certificates/user/${currentUser.id}`)
              .catch(() => api.get(`/credentials/${currentUser.id}`)),
            api.get('/bundles/user/me'),
            api.get('/learning-paths/user/me'),
            api
              .get('/v1/recommendations?limit=5')
              .catch(() => ({ data: { data: [] } })),
          ]);

        setBundleEnrollments(bundlesRes.data ?? []);
        setPathEnrollments(pathsRes.data ?? []);
        setRecommendations(recsRes.data?.data ?? []);
        setBadges(badgesRes.data ?? []);

        const progressRecords: ProgressRecord[] = (progressRes.data ?? []).map(
          (p: any) => ({
            id: p.id,
            courseId: p.courseId,
            progressPct: p.progressPct ?? 0,
            updatedAt: p.updatedAt ?? p.lastActivityAt ?? undefined,
          }),
        );
        setProgress(progressRecords);

        const certList: CertificateRecord[] = (certsRes.data ?? []).map(
          (c: any) => ({
            id: c.id,
            courseId: c.courseId,
            issuedAt: c.issuedAt ?? c.createdAt ?? '',
            course: c.course ? { id: c.course.id, title: c.course.title } : undefined,
          }),
        );
        setCertificates(
          certList.sort(
            (a, b) =>
              Number(new Date(b.issuedAt)) - Number(new Date(a.issuedAt)),
          ),
        );

        // Fetch course details for progress records
        const courseIds = Array.from(
          new Set(progressRecords.map((p) => p.courseId)),
        );
        const courseMap: Record<string, CourseData> = {};
        await Promise.all(
          courseIds.map(async (courseId) => {
            try {
              const { data } = await api.get(`/courses/${courseId}`);
              const course = data?.data ?? data;
              if (course) courseMap[course.id] = { id: course.id, title: course.title };
            } catch {
              // ignore
            }
          }),
        );
        setCourses(courseMap);
      } catch {
        setError('Unable to load dashboard information. Please refresh.');
      } finally {
        setIsLoading(false);
      }
    }

    if (!state.isLoading) loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isLoading, state.token]);

  // ── Derived data ─────────────────────────────────────────────────────────

  /** All courses the student is enrolled in, enriched with title */
  const enrolledCourses = useMemo(
    () =>
      progress.map((record) => ({
        ...record,
        title: courses[record.courseId]?.title ?? `Course ${record.courseId}`,
      })),
    [progress, courses],
  );

  /** Courses still in progress (< 100%) sorted by most recently accessed */
  const inProgressCourses = useMemo(
    () =>
      enrolledCourses
        .filter((c) => c.progressPct < 100)
        .sort((a, b) => {
          if (!a.updatedAt && !b.updatedAt) return 0;
          if (!a.updatedAt) return 1;
          if (!b.updatedAt) return -1;
          return (
            Number(new Date(b.updatedAt)) - Number(new Date(a.updatedAt))
          );
        }),
    [enrolledCourses],
  );

  /** Completed courses (100%) */
  const completedCourses = useMemo(
    () => enrolledCourses.filter((c) => c.progressPct === 100),
    [enrolledCourses],
  );

  /** Recently accessed = in-progress sorted by last activity, top 3 */
  const recentCourses = useMemo(
    () => inProgressCourses.slice(0, 3),
    [inProgressCourses],
  );

  /** Certificate IDs keyed by courseId for quick lookup */
  const certByCourse = useMemo(
    () =>
      certificates.reduce<Record<string, CertificateRecord>>((acc, cert) => {
        acc[cert.courseId] = cert;
        return acc;
      }, {}),
    [certificates],
  );

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <ProtectedRoute>
      <OnboardingWizard />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

        {/* ── Header ── */}
        <section>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="w-48 h-8" />
              <Skeleton className="w-64 h-5" />
            </div>
          ) : (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Welcome back, {user?.username ?? user?.email ?? 'Student'}!
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
          )}
        </section>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-700 dark:bg-red-900/20">
            {error}
          </div>
        )}

        {/* ── Stats bar — streak + token balance + cert count ── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
              Learning Streak
            </h2>
            <StreakWidget
              currentStreak={user?.currentStreak ?? 0}
              longestStreak={user?.longestStreak ?? 0}
              isLoading={isLoading}
            />
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Stellar Balances
            </h2>
            <BalanceWidget stellarPublicKey={state.user?.stellarPublicKey} />
          </div>

          {/* Certificate count card */}
          <div className="flex items-center gap-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10 p-4">
            <div className="flex-shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-800 p-3">
              <Award className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              {isLoading ? (
                <Skeleton className="w-8 h-7" />
              ) : (
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                  {certificates.length}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {certificates.length === 1 ? 'Certificate' : 'Certificates'} earned
              </p>
              {certificates.length > 0 && (
                <Link
                  href="/certificates"
                  className="mt-1 inline-block text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  View all →
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* ── Recently Accessed ── */}
        {(isLoading || recentCourses.length > 0) && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Recently Accessed
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading
                ? Array.from({ length: 3 }).map((_, idx) => (
                    <Skeleton key={idx} className="h-24 rounded-xl" />
                  ))
                : recentCourses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/courses/${course.courseId}`}
                      className="group flex flex-col justify-between rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10 p-4 hover:shadow-md transition-shadow"
                    >
                      <p className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {course.title}
                      </p>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <span>{course.progressPct}% complete</span>
                          <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                            <PlayCircle className="h-3.5 w-3.5" />
                            Continue
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className="h-full rounded-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${course.progressPct}%` }}
                          />
                        </div>
                      </div>
                    </Link>
                  ))}
            </div>
          </section>
        )}

        {/* ── In-progress Courses ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
              <BookOpen className="h-5 w-5 text-indigo-500" />
              In Progress
            </h2>
            {inProgressCourses.length > 0 && (
              <span className="text-sm text-gray-400 dark:text-gray-500">
                {inProgressCourses.length}{' '}
                {inProgressCourses.length === 1 ? 'course' : 'courses'}
              </span>
            )}
          </div>
          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="space-y-2">
                  <Skeleton className="w-2/5 h-5" />
                  <Skeleton className="w-full h-3" />
                </div>
              ))
            ) : inProgressCourses.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {completedCourses.length > 0
                  ? 'All enrolled courses are complete! 🎉'
                  : 'You haven\'t enrolled in any courses yet.'}
              </p>
            ) : (
              inProgressCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center gap-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4"
                >
                  <CircularProgress
                    value={course.progressPct}
                    size={64}
                    strokeWidth={6}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                      {course.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {course.progressPct}% complete
                    </p>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${course.progressPct}%` }}
                      />
                    </div>
                  </div>
                  <Link
                    href={`/courses/${course.courseId}`}
                    className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-sm font-medium text-white transition-colors"
                    aria-label={`Continue ${course.title}`}
                  >
                    <PlayCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Continue</span>
                  </Link>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ── Completed Courses ── */}
        {(isLoading || completedCourses.length > 0) && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                Completed
              </h2>
              {completedCourses.length > 0 && (
                <span className="text-sm text-gray-400 dark:text-gray-500">
                  {completedCourses.length}{' '}
                  {completedCourses.length === 1 ? 'course' : 'courses'}
                </span>
              )}
            </div>
            <div className="space-y-2">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, idx) => (
                  <Skeleton key={idx} className="w-full h-14 rounded-xl" />
                ))
              ) : (
                completedCourses.map((course) => {
                  const cert = certByCourse[course.courseId];
                  return (
                    <div
                      key={course.id}
                      className="flex items-center gap-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-900/10 px-4 py-3"
                    >
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                      <Link
                        href={`/courses/${course.courseId}`}
                        className="flex-1 min-w-0 font-medium text-gray-800 dark:text-gray-100 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors truncate"
                      >
                        {course.title}
                      </Link>
                      {cert && (
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/v1/certificates/${cert.id}/download`}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-gray-900 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-2.5 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 transition-colors"
                          aria-label={`Download certificate for ${course.title}`}
                        >
                          <Download className="h-3.5 w-3.5" />
                          Certificate
                        </a>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* ── Active Bundles ── */}
        {bundleEnrollments.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Active Bundles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {bundleEnrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-900/10"
                >
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {enrollment.bundle.title}
                  </h3>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {enrollment.bundle.courses.length} Courses
                    </span>
                    {enrollment.completedAt ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Completed
                      </span>
                    ) : (
                      <span className="text-blue-600 font-bold">In Progress</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Learning Paths ── */}
        {pathEnrollments.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Learning Paths
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pathEnrollments.map((enrollment: any) => {
                const lp = enrollment.learningPath;
                const total = lp?.courses?.length ?? 0;
                return (
                  <div
                    key={enrollment.id}
                    className="p-4 rounded-xl border border-purple-100 dark:border-purple-900/30 bg-purple-50/30 dark:bg-purple-900/10"
                  >
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {lp?.title}
                    </h3>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-gray-500">{total} Courses</span>
                      {enrollment.completedAt ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" /> Completed
                        </span>
                      ) : (
                        <span className="text-purple-600 font-bold">
                          In Progress
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Recommended for You ── */}
        {recommendations.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Recommended for You
              </h2>
              <Link
                href="/recommendations"
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendations.map((course: any) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="block rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {course.title}
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="capitalize px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                      {course.level}
                    </span>
                    {course.skills?.slice(0, 2).map((s: string) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  {course.matchReasons?.length > 0 && (
                    <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                      {course.matchReasons[0]}
                    </p>
                  )}
                  {course.averageRating != null && (
                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                      ★ {Number(course.averageRating).toFixed(1)}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Enrolled Courses
          </h2>
          <div className="mt-3 space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="space-y-2">
                  <Skeleton className="w-2/5 h-5" />
                  <Skeleton className="w-full h-3" />
                </div>
              ))
            ) : enrolledCourses.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                You have not enrolled in any courses yet.
              </p>
            ) : (
              enrolledCourses.map((course) => (
                <div
                  key={course.id}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 flex items-center gap-4"
                >
                  <CircularProgress value={course.progressPct} size={72} strokeWidth={7} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">{course.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {course.progressPct === 100 ? '🏆 Completed' : `${course.progressPct}% complete`}
                    </p>
                    <div className="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${course.progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Recent Credentials
          </h2>
          <div className="mt-3 space-y-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton key={idx} className="w-full h-6" />
              ))
            ) : recentCredentials.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                You have not earned any credentials yet.
              </p>
            ) : (
              recentCredentials.map((cred) => (
                <div
                  key={cred.id}
                  className="flex justify-between items-center text-sm text-gray-700 dark:text-gray-300"
                >
                  <span>{cred.course?.title ?? `Course ${cred.courseId}`}</span>
                  <span>{new Date(cred.issuedAt).toLocaleDateString()}</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* #883: User Activity Dashboard */}
        <section>
          <UserActivityDashboard />
        </section>

      </main>
    </ProtectedRoute>
  );
}
