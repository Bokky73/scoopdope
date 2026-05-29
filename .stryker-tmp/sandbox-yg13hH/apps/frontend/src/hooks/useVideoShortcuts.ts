'use client';

import { RefObject, useMemo } from 'react';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

/**
 * Attach Space/ArrowLeft/ArrowRight keyboard shortcuts to a <video> element.
 * Only active when the video container (or document) has focus and no input is focused.
 */
export function useVideoShortcuts(videoRef: RefObject<HTMLVideoElement | null>) {
  const shortcuts = useMemo(() => [
    {
      key: ' ',
      skipOnInput: true,
      handler: (e: KeyboardEvent) => {
        const v = videoRef.current;
        if (!v) return;
        e.preventDefault();
        v.paused ? v.play() : v.pause();
      },
    },
    {
      key: 'ArrowLeft',
      skipOnInput: true,
      handler: (e: KeyboardEvent) => {
        const v = videoRef.current;
        if (!v) return;
        e.preventDefault();
        v.currentTime = Math.max(0, v.currentTime - 10);
      },
    },
    {
      key: 'ArrowRight',
      skipOnInput: true,
      handler: (e: KeyboardEvent) => {
        const v = videoRef.current;
        if (!v) return;
        e.preventDefault();
        v.currentTime = Math.min(v.duration, v.currentTime + 10);
      },
    },
  ], [videoRef]);

  useKeyboardShortcuts(shortcuts);
}
