'use client';

import { useState, useCallback } from 'react';

export const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;
export type PlaybackSpeed = (typeof SPEED_OPTIONS)[number];

const STORAGE_KEY = 'videoPlayer.playbackSpeed';

function readStoredSpeed(): PlaybackSpeed {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = parseFloat(stored ?? '');
    if (SPEED_OPTIONS.includes(parsed as PlaybackSpeed)) {
      return parsed as PlaybackSpeed;
    }
  } catch {
    // localStorage unavailable (SSR / private browsing)
  }
  return 1;
}

interface UsePlaybackSpeedReturn {
  speed: PlaybackSpeed;
  setSpeed: (speed: PlaybackSpeed) => void;
  speedOptions: readonly PlaybackSpeed[];
}

/**
 * Manages video playback speed with localStorage persistence.
 * Falls back to 1× on any read/write error.
 */
export function usePlaybackSpeed(): UsePlaybackSpeedReturn {
  const [speed, setSpeedState] = useState<PlaybackSpeed>(readStoredSpeed);

  const setSpeed = useCallback((newSpeed: PlaybackSpeed) => {
    try {
      localStorage.setItem(STORAGE_KEY, String(newSpeed));
    } catch {
      // Ignore write errors; state still updates in memory
    }
    setSpeedState(newSpeed);
  }, []);

  return { speed, setSpeed, speedOptions: SPEED_OPTIONS };
}
