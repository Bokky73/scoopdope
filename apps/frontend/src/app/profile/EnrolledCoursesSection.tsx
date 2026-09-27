'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import type { ProgressRecord } from './types';

interface CourseInfo {
  id: string;
  title: string;
}

interface EnrolledCoursesSectionProps {
  progress: ProgressRecord[];
  courses: Record<string, CourseInfo>;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}

function CourseProgressCard({
  record,
  courseTitle,
}: {
  record: ProgressRecord;
  courseTitle: string;
}) {
  const isCompleted = record.progressPct >= 100;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-white truncate">{courseTitle}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Last updated {new Date(record.updatedAt).toLocaleDateString()}
          </p>
        </div>
        {isCompleted && (
          <span
            aria-label="Course completed"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 whitespace-nowrap"
          >
            🏆 Completed
          </span>
        )}
      </div>

      {/* Progress bar / completed indicator */}
      <div className="mt-3">
        {isCompleted ? (
          <div className="w-full h-2 rounded-full bg-green-200 dark:bg-green-900">
            <div className="h-full w-full rounded-full bg-green-500" aria-hidden="true" />
          </div>
        ) : (
          <div
            className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700"
            role="progressbar"
            aria-valuenow={record.progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${record.progressPct}% complete`}
          >
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${record.progressPct}%` }}
            />
          </div>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {isCompleted ? '100%' : `${record.progressPct}%`} complete
        </p>
      </div>
    </Card>
  );
}

/**
 * Displays the student's enrolled courses with per-course progress indicators.
 */
export function EnrolledCoursesSection({
  progress,
  courses,
  loading,
  error,
  onRetry,
}: EnrolledCoursesSectionProps) {
  return (
    <section aria-labelledby="enrolled-courses-heading">
      <h2
        id="enrolled-courses-heading"
        className="text-xl font-semibold text-gray-900 dark:text-white mb-4"
      >
        Enrolled Courses
      </h2>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div
          role="alert"
          className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <p className="text-sm text-red-700 dark:text-red-300 mb-2">
            Failed to load your courses.
          </p>
          <button
            onClick={onRetry}
            aria-label="Retry loading enrolled courses"
            className="text-sm text-red-700 dark:text-red-300 underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      ) : progress.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          You haven't enrolled in any courses yet.
        </p>
      ) : (
        <div className="space-y-3">
          {progress.map((record) => {
            const courseTitle =
              courses[record.courseId]?.title ?? `Course ${record.courseId}`;
            return (
              <CourseProgressCard
                key={record.courseId}
                record={record}
                courseTitle={courseTitle}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
