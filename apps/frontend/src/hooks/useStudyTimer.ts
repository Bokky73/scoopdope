'use client';

import { useEffect, useRef, useCallback } from 'react';
import { studySessionsApi } from '@/lib/studySessionsApi';

interface UseStudyTimerOptions {
  courseId?: string;
  lessonId?: string;
  /** Whether the timer should be active. Pass false to pause. */
  active?: boolean;
}

/**
 * Tracks study time for a lesson/course.
 *
 * - Starts counting when `active` is true.
 * - Pauses automatically on browser tab switch (visibilitychange).
 * - Saves the accumulated time to the backend when the component unmounts,
 *   the session reaches 60 seconds, or the page unloads.
 * - Anti-fraud: a single flush is capped at 3600 s (enforced server-side too).
 *
 * Usage:
 *   useStudyTimer({ courseId, lessonId, active: isWatching });
 */
export function useStudyTimer({
  courseId,
  lessonId,
  active = true,
}: UseStudyTimerOptions): void {
  const startRef = useRef<number | null>(null);
  const accumulatedRef = useRef<number>(0); // seconds accumulated before current interval
  const isActiveRef = useRef<boolean>(false);

  /** Flush accumulated seconds to the backend and reset. */
  const flush = useCallback(async () => {
    // Capture elapsed time since last start
    if (startRef.current !== null) {
      const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
      accumulatedRef.current += elapsed;
      startRef.current = null;
    }

    const seconds = accumulatedRef.current;
    if (seconds < 1) return;

    accumulatedRef.current = 0;

    try {
      await studySessionsApi.record(courseId, lessonId, Math.min(seconds, 3600));
    } catch {
      // Silently ignore — not critical for UX
    }
  }, [courseId, lessonId]);

  /** Start the interval timer. */
  const startTimer = useCallback(() => {
    if (startRef.current === null) {
      startRef.current = Date.now();
    }
    isActiveRef.current = true;
  }, []);

  /** Pause the timer (does not flush). */
  const pauseTimer = useCallback(() => {
    if (startRef.current !== null) {
      const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
      accumulatedRef.current += elapsed;
      startRef.current = null;
    }
    isActiveRef.current = false;
  }, []);

  // React to `active` prop changes
  useEffect(() => {
    if (active) {
      startTimer();
    } else {
      pauseTimer();
    }
  }, [active, startTimer, pauseTimer]);

  // Pause when the tab is hidden (browser tab switch)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        pauseTimer();
        // Eagerly flush so data isn't lost on tab close
        flush();
      } else if (document.visibilityState === 'visible' && active) {
        startTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [active, pauseTimer, startTimer, flush]);

  // Flush on page unload (beforeunload / pagehide)
  useEffect(() => {
    const handleUnload = () => {
      pauseTimer();
      // Use sendBeacon for reliability during page close
      if (accumulatedRef.current >= 1 && typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const apiBase =
          process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
        const payload = JSON.stringify({
          courseId,
          lessonId,
          durationSeconds: Math.min(accumulatedRef.current, 3600),
        });
        // sendBeacon fires even after the page begins unloading
        navigator.sendBeacon(
          `${apiBase}/v1/study-sessions`,
          new Blob([payload], { type: 'application/json' }),
        );
        accumulatedRef.current = 0;
      }
    };

    window.addEventListener('pagehide', handleUnload);
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('pagehide', handleUnload);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [courseId, lessonId, pauseTimer]);

  // Auto-flush every 60 s so we don't lose long sessions if the tab stays open
  useEffect(() => {
    const interval = setInterval(() => {
      if (isActiveRef.current) {
        flush();
        // Restart the timer immediately after flush
        startRef.current = Date.now();
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [flush]);

  // Flush on unmount (component removed from DOM)
  useEffect(() => {
    return () => {
      pauseTimer();
      flush();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
