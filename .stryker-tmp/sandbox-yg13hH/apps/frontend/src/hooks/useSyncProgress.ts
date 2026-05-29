'use client';

import { useEffect, useCallback } from 'react';
import api from '@/lib/api';

interface PendingProgress {
  courseId: string;
  lessonId: string;
  progressPct: number;
  timestamp: number;
}

const STORAGE_KEY = 'pending_progress_updates';

export function useSyncProgress() {
  const getPending = useCallback((): PendingProgress[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }, []);

  const savePending = useCallback((updates: PendingProgress[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updates));
  }, []);

  const sync = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.onLine) return;

    const pending = getPending();
    if (pending.length === 0) return;

    console.log(`Syncing ${pending.length} progress updates...`);
    
    const remaining: PendingProgress[] = [];
    
    for (const update of pending) {
      try {
        await api.post('/v1/progress', {
          courseId: update.courseId,
          lessonId: update.lessonId,
          progressPct: update.progressPct,
        });
      } catch (error) {
        console.error('Failed to sync progress update:', update, error);
        remaining.push(update);
      }
    }

    savePending(remaining);
  }, [getPending, savePending]);

  const recordProgress = useCallback(
    async (courseId: string, lessonId: string, progressPct: number) => {
      if (navigator.onLine) {
        try {
          await api.post('/v1/progress', { courseId, lessonId, progressPct });
          return;
        } catch (error) {
          console.error('Failed to record progress online, saving for sync:', error);
        }
      }

      const pending = getPending();
      pending.push({
        courseId,
        lessonId,
        progressPct,
        timestamp: Date.now(),
      });
      savePending(pending);
    },
    [getPending, savePending]
  );

  useEffect(() => {
    window.addEventListener('online', sync);
    // Initial sync check
    sync();
    return () => window.removeEventListener('online', sync);
  }, [sync]);

  return { recordProgress };
}
