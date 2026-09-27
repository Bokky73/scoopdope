import { describe, it, expect } from 'vitest';
import { computeProgressPct } from '@/lib/videoProgress';

describe('computeProgressPct', () => {
  it('returns 0 when duration is 0', () => {
    expect(computeProgressPct(30, 0)).toBe(0);
  });

  it('returns 0 when duration is NaN', () => {
    expect(computeProgressPct(30, NaN)).toBe(0);
  });

  it('returns 0 when duration is negative', () => {
    expect(computeProgressPct(30, -10)).toBe(0);
  });

  it('returns 0 when currentTime is 0', () => {
    expect(computeProgressPct(0, 100)).toBe(0);
  });

  it('returns 100 when currentTime equals duration', () => {
    expect(computeProgressPct(100, 100)).toBe(100);
  });

  it('returns 50 for the midpoint', () => {
    expect(computeProgressPct(50, 100)).toBe(50);
  });

  it('clamps to 100 when currentTime exceeds duration', () => {
    expect(computeProgressPct(110, 100)).toBe(100);
  });

  it('clamps to 0 when currentTime is negative', () => {
    expect(computeProgressPct(-5, 100)).toBe(0);
  });

  it('rounds correctly — 0.454 rounds to 45', () => {
    // 45.45… rounds to 45
    expect(computeProgressPct(49.9, 110)).toBe(45);
  });

  it('rounds correctly — 0.455 rounds to 46', () => {
    // 50/110 ≈ 45.45, edge check
    expect(computeProgressPct(100, 110)).toBe(91);
  });

  it('handles non-integer duration', () => {
    const result = computeProgressPct(5.5, 11);
    expect(result).toBe(50);
  });

  it('returns correct pct for arbitrary valid input', () => {
    const result = computeProgressPct(30, 120);
    expect(result).toBe(25);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
  });
});
