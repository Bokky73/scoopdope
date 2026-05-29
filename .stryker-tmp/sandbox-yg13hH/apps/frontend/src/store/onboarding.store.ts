import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OnboardingStep = 'wallet' | 'courses' | 'complete';

interface OnboardingState {
  completed: boolean;
  skipped: boolean;
  currentStep: OnboardingStep;
  walletConnected: boolean;
  selectedCourseId: string | null;
  setStep: (step: OnboardingStep) => void;
  setWalletConnected: (v: boolean) => void;
  setSelectedCourse: (id: string | null) => void;
  complete: () => void;
  skip: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      completed: false,
      skipped: false,
      currentStep: 'wallet',
      walletConnected: false,
      selectedCourseId: null,
      setStep: (currentStep) => set({ currentStep }),
      setWalletConnected: (walletConnected) => set({ walletConnected }),
      setSelectedCourse: (selectedCourseId) => set({ selectedCourseId }),
      complete: () => set({ completed: true, currentStep: 'complete' }),
      skip: () => set({ skipped: true, completed: true }),
      reset: () =>
        set({
          completed: false,
          skipped: false,
          currentStep: 'wallet',
          walletConnected: false,
          selectedCourseId: null,
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
      }),
    }
  )
);
