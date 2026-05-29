'use client';

import { useEffect, useState } from 'react';

interface TransactionStatusProps {
  txHash: string;
  /** Label shown before the hash, e.g. "Certificate TX" */
  label?: string;
}

type TxStatus = 'loading' | 'success' | 'not_found' | 'error';

const NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'mainnet' ? 'mainnet' : 'testnet';
const HORIZON_URL =
  NETWORK === 'mainnet'
    ? 'https://horizon.stellar.org'
    : 'https://horizon-testnet.stellar.org';
const EXPLORER_BASE =
  NETWORK === 'mainnet'
    ? 'https://stellar.expert/explorer/public/tx'
    : 'https://stellar.expert/explorer/testnet/tx';

export function TransactionStatus({ txHash, label = 'Transaction' }: TransactionStatusProps) {
  const [status, setStatus] = useState<TxStatus>('loading');

  useEffect(() => {
    if (!txHash) return;
    let cancelled = false;

    fetch(`${HORIZON_URL}/transactions/${txHash}`)
      .then((res) => {
        if (cancelled) return;
        if (res.ok) setStatus('success');
        else if (res.status === 404) setStatus('not_found');
        else setStatus('error');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [txHash]);

  const statusBadge: Record<TxStatus, { label: string; className: string }> = {
    loading: { label: 'Checking…', className: 'text-gray-500' },
    success: { label: '✅ Confirmed', className: 'text-green-600 dark:text-green-400' },
    not_found: { label: '⏳ Pending', className: 'text-yellow-600 dark:text-yellow-400' },
    error: { label: '⚠️ Unknown', className: 'text-red-500' },
  };

  const badge = statusBadge[status];

  return (
    <div className="text-sm space-y-1">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-gray-500 dark:text-gray-400">{label}:</span>
        <span className="font-mono text-xs text-gray-700 dark:text-gray-300 break-all">
          {txHash.slice(0, 8)}…{txHash.slice(-8)}
        </span>
        <span className={`text-xs font-medium ${badge.className}`}>{badge.label}</span>
      </div>
      <a
        href={`${EXPLORER_BASE}/${txHash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
      >
        View on Stellar Expert ↗
      </a>
    </div>
  );
}
