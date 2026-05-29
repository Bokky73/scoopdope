'use client';
import { useState } from 'react';
import { useWalletStore } from '@/store/walletStore';
import { connectFreighter, fetchXlmBalance, isFreighterInstalled, truncateAddress } from '@/lib/walletApi';
import { WalletMenu } from './WalletMenu';

export function WalletButton() {
  const { address, isConnecting, error, setAddress, setBalance, setIsConnecting, setError, setBalanceError } = useWalletStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  async function handleConnect() {
    if (!isFreighterInstalled()) {
      setShowInstallPrompt(true);
      return;
    }
    setIsConnecting(true);
    setError(null);
    try {
      const publicKey = await connectFreighter();
      setAddress(publicKey);
      // Fetch balance
      try {
        const bal = await fetchXlmBalance(publicKey);
        setBalance(bal);
        setBalanceError(false);
      } catch {
        setBalance(null);
        setBalanceError(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg === 'FREIGHTER_NOT_CONNECTED') {
        setError('Connection cancelled.');
      } else {
        setError('Failed to connect wallet. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  }

  if (address) {
    return (
      <div className="relative">
        <button
          data-tour="wallet-button"
          className="flex items-center gap-2 border rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors"
          onClick={() => setShowMenu((v) => !v)}
          aria-expanded={showMenu}
          aria-haspopup="true"
        >
          <span className="w-2 h-2 rounded-full bg-green-500" aria-hidden="true" />
          {truncateAddress(address)}
        </button>
        {showMenu && <WalletMenu onClose={() => setShowMenu(false)} />}
      </div>
    );
  }

  return (
    <div>
      <button
        className="flex items-center gap-2 bg-blue-600 text-white rounded-lg px-3 py-1.5 text-sm hover:bg-blue-700 disabled:opacity-60 transition-colors"
        onClick={handleConnect}
        disabled={isConnecting}
        aria-busy={isConnecting}
      >
        {isConnecting ? (
          <>
            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
            Connecting…
          </>
        ) : (
          'Connect Wallet'
        )}
      </button>
      {error && (
        <p className="text-xs text-red-600 mt-1">
          {error}{' '}
          <button className="underline" onClick={() => setError(null)}>Dismiss</button>
        </p>
      )}
      {showInstallPrompt && (
        <p className="text-xs text-gray-600 mt-1">
          Freighter not found.{' '}
          <a
            href="https://www.freighter.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Install Freighter
          </a>
          {' '}
          <button className="underline text-gray-500" onClick={() => setShowInstallPrompt(false)}>Dismiss</button>
        </p>
      )}
    </div>
  );
}
