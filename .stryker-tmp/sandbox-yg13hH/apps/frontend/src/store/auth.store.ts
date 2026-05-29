import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as Sentry from '@sentry/nextjs';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: string;
  avatarUrl?: string;
  stellarPublicKey?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  setUser: (user: AuthUser) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (token, user) => {
        Sentry.setUser({
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        });
        set({ token, user });
      },
      logout: () => {
        Sentry.setUser(null);
        set({ token: null, user: null });
      },
      setUser: (user) => {
        Sentry.setUser({
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        });
        set({ user });
      },
    }),
    {
      name: 'auth',
      // only persist token + user, not actions
      partialize: (s) => ({ token: s.token, user: s.user }),
    }
  )
);
