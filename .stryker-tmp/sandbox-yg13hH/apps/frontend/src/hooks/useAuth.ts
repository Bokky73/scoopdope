import { useAuthStore } from '@/store/auth.store';

/**
 * Thin hook over the auth store — provides a stable API for components
 * and makes mocking in tests straightforward.
 */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const setUser = useAuthStore((s) => s.setUser);

  return {
    user,
    token,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin',
    login,
    logout,
    setUser,
  };
}
