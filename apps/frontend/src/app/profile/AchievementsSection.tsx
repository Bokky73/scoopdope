'use client';

import React from 'react';
import type { BadgeState } from './types';

const BADGE_COLORS: Record<string, string> = {
  'first-step': 'from-blue-400 to-blue-600',
  'course-collector': 'from-purple-400 to-purple-600',
  'token-earner': 'from-yellow-400 to-yellow-600',
  'high-achiever': 'from-orange-400 to-orange-600',
  'dedicated-learner': 'from-green-400 to-green-600',
};

const BADGE_ICONS: Record<string, string> = {
  'first-step': '🚀',
  'course-collector': '📚',
  'token-earner': '🪙',
  'high-achiever': '⭐',
  'dedicated-learner': '🎓',
};

function BadgeCard({ badge }: { badge: BadgeState }) {
  const gradient = BADGE_COLORS[badge.id] ?? 'from-gray-400 to-gray-600';
  const icon = BADGE_ICONS[badge.id] ?? '🏅';

  return (
    <div
      className={`relative p-4 border rounded-lg text-center transition-all ${
        badge.earned
          ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm'
          : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 grayscale opacity-60'
      }`}
      aria-label={`${badge.name} badge — ${badge.earned ? 'earned' : 'not yet earned'}`}
    >
      {/* Lock icon for unearned badges */}
      {!badge.earned && (
        <div
          className="absolute top-2 right-2"
          aria-hidden="true"
          data-testid="badge-locked"
        >
          <svg
            className="w-4 h-4 text-gray-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fillRule="evenodd"
              d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}

      {/* Badge icon */}
      <div
        className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center text-2xl bg-gradient-to-br ${gradient}`}
        aria-hidden="true"
      >
        {icon}
      </div>

      <p className="font-semibold text-sm text-gray-900 dark:text-white">{badge.name}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
        {badge.earned ? badge.description : 'Keep going to unlock this badge!'}
      </p>
    </div>
  );
}

interface AchievementsSectionProps {
  badges: BadgeState[];
}

/**
 * Renders a responsive grid of achievement badge cards.
 * Earned badges are shown with full color; unearned badges are grayscale with a lock icon.
 */
export default function AchievementsSection({ badges }: AchievementsSectionProps) {
  return (
    <section aria-labelledby="achievements-heading">
      <h2
        id="achievements-heading"
        className="text-xl font-semibold text-gray-900 dark:text-white mb-4"
      >
        Achievements
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {badges.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} />
        ))}
      </div>
    </section>
  );
}
