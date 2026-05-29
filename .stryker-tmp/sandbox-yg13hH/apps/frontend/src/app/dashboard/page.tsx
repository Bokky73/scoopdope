'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { StreakWidget } from '@/components/ui/StreakWidget';
import { CheckCircle2 } from 'lucide-react';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { useOnboardingStore } from '@/store/onboarding.store';

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
}

interface CredentialRecord {
  id: string;
  courseId: string;
  issuedAt: string;
  course?: { id: string; title: string };
}

interface CourseData {
  id: string;
  title: string;
}

function SkeletonItem({ width = 'w-full', height = 'h-6' }: { width?: string; height?: string }) {
  return (
    <div className={`bg-gray-200 dark:bg-gray-700 rounded ${width} ${height} animate-pulse`} />
  );
}

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
      : null
  );
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [courses, setCourses] = useState<Record<string, CourseData>>({});
  const [credentials, setCredentials] = useState<CredentialRecord[]>([]);
  const [bundleEnrollments, setBundleEnrollments] = useState<any[]>([]);
  const [pathEnrollments, setPathEnrollments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        if (!state.token && !state.isLoading) {
          // ProtectedRoute will handle redirect; do not fetch yet.
          return;
        }

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

        if (!currentUser?.id) {
          throw new Error('User information is missing.');
        }

        const [balanceRes, progressRes, credRes, bundlesRes, pathsRes] = await Promise.all([
          api.get(`/users/${currentUser.id}/token-balance`),
          api.get(`/users/${currentUser.id}/progress`),
          api.get(`/credentials/${currentUser.id}`),
          api.get('/bundles/user/me'),
          api.get('/learning-paths/user/me'),
        ]);

        setTokenBalance(Number(balanceRes.data.balance ?? 0));
        setBundleEnrollments(bundlesRes.data ?? []);
        setPathEnrollments(pathsRes.data ?? []);

        const progressRecords: ProgressRecord[] = (progressRes.data ?? []).map((p: any) => ({
          id: p.id,
          courseId: p.courseId,
          progressPct: p.progressPct ?? 0,
        }));

        setProgress(progressRecords);

        const credentialsList: CredentialRecord[] = (credRes.data ?? []).map((c: any) => ({
          id: c.id,
          courseId: c.courseId,
          issuedAt: c.issuedAt ?? c.createdAt ?? '',
          course: c.course ? { id: c.course.id, title: c.course.title } : undefined,
        }));

        setCredentials(
          credentialsList.sort(
            (a, b) => Number(new Date(b.issuedAt)) - Number(new Date(a.issuedAt))
          )
        );

        const courseIds = Array.from(new Set(progressRecords.map((p) => p.courseId)));
        const courseMap: Record<string, CourseData> = {};

        await Promise.all(
          courseIds.map(async (courseId) => {
            try {
              const { data } = await api.get(`/courses/${courseId}`);
              const course = data?.data ?? data;
              if (course) {
                courseMap[course.id] = { id: course.id, title: course.title };
              }
            } catch {
              // ignore missing course details
            }
          })
        );

        setCourses(courseMap);
      } catch (err) {
        setError('Unable to load dashboard information. Please refresh.');
      } finally {
        setIsLoading(false);
      }
    }

    if (!state.isLoading) loadDashboard();
  }, [state.isLoading, state.token, user]);

  const enrolledCourses = useMemo(() => {
    return progress.map((record) => ({
      ...record,
      title: courses[record.courseId]?.title ?? `Course ${record.courseId}`,
    }));
  }, [progress, courses]);

  const recentCredentials = useMemo(() => {
    return credentials.slice(0, 5);
  }, [credentials]);

  return (
    <ProtectedRoute>
      <OnboardingWizard />
      <main className="max-w-5xl mx-auto p-8 space-y-8">
        <section>
          {isLoading ? (
            <div className="space-y-2">
              <SkeletonItem width="w-48" height="h-8" />
              <SkeletonItem width="w-64" height="h-5" />
            </div>
          ) : (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Welcome back, {user?.username ?? user?.email ?? 'Student'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
          )}
        </section>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-700 dark:bg-red-900/20">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
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
              BST Token Balance
            </h2>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 h-[116px] flex items-center">
              {isLoading ? (
                <SkeletonItem width="w-32" height="h-7" />
              ) : (
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {tokenBalance ?? 0} BST
                </p>
              )}
            </div>
          </div>
        </section>

        {bundleEnrollments.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Active Bundles
            </h2>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              {bundleEnrollments.map((enrollment) => (
                <div key={enrollment.id} className="p-4 rounded-lg border border-blue-100 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-900/10">
                  <h3 className="font-bold text-gray-900 dark:text-white">{enrollment.bundle.title}</h3>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-gray-500">{enrollment.bundle.courses.length} Courses</span>
                    {enrollment.completedAt ? (
                      <span className="text-green-600 font-bold flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Completed
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

        {pathEnrollments.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Learning Paths
            </h2>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              {pathEnrollments.map((enrollment: any) => {
                const lp = enrollment.learningPath;
                const total = lp?.courses?.length ?? 0;
                return (
                  <div
                    key={enrollment.id}
                    className="p-4 rounded-lg border border-purple-100 dark:border-purple-900/30 bg-purple-50/30 dark:bg-purple-900/10"
                  >
                    <h3 className="font-bold text-gray-900 dark:text-white">{lp?.title}</h3>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-gray-500">{total} Courses</span>
                      {enrollment.completedAt ? (
                        <span className="text-green-600 font-bold flex items-center">
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Completed
                        </span>
                      ) : (
                        <span className="text-purple-600 font-bold">In Progress</span>
                      )}
                    </div>
                  </div>
                );
              })}
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
                  <SkeletonItem width="w-2/5" height="h-5" />
                  <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
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
                <SkeletonItem key={idx} width="w-full" height="h-6" />
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
      </main>
    </ProtectedRoute>
  );
}
