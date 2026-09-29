import { Networks } from '@stellar/stellar-sdk';

/**
 * Stellar network configuration.
 *
 * The active network is controlled by the STELLAR_NETWORK environment variable.
 * Supported values: "testnet" (default) and "mainnet".
 */
export type StellarNetwork = 'testnet' | 'mainnet';

const NETWORK_PASSPHRASES: Record<StellarNetwork, string> = {
  testnet: Networks.TESTNET,
  mainnet: Networks.PUBLIC,
};

const DEFAULT_NETWORK: StellarNetwork = 'testnet';

function resolveNetwork(): StellarNetwork {
  const raw = process.env.STELLAR_NETWORK?.trim().toLowerCase();

  if (!raw) {
    return DEFAULT_NETWORK;
  }

  if (raw === 'testnet' || raw === 'mainnet') {
    return raw;
  }

  throw new Error(
    `Invalid STELLAR_NETWORK value "${process.env.STELLAR_NETWORK}". ` +
      'Expected "testnet" or "mainnet".',
  );
}

export const stellarNetwork: StellarNetwork = resolveNetwork();

export const stellarNetworkPassphrase: string =
  NETWORK_PASSPHRASES[stellarNetwork];

export const isMainnet: boolean = stellarNetwork === 'mainnet';

export const stellarConfig = {
  network: stellarNetwork,
  networkPassphrase: stellarNetworkPassphrase,
  isMainnet,
} as const;
