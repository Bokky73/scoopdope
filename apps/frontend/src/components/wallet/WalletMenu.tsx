'use client';
import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import { useWalletStore } from '@/store/walletStore';
import { connectFreighter, fetchXlmBalance, fetchBstBalance } from '@/lib/walletApi';
import { TestnetFaucet } from './TestnetFaucet';
import { Modal } from '@/components/ui/Modal';
import { RefreshCw } from 'lucide-react';

interface WalletMenuProps {
  onClose: () => void;
}

interface TxRecord {
  id: string;
  created_at: string;
  successful: boolean;
}

const NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'mainnet' ? 'mainnet' : 'testnet';
const HORIZON_URL =
  NETWORK === 'mainnet'
    ? 'https://horizon.stellar.org'
    : 'https://horizon-testnet.stellar.org';
const EXPLORER_BASE =
  NETWORK === 'mainnet'
    ? 'https://stellar.expert/explorer/public/tx'
    : 'https://stellar.expert/explorer/testnet/tx';

export function WalletMenu({ onClose }: WalletMenuProps) {
  const { address, balance, bstBalance, bstBalanceRefreshKey, balanceError, disconnect, setAddress, setBalance, setBstBalance, setBalanceError, setIsConnecting, setError } = useWalletStore();
  const menuRef = useRef<HTMLDivElement>(null);
  const [txHistory, setTxHistory] = useState<TxRecord[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch BST balance using SWR
  const { data: bstBalanceData, error: bstError, isLoading: bstLoading, mutate: mutateBst } = useSWR<string>(
    address ? ['bst-balance', address, bstBalanceRefreshKey] : null,
    ([, key]: [string, string, number]) => fetchBstBalance(key),
    {
      refreshInterval: 60_000,
      keepPreviousData: true,
      shouldRetryOnError: false,
      onSuccess: (data) => setBstBalance(data),
    }
  );

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  // Fetch recent transactions
  useEffect(() => {
    if (!address) return;
    setTxLoading(true);
    fetch(`${HORIZON_URL}/accounts/${address}/transactions?limit=5&order=desc`)
      .then((r) => r.json())
      .then((data) => setTxHistory(data._embedded?.records ?? []))
      .catch(() => setTxHistory([]))
      .finally(() => setTxLoading(false));
  }, [address]);

  async function handleSwitch() {
    onClose();
    setIsConnecting(true);
    setError(null);
    try {
      const publicKey = await connectFreighter();
      setAddress(publicKey);
      try {
        const bal = await fetchXlmBalance(publicKey);
        setBalance(bal);
        setBalanceError(false);
      } catch {
        setBalance(null);
        setBalanceError(true);
      }
    } catch {
      setError('Failed to switch wallet.');
    } finally {
      setIsConnecting(false);
    }
  }

  async function handleRetryBalance() {
    if (!address) return;
    try {
      const bal = await fetchXlmBalance(address);
      setBalance(bal);
      setBalanceError(false);
    } catch {
      setBalanceError(true);
    }
  }

  function handleConfirmDisconnect() {
    setShowConfirm(false);
    disconnect();
    onClose();
  }

  return (
    <>
    <div
      ref={menuRef}
      className="absolute right-0 top-full mt-1 w-80 bg-white border rounded-xl shadow-lg p-4 z-50 space-y-3"
      role="menu"
    >
      <div>
        <p className="text-xs text-gray-500 mb-0.5">Connected Wallet</p>
        <p className="font-mono text-xs break-all">{address}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-0.5">XLM Balance</p>
        {balanceError ? (
          <p className="text-sm text-gray-500">
            Balance unavailable{' '}
            <button className="text-blue-600 underline text-xs" onClick={handleRetryBalance}>Retry</button>
          </p>
        ) : (
          <p className="text-sm font-medium">{balance ?? '—'} XLM</p>
        )}
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-0.5">BST Balance</p>
        {bstError && bstBalanceData === undefined ? (
          <p className="text-sm text-gray-500">
            Balance unavailable{' '}
            <button className="text-blue-600 underline text-xs flex items-center gap-1" onClick={() => mutateBst()}>
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </p>
        ) : (
          <p className="text-sm font-medium flex items-center gap-2">
            {bstBalanceData ?? '0'} BST
            {bstLoading && <RefreshCw className="w-3 h-3 animate-spin" />}
          </p>
        )}
      </div>
      {address && <TestnetFaucet publicKey={address} />}
      <div className="flex gap-2 pt-2 border-t">
        <button
          className="flex-1 text-sm border rounded-lg py-1.5 hover:bg-gray-50 transition-colors"
          onClick={handleSwitch}
          role="menuitem"
        >
          Switch Wallet
        </button>
        <button
          className="flex-1 text-sm border border-red-200 text-red-600 rounded-lg py-1.5 hover:bg-red-50 transition-colors"
          onClick={() => setShowConfirm(true)}
          role="menuitem"
        >
          Disconnect
        </button>
      </div>
    </div>

    <Modal
      isOpen={showConfirm}
      onClose={() => setShowConfirm(false)}
      title="Disconnect Wallet"
    >
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
        Are you sure you want to disconnect your wallet?
      </p>
      <div className="flex justify-end gap-3">
        <button
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
          onClick={() => setShowConfirm(false)}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          onClick={handleConfirmDisconnect}
        >
          Disconnect
        </button>
      </div>
    </Modal>
    </>
  );
}
