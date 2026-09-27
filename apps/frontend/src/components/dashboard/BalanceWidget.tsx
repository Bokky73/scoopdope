'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { RefreshCw, Wallet, Coins, AlertTriangle, WalletMinimal } from 'lucide-react';
import { fetchXlmBalance, fetchBstBalance } from '@/lib/walletApi';
import { Card } from '@/components/ui/Card';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Formats a human-readable Stellar balance string (e.g. '100.0000000') with
 * thousand separators and up to 7 decimal places.
 * e.g. '1234.5678900' → '1,234.5678900'
 */
function formatBalance(balance: string): string {
  const n = parseFloat(balance);
  if (!Number.isFinite(n)) return '0.00';
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 7 });
}

/**
 * Returns a human-readable relative timestamp string.
 * e.g. 'Updated just now' or 'Updated 42 seconds ago'
 */
function useRelativeTime(timestamp: number | null): string {
  const [label, setLabel] = useState<string>('');

  useEffect(() => {
    if (timestamp === null) {
      setLabel('');
      return;
    }

    function compute() {
      const seconds = Math.floor((Date.now() - timestamp!) / 1000);
      if (seconds < 5) return 'Updated just now';
      if (seconds < 60) return `Updated ${seconds} seconds ago`;
      const minutes = Math.floor(seconds / 60);
      return `Updated ${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    }

    setLabel(compute());
    const id = setInterval(() => setLabel(compute()), 5_000);
    return () => clearInterval(id);
  }, [timestamp]);

  return label;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function BalanceWidgetSkeleton() {
  return (
    <Card className="p-6 animate-pulse" aria-busy="true" aria-label="Loading Stellar balances">
      {/* Header row */}
      <div className="flex items-center justify-between mb-1">
        <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>
      {/* Timestamp placeholder */}
      <div className="h-3 w-28 rounded bg-gray-200 dark:bg-gray-700 mb-4" />
      {/* XLM row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-8 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="h-7 w-36 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      {/* BST row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-8 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="h-7 w-36 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      <span className="sr-only">Loading Stellar balances…</span>
    </Card>
  );
}

// ── No wallet connected ───────────────────────────────────────────────────────

function NoWalletState() {
  return (
    <Card className="p-6 flex flex-col items-center justify-center gap-3 text-center min-h-[140px]">
      <WalletMinimal className="w-8 h-8 text-gray-400 dark:text-gray-500" aria-hidden="true" />
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No wallet connected. Connect your Freighter wallet to see your Stellar balances.
      </p>
    </Card>
  );
}

// ── Full error state (both balances failed) ───────────────────────────────────

function FullErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="p-6 flex flex-col gap-3 min-h-[140px]">
      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
        <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
        <p className="text-sm font-medium">Balances unavailable</p>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Could not fetch your Stellar balances. This can happen if your account
        hasn&apos;t been activated yet or if there is a temporary network issue.
      </p>
      <button
        onClick={onRetry}
        className="self-start flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
        aria-label="Retry fetching Stellar balances"
      >
        <RefreshCw className="w-3 h-3" aria-hidden="true" />
        Retry
      </button>
    </Card>
  );
}

// ── Individual balance row ────────────────────────────────────────────────────

interface BalanceRowProps {
  label: string;
  balance: string | undefined;
  error: unknown;
  icon: React.ReactNode;
}

function BalanceRow({ label, balance, error, icon }: BalanceRowProps) {
  const hasData = balance !== undefined;
  const hasError = !!error;

  return (
    <div className="flex items-center justify-between py-2">
      {/* Icon + label */}
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</span>
      </div>

      {/* Value */}
      {hasError && !hasData ? (
        <span
          className="flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400"
          aria-label={`${label} balance unavailable`}
        >
          <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
          Unavailable
        </span>
      ) : (
        <span
          className="text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-100"
          aria-label={`${formatBalance(balance ?? '0')} ${label}`}
        >
          {formatBalance(balance ?? '0')}
          <span className="ml-1.5 text-sm font-semibold text-gray-400 dark:text-gray-500">
            {label}
          </span>
        </span>
      )}
    </div>
  );
}

// ── Main widget ───────────────────────────────────────────────────────────────

/**
 * Displays the user's XLM and BST balances.
 *
 * Auto-refreshes when:
 *  1. The component mounts (initial fetch)
 *  2. The window regains focus (SWR revalidateOnFocus: true default)
 *  3. Every 60 seconds (refreshInterval)
 *  4. The Refresh button is clicked (increments refreshKey)
 *
 * Usage:
 *   <BalanceWidget stellarPublicKey={state.user?.stellarPublicKey} />
 */
export function BalanceWidget({
  stellarPublicKey,
}: {
  stellarPublicKey?: string | null;
}) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const relativeTime = useRelativeTime(lastUpdated);

  // Track how many successful fetches have completed so we can set lastUpdated
  // only once both have returned on the same refresh cycle.
  const successCount = useRef(0);

  const xlmKey = stellarPublicKey
    ? ['xlm-balance', stellarPublicKey, refreshKey]
    : null;

  const bstKey = stellarPublicKey
    ? ['bst-balance', stellarPublicKey, refreshKey]
    : null;

  const {
    data: xlmBalance,
    error: xlmError,
    isLoading: xlmLoading,
    mutate: mutateXlm,
  } = useSWR<string>(
    xlmKey,
    ([, address]: [string, string, number]) => fetchXlmBalance(address),
    {
      refreshInterval: 60_000,
      keepPreviousData: true,
      shouldRetryOnError: false,
      revalidateOnFocus: true,
      onSuccess: () => {
        successCount.current += 1;
        setLastUpdated(Date.now());
      },
    },
  );

  const {
    data: bstBalance,
    error: bstError,
    isLoading: bstLoading,
    mutate: mutateBst,
  } = useSWR<string>(
    bstKey,
    ([, key]: [string, string, number]) => fetchBstBalance(key),
    {
      refreshInterval: 60_000,
      keepPreviousData: true,
      shouldRetryOnError: false,
      revalidateOnFocus: true,
      onSuccess: () => {
        successCount.current += 1;
        setLastUpdated(Date.now());
      },
    },
  );

  function handleRefresh() {
    successCount.current = 0;
    setRefreshKey((k) => k + 1);
  }

  function handleRetry() {
    successCount.current = 0;
    mutateXlm();
    mutateBst();
  }

  // ── Derived loading state ───────────────────────────────────────────────────

  if (!stellarPublicKey) return <NoWalletState />;

  const initialLoading =
    (xlmLoading && xlmBalance === undefined) ||
    (bstLoading && bstBalance === undefined);

  if (initialLoading) return <BalanceWidgetSkeleton />;

  const bothFailed = xlmError && bstError && xlmBalance === undefined && bstBalance === undefined;
  if (bothFailed) return <FullErrorState onRetry={handleRetry} />;

  const isRefreshing =
    (xlmLoading && xlmBalance !== undefined) ||
    (bstLoading && bstBalance !== undefined);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <Card className="p-6 transition-all hover:shadow-lg border-blue-100 dark:border-blue-900/30">
      {/* Header row */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Stellar Balances
        </h3>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
          aria-label="Refresh Stellar balances"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
          Refresh
        </button>
      </div>

      {/* Last updated timestamp */}
      {relativeTime && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">{relativeTime}</p>
      )}

      {/* Divider */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {/* XLM row */}
        <BalanceRow
          label="XLM"
          balance={xlmBalance}
          error={xlmError}
          icon={
            <span
              className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
              aria-hidden="true"
            >
              <Wallet className="w-3.5 h-3.5" />
            </span>
          }
        />

        {/* BST row */}
        <BalanceRow
          label="BST"
          balance={bstBalance}
          error={bstError}
          icon={
            <span
              className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400"
              aria-hidden="true"
            >
              <Coins className="w-3.5 h-3.5" />
            </span>
          }
        />
      </div>

      {/* Stale-data warning when a refresh failed but we still have cached data */}
      {(xlmError && xlmBalance !== undefined) || (bstError && bstBalance !== undefined) ? (
        <p className="mt-3 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 shrink-0" aria-hidden="true" />
          Showing cached data — last refresh failed
          <button
            onClick={handleRetry}
            className="underline ml-1 hover:no-underline focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 rounded"
          >
            retry
          </button>
        </p>
      ) : null}
    </Card>
  );
}
