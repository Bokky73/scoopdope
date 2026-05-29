'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Props {
  userId: string;
  referralCode: string;
}

export default function ReferralSection({ userId, referralCode }: Props) {
  const [stats, setStats] = useState<{ referralCount: number; earnedBst: number } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api
      .get(`/users/${userId}/referrals`)
      .then((r) => setStats(r.data))
      .catch(() => {});
  }, [userId]);

  const referralLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/register?ref=${referralCode}`
      : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Referrals</h2>

      <p className="text-sm text-gray-600 dark:text-gray-400">
        Share your link — earn <span className="font-medium">50 BST</span> when a referred student
        completes their first course.
      </p>

      <div className="flex items-center gap-2">
        <input
          readOnly
          value={referralLink}
          className="flex-1 truncate border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          aria-label="Referral link"
        />
        <button
          onClick={handleCopy}
          className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {stats && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {stats.referralCount} referral{stats.referralCount !== 1 ? 's' : ''} ·{' '}
          <span className="font-medium">{stats.earnedBst} BST earned</span>
        </p>
      )}
    </section>
  );
}
