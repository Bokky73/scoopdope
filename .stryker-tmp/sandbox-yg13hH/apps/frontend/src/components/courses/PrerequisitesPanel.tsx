'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Circle, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';

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

interface Props {
  courseId: string;
}

export function PrerequisitesPanel({ courseId }: Props) {
  const [status, setStatus] = useState<PrerequisiteStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/v1/courses/${courseId}/prerequisites/status`)
      .then(({ data }) => setStatus(data.data ?? data))
      .catch(() => setStatus(null))
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) return <p className="text-sm text-gray-500">Loading prerequisites…</p>;
  if (!status || !status.prerequisites.length) return null;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-4 space-y-3">
      <div className="flex items-center gap-2">
        {status.allSatisfied ? (
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
        )}
        <h3 className="font-semibold text-sm">
          {status.allSatisfied
            ? 'All prerequisites completed'
            : 'Complete these courses before enrolling'}
        </h3>
      </div>

      <ul className="space-y-2">
        {status.prerequisites.map((prereq) => (
          <li key={prereq.courseId} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              {prereq.completed ? (
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-gray-400 shrink-0" />
              )}
              <span
                className={`text-sm truncate ${
                  prereq.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'
                }`}
              >
                {prereq.title}
              </span>
            </div>
            {!prereq.completed && (
              <Link
                href={`/courses/${prereq.courseId}`}
                className="text-xs font-medium text-blue-600 hover:underline whitespace-nowrap"
              >
                {prereq.enrolled ? 'Continue →' : 'View course →'}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
