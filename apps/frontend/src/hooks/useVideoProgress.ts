'use client';

import { useRef, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { computeProgressPct } from '@/lib/videoProgress';
import { useProgressStore } from '@/store/progress.store';

const DEBOUNCE_INTERVAL_MS = 10_000;
const MAX_RETRIES = 2; // 1 initial + 2 retries = 3 total attempts

interface UseVideoProgressOptions {
  courseId: string;
  lessonId: string;
  onComplete?: () => void;
}

interface UseVideoProgressReturn {
  handleTimeUpdate: (currentTime: number, duration: number) => void;
  handlePause: (currentTime: number, duration: number) => void;
  handleEnded: () => void;
}

/**
 * Tracks video progress and persists it via POST /v1/progress.
 *
 * - Debounces API calls to at most once per 10 seconds during playback.
 * - Flushes immediately on pause and on video end.
 * - Retries failed requests up to MAX_RETRIES times.
 * - Calls onComplete and marks lesson as 100% when video ends.
 * - Updates the Zustand progress store after each successful response.
 */
export function useVideoProgress({
  courseId,
  lessonId,
  onComplete,
}: UseVideoProgressOptions): UseVideoProgressReturn {
  const markLesson = useProgressStore((s) => s.markLesson);

  // Store the latest progress pct so the interval can flush it
  const pendingPctRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);

  /** Send a progress update with exponential-ish retry */
  const sendProgress = useCallback(
    async (progressPct: number, attempt = 0): Promise<void> => {
      try {
        await api.post('/v1/progress', { courseId, lessonId, progressPct });
        markLesson(courseId, lessonId, progressPct >= 100, progressPct);
      } catch {
        if (attempt < MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return sendProgress(progressPct, attempt + 1);
        }
        // Silent failure after MAX_RETRIES
      }
    },
    [courseId, lessonId, markLesson]
  );

  /** Flush the latest pending progress immediately */
  const flush = useCallback(
    (currentTime: number, duration: number) => {
      const pct = computeProgressPct(currentTime, duration);
      if (pct <= 0 || !duration) return;
      pendingPctRef.current = null;
      sendProgress(pct);
    },
    [sendProgress]
  );

  // Start debounce interval while mounted; clear on unmount
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const pct = pendingPctRef.current;
      if (pct !== null) {
        pendingPctRef.current = null;
        sendProgress(pct);
      }
    }, DEBOUNCE_INTERVAL_MS);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [sendProgress]);

  const handleTimeUpdate = useCallback(
    (currentTime: number, duration: number) => {
      if (completedRef.current || !duration) return;
      const pct = computeProgressPct(currentTime, duration);
      pendingPctRef.current = pct;
    },
    []
  );

  const handlePause = useCallback(
    (currentTime: number, duration: number) => {
      flush(currentTime, duration);
    },
    [flush]
  );

  const handleEnded = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    // Flush pending then mark 100%
    pendingPctRef.current = null;
    sendProgress(100).then(() => {
      onComplete?.();
    });
  }, [sendProgress, onComplete]);

  return { handleTimeUpdate, handlePause, handleEnded };
}
