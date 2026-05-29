// @ts-nocheck
'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useOnboardingStore } from '@/store/onboarding.store';

/**
 * Triggers the onboarding wizard for newly registered users.
 * Call this hook in a layout or page that renders after login.
 */
export function useOnboarding() {
  const user = useAuthStore((s) => s.user);
  const { completed, reset } = useOnboardingStore();

  useEffect(() => {
    if (!user) return;
    // Show onboarding if not yet completed for this user.
    // We key off localStorage so each user gets their own state via the persisted store.
    if (!completed) {
      reset(); // ensure wizard starts from step 1
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return { showOnboarding: !!user && !completed };
}
