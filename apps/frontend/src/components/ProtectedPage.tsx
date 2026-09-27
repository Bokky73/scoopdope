import React, { useEffect } from 'react';
import { redirect } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedPageProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallbackPath?: string;
}

/**
 * Role-based page protection component
 * Restricts access based on user role and redirects if unauthorized
 * 
 * @param allowedRoles - List of roles with access (e.g., ['admin', 'instructor'])
 * @param fallbackPath - Path to redirect to if unauthorized (default: '/dashboard')
 * @param children - Page content
 */
export function ProtectedPage({
  children,
  allowedRoles,
  fallbackPath = '/dashboard',
}: ProtectedPageProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      redirect('/auth/login');
    }

    // User has no role - redirect
    if (!user?.role) {
      redirect(fallbackPath);
    }

    // User role not allowed - redirect
    if (!allowedRoles.includes(user.role)) {
      console.warn(
        `Access denied: user role "${user.role}" not in ${allowedRoles.join(', ')}`
      );
      redirect(fallbackPath);
    }
  }, [isLoading, isAuthenticated, user?.role, allowedRoles, fallbackPath]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!user?.role || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Utility function to check if a role is allowed for a resource
 */
export function hasRole(userRole: string | undefined, allowedRoles: string[]): boolean {
  return Boolean(userRole && allowedRoles.includes(userRole));
}

/**
 * Utility function to conditionally render content based on role
 */
export function RoleGate({
  children,
  roles,
  fallback = null,
}: {
  children: React.ReactNode;
  roles: string[];
  fallback?: React.ReactNode;
}) {
  const { user } = useAuth();

  if (!user || !hasRole(user.role, roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
