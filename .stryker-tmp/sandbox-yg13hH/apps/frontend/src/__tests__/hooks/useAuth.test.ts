import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth.store';

const mockUser = {
  id: 'user-1',
  username: 'alice',
  email: 'alice@example.com',
  role: 'student',
};

const mockAdmin = { ...mockUser, id: 'admin-1', role: 'admin' };

beforeEach(() => {
  // Reset store state between tests
  useAuthStore.setState({ user: null, token: null });
});

describe('useAuth', () => {
  it('returns unauthenticated state by default', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('sets authenticated state after login', () => {
    const { result } = renderHook(() => useAuth());
    act(() => result.current.login('tok-123', mockUser));
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe('tok-123');
    expect(result.current.user).toEqual(mockUser);
  });

  it('clears state after logout', () => {
    const { result } = renderHook(() => useAuth());
    act(() => result.current.login('tok-123', mockUser));
    act(() => result.current.logout());
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('isAdmin is false for student role', () => {
    const { result } = renderHook(() => useAuth());
    act(() => result.current.login('tok', mockUser));
    expect(result.current.isAdmin).toBe(false);
  });

  it('isAdmin is true for admin role', () => {
    const { result } = renderHook(() => useAuth());
    act(() => result.current.login('tok', mockAdmin));
    expect(result.current.isAdmin).toBe(true);
  });

  it('setUser updates user without changing token', () => {
    const { result } = renderHook(() => useAuth());
    act(() => result.current.login('tok', mockUser));
    act(() => result.current.setUser({ ...mockUser, username: 'alice-updated' }));
    expect(result.current.user?.username).toBe('alice-updated');
    expect(result.current.token).toBe('tok');
  });
});
