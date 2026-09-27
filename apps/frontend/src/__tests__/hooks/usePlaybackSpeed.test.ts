import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePlaybackSpeed, SPEED_OPTIONS } from '@/hooks/usePlaybackSpeed';

describe('usePlaybackSpeed', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('defaults to speed 1 when no stored value', () => {
    const { result } = renderHook(() => usePlaybackSpeed());
    expect(result.current.speed).toBe(1);
  });

  it('exposes all speed options', () => {
    const { result } = renderHook(() => usePlaybackSpeed());
    expect(result.current.speedOptions).toEqual(SPEED_OPTIONS);
  });

  it('restores speed from localStorage', () => {
    localStorage.setItem('videoPlayer.playbackSpeed', '1.5');
    const { result } = renderHook(() => usePlaybackSpeed());
    expect(result.current.speed).toBe(1.5);
  });

  it('updates speed in state when setSpeed is called', () => {
    const { result } = renderHook(() => usePlaybackSpeed());
    act(() => {
      result.current.setSpeed(2);
    });
    expect(result.current.speed).toBe(2);
  });

  it('persists the new speed to localStorage', () => {
    const { result } = renderHook(() => usePlaybackSpeed());
    act(() => {
      result.current.setSpeed(0.5);
    });
    expect(localStorage.getItem('videoPlayer.playbackSpeed')).toBe('0.5');
  });

  it('falls back to 1 when stored value is invalid', () => {
    localStorage.setItem('videoPlayer.playbackSpeed', 'not-a-number');
    const { result } = renderHook(() => usePlaybackSpeed());
    expect(result.current.speed).toBe(1);
  });

  it('falls back to 1 when stored value is not a valid speed option', () => {
    localStorage.setItem('videoPlayer.playbackSpeed', '3');
    const { result } = renderHook(() => usePlaybackSpeed());
    expect(result.current.speed).toBe(1);
  });

  it('gracefully handles localStorage read errors', () => {
    const originalGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = vi.fn(() => { throw new Error('Storage error'); });
    const { result } = renderHook(() => usePlaybackSpeed());
    expect(result.current.speed).toBe(1);
    Storage.prototype.getItem = originalGetItem;
  });

  it('gracefully handles localStorage write errors', () => {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = vi.fn(() => { throw new Error('Storage error'); });
    const { result } = renderHook(() => usePlaybackSpeed());
    // Should not throw; state still updates
    expect(() => {
      act(() => {
        result.current.setSpeed(1.25);
      });
    }).not.toThrow();
    expect(result.current.speed).toBe(1.25);
    Storage.prototype.setItem = originalSetItem;
  });
});
