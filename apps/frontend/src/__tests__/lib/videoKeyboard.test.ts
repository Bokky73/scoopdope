import { describe, it, expect } from 'vitest';
import { seekForward, seekBackward, volumeUp, volumeDown } from '@/lib/videoKeyboard';

describe('seekForward', () => {
  it('adds 10 seconds normally', () => {
    expect(seekForward(20, 120)).toBe(30);
  });

  it('clamps to duration when near end', () => {
    expect(seekForward(115, 120)).toBe(120);
  });

  it('clamps to duration when exactly at duration', () => {
    expect(seekForward(120, 120)).toBe(120);
  });

  it('handles currentTime of 0', () => {
    expect(seekForward(0, 120)).toBe(10);
  });

  it('result is never greater than duration', () => {
    expect(seekForward(500, 100)).toBe(100);
  });
});

describe('seekBackward', () => {
  it('subtracts 10 seconds normally', () => {
    expect(seekBackward(30, 120)).toBe(20);
  });

  it('clamps to 0 when near start', () => {
    expect(seekBackward(5, 120)).toBe(0);
  });

  it('clamps to 0 when already at start', () => {
    expect(seekBackward(0, 120)).toBe(0);
  });

  it('result is never negative', () => {
    expect(seekBackward(-5, 120)).toBeGreaterThanOrEqual(0);
  });
});

describe('volumeUp', () => {
  it('increases volume by 0.1', () => {
    expect(volumeUp(0.5)).toBe(0.6);
  });

  it('clamps to 1 at maximum', () => {
    expect(volumeUp(1)).toBe(1);
  });

  it('clamps to 1 when close to max', () => {
    expect(volumeUp(0.95)).toBe(1);
  });

  it('starts from 0 correctly', () => {
    expect(volumeUp(0)).toBe(0.1);
  });

  it('result is in [0, 1]', () => {
    const result = volumeUp(0.7);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(1);
  });
});

describe('volumeDown', () => {
  it('decreases volume by 0.1', () => {
    expect(volumeDown(0.5)).toBe(0.4);
  });

  it('clamps to 0 at minimum', () => {
    expect(volumeDown(0)).toBe(0);
  });

  it('clamps to 0 when close to min', () => {
    expect(volumeDown(0.05)).toBe(0);
  });

  it('starts from 1 correctly', () => {
    expect(volumeDown(1)).toBe(0.9);
  });

  it('result is in [0, 1]', () => {
    const result = volumeDown(0.3);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(1);
  });
});
