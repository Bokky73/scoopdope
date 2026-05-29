'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { createPortal } from 'react-dom';

interface TourStep {
  target: string; // CSS selector
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    target: 'nav a[href="/courses"]',
    title: 'Explore Courses',
    content: 'Browse our comprehensive blockchain courses to start your learning journey.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="wallet-button"]',
    title: 'Connect Your Wallet',
    content: 'Connect your Stellar wallet to access premium features and track your progress.',
    placement: 'bottom',
  },
  {
    target: 'nav a[href="/profile"]',
    title: 'Your Profile',
    content: 'Manage your account settings, view certificates, and track your achievements.',
    placement: 'bottom',
  },
];

interface TourProps {
  onComplete: () => void;
  onSkip: () => void;
  forceStart?: boolean;
}

export function Tour({ onComplete, onSkip, forceStart = false }: TourProps) {
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if tour already completed
    if (user?.id && !forceStart) {
      const completed = localStorage.getItem(`tour-completed-${user.id}`);
      if (completed) {
        onComplete();
        return;
      }
    }

    // Start tour after a delay
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, [user, onComplete, forceStart]);

  useEffect(() => {
    if (!isVisible) return;

    const target = document.querySelector(TOUR_STEPS[currentStep].target);
    if (!target) return;

    // Position tooltip
    const rect = target.getBoundingClientRect();
    const tooltip = tooltipRef.current;
    if (!tooltip) return;

    const placement = TOUR_STEPS[currentStep].placement || 'bottom';
    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = rect.top - tooltip.offsetHeight - 10;
        left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2;
        break;
      case 'bottom':
        top = rect.bottom + 10;
        left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltip.offsetHeight / 2;
        left = rect.left - tooltip.offsetWidth - 10;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltip.offsetHeight / 2;
        left = rect.right + 10;
        break;
    }

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;

    // Scroll target into view if needed
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentStep, isVisible]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    onSkip();
  };

  const handleComplete = () => {
    if (user?.id) {
      localStorage.setItem(`tour-completed-${user.id}`, 'true');
    }
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  const step = TOUR_STEPS[currentStep];

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
      aria-describedby="tour-content"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />

      {/* Highlight */}
      {(() => {
        const target = document.querySelector(step.target);
        if (!target) return null;
        const rect = target.getBoundingClientRect();
        return (
          <div
            className="absolute border-2 border-blue-500 rounded-lg pointer-events-none"
            style={{
              top: rect.top - 4,
              left: rect.left - 4,
              width: rect.width + 8,
              height: rect.height + 8,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
            }}
          />
        );
      })()}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="absolute bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-xs pointer-events-auto"
      >
        <div className="flex justify-between items-start mb-2">
          <h3 id="tour-title" className="font-semibold text-gray-900">
            {step.title}
          </h3>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Skip tour"
          >
            ×
          </button>
        </div>
        <p id="tour-content" className="text-gray-700 mb-4">
          {step.content}
        </p>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {currentStep + 1} of {TOUR_STEPS.length}
          </div>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Previous
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}