'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useVideoShortcuts } from '@/hooks/useVideoShortcuts';
import { useStudyTimer } from '@/hooks/useStudyTimer';

interface Props {
  src: string;
  lessonId: string;
  courseId: string;
  onComplete?: () => void;
}

const storageKey = (lessonId: string) => `vp-${lessonId}`;

const SAVE_INTERVAL_MS = 10_000;

export function VideoPlayer({ src, lessonId, courseId, onComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [completed, setCompleted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  // Timestamp of the last localStorage write; -Infinity ensures the first save
  // always goes through even if it happens before 10 s have elapsed.
  const lastSavedAtRef = useRef<number>(-Infinity);
  // Screen-reader announcement text surfaced via aria-live
  const [announcement, setAnnouncement] = useState('');

  // #881: Track study time while the video is playing
  useStudyTimer({ courseId, lessonId, active: isPlaying });

  const announce = useCallback((msg: string) => {
    // Clear then set so repeated identical messages still trigger the live region
    setAnnouncement('');
    // Defer to let the DOM see the empty string first
    requestAnimationFrame(() => setAnnouncement(msg));
  }, []);

  useVideoShortcuts(videoRef, announce);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const saved = localStorage.getItem(storageKey(lessonId));
    if (saved) v.currentTime = Number(saved);
  }, [lessonId]);

  // Reset error state when src changes
  useEffect(() => {
    setHasError(false);
    setRetryCount(0);
  }, [src]);

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || completed) return;

    // Throttle localStorage writes to at most once every SAVE_INTERVAL_MS
    const now = Date.now();
    if (now - lastSavedAtRef.current >= SAVE_INTERVAL_MS) {
      localStorage.setItem(storageKey(lessonId), String(v.currentTime));
      lastSavedAtRef.current = now;
    }

    if (v.duration && v.currentTime / v.duration >= 0.9) {
      setCompleted(true);
      fetch('/v1/progress/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, courseId, completed: true }),
      });
      onComplete?.();
    }
  };

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setRetryCount((c) => c + 1);
  }, []);

  // Build the actual src, appending a cache-bust param on retries
  const videoSrc = retryCount > 0
    ? `${src}${src.includes('?') ? '&' : '?'}_retry=${retryCount}`
    : src;

  if (hasError) {
    return (
      <div
        className="w-full rounded-lg bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center gap-4 py-16 px-6"
        role="alert"
      >
        <svg
          className="w-12 h-12 text-gray-400 dark:text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
          />
        </svg>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Video failed to load
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-sm">
          This could be due to a network issue or an unsupported format. Please check your connection and try again.
        </p>
        <button
          onClick={handleRetry}
          className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-sm font-medium transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    // tabIndex makes the container focusable so keyboard shortcuts activate
    // when the user tabs to the player without clicking inside it first.
    <div
      className="relative w-full"
      tabIndex={0}
      aria-label="Video player. Use Space to play/pause, arrow keys to seek and adjust volume, M to mute, F for fullscreen."
    >
      {/* aria-live region — visually hidden, announces shortcut actions to screen readers */}
      <span
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </span>

      <video
        ref={videoRef}
        src={videoSrc}
        controls
        onTimeUpdate={handleTimeUpdate}
        onError={handleError}
        className="w-full rounded-lg bg-black dark:bg-black"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
}
