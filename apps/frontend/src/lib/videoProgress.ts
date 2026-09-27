/**
 * Computes the watch percentage from current playback position and total duration.
 *
 * Returns a value clamped to [0, 100].
 * Returns 0 when duration is 0 or NaN (i.e., video not yet loaded).
 *
 * @param currentTime - Current playback position in seconds
 * @param duration    - Total video duration in seconds
 */
export function computeProgressPct(currentTime: number, duration: number): number {
  if (!duration || !isFinite(duration) || duration <= 0) return 0;
  const raw = Math.round((currentTime / duration) * 100);
  return Math.min(100, Math.max(0, raw));
}
