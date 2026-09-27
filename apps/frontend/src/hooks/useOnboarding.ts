'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useOnboardingStore } from '@/store/onboarding.store';

/**
 * Triggers the onboarding wizard for newly registered users.
 * Call this hook in a layout or page that renders after login.
 *
 * Only resets the wizard when a *different* user logs in (i.e. lastUserId
 * differs from the current user's id). Users who have already completed or
 * skipped onboarding will not see it again unless they explicitly restart.
 */
export function useOnboarding() {
  const user = useAuthStore((s) => s.user);
  const { completed, skipped, lastUserId, reset } = useOnboardingStore();

  useEffect(() => {
    if (!user) return;

    // A different user logged in — reset so the wizard runs from step 1,
    // but only if they haven't already completed/skipped it themselves.
    if (user.id !== lastUserId && !completed && !skipped) {
      reset();
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return { showOnboarding: !!user && !completed && !skipped };
}
