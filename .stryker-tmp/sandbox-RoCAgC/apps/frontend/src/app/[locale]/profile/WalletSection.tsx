'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface Props {
  userId: string;
  stellarPublicKey?: string;
  onLinked: (key: string) => void;
  onUnlinked: () => void;
}

export default function WalletSection({ userId, stellarPublicKey, onLinked, onUnlinked }: Props) {
  const t = useTranslations('wallet');
  const [bstBalance, setBstBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [freighterMissing, setFreighterMissing] = useState(false);
  const [funding, setFunding] = useState(false);
  const [fundMessage, setFundMessage] = useState<string | null>(null);

  useEffect(() => {
    if (stellarPublicKey) {
      api
        .get(`/stellar/balance/${stellarPublicKey}`)
        .then((r) => {
          const bst = r.data.balances?.find(
            (b: { asset_code: string; balance: string }) => b.asset_code === 'BST'
          );
          setBstBalance(bst?.balance ?? '0');
        })
        .catch(() => setBstBalance('0'));
    }
  }, [stellarPublicKey]);

  const linkWallet = async () => {
    setLoading(true);
    setFreighterMissing(false);
    try {
      const freighter = await import('@stellar/freighter-api');
      const { isConnected } = await freighter.isConnected();
      if (!isConnected) {
        setFreighterMissing(true);
        setLoading(false);
        return;
      }

      // Get public key from Freighter
      const { publicKey } = await freighter.getPublicKey();

      // Request challenge from backend
      const challengeResponse = await api.post('/auth/stellar-challenge', { publicKey });
      const { challenge, message } = challengeResponse.data;

      // Sign the challenge with Freighter
      const { signedMessage } = await freighter.signMessage(message, { address: publicKey });

      // Verify signature with backend
      await api.post('/auth/stellar-verify', {
        publicKey,
        signature: signedMessage,
        challenge,
      });

      onLinked(publicKey);
    } catch (error: any) {
      console.error('Wallet linking error:', error);
      if (error?.response?.status === 400) {
        // Challenge or signature verification failed
        setFreighterMissing(true);
      } else if (error?.message?.includes('User declined')) {
        // User declined to sign
        setFreighterMissing(false);
      } else {
        setFreighterMissing(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const unlinkWallet = async () => {
    await api.patch(`/users/${userId}`, { stellarPublicKey: null });
    setBstBalance(null);
    onUnlinked();
  };

  const fundTestnet = async () => {
    if (!stellarPublicKey) return;
    setFunding(true);
    setFundMessage(null);
    try {
      await api.post('/stellar/fund-testnet', { publicKey: stellarPublicKey });
      setFundMessage(t('fundSuccess'));
    } catch {
      setFundMessage(t('fundError'));
    } finally {
      setFunding(false);
    }
  };

  return (
    <section
      aria-labelledby="wallet-heading"
      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4 bg-white dark:bg-gray-900"
    >
      <h2 id="wallet-heading" className="text-lg font-semibold text-gray-900 dark:text-white">
        {t('title')}
      </h2>
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4 bg-white dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('title')}</h2>

      {stellarPublicKey ? (
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-400 mb-1">{t('linkedKey')}</p>
            <code
              aria-label={t('publicKeyLabel', { key: stellarPublicKey })}
              className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-1 rounded break-all block"
            >
              {stellarPublicKey}
            </code>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('linkedKey')}</p>
            <code className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-1 rounded break-all">{stellarPublicKey}</code>
          </div>
          {bstBalance !== null && (
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {t('bstBalance', { balance: Number(bstBalance).toLocaleString() })}
            </p>
          )}
          <Button variant="outline" onClick={unlinkWallet}>{t('unlinkWallet')}</Button>
          {process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'testnet' && (
            <div className="space-y-1">
              <Button variant="outline" onClick={fundTestnet} disabled={funding}>
                {funding ? t('funding') : t('fundTestnet')}
              </Button>
              {fundMessage && <p className="text-sm text-gray-600 dark:text-gray-400">{fundMessage}</p>}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-700 dark:text-gray-400">{t('description')}</p>
          {freighterMissing && (
            <p role="alert" className="text-sm text-amber-700 dark:text-amber-400">
              {t('freighterMissing')}{' '}
              <a
                href="https://www.freighter.app/"
                target="_blank"
                rel="noreferrer"
                className="underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
              >
                {stellarPublicKey}
              </code>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('linkedKey')}</p>
              <code className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-1 rounded break-all">{stellarPublicKey}</code>
            </div>
            {bstBalance !== null && (
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {t('bstBalance', { balance: Number(bstBalance).toLocaleString() })}
              </p>
            )}
            <Button variant="outline" onClick={unlinkWallet}>{t('unlinkWallet')}</Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-700 dark:text-gray-400">{t('description')}</p>
            {freighterMissing && (
              <p role="alert" className="text-sm text-amber-700 dark:text-amber-400">
                {t('freighterMissing')}{' '}
                <a
                  href="https://www.freighter.app/"
                  target="_blank"
                  rel="noreferrer"
                  className="underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                >
                  {t('installFreighter')}
                </a>
              </p>
            )}
            <Button onClick={linkWallet} disabled={loading}>
              {loading ? t('connecting') : t('linkWallet')}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
