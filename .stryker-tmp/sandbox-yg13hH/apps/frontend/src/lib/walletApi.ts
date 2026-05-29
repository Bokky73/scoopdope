// Freighter wallet integration
// Freighter exposes window.freighter (or @stellar/freighter-api package)

declare global {
  interface Window {
    freighter?: {
      isConnected: () => Promise<boolean>;
      getPublicKey: () => Promise<string>;
      getNetwork: () => Promise<string>;
    };
  }
}

export function isFreighterInstalled(): boolean {
  return typeof window !== 'undefined' && !!window.freighter;
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

export function truncateAddress(address: string): string {
  if (!address || address.length < 8) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}
