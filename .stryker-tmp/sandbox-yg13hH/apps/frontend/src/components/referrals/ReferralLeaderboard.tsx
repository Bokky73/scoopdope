'use client';

import { useState } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface LeaderboardEntry {
  id: string;
  username: string;
  avatarUrl?: string;
  totalReferrals: number;
  totalRewards: number;
  rank: number;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  userRank?: number;
}

export function ReferralLeaderboard() {
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('all');
  const { data, error, isLoading } = useSWR<LeaderboardData>(
    `/api/referrals/leaderboard?timeframe=${timeframe}`,
    fetcher
  );

  // Mock data
  const mockData: LeaderboardData = {
    leaderboard: [
      {
        id: '1',
        username: 'crypto_enthusiast',
        totalReferrals: 45,
        totalRewards: 900,
        rank: 1,
      },
      {
        id: '2',
        username: 'blockchain_dev',
        totalReferrals: 38,
        totalRewards: 760,
        rank: 2,
      },
      {
        id: '3',
        username: 'stellar_expert',
        totalReferrals: 32,
        totalRewards: 640,
        rank: 3,
      },
      {
        id: '4',
        username: 'web3_builder',
        totalReferrals: 28,
        totalRewards: 560,
        rank: 4,
      },
      {
        id: '5',
        username: 'defi_trader',
        totalReferrals: 25,
        totalRewards: 500,
        rank: 5,
      },
    ],
    userRank: 12,
  };

  const leaderboard = data?.leaderboard || mockData.leaderboard;
  const userRank = data?.userRank || mockData.userRank;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    if (rank <= 3) return 'text-yellow-600';
    return 'text-gray-600 dark:text-gray-400';
  };

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-red-600 dark:text-red-400">Failed to load leaderboard</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Referral Leaderboard
        </h2>

        <div className="flex gap-2">
          {(['all', 'month', 'week'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeframe === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {period === 'all' ? 'All Time' : period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {userRank && userRank > 5 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <p className="text-blue-800 dark:text-blue-200">
            You're ranked <strong>#{userRank}</strong> overall! Keep referring to climb the leaderboard.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              </div>
              <div className="text-right">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
              </div>
            </div>
          ))
        ) : (
          leaderboard.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                entry.rank === userRank
                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                  : 'bg-gray-50 dark:bg-gray-800'
              }`}
            >
              <div className={`text-lg font-bold w-8 text-center ${getRankColor(entry.rank)}`}>
                {getRankIcon(entry.rank)}
              </div>

              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">
                  {entry.username}
                  {entry.rank === userRank && (
                    <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(You)</span>
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {entry.totalReferrals} referrals
                </div>
              </div>

              <div className="text-right">
                <div className="font-semibold text-gray-900 dark:text-white">
                  ${entry.totalRewards}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  earned
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Rankings update daily. Keep referring to climb the leaderboard!
        </p>
      </div>
    </div>
  );
}