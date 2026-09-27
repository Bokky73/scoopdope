'use client';

import { Wallet, ExternalLink } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { isFreighterInstalled, isStellarLabInstalled, type WalletType } from '@/lib/walletApi';

interface WalletConnectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (walletType: WalletType) => Promise<void>;
  isConnecting: boolean;
}

const WALLET_OPTIONS = [
  {
    type: 'freighter' as WalletType,
    name: 'Freighter',
    description: 'Popular browser extension wallet for Stellar',
    installUrl: 'https://www.freighter.app/',
    isInstalled: isFreighterInstalled,
  },
  {
    type: 'stellar-lab' as WalletType,
    name: 'Stellar Lab',
    description: 'Official Stellar development wallet',
    installUrl: 'https://laboratory.stellar.org/',
    isInstalled: isStellarLabInstalled,
  },
];

export function WalletConnectDialog({
  isOpen,
  onClose,
  onConnect,
  isConnecting,
}: WalletConnectDialogProps) {
  async function handleConnect(walletType: WalletType) {
    await onConnect(walletType);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Connect Wallet">
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Select a wallet to connect to the Stellar network
        </p>
        <div className="space-y-3">
          {WALLET_OPTIONS.map((option) => {
            const installed = option.isInstalled();
            return (
              <button
                key={option.type}
                onClick={() => handleConnect(option.type)}
                disabled={isConnecting || !installed}
                className="w-full flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left"
              >
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{option.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{option.description}</p>
                </div>
                {!installed && (
                  <a
                    href={option.installUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    Install
                  </a>
                )}
              </button>
            );
          })}
        </div>
        {isConnecting && (
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            Connecting to wallet...
          </p>
        )}
      </div>
    </Modal>
  );
}
