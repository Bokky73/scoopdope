'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/store/onboarding.store';
import { useWalletStore } from '@/store/walletStore';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
}

const STEPS = ['wallet', 'courses', 'features', 'complete'] as const;
const TOTAL_STEPS = STEPS.length;

/** Accent colours per step give a subtle visual distinction. */
const STEP_ACCENT: Record<string, string> = {
  wallet: 'border-t-4 border-t-blue-500',
  courses: 'border-t-4 border-t-purple-500',
  features: 'border-t-4 border-t-emerald-500',
  complete: 'border-t-4 border-t-yellow-400',
};

function StepIndicator({ current }: { current: number }) {
  return (
    <div
      className="flex items-center justify-center gap-2 mb-6"
      role="tablist"
      aria-label="Onboarding steps"
    >
      {STEPS.map((step, i) => (
        <div
          key={step}
          role="tab"
          aria-selected={i === current}
          aria-label={`Step ${i + 1}: ${step}`}
          className={`h-2 rounded-full transition-all ${
            i <= current ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300 dark:bg-gray-600'
          }`}
        />
      ))}
    </div>
  );
}

function StepLabel({ current }: { current: number }) {
  return (
    <p className="text-xs font-medium text-gray-400 dark:text-gray-500 text-center mb-2 uppercase tracking-wider">
      Step {current + 1} of {TOTAL_STEPS}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Step: Wallet
// ---------------------------------------------------------------------------
function WalletStep({ onNext }: { onNext: () => void }) {
  const { address } = useWalletStore();
  const { setWalletConnected, skip } = useOnboardingStore();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (address) setWalletConnected(true);
  }, [address, setWalletConnected]);

  return (
    <div className="text-center" role="tabpanel" aria-label="Connect wallet step">
      <div className="text-5xl mb-4" aria-hidden="true">🔗</div>
      <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
        Connect Your Wallet
      </h2>
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
          aria-label={address ? 'Continue to next step' : 'Continue without connecting a wallet'}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {address ? 'Continue' : 'Continue without wallet'}
        </button>
        <button
          onClick={() => skip(user?.id)}
          aria-label="Skip onboarding setup"
          className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          Skip setup
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step: Courses
// ---------------------------------------------------------------------------
function CourseStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedCourseId, setSelectedCourse, skip } = useOnboardingStore();
  const user = useAuthStore((s) => s.user);
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
        // already enrolled or unauthenticated — continue anyway
      }
      router.push(`/courses/${selectedCourseId}`);
    }
    onNext();
  };

  return (
    <div role="tabpanel" aria-label="Pick your first course step">
      <div className="text-center mb-6">
        <div className="text-5xl mb-4" aria-hidden="true">📚</div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          Pick Your First Course
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Choose a course to get started. You can always browse more later.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 mb-6" aria-busy="true" aria-label="Loading courses">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 max-h-72 overflow-y-auto"
          role="listbox"
          aria-label="Available courses"
        >
          {courses.map((c) => (
            <button
              key={c.id}
              role="option"
              aria-selected={selectedCourseId === c.id}
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
          aria-label={selectedCourseId ? 'Enroll in selected course and continue' : 'Select a course to enroll'}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {selectedCourseId ? 'Enroll & Continue' : 'Select a course'}
        </button>
        <button
          onClick={onNext}
          aria-label="Skip course selection"
          className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          Skip for now
        </button>
        <button
          onClick={onBack}
          aria-label="Go back to previous step"
          className="text-xs text-gray-300 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={() => skip(user?.id)}
          aria-label="Skip all onboarding setup"
          className="text-xs text-gray-300 hover:text-gray-500 transition-colors"
        >
          Skip all setup
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step: Features (new)
// ---------------------------------------------------------------------------
const FEATURE_CARDS = [
  {
    emoji: '🎓',
    title: 'Browse Courses',
    description: 'Explore a growing library of blockchain and web3 courses curated for all skill levels.',
  },
  {
    emoji: '📈',
    title: 'Track Progress',
    description: 'Your learning progress is stored on-chain so it\'s always verifiable and tamper-proof.',
  },
  {
    emoji: '🏆',
    title: 'Earn Credentials',
    description: 'Complete courses to receive BST tokens and Stellar-issued certificates you truly own.',
  },
];

function FeaturesStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div role="tabpanel" aria-label="Platform features step">
      <div className="text-center mb-6">
        <div className="text-5xl mb-4" aria-hidden="true">✨</div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          What You Can Do
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Here's what scoopdope has in store for you.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6">
        {FEATURE_CARDS.map((card) => (
          <div
            key={card.title}
            className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
          >
            <span className="text-3xl flex-shrink-0" aria-hidden="true">{card.emoji}</span>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{card.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{card.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={onNext}
          aria-label="Continue to final step"
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Continue
        </button>
        <button
          onClick={onBack}
          aria-label="Go back to previous step"
          className="text-xs text-gray-300 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step: Complete
// ---------------------------------------------------------------------------
function CompleteStep({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  return (
    <div className="text-center" role="tabpanel" aria-label="Setup complete step">
      <div className="text-6xl mb-4" aria-hidden="true">🎉</div>
      <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">You&apos;re all set!</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Your account is ready. Start learning and earn on-chain credentials.
      </p>
      <div className="flex flex-col gap-3">
        <button
          onClick={() => router.push('/courses')}
          aria-label="Browse all available courses"
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Browse Courses
        </button>
        <button
          onClick={onBack}
          aria-label="Go back to previous step"
          className="text-xs text-gray-300 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main wizard
// ---------------------------------------------------------------------------
export default function OnboardingWizard({ onClose }: { onClose?: () => void }) {
  const { currentStep, completed, setStep, complete, skip } = useOnboardingStore();
  const user = useAuthStore((s) => s.user);
  const stepIndex = STEPS.indexOf(currentStep);

  if (completed) {
    onClose?.();
    return null;
  }

  const handleNext = () => {
    const next = STEPS[stepIndex + 1];
    if (next === 'complete') {
      complete(user?.id);
      onClose?.();
    } else if (next) {
      setStep(next);
    }
  };

  const handleBack = () => {
    const prev = STEPS[stepIndex - 1];
    if (prev) setStep(prev);
  };

  const handleClose = () => {
    skip(user?.id);
    onClose?.();
  };

  const accentClass = STEP_ACCENT[currentStep] ?? '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Onboarding wizard"
    >
      <div
        className={`relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-8 ${accentClass}`}
      >
        {/* Persistent close button */}
        <button
          onClick={handleClose}
          aria-label="Close onboarding wizard"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-xl leading-none"
        >
          ✕
        </button>

        <StepLabel current={stepIndex} />
        <StepIndicator current={stepIndex} />

        {currentStep === 'wallet' && <WalletStep onNext={handleNext} />}
        {currentStep === 'courses' && (
          <CourseStep onNext={handleNext} onBack={handleBack} />
        )}
        {currentStep === 'features' && (
          <FeaturesStep onNext={handleNext} onBack={handleBack} />
        )}
        {currentStep === 'complete' && <CompleteStep onBack={handleBack} />}
      </div>
    </div>
  );
}
