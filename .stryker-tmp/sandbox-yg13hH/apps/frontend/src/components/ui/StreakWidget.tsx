import React from 'react';
import { Card } from './Card';
import { Flame } from 'lucide-react';

interface StreakWidgetProps {
  currentStreak: number;
  longestStreak: number;
  isLoading?: boolean;
}

export function StreakWidget({ currentStreak, longestStreak, isLoading }: StreakWidgetProps) {
  if (isLoading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 overflow-hidden relative group transition-all hover:shadow-lg border-orange-100 dark:border-orange-900/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-2xl ${currentStreak > 0 ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
            <Flame className={`w-8 h-8 ${currentStreak > 0 ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Learning Streak
            </h3>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-black text-gray-900 dark:text-gray-100">
                {currentStreak}
              </span>
              <span className="text-lg font-bold text-gray-500 dark:text-gray-400">
                days
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">
            Best
          </p>
          <p className="text-xl font-bold text-gray-700 dark:text-gray-300">
            {longestStreak}
          </p>
        </div>
      </div>

      {currentStreak > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {currentStreak >= 7 ? (
              <span className="flex items-center text-green-600 dark:text-green-400 font-medium">
                🔥 You're on fire! Keep it up!
              </span>
            ) : (
              <span>Come back tomorrow to keep your streak!</span>
            )}
          </p>
        </div>
      )}

      {/* Background decoration */}
      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Flame size={120} />
      </div>
    </Card>
  );
}
