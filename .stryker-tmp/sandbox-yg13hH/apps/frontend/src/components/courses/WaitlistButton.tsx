'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

interface WaitlistStatus {
  position: number | null;
  total: number;
}

interface WaitlistButtonProps {
  courseId: string;
  /** Whether the course is currently full (maxEnrollment reached) */
  isFull: boolean;
  /** Whether the current user is already enrolled */
  isEnrolled: boolean;
  /** Called after a successful enroll action (from waitlist promotion) */
  onEnrolled?: () => void;
}

export function WaitlistButton({ courseId, isFull, isEnrolled, onEnrolled }: WaitlistButtonProps) {
  const [status, setStatus] = useState<WaitlistStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const { data } = await api.get<WaitlistStatus>(`/courses/${courseId}/waitlist/position`);
      setStatus(data);
    } catch {
      setStatus({ position: null, total: 0 });
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (!isEnrolled) {
      fetchStatus();
    } else {
      setLoading(false);
    }
  }, [isEnrolled, fetchStatus]);

  async function handleJoin() {
    setActionLoading(true);
    setError(null);
    try {
      await api.post(`/courses/${courseId}/waitlist`);
      await fetchStatus();
    } catch (err: any) {
      const msg: string =
        err?.response?.data?.message ?? 'Failed to join waitlist. Please try again.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleLeave() {
    setActionLoading(true);
    setError(null);
    try {
      await api.delete(`/courses/${courseId}/waitlist`);
      setStatus({ position: null, total: Math.max(0, (status?.total ?? 1) - 1) });
    } catch (err: any) {
      const msg: string =
        err?.response?.data?.message ?? 'Failed to leave waitlist. Please try again.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setActionLoading(false);
    }
  }

  if (isEnrolled) return null;
  if (!isFull) return null;
  if (loading) {
    return (
      <div className="h-10 w-40 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
    );
  }

  const onWaitlist = status?.position !== null && status?.position !== undefined;

  return (
    <div className="space-y-2">
      {onWaitlist ? (
        <div className="space-y-2">
          <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-3">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              You're on the waitlist
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              Position <strong>#{status!.position}</strong> of {status!.total} — we'll enroll you automatically when a spot opens.
            </p>
          </div>
          <button
            onClick={handleLeave}
            disabled={actionLoading}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Leave the waitlist for this course"
          >
            {actionLoading ? 'Leaving…' : 'Leave Waitlist'}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Course is full
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {status && status.total > 0
                ? `${status.total} student${status.total === 1 ? '' : 's'} ahead of you`
                : 'Join the waitlist to be notified when a spot opens.'}
            </p>
          </div>
          <button
            onClick={handleJoin}
            disabled={actionLoading}
            className="w-full rounded-lg bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Join the waitlist for this course"
          >
            {actionLoading ? 'Joining…' : 'Join Waitlist'}
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
