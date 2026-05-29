'use client';

import { useState } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Reward {
  id: string;
  type: 'signup' | 'course_completion' | 'milestone';
  amount: number;
  status: 'pending' | 'earned' | 'paid';
  description: string;
  date: string;
  referredUser?: string;
}

interface RewardsData {
  pending: Reward[];
  earned: Reward[];
  totalEarned: number;
  totalPaid: number;
}

export function RewardsDisplay() {
  const [activeTab, setActiveTab] = useState<'pending' | 'earned'>('pending');
  const { data, error, isLoading } = useSWR<RewardsData>('/api/referrals/rewards', fetcher);

  // Mock data
  const mockData: RewardsData = {
    pending: [
      {
        id: '1',
        type: 'signup',
        amount: 10,
        status: 'pending',
        description: 'Friend signed up',
        date: '2024-01-15',
        referredUser: 'john_doe',
      },
      {
        id: '2',
        type: 'course_completion',
        amount: 25,
        status: 'pending',
        description: 'Friend completed "Blockchain Basics"',
        date: '2024-01-14',
        referredUser: 'crypto_fan',
      },
    ],
    earned: [
      {
        id: '3',
        type: 'signup',
        amount: 10,
        status: 'earned',
        description: 'Friend signed up',
        date: '2024-01-10',
        referredUser: 'blockchain_newbie',
      },
      {
        id: '4',
        type: 'course_completion',
        amount: 25,
        status: 'earned',
        description: 'Friend completed "Smart Contracts 101"',
        date: '2024-01-08',
        referredUser: 'dev_alice',
      },
      {
        id: '5',
        type: 'milestone',
        amount: 50,
        status: 'earned',
        description: 'Reached 10 successful referrals',
        date: '2024-01-05',
      },
    ],
    totalEarned: 95,
    totalPaid: 45,
  };

  const rewards = data || mockData;
  const activeRewards = activeTab === 'pending' ? rewards.pending : rewards.earned;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'earned':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'paid':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'signup':
        return '👤';
      case 'course_completion':
        return '🎓';
      case 'milestone':
        return '🏆';
      default:
        return '💰';
    }
  };

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-red-600 dark:text-red-400">Failed to load rewards</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Your Rewards
      </h2>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            ${isLoading ? '...' : rewards.totalEarned}
          </div>
          <div className="text-sm text-green-800 dark:text-green-200">
            Total Earned
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            ${isLoading ? '...' : rewards.totalPaid}
          </div>
          <div className="text-sm text-blue-800 dark:text-blue-200">
            Total Paid
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'pending'
              ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          Pending ({rewards.pending.length})
        </button>
        <button
          onClick={() => setActiveTab('earned')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'earned'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          Earned ({rewards.earned.length})
        </button>
      </div>

      {/* Rewards List */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12" />
            </div>
          ))
        ) : activeRewards.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No {activeTab} rewards yet
          </div>
        ) : (
          activeRewards.map((reward) => (
            <div
              key={reward.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="text-xl">{getTypeIcon(reward.type)}</div>

              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">
                  {reward.description}
                </div>
                {reward.referredUser && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Referred: {reward.referredUser}
                  </div>
                )}
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {new Date(reward.date).toLocaleDateString()}
                </div>
              </div>

              <div className="text-right">
                <div className="font-semibold text-gray-900 dark:text-white">
                  +${reward.amount}
                </div>
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    reward.status
                  )}`}
                >
                  {reward.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {activeTab === 'earned' && rewards.earned.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💳 Rewards are paid out monthly. Your next payout will be processed soon!
          </p>
        </div>
      )}
    </div>
  );
}