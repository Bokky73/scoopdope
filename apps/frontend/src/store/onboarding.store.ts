import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OnboardingStep = 'wallet' | 'courses' | 'features' | 'complete';

interface OnboardingState {
  completed: boolean;
  skipped: boolean;
  currentStep: OnboardingStep;
  walletConnected: boolean;
  selectedCourseId: string | null;
  lastUserId: string | null;
  setStep: (step: OnboardingStep) => void;
  setWalletConnected: (v: boolean) => void;
  setSelectedCourse: (id: string | null) => void;
  complete: (userId?: string) => void;
  skip: (userId?: string) => void;
  reset: () => void;
  restartOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      completed: false,
      skipped: false,
      currentStep: 'wallet',
      walletConnected: false,
      selectedCourseId: null,
      lastUserId: null,
      setStep: (currentStep) => set({ currentStep }),
      setWalletConnected: (walletConnected) => set({ walletConnected }),
      setSelectedCourse: (selectedCourseId) => set({ selectedCourseId }),
      complete: (userId?: string) => {
        set({ completed: true, currentStep: 'complete', lastUserId: userId ?? null });
        // Clear transient state after completion
        setTimeout(() => {
          set({
            currentStep: 'wallet',
            walletConnected: false,
            selectedCourseId: null,
          });
        }, 100);
      },
      skip: (userId?: string) =>
        set({ skipped: true, completed: true, lastUserId: userId ?? null }),
      reset: () =>
        set({
          completed: false,
          skipped: false,
          currentStep: 'wallet',
          walletConnected: false,
          selectedCourseId: null,
        }),
      restartOnboarding: () =>
        set({
          completed: false,
          skipped: false,
          currentStep: 'wallet',
          walletConnected: false,
          selectedCourseId: null,
          lastUserId: null,
        }),
    }),
    {
      name: 'onboarding',
      partialize: (s) => ({
        completed: s.completed,
        skipped: s.skipped,
        currentStep: s.currentStep,
        walletConnected: s.walletConnected,
        selectedCourseId: s.selectedCourseId,
        lastUserId: s.lastUserId,
      }),
    }
  )
);
