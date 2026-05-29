'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { state } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!state.isLoading && !state.token) {
      router.push('/auth/login');
    }
  }, [state.isLoading, state.token, router]);

  if (state.isLoading) {
    return <div>Loading...</div>; // Or a proper loading component
  }

  if (!state.token) {
    return null; // Or redirect component
  }

  return <>{children}</>;
}
