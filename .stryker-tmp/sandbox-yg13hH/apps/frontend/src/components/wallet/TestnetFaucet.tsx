'use client';

import { useState } from 'react';
import api from '@/lib/api';

interface FaucetResult {
  message: string;
  transactionHash?: string;
  amount?: string;
}

interface Props {
  publicKey: string;
}

export function TestnetFaucet({ publicKey }: Props) {
  const isTestnet =
    process.env.NEXT_PUBLIC_STELLAR_NETWORK !== 'mainnet';

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FaucetResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isTestnet) return null;

  async function handleFund() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.post('/stellar/fund-testnet', { publicKey });
      setResult(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Funding failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-yellow-600 dark:text-yellow-400 text-sm font-semibold">
          🧪 Testnet Faucet
        </span>
        <span className="text-xs text-yellow-500 dark:text-yellow-500 bg-yellow-100 dark:bg-yellow-800 px-2 py-0.5 rounded-full">
          Testnet only
        </span>
      </div>

      <p className="text-xs text-yellow-700 dark:text-yellow-300">
        Fund your testnet wallet with 10,000 XLM via Friendbot.
      </p>

      <button
        onClick={handleFund}
        disabled={loading || !publicKey}
        className="w-full rounded-md bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2 px-4 transition-colors"
        aria-label="Fund testnet wallet"
      >
        {loading ? 'Funding…' : 'Fund Testnet Wallet'}
      </button>

      {result && (
        <div className="rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 p-3 space-y-1">
          <p className="text-sm text-green-700 dark:text-green-300 font-medium">
            ✓ {result.message}
          </p>
          {result.amount && (
            <p className="text-xs text-green-600 dark:text-green-400">
              Amount: {result.amount} XLM
            </p>
          )}
          {result.transactionHash && (
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${result.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline break-all"
            >
              Tx: {result.transactionHash}
            </a>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
