// Wallet integration for Freighter and Stellar Lab
// Freighter exposes window.freighter (or @stellar/freighter-api package)
// Stellar Lab exposes window.stellarWallet (or similar interface)

import api from './api';

declare global {
  interface Window {
    freighter?: {
      isConnected: () => Promise<boolean>;
      getPublicKey: () => Promise<string>;
      getNetwork: () => Promise<string>;
    };
    stellarWallet?: {
      isConnected: () => Promise<boolean>;
      getPublicKey: () => Promise<string>;
      getNetwork: () => Promise<string>;
    };
  }
}

export type WalletType = 'freighter' | 'stellar-lab';

export function isFreighterInstalled(): boolean {
  return typeof window !== 'undefined' && !!window.freighter;
}

export function isStellarLabInstalled(): boolean {
  return typeof window !== 'undefined' && !!window.stellarWallet;
}

export async function connectFreighter(): Promise<string> {
  if (!isFreighterInstalled()) {
    throw new Error('FREIGHTER_NOT_INSTALLED');
  }
  const connected = await window.freighter!.isConnected();
  if (!connected) {
    throw new Error('FREIGHTER_NOT_CONNECTED');
  }
  const publicKey = await window.freighter!.getPublicKey();
  return publicKey;
}

export async function connectStellarLab(): Promise<string> {
  if (!isStellarLabInstalled()) {
    throw new Error('STELLAR_LAB_NOT_INSTALLED');
  }
  const connected = await window.stellarWallet!.isConnected();
  if (!connected) {
    throw new Error('STELLAR_LAB_NOT_CONNECTED');
  }
  const publicKey = await window.stellarWallet!.getPublicKey();
  return publicKey;
}

export async function connectWallet(walletType: WalletType): Promise<string> {
  switch (walletType) {
    case 'freighter':
      return connectFreighter();
    case 'stellar-lab':
      return connectStellarLab();
    default:
      throw new Error('UNKNOWN_WALLET_TYPE');
  }
}

export async function fetchXlmBalance(address: string): Promise<string> {
  const network = process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet';
  const horizonUrl =
    network === 'mainnet'
      ? 'https://horizon.stellar.org'
      : 'https://horizon-testnet.stellar.org';

  const res = await fetch(`${horizonUrl}/accounts/${address}`);
  if (!res.ok) throw new Error('BALANCE_FETCH_FAILED');
  const data = await res.json();
  const xlmBalance = data.balances?.find((b: { asset_type: string }) => b.asset_type === 'native');
  return xlmBalance ? xlmBalance.balance : '0';
}

/**
 * Fetches the user's BST token balance from the backend.
 *
 * The backend calls the Stellar Token contract and returns the balance via
 * GET /stellar/balance/:publicKey — which returns an array of balance objects.
 * We find the entry with asset_code === 'BST' and return its balance string.
 *
 * Returns '0' when:
 *  - the account has no BST trustline yet (new account)
 *  - the account does not exist on-chain yet
 *
 * @throws on unexpected network/server errors so callers can show an error state
 */
export async function fetchBstBalance(publicKey: string): Promise<string> {
  const { data } = await api.get<Array<{ asset_code?: string; asset_type: string; balance: string }>>(
    `/stellar/balance/${publicKey}`,
  );

  const bstEntry = data.find((b) => b.asset_code === 'BST');
  return bstEntry?.balance ?? '0';
}

export function truncateAddress(address: string): string {
  if (!address || address.length < 8) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}
