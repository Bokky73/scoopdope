'use client';

import { useState } from 'react';
import { Tour } from './Tour';
import { useAuthStore } from '@/store/auth.store';

export function TourProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const [tourActive, setTourActive] = useState(false);

  const handleTourComplete = () => {
    setTourActive(false);
  };

  const handleTourSkip = () => {
    setTourActive(false);
  };

  // Function to restart tour
  const restartTour = () => {
    if (user?.id) {
      localStorage.removeItem(`tour-completed-${user.id}`);
    }
    setTourActive(true);
  };

  return (
    <>
      {children}
      {tourActive && (
        <Tour onComplete={handleTourComplete} onSkip={handleTourSkip} forceStart />
      )}
    </>
  );
}

// Export restart function for external use
export const restartOnboardingTour = () => {
  // This function can be called from profile settings or anywhere
  // It will trigger the tour by updating state, but since it's not connected,
  // for now, users can manually clear localStorage
};