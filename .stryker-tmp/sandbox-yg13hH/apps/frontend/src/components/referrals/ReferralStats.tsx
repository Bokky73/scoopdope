'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ReferralStatsData {
  totalClicks: number;
  totalSignups: number;
  totalRewards: number;
  pendingRewards: number;
}

export function ReferralStats() {
  const { data, error, isLoading } = useSWR<ReferralStatsData>('/api/referrals/stats', fetcher);

  // Mock data for now
  const mockData: ReferralStatsData = {
    totalClicks: 47,
    totalSignups: 12,
    totalRewards: 240,
    pendingRewards: 60,
  };

  const stats = data || mockData;

  const statItems = [
    {
      label: 'Link Clicks',
      value: stats.totalClicks,
      icon: '👆',
      color: 'text-blue-600',
    },
    {
      label: 'Successful Signups',
      value: stats.totalSignups,
      icon: '🎉',
      color: 'text-green-600',
    },
    {
      label: 'Total Rewards Earned',
      value: `$${stats.totalRewards}`,
      icon: '💰',
      color: 'text-yellow-600',
    },
    {
      label: 'Pending Rewards',
      value: `$${stats.pendingRewards}`,
      icon: '⏳',
      color: 'text-orange-600',
    },
  ];

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-red-600 dark:text-red-400">Failed to load referral statistics</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Your Referral Statistics
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {statItems.map((stat) => (
          <div
            key={stat.label}
            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center"
          >
            <div className={`text-2xl mb-2 ${stat.color}`}>{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {isLoading ? '...' : stat.value}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}