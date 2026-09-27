import { useAuth } from './useAuth';

/**
 * Hook to check if current user has specific role(s)
 * Returns true if user has ANY of the specified roles
 * 
 * @param roles - Single role or array of roles to check
 * @returns true if user has one of the roles
 * 
 * @example
 * const isAdmin = useHasRole('admin');
 * const isInstructor = useHasRole(['admin', 'instructor']);
 */
export function useHasRole(roles: string | string[]): boolean {
  const { user } = useAuth();

  if (!user?.role) return false;

  const roleArray = Array.isArray(roles) ? roles : [roles];
  return roleArray.includes(user.role);
}

/**
 * Hook for admin-only access check
 */
export function useIsAdmin(): boolean {
  return useHasRole('admin');
}

/**
 * Hook for instructor-only access check
 */
export function useIsInstructor(): boolean {
  return useHasRole('instructor');
}

/**
 * Hook for student-only access check
 */
export function useIsStudent(): boolean {
  return useHasRole('student');
}

/**
 * Hook to get user role and role checking utilities
 */
export function useRole() {
  const { user } = useAuth();
  const hasRole = (roles: string | string[]) => {
    if (!user?.role) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  return {
    role: user?.role,
    hasRole,
    isAdmin: hasRole('admin'),
    isInstructor: hasRole('instructor'),
    isStudent: hasRole('student'),
  };
}
