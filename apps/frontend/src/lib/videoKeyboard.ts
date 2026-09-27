/**
 * Pure functions for video keyboard shortcuts.
 * These functions perform no side effects and are trivially testable.
 */

/**
 * Returns the new currentTime after seeking forward 10 seconds,
 * clamped to [0, duration].
 */
export function seekForward(currentTime: number, duration: number): number {
  return Math.min(duration, currentTime + 10);
}

/**
 * Returns the new currentTime after seeking backward 10 seconds,
 * clamped to [0, duration].
 */
export function seekBackward(currentTime: number, duration: number): number {
  return Math.max(0, currentTime - 10);
}

/**
 * Returns the new volume after increasing by 0.1, clamped to [0, 1].
 * Rounded to 1 decimal place to avoid floating-point drift.
 */
export function volumeUp(volume: number): number {
  return Math.min(1, Math.round((volume + 0.1) * 10) / 10);
}

/**
 * Returns the new volume after decreasing by 0.1, clamped to [0, 1].
 * Rounded to 1 decimal place to avoid floating-point drift.
 */
export function volumeDown(volume: number): number {
  return Math.max(0, Math.round((volume - 0.1) * 10) / 10);
}
