'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ReviewList } from '@/components/reviews/ReviewList';
import { QAPanel } from '@/components/courses/QAPanel';
import { AnnouncementsPanel } from '@/components/courses/AnnouncementsPanel';
import { AssignmentsTab } from '@/components/assignments/AssignmentsTab';
import { WaitlistButton } from '@/components/courses/WaitlistButton';
import { useAuth } from '@/hooks/useAuth';
import { useCompareStore } from '@/store/compare.store';
import api from '@/lib/api';
import { toast } from '@/lib/toast';
import { PlayCircle, Lock, Calendar } from 'lucide-react';

interface CourseDetailPageProps {
  params: { id: string };
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  maxEnrollment: number | null;
  enrollmentCount?: number;
  isPublished: boolean;
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const [tab, setTab] = useState<'overview' | 'curriculum' | 'reviews' | 'qa' | 'announcements' | 'assignments'>('overview');
  const [reviewsKey, setReviewsKey] = useState(0);
  const [modules, setModules] = useState<any[]>([]);
  const [enrolling, setEnrolling] = useState(false);
  const { user } = useAuth();
  const { clear: clearCompare } = useCompareStore();

  const courseId = params.id;
  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await api.post('/v1/enrollments', { courseId });
      clearCompare();
      toast.success('Enrolled successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  useEffect(() => {
    async function fetchCourse() {
      try {
        const { data } = await api.get(`/courses/${courseId}`);
        setCourse(data);
      } catch {
        // course data unavailable
      }
    }

    async function fetchEnrollmentStatus() {
      if (!user) return;
      try {
        const { data } = await api.get(`/users/${user.id}/enrollments`);
        const enrolled = Array.isArray(data)
          ? data.some((e: any) => e.courseId === courseId)
          : false;
        setIsEnrolled(enrolled);
      } catch {
        // not enrolled or unauthenticated
      }
    }

    const fetchModules = async () => {
      try {
        const { data } = await api.get(`/courses/${courseId}/modules`);
        const modulesWithLessons = await Promise.all(
          data.map(async (mod: any) => {
            const lessonsRes = await api.get(`/modules/${mod.id}/lessons`);
            return { ...mod, lessons: lessonsRes.data };
          })
        );
        setModules(modulesWithLessons);
      } catch (error) {
        console.error('Failed to fetch course curriculum:', error);
      }
    };

    fetchCourse();
    fetchEnrollmentStatus();
    fetchModules();
  }, [courseId, user]);

  async function handleEnroll() {
    setEnrolling(true);
    setEnrollError(null);
    try {
      await api.post(`/courses/${courseId}/enroll`);
      setIsEnrolled(true);
    } catch (err: any) {
      const msg: string =
        err?.response?.data?.message ?? 'Enrollment failed. Please try again.';
      setEnrollError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setEnrolling(false);
    }
  }

  return (
    <main className="max-w-4xl mx-auto p-8">
      <Link href="/courses" className="text-blue-600 hover:underline text-sm mb-4 inline-block">
        ← Back to Courses
      </Link>
      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 className="text-3xl font-bold">{course?.title ?? `Course ${courseId}`}</h1>

        {/* Enrollment / Waitlist actions */}
        {user && !isInstructor && (
          <div className="shrink-0 w-48 space-y-2">
            {isEnrolled ? (
              <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 px-4 py-2 text-center">
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Enrolled ✓</p>
              </div>
            ) : isFull ? (
              <WaitlistButton
                courseId={courseId}
                isFull={isFull}
                isEnrolled={isEnrolled}
                onEnrolled={() => setIsEnrolled(true)}
              />
            ) : (
              <div className="space-y-1">
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Enroll in this course"
                >
                  {enrolling ? 'Enrolling…' : 'Enroll Now'}
                </button>
                {enrollError && (
                  <p className="text-xs text-red-600 dark:text-red-400" role="alert">
                    {enrollError}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {course?.description && (
        <p className="text-gray-600 dark:text-gray-400 mb-2">{course.description}</p>
      )}

      {course?.maxEnrollment != null && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          {course.enrollmentCount ?? 0} / {course.maxEnrollment} spots filled
          {isFull && (
            <span className="ml-2 inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-300">
              Full
            </span>
          )}
        </p>
      )}

      <Link href={`/courses/${courseId}/forum`} className="text-blue-600 hover:underline text-sm mb-6 inline-block">
        View Discussion Forum →
      </Link>

      <div className="flex gap-4 border-b mb-6 overflow-x-auto">
        {(['overview', 'curriculum', 'reviews', 'qa', 'announcements', 'assignments'] as const).map((t) => (
          <button
            key={t}
            className={`pb-2 px-1 capitalize text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setTab(t)}
          >
            {t === 'qa' ? 'Q&A' : t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
          <p className="text-gray-600">Course content and details would appear here.</p>
          {!isInstructor && <PrerequisitesPanel courseId={courseId} />}
          {!isInstructor && (
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 font-medium text-sm transition-colors"
            >
              {enrolling ? 'Enrolling…' : 'Enroll Now'}
            </button>
          )}
          <ReviewForm courseId={courseId} onSuccess={() => { setTab('reviews'); setReviewsKey((k) => k + 1); }} />
        </div>
      )}

      {tab === 'curriculum' && (
        <div className="space-y-6">
          {modules.map((mod) => (
            <div key={mod.id} className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{mod.title}</h3>
                {mod.isLocked ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full">
                    <Lock className="w-3 h-3" />
                    {mod.releaseDate
                      ? `Unlocks ${new Date(mod.releaseDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
                      : 'Locked'}
                  </span>
                ) : mod.releaseDate ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                    <Calendar className="w-3 h-3" />
                    Released {new Date(mod.releaseDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                ) : null}
              </div>
              {mod.isLocked ? (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Lock className="w-4 h-4 shrink-0" />
                  This module will be available on{' '}
                  {mod.releaseDate
                    ? new Date(mod.releaseDate).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })
                    : 'a future date'}
                  .
                </div>
              ) : (
                <div className="space-y-2">
                  {mod.lessons?.map((lesson: any) => (
                    <Link
                      key={lesson.id}
                      href={`/courses/${courseId}/lesson/${lesson.id}`}
                      className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg hover:border-blue-500 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <PlayCircle className="w-5 h-5 text-blue-500" />
                        <span className="font-medium">{lesson.title}</span>
                      </div>
                      <span className="text-sm text-gray-500">{lesson.durationMinutes} min</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'reviews' && (
        <ReviewList key={reviewsKey} courseId={courseId} />
      )}

      {tab === 'qa' && (
        <QAPanel
          courseId={courseId}
          isInstructor={isInstructor}
          currentUserId={user?.id}
        />
      )}

      {tab === 'announcements' && (
        <AnnouncementsPanel courseId={courseId} isInstructor={isInstructor} />
      )}

      {tab === 'assignments' && (
        <AssignmentsTab courseId={courseId} />
      )}
    </main>
  );
}
