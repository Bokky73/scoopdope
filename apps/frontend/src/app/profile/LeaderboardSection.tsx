'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import type { LeaderboardEntry } from './types';

interface LeaderboardSectionProps {
  leaderboard: LeaderboardEntry[];
  userId: string;
  stellarPublicKey?: string;
  loading: boolean;
  error: boolean;
}

/**
 * Displays the student's leaderboard rank based on their BST balance.
 * Shows "unranked" when the student's wallet isn't on the leaderboard.
 */
export function LeaderboardSection({
  leaderboard,
  userId,
  stellarPublicKey,
  loading,
  error,
}: LeaderboardSectionProps) {
  const entryIndex = leaderboard.findIndex((e) => e.userId === userId);
  const entry = entryIndex !== -1 ? leaderboard[entryIndex] : null;
  const rank = entryIndex !== -1 ? entryIndex + 1 : null;
  const total = leaderboard.length;

  return (
    <section aria-labelledby="leaderboard-heading">
      <h2
        id="leaderboard-heading"
        className="text-xl font-semibold text-gray-900 dark:text-white mb-4"
      >
        Leaderboard
      </h2>

      {loading ? (
        <Skeleton className="h-24 w-full rounded-lg" />
      ) : error ? (
        <div
          role="alert"
          className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <p className="text-sm text-red-700 dark:text-red-300">
            Could not load leaderboard at this time.
          </p>
        </div>
      ) : !stellarPublicKey ? (
        <Card className="p-4 border-dashed">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Link your Stellar wallet to appear on the leaderboard and compete for top rankings.
          </p>
          <a
            href="#wallet"
            className="inline-block mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            aria-label="Go to wallet connection section to join leaderboard"
          >
            Link wallet →
          </a>
        </Card>
      ) : entry && rank !== null ? (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                #{rank}
                <span className="text-base font-normal text-gray-500 dark:text-gray-400 ml-1">
                  of {total}
                </span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Your current leaderboard rank
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {parseFloat(entry.balance).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 7,
                })}{' '}
                <span className="text-sm font-normal text-gray-500">BST</span>
              </p>
            </div>
          </div>

          {/* Top 3 entries preview */}
          {leaderboard.length > 0 && (
            <div className="mt-4 border-t dark:border-gray-700 pt-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Top Earners
              </p>
              <ol className="space-y-1.5" aria-label="Top leaderboard entries">
                {leaderboard.slice(0, 3).map((e, i) => (
                  <li
                    key={e.userId}
                    className={`flex items-center justify-between text-sm ${
                      e.userId === userId
                        ? 'font-semibold text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-5 text-center font-mono text-gray-400">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                      </span>
                      {e.username ?? e.email}
                    </span>
                    <span className="font-mono">
                      {parseFloat(e.balance).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </Card>
      ) : (
        <Card className="p-4">
          <p className="text-gray-500 dark:text-gray-400 text-sm" aria-live="polite">
            You are currently <strong>unranked</strong>. Earn BST tokens by completing courses to
            appear on the leaderboard.
          </p>
        </Card>
      )}
    </section>
  );
}
