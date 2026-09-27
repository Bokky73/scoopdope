'use client';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Trophy,
  BookOpen,
  Clock,
  Star,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  fetchCourseProgress,
  type CourseProgressPayload,
  type ModuleProgress,
} from '@/lib/progressApi';
import { Card } from '@/components/ui/Card';

// ── Props ─────────────────────────────────────────────────────────────────────

export interface ProgressTrackerProps {
  courseId: string;
  /** Compact variant for sidebar/panel use; default false = full layout */
  compact?: boolean;
  className?: string;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

const ProgressTrackerSkeleton = memo(function ProgressTrackerSkeleton({
  compact,
}: {
  compact: boolean;
}) {
  return (
    <div
      className="animate-pulse space-y-4"
      aria-busy="true"
      aria-label="Loading progress"
      role="status"
    >
      <span className="sr-only">Loading progress tracker…</span>

      {/* Overall card */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Module rows */}
      {Array.from({ length: compact ? 2 : 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-10 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
      ))}
    </div>
  );
});

// ── Animated progress bar ─────────────────────────────────────────────────────
// Uses a CSS transition triggered by mounting: the bar starts at width 0 and
// transitions to the target value after the first paint. No Framer Motion
// needed — matches the existing ProgressBar/CircularProgress pattern.

interface AnimatedBarProps {
  value: number;
  colorClass?: string;
  heightClass?: string;
  /** Delay in ms before animation starts (staggers module bars) */
  delay?: number;
}

const AnimatedBar = memo(function AnimatedBar({
  value,
  colorClass = 'bg-blue-500',
  heightClass = 'h-2',
  delay = 0,
}: AnimatedBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => setWidth(clamped), delay + 50);
    return () => clearTimeout(id);
  }, [clamped, delay]);

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`w-full ${heightClass} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden`}
    >
      <div
        className={`${heightClass} ${colorClass} rounded-full transition-[width] duration-700 ease-out`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
});

// ── Animated circular progress ────────────────────────────────────────────────

interface AnimatedRingProps {
  value: number;
  size: number;
  strokeWidth: number;
}

const AnimatedRing = memo(function AnimatedRing({ value, size, strokeWidth }: AnimatedRingProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const id = setTimeout(() => setOffset(circumference - (clamped / 100) * circumference), 80);
    return () => clearTimeout(id);
  }, [clamped, circumference]);

  const colorClass =
    clamped === 100
      ? 'stroke-green-500'
      : clamped >= 99
        ? 'stroke-blue-400'
        : clamped >= 50
          ? 'stroke-blue-500'
          : 'stroke-amber-500';

  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={strokeWidth}
        className="stroke-gray-200 dark:stroke-gray-700"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className={`${colorClass} transition-[stroke-dashoffset] duration-700 ease-out`}
      />
    </svg>
  );
});

// ── Quiz score pill ───────────────────────────────────────────────────────────

const QuizBadge = memo(function QuizBadge({
  score,
  maxScore,
  title,
}: {
  score: number;
  maxScore: number;
  title: string;
}) {
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const colorClass =
    pct >= 80
      ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
      : pct >= 50
        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
        : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}
      title={`${title}: ${score}/${maxScore}`}
    >
      <Star className="w-3 h-3" aria-hidden="true" />
      {pct}%
    </span>
  );
});

// ── Module row ────────────────────────────────────────────────────────────────

interface ModuleRowProps {
  module: ModuleProgress;
  index: number;
  compact: boolean;
}

function areQuizScoresEqual(
  previous: ModuleProgress['quizScores'],
  next: ModuleProgress['quizScores']
) {
  if (previous === next) return true;
  if (previous.length !== next.length) return false;

  return previous.every((quiz, index) => {
    const nextQuiz = next[index];
    return (
      quiz.quizId === nextQuiz.quizId &&
      quiz.score === nextQuiz.score &&
      quiz.maxScore === nextQuiz.maxScore &&
      quiz.title === nextQuiz.title
    );
  });
}

function areLessonsEqual(previous: ModuleProgress['lessons'], next: ModuleProgress['lessons']) {
  if (previous === next) return true;
  if (previous.length !== next.length) return false;

  return previous.every((lesson, index) => {
    const nextLesson = next[index];
    return (
      lesson.lessonId === nextLesson.lessonId &&
      lesson.completed === nextLesson.completed &&
      lesson.completedAt === nextLesson.completedAt &&
      lesson.title === nextLesson.title
    );
  });
}

const ModuleRow = memo(
  function ModuleRow({ module, index, compact }: ModuleRowProps) {
    const [open, setOpen] = useState(false);
    const completedCount = useMemo(
      () => module.lessons.filter((lesson) => lesson.completed).length,
      [module.lessons]
    );
    const total = module.lessons.length;

    const barColor = useMemo(() => {
      if (module.progressPct === 100) return 'bg-green-500';
      if (module.progressPct > 0) return 'bg-blue-500';
      return 'bg-gray-300 dark:bg-gray-600';
    }, [module.progressPct]);

    const handleToggle = useCallback(() => {
      setOpen((value) => !value);
    }, []);

    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        {/* Module header — always visible */}
        <button
          className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
          onClick={handleToggle}
          aria-expanded={open}
          aria-controls={`module-lessons-${module.moduleId}`}
        >
          {/* Completion icon */}
          <span className="shrink-0" aria-hidden="true">
            {module.progressPct === 100 ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            )}
          </span>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-medium text-sm text-gray-800 dark:text-gray-100 truncate">
                {module.title}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                {/* Quiz score pills */}
                {module.quizScores.map((q) => (
                  <QuizBadge key={q.quizId} score={q.score} maxScore={q.maxScore} title={q.title} />
                ))}
                <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                  {completedCount}/{total}
                </span>
                {open ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" aria-hidden="true" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" aria-hidden="true" />
                )}
              </div>
            </div>

            {/* Progress bar — staggered by module index */}
            <div className="mt-2">
              <AnimatedBar value={module.progressPct} colorClass={barColor} delay={index * 80} />
            </div>
          </div>
        </button>

        {/* Lesson list — collapsible */}
        {!compact && open && (
          <ul
            id={`module-lessons-${module.moduleId}`}
            className="border-t border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700"
            aria-label={`Lessons in ${module.title}`}
          >
            {module.lessons.map((lesson) => (
              <li key={lesson.lessonId} className="flex items-center gap-3 px-4 py-3">
                {lesson.completed ? (
                  <CheckCircle2
                    className="w-4 h-4 text-green-500 shrink-0"
                    aria-label="Completed"
                  />
                ) : (
                  <Circle
                    className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0"
                    aria-label="Not completed"
                  />
                )}
                <span
                  className={`text-sm ${
                    lesson.completed
                      ? 'text-gray-500 dark:text-gray-400 line-through'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {lesson.title}
                </span>
                {lesson.completedAt && (
                  <span className="ml-auto text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {new Date(lesson.completedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  },
  (previous, next) => {
    const previousModule = previous.module;
    const nextModule = next.module;

    return (
      previous.index === next.index &&
      previous.compact === next.compact &&
      previousModule.moduleId === nextModule.moduleId &&
      previousModule.title === nextModule.title &&
      previousModule.progressPct === nextModule.progressPct &&
      areQuizScoresEqual(previousModule.quizScores, nextModule.quizScores) &&
      areLessonsEqual(previousModule.lessons, nextModule.lessons)
    );
  }
);

// ── Time remaining formatting ─────────────────────────────────────────────────

function formatTimeRemaining(estimate: CourseProgressPayload['estimatedCompletionTime']) {
  if (!estimate || estimate.remainingLessons === 0) return null;

  const hours = Math.floor(estimate.remainingMinutes / 60);
  const minutes = estimate.remainingMinutes % 60;
  const duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  if (estimate.estimatedDaysRemaining == null) {
    return `~${duration} left`;
  }

  const days = estimate.estimatedDaysRemaining;
  return `~${duration} left · ~${days} ${days === 1 ? 'day' : 'days'} at your pace`;
}

// ── Overall summary card ──────────────────────────────────────────────────────

const OverallCard = memo(function OverallCard({ data }: { data: CourseProgressPayload }) {
  const pct = Math.round(data.overallProgressPct);
  const timeRemainingLabel = formatTimeRemaining(data.estimatedCompletionTime);

  const statusLabel =
    pct === 100
      ? 'Course complete!'
      : pct >= 99 && data.overallProgressPct < 100
        ? 'Almost done!'
        : pct === 0
          ? 'Not started yet'
          : `${data.completedLessons} of ${data.totalLessons} lessons done`;

  const ringColor =
    pct === 100 ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400';

  return (
    <Card className="p-5 border border-gray-200 dark:border-gray-700 shadow-none">
      <div className="flex items-center gap-5">
        {/* Animated ring */}
        <div className="relative shrink-0 flex items-center justify-center">
          <AnimatedRing value={pct} size={72} strokeWidth={7} />
          {/* Centred percentage label — rotated back upright */}
          <span
            className={`absolute text-base font-black tabular-nums ${ringColor}`}
            aria-label={`${pct}% complete`}
          >
            {pct}%
          </span>
        </div>

        {/* Text summary */}
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Overall Progress
          </p>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight">
            {pct === 100 ? (
              <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                <Trophy className="w-4 h-4" aria-hidden="true" />
                {statusLabel}
              </span>
            ) : pct >= 99 && data.overallProgressPct < 100 ? (
              <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <Star className="w-4 h-4" aria-hidden="true" />
                {statusLabel}
              </span>
            ) : (
              statusLabel
            )}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" aria-hidden="true" />
              {data.totalLessons} lessons
            </span>
            {data.lastActivityAt && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" aria-hidden="true" />
                Last activity{' '}
                {new Date(data.lastActivityAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            )}
            {timeRemainingLabel && (
              <span className="flex items-center gap-1" data-testid="time-remaining">
                <Clock className="w-3 h-3" aria-hidden="true" />
                {timeRemainingLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Full-width bar underneath */}
      <div className="mt-4">
        <AnimatedBar
          value={pct}
          colorClass={pct === 100 ? 'bg-green-500' : pct >= 99 && data.overallProgressPct < 100 ? 'bg-blue-400' : 'bg-blue-500'}
          heightClass="h-2.5"
        />
      </div>
    </Card>
  );
});

// ── Error state ───────────────────────────────────────────────────────────────

const ErrorState = memo(function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-4 text-sm space-y-2">
      <p className="font-medium text-amber-700 dark:text-amber-300">
        Could not load progress data.
      </p>
      <p className="text-amber-600 dark:text-amber-400 text-xs">
        This may be a temporary network issue. Your progress is saved and will appear shortly.
      </p>
      <button
        onClick={onRetry}
        className="text-xs font-medium text-blue-600 dark:text-blue-400 underline hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
      >
        Retry
      </button>
    </div>
  );
});

// ── Main component ────────────────────────────────────────────────────────────

/**
 * ProgressTracker — displays overall course completion, per-module progress
 * bars, lesson completion lists, and quiz score badges.
 *
 * @example
 * // Full layout (course detail sidebar or dedicated progress tab)
 * <ProgressTracker courseId={courseId} />
 *
 * @example
 * // Compact variant for lesson page sidebar
 * <ProgressTracker courseId={courseId} compact />
 */
export function ProgressTracker({
  courseId,
  compact = false,
  className = '',
}: ProgressTrackerProps) {
  const { user } = useAuth();
  const progressKey = useMemo<[string, string, string] | null>(
    () => (user?.id ? ['course-progress', courseId, user.id] : null),
    [courseId, user?.id]
  );
  const progressFetcher = useCallback(
    ([, cid, uid]: [string, string, string]) => fetchCourseProgress(cid, uid),
    []
  );

  const { data, error, isLoading, mutate } = useSWR<CourseProgressPayload>(
    progressKey,
    progressFetcher,
    {
      // Keep stale data visible while refreshing — no skeleton flash
      keepPreviousData: true,
      // Progress doesn't need aggressive polling; refresh on focus is enough
      revalidateOnFocus: true,
      shouldRetryOnError: false,
    }
  );
  const handleRetry = useCallback(() => {
    void mutate();
  }, [mutate]);

  if (!user) return null;

  if (isLoading && !data) {
    return <ProgressTrackerSkeleton compact={compact} />;
  }

  if (error && !data) {
    return <ErrorState onRetry={handleRetry} />;
  }

  if (!data) return null;

  return (
    <div className={`space-y-3 ${className}`} aria-label={`Progress for ${data.courseTitle}`}>
      {/* Overall summary */}
      <OverallCard data={data} />

      {/* Module list */}
      {data.modules.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-1">
            Modules
          </h3>
          {data.modules.map((mod, i) => (
            <ModuleRow key={mod.moduleId} module={mod} index={i} compact={compact} />
          ))}
        </div>
      )}

      {/* Stale data warning shown during a failed background refresh */}
      {error && data && (
        <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
          Showing cached progress —{' '}
          <button onClick={handleRetry} className="underline hover:no-underline focus:outline-none">
            retry
          </button>
        </p>
      )}
    </div>
  );
}
