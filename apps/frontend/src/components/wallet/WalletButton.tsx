'use client';
import { useState } from 'react';
import { useWalletStore } from '@/store/walletStore';
import { connectWallet, fetchXlmBalance, type WalletType } from '@/lib/walletApi';
import { WalletMenu } from './WalletMenu';
import { WalletConnectDialog } from './WalletConnectDialog';

export function WalletButton() {
  const { address, isConnecting, error, setAddress, setBalance, setIsConnecting, setError, setBalanceError } = useWalletStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  async function handleConnect(walletType: WalletType) {
    setIsConnecting(true);
    setError(null);
    try {
      const publicKey = await connectWallet(walletType);
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
      if (msg.includes('NOT_CONNECTED')) {
        setError('Connection cancelled.');
      } else if (msg.includes('NOT_INSTALLED')) {
        setError('Wallet not installed. Please install the wallet extension.');
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
          {address.slice(0, 4)}…{address.slice(-4)}
        </button>
        {showMenu && <WalletMenu onClose={() => setShowMenu(false)} />}
      </div>
    );
  }

  return (
    <div>
      <button
        className="flex items-center gap-2 bg-blue-600 text-white rounded-lg px-3 py-1.5 text-sm hover:bg-blue-700 disabled:opacity-60 transition-colors"
        onClick={() => setShowDialog(true)}
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
      <WalletConnectDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onConnect={handleConnect}
        isConnecting={isConnecting}
      />
    </div>
  );
}
