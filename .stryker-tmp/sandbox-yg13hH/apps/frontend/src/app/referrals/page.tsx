'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ReferralLink } from '@/components/referrals/ReferralLink';
import { ReferralStats } from '@/components/referrals/ReferralStats';
import { SocialSharing } from '@/components/referrals/SocialSharing';
import { ReferralLeaderboard } from '@/components/referrals/ReferralLeaderboard';
import { RewardsDisplay } from '@/components/referrals/RewardsDisplay';

export default function ReferralsPage() {
  return (
    <ProtectedRoute>
      <main className="max-w-6xl mx-auto p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Referral Program
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Invite friends to join scoopdope and earn rewards for each successful referral.
            Share your unique link and start building your network!
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <ReferralLink />
            <SocialSharing />
          </div>
          <div className="space-y-6">
            <ReferralStats />
            <RewardsDisplay />
          </div>
        </div>

        <ReferralLeaderboard />
      </main>
    </ProtectedRoute>
  );
}