'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import type { StellarBalance } from './types';

interface TokenSectionProps {
  stellarPublicKey?: string;
  tokenBalance: string | null;
  stellarBalances: StellarBalance[] | null;
  loading: boolean;
  error: boolean;
}

function assetLabel(balance: StellarBalance): string {
  if (balance.asset_type === 'native') return 'XLM';
  return balance.asset_code ?? balance.asset_type;
}

/**
 * Displays the student's BST token balance and full Stellar account balances.
 * Shows a wallet-link prompt when no Stellar wallet is connected.
 */
export function TokenSection({
  stellarPublicKey,
  tokenBalance,
  stellarBalances,
  loading,
  error,
}: TokenSectionProps) {
  return (
    <section aria-labelledby="token-section-heading">
      <h2
        id="token-section-heading"
        className="text-xl font-semibold text-gray-900 dark:text-white mb-4"
      >
        Token & Wallet
      </h2>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* BST balance card */}
          <Card className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">BST Balance</p>
            {error || tokenBalance === null ? (
              <p className="text-2xl font-bold text-gray-400 dark:text-gray-500">—</p>
            ) : (
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {parseFloat(tokenBalance).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 7,
                })}{' '}
                <span className="text-base font-medium text-gray-500">BST</span>
              </p>
            )}
          </Card>

          {/* Wallet-link prompt when no wallet connected */}
          {!stellarPublicKey && (
            <Card className="p-4 border-dashed">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Connect your Stellar wallet to see your full token portfolio and earn rewards.
              </p>
              <a
                href="#wallet"
                className="inline-block mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                aria-label="Go to wallet connection section"
              >
                Link wallet →
              </a>
            </Card>
          )}

          {/* Full Stellar balances list */}
          {stellarPublicKey && stellarBalances && stellarBalances.length > 0 && (
            <Card className="p-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Stellar Account Balances
              </p>
              <ul className="space-y-2" aria-label="Stellar account balances">
                {stellarBalances.map((bal, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {assetLabel(bal)}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 font-mono">
                      {parseFloat(bal.balance).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 7,
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Stellar public key display */}
          {stellarPublicKey && (
            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono break-all">
              {stellarPublicKey.slice(0, 10)}…{stellarPublicKey.slice(-10)}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
