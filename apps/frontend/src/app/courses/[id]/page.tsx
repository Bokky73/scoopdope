'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ReviewList } from '@/components/reviews/ReviewList';
import { QAPanel } from '@/components/courses/QAPanel';
import { AnnouncementsPanel } from '@/components/courses/AnnouncementsPanel';
import { AssignmentsTab } from '@/components/assignments/AssignmentsTab';
import { CourseForumTab } from '@/components/forum/CourseForumTab';
import { WaitlistButton } from '@/components/courses/WaitlistButton';
import { ProgressTracker } from '@/components/courses/ProgressTracker';
import { useAuth } from '@/hooks/useAuth';
import { useCompareStore } from '@/store/compare.store';
import api from '@/lib/api';
import { toast } from '@/lib/toast';
import { PlayCircle, Lock, Calendar, CheckCircle, CheckCircle2, Circle, AlertTriangle } from 'lucide-react';

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

interface Lesson {
  id: string;
  title: string;
  durationMinutes: number;
}

interface CourseModule {
  id: string;
  title: string;
  isLocked?: boolean;
  releaseDate?: string;
  lessons?: Lesson[];
}

interface Prerequisite {
  courseId: string;
  title: string;
  completed: boolean;
  enrolled: boolean;
}

interface PrerequisiteStatus {
  allSatisfied: boolean;
  prerequisites: Prerequisite[];
}

type ModuleProgressMap = Record<string, { completed: boolean; lessonProgress: Record<string, boolean> }>;

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const [tab, setTab] = useState<'overview' | 'curriculum' | 'reviews' | 'qa' | 'announcements' | 'assignments' | 'forum'>('overview');
  const [reviewsKey, setReviewsKey] = useState(0);
  const [course, setCourse] = useState<CourseData | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [enrolling, setEnrolling] = useState(false);
  const [prereqStatus, setPrereqStatus] = useState<PrerequisiteStatus | null>(null);
  const [prereqLoading, setPrereqLoading] = useState(true);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgressMap>({});
  const { user } = useAuth();
  const { clear: clearCompare } = useCompareStore();

  const hasUnmetPrereqs = prereqStatus !== null && !prereqStatus.allSatisfied && prereqStatus.prerequisites.length > 0;

  const courseId = params.id;
  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';

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
          ? data.some((e: { courseId: string }) => e.courseId === courseId)
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
          data.map(async (mod: CourseModule) => {
            const lessonsRes = await api.get(`/modules/${mod.id}/lessons`);
            return { ...mod, lessons: lessonsRes.data };
          })
        );
        setModules(modulesWithLessons);
        // Pass fresh module data to progress fetch — avoids stale closure
        if (user) await fetchProgress(modulesWithLessons);
      } catch (error) {
        console.error('Failed to fetch course curriculum:', error);
      }
    };

    async function fetchPrerequisites() {
      if (!user) { setPrereqLoading(false); return; }
      try {
        const { data } = await api.get(`/v1/courses/${courseId}/prerequisites/status`);
        setPrereqStatus(data.data ?? data);
      } catch {
        setPrereqStatus(null);
      } finally {
        setPrereqLoading(false);
      }
    }

    async function fetchProgress(currentModules: CourseModule[]) {
      if (!user) return;
      try {
        const { data } = await api.get<Array<{ courseId: string; lessonId: string; progressPct: number; completedAt: string | null }>>(`/users/${user.id}/progress`);
        // Filter progress for this course only
        const courseProgress = (data ?? []).filter((p: any) => p.courseId === courseId);

        // Track which lessons are completed
        const completedLessons = new Set(
          courseProgress
            .filter((p: any) => p.progressPct >= 100)
            .map((p: any) => p.lessonId)
        );

        // Build progress map per module from the passed-in module data
        const progressMap: ModuleProgressMap = {};
        currentModules.forEach((mod) => {
          const modLessonIds = (mod.lessons ?? []).map((l) => l.id);
          const lessonProgress: Record<string, boolean> = {};
          let completedCount = 0;
          modLessonIds.forEach((lessonId) => {
            const isCompleted = completedLessons.has(lessonId);
            lessonProgress[lessonId] = isCompleted;
            if (isCompleted) completedCount++;
          });

          progressMap[mod.id] = {
            completed: modLessonIds.length > 0 && completedCount === modLessonIds.length,
            lessonProgress,
          };
        });

        setModuleProgress(progressMap);
      } catch {
        // Progress data unavailable — modules render without checkmarks
      }
    }

    fetchCourse();
    fetchEnrollmentStatus();
    fetchModules();
    fetchPrerequisites();
  }, [courseId, user]);

  async function handleEnroll() {
    setEnrolling(true);
    setEnrollError(null);
    try {
      await api.post(`/courses/${courseId}/enroll`);
      setIsEnrolled(true);
    } catch (err: unknown) {
      const msg: string =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Enrollment failed. Please try again.';
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
              <div className="space-y-2">
                <div className="relative group">
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling || hasUnmetPrereqs}
                    className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Enroll in this course"
                  >
                    {enrolling ? 'Enrolling…' : 'Enroll Now'}
                  </button>
                  {hasUnmetPrereqs && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-lg bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-2 shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10 text-center">
                      Complete all prerequisites before enrolling
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
                    </div>
                  )}
                </div>
                {enrollError && (
                  <p className="text-xs text-red-600 dark:text-red-400" role="alert">
                    {enrollError}
                  </p>
                )}
                {hasUnmetPrereqs && !prereqLoading && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-3 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">Prerequisites required</span>
                    </div>
                    <ul className="space-y-1">
                      {prereqStatus!.prerequisites.map((p) => (
                        <li key={p.courseId} className="flex items-center gap-1.5 text-xs">
                          {p.completed ? (
                            <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400 shrink-0" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          )}
                          {p.completed ? (
                            <span className="line-through text-gray-400 truncate">{p.title}</span>
                          ) : (
                            <Link href={`/courses/${p.courseId}`} className="text-blue-600 hover:underline truncate">
                              {p.title} →
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
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
        {(['overview', 'curriculum', 'reviews', 'qa', 'announcements', 'assignments', 'forum'] as const).map((t) => (
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
            <div className="relative group inline-block">
              <button
                onClick={handleEnroll}
                disabled={enrolling || hasUnmetPrereqs}
                className="rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 font-medium text-sm transition-colors"
              >
                {enrolling ? 'Enrolling…' : 'Enroll Now'}
              </button>
              {hasUnmetPrereqs && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-lg bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-2 shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10 text-center">
                  Complete all prerequisites before enrolling
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
                </div>
              )}
            </div>
          )}
          <ReviewForm courseId={courseId} onSuccess={() => { setTab('reviews'); setReviewsKey((k) => k + 1); }} />
        </div>
      )}

      {tab === 'curriculum' && (
        <div className="space-y-6">
          {/* Progress tracker — shown above the module list for enrolled students */}
          {user && !isInstructor && (
            <ProgressTracker courseId={courseId} />
          )}
          {modules.map((mod) => {
            const modProgress = moduleProgress[mod.id];
            const isModuleCompleted = modProgress?.completed ?? false;

            return (
              <div key={mod.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  {/* Completion checkmark */}
                  {user && !mod.isLocked && (
                    <span
                      aria-hidden={!isModuleCompleted}
                      title={isModuleCompleted ? 'Completed' : undefined}
                    >
                      {isModuleCompleted ? (
                        <CheckCircle2
                          className="w-5 h-5 text-green-500 shrink-0"
                          aria-label="Completed"
                        />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600 shrink-0" />
                      )}
                    </span>
                  )}
                  <h3
                    className={`font-bold text-lg ${
                      isModuleCompleted ? 'text-green-700 dark:text-green-400' : ''
                    }`}
                  >
                    {mod.title}
                  </h3>
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
                    {mod.lessons?.map((lesson: Lesson) => {
                      const isLessonCompleted = modProgress?.lessonProgress[lesson.id] ?? false;
                      return (
                        <Link
                          key={lesson.id}
                          href={`/courses/${courseId}/lesson/${lesson.id}`}
                          className={`flex items-center justify-between p-4 bg-white dark:bg-gray-900 border rounded-lg transition-colors ${
                            isLessonCompleted
                              ? 'border-green-200 dark:border-green-900/50 hover:border-green-400'
                              : 'border-gray-200 dark:border-gray-800 hover:border-blue-500'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {isLessonCompleted ? (
                              <CheckCircle2
                                className="w-5 h-5 text-green-500 shrink-0"
                                aria-label="Completed"
                              />
                            ) : (
                              <PlayCircle className="w-5 h-5 text-blue-500 shrink-0" />
                            )}
                            <span
                              className={`font-medium ${
                                isLessonCompleted
                                  ? 'text-green-700 dark:text-green-400'
                                  : 'text-gray-900 dark:text-gray-100'
                              }`}
                            >
                              {lesson.title}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">{lesson.durationMinutes} min</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
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

      {tab === 'forum' && (
        <CourseForumTab courseId={courseId} />
      )}
    </main>
  );
}
