'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/store/onboarding.store';
import { useWalletStore } from '@/store/walletStore';
import api from '@/lib/api';

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
}

const STEPS = ['wallet', 'courses', 'complete'] as const;

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all ${
            i <= current ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300 dark:bg-gray-600'
          }`}
        />
      ))}
    </div>
  );
}

function WalletStep({ onNext }: { onNext: () => void }) {
  const { address } = useWalletStore();
  const { setWalletConnected, skip } = useOnboardingStore();

  useEffect(() => {
    if (address) setWalletConnected(true);
  }, [address, setWalletConnected]);

  return (
    <div className="text-center">
      <div className="text-5xl mb-4">🔗</div>
      <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Connect Your Wallet</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
        Link your Stellar wallet to earn on-chain credentials and BST tokens as you complete
        courses.
      </p>

      {address ? (
        <div className="mb-6 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <p className="text-green-700 dark:text-green-400 text-sm font-medium">
            ✓ Wallet connected
          </p>
          <p className="text-green-600 dark:text-green-500 text-xs mt-1 font-mono truncate">
            {address}
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-400 mb-6">
          Use the wallet button in the top navigation to connect.
        </p>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={onNext}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {address ? 'Continue' : 'Continue without wallet'}
        </button>
        <button
          onClick={skip}
          className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          Skip setup
        </button>
      </div>
    </div>
  );
}

function CourseStep({ onNext }: { onNext: () => void }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedCourseId, setSelectedCourse, skip } = useOnboardingStore();
  const router = useRouter();

  useEffect(() => {
    api
      .get<Course[]>('/v1/courses?limit=6')
      .then((r) => setCourses(Array.isArray(r.data) ? r.data.slice(0, 6) : []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  const handleEnroll = async () => {
    if (selectedCourseId) {
      try {
        await api.post('/v1/enrollments', { courseId: selectedCourseId });
      } catch {
        // already enrolled or not authenticated — continue anyway
      }
      router.push(`/courses/${selectedCourseId}`);
    }
    onNext();
  };

  return (
    <div>
      <div className="text-center mb-6">
        <div className="text-5xl mb-4">📚</div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          Pick Your First Course
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Choose a course to get started. You can always browse more later.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 max-h-72 overflow-y-auto">
          {courses.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCourse(c.id === selectedCourseId ? null : c.id)}
              className={`text-left p-3 rounded-lg border-2 transition-colors ${
                selectedCourseId === c.id
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
            >
              <p className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2">
                {c.title}
              </p>
              <span className="text-xs text-gray-400 capitalize">{c.level}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={handleEnroll}
          disabled={!selectedCourseId}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {selectedCourseId ? 'Enroll & Continue' : 'Select a course'}
        </button>
        <button
          onClick={onNext}
          className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          Skip for now
        </button>
        <button
          onClick={skip}
          className="text-xs text-gray-300 hover:text-gray-500 transition-colors"
        >
          Skip all setup
        </button>
      </div>
    </div>
  );
}

function CompleteStep() {
  const router = useRouter();
  return (
    <div className="text-center">
      <div className="text-6xl mb-4">🎉</div>
      <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">You&apos;re all set!</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Your account is ready. Start learning and earn on-chain credentials.
      </p>
      <button
        onClick={() => router.push('/courses')}
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Browse Courses
      </button>
    </div>
  );
}

export default function OnboardingWizard({ onClose }: { onClose?: () => void }) {
  const { currentStep, completed, setStep, complete } = useOnboardingStore();
  const stepIndex = STEPS.indexOf(currentStep);

  if (completed) {
    onClose?.();
    return null;
  }

  const handleNext = () => {
    const next = STEPS[stepIndex + 1];
    if (next === 'complete') {
      complete();
      onClose?.();
    } else {
      setStep(next);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-8">
        <StepIndicator current={stepIndex} />

        {currentStep === 'wallet' && <WalletStep onNext={handleNext} />}
        {currentStep === 'courses' && <CourseStep onNext={handleNext} />}
        {currentStep === 'complete' && <CompleteStep />}
      </div>
    </div>
  );
}
