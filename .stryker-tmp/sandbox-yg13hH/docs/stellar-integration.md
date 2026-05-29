# Stellar Network Integration Guide

This guide explains how scoopdope integrates with the Stellar network — covering account management, Freighter wallet integration, on-chain credential issuance, network configuration, and Horizon API usage.

---

## Table of Contents

1. [Overview](#overview)
2. [Stellar Account Management](#stellar-account-management)
3. [Freighter Wallet Integration](#freighter-wallet-integration)
4. [On-Chain Credential Issuance](#on-chain-credential-issuance)
5. [Testnet vs Mainnet Configuration](#testnet-vs-mainnet-configuration)
6. [Horizon API Usage Patterns](#horizon-api-usage-patterns)

---

## Overview

scoopdope uses Stellar for three core functions:

- **Authentication** — SEP-0010 wallet-based login (see [stellar-auth.md](./stellar-auth.md))
- **Credentials** — Course completion certificates recorded on-chain via Soroban smart contracts and Horizon `ManageData` operations
- **Token Rewards** — BST (scoopdope Token) minted to students via the Token Soroban contract

The backend's Stellar logic lives in `apps/backend/src/stellar/`:

```
stellar/
├── stellar.service.ts          # Core Stellar + Soroban operations
├── stellar.controller.ts       # REST endpoints
├── network-monitor.service.ts  # Network health polling
└── stellar-indexer.service.ts  # On-chain event indexing
```

---

## Stellar Account Management

### Server Keypair

The backend uses a single server keypair (the issuer account) for signing credential transactions and invoking Soroban contracts. It is configured via `STELLAR_SECRET_KEY`.

```typescript
import { Keypair } from '@stellar/stellar-sdk';

const issuerKeypair = Keypair.fromSecret(process.env.STELLAR_SECRET_KEY);
console.log(issuerKeypair.publicKey()); // G...
```

> Never expose `STELLAR_SECRET_KEY` in client-side code or version control.

### Loading an Account

Use the Horizon `Server` to load account details and balances:

```typescript
import { Horizon } from '@stellar/stellar-sdk';

const server = new Horizon.Server('https://horizon-testnet.stellar.org');
const account = await server.loadAccount(publicKey);
console.log(account.balances);
```

The `GET /v1/stellar/balance/:publicKey` endpoint wraps this:

```http
GET /v1/stellar/balance/GABC...XYZ
```

```json
[
  { "balance": "9999.9999700", "asset_type": "native" }
]
```

### Funding a Testnet Account (Friendbot)

New testnet accounts need an initial XLM balance. Use the `POST /v1/stellar/fund-testnet` endpoint or call Friendbot directly:

```typescript
await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`);
```

This is only available on testnet. The backend enforces this — calling it on mainnet throws an error.

---

## Freighter Wallet Integration

[Freighter](https://www.freighter.app/) is the official Stellar browser extension wallet. scoopdope uses it for:

- Wallet-based login (SEP-0010)
- Signing credential-related transactions on the frontend

### Installation

```bash
npm install @stellar/freighter-api
```

### Connecting and Getting the Public Key

```typescript
import { isConnected, getPublicKey } from '@stellar/freighter-api';

async function connectWallet(): Promise<string | null> {
  if (!(await isConnected())) {
    alert('Please install the Freighter extension.');
    return null;
  }
  return getPublicKey();
}
```

### Signing a Transaction

```typescript
import { signTransaction } from '@stellar/freighter-api';

const { signedTxXdr } = await signTransaction(unsignedTxXdr, {
  networkPassphrase: 'Test SDF Network ; September 2015', // or Networks.PUBLIC for mainnet
});
```

### Full SEP-0010 Login Flow

```typescript
import { getPublicKey, signTransaction } from '@stellar/freighter-api';

async function stellarLogin(): Promise<string> {
  const publicKey = await getPublicKey();

  // 1. Request challenge from server
  const { transaction, network_passphrase } = await fetch(
    `/v1/auth/stellar?account=${publicKey}`
  ).then(r => r.json());

  // 2. Sign with Freighter
  const { signedTxXdr } = await signTransaction(transaction, {
    networkPassphrase: network_passphrase,
  });

  // 3. Exchange signed challenge for JWT
  const { access_token } = await fetch('/v1/auth/stellar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transaction: signedTxXdr }),
  }).then(r => r.json());

  return access_token;
}
```

See [stellar-auth.md](./stellar-auth.md) for the full SEP-0010 server-side implementation.

---

## On-Chain Credential Issuance

When a student completes a course, scoopdope records the credential on-chain in two steps:

1. **Soroban** — calls `record_progress` on the Analytics contract (primary path)
2. **Horizon ManageData** — writes a `scoopdope:credential:<courseId>` entry to the issuer account (fallback + permanent record)

### Flow

```
Course Completion
      │
      ▼
StellarService.issueCredential(recipientPublicKey, courseId)
      │
      ├─► recordProgressOnChain()   ← Soroban Analytics contract
      │         (retried up to 3×)
      │
      └─► mintCredentialViaHorizon() ← Horizon ManageData tx
```

### Soroban: Recording Progress

The Analytics contract's `record_progress` function stores a completion percentage (100) for a given student + course pair.

```typescript
import {
  TransactionBuilder, Operation, BASE_FEE,
  SorobanRpc, Address, nativeToScVal,
} from '@stellar/stellar-sdk';

const tx = new TransactionBuilder(sourceAccount, {
  fee: BASE_FEE,
  networkPassphrase,
})
  .addOperation(
    Operation.invokeContractFunction({
      contract: ANALYTICS_CONTRACT_ID,
      function: 'record_progress',
      args: [
        new Address(studentPublicKey).toScVal(),
        nativeToScVal(courseId, { type: 'symbol' }),
        nativeToScVal(100, { type: 'i32' }),
      ],
    })
  )
  .setTimeout(30)
  .build();

const prepared = await sorobanServer.prepareTransaction(tx);
prepared.sign(issuerKeypair);
const result = await sorobanServer.sendTransaction(prepared);
```

### Horizon: ManageData Fallback

If the Soroban call fails after retries, a `ManageData` operation is written to the Horizon ledger as a permanent credential record:

```typescript
const tx = new TransactionBuilder(issuerAccount, { fee: BASE_FEE, networkPassphrase })
  .addOperation(
    Operation.manageData({
      name: `scoopdope:credential:${courseId}`,
      value: recipientPublicKey,
    })
  )
  .setTimeout(30)
  .build();

tx.sign(issuerKeypair);
const result = await server.submitTransaction(tx);
// result.hash is the on-chain proof
```

### Minting BST Reward Tokens

After credential issuance, the Token contract mints BST to the student:

```typescript
// POST /v1/stellar/mint  (admin only)
{
  "recipientPublicKey": "GABC...XYZ",
  "courseId": "uuid-of-course"
}
```

Internally this calls `mint_reward` on the Token Soroban contract with the recipient address and amount.

### Verifying a Credential

Query the issuer account's data entries via Horizon:

```bash
curl https://horizon-testnet.stellar.org/accounts/<ISSUER_PUBLIC_KEY> \
  | jq '.data | to_entries[] | select(.key | startswith("scoopdope:credential:"))'
```

Each entry's key encodes the course ID and the base64-decoded value is the student's public key.

---

## Testnet vs Mainnet Configuration

### Environment Variables

| Variable | Testnet | Mainnet |
|---|---|---|
| `STELLAR_NETWORK` | `testnet` | `mainnet` |
| `STELLAR_HORIZON_URL` | `https://horizon-testnet.stellar.org` | `https://horizon.stellar.org` |
| `SOROBAN_RPC_URL` | `https://soroban-testnet.stellar.org` | `https://soroban.stellar.org` |
| `STELLAR_SECRET_KEY` | Testnet keypair | Mainnet keypair (fund with real XLM) |
| `ANALYTICS_CONTRACT_ID` | Testnet contract ID | Mainnet contract ID |
| `TOKEN_CONTRACT_ID` | Testnet contract ID | Mainnet contract ID |
| `STELLAR_WEB_AUTH_DOMAIN` | `localhost` | `api.Scoopdope.app` |

### Network Passphrases

```typescript
import { Networks } from '@stellar/stellar-sdk';

const passphrase = STELLAR_NETWORK === 'mainnet'
  ? Networks.PUBLIC          // 'Public Global Stellar Network ; September 2015'
  : Networks.TESTNET;        // 'Test SDF Network ; September 2015'
```

The backend selects the passphrase automatically based on `STELLAR_NETWORK`.

### Deploying Contracts to Each Network

```bash
# Testnet
./scripts/deploy.sh testnet analytics
./scripts/deploy.sh testnet token

# Mainnet
./scripts/deploy.sh mainnet analytics
./scripts/deploy.sh mainnet token
```

After deployment, update `ANALYTICS_CONTRACT_ID` and `TOKEN_CONTRACT_ID` in your `.env` with the returned contract IDs.

### Frontend Network Config

The frontend reads `NEXT_PUBLIC_STELLAR_NETWORK` to configure Freighter:

```typescript
const networkPassphrase =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'mainnet'
    ? Networks.PUBLIC
    : Networks.TESTNET;
```

---

## Horizon API Usage Patterns

scoopdope uses the `@stellar/stellar-sdk` `Horizon.Server` client. Below are the common patterns used in the codebase.

### Initializing the Server

```typescript
import { Horizon } from '@stellar/stellar-sdk';

const server = new Horizon.Server(
  process.env.STELLAR_HORIZON_URL ?? 'https://horizon-testnet.stellar.org'
);
```

### Fetching Account Balances

```typescript
const account = await server.loadAccount(publicKey);
// account.balances: Array<{ balance, asset_type, asset_code?, asset_issuer? }>
```

### Submitting a Transaction

```typescript
const result = await server.submitTransaction(signedTx);
console.log(result.hash); // transaction hash — use as on-chain proof
```

### Streaming Payments (Event Indexing)

The `stellar-indexer.service.ts` polls for new transactions. You can also stream in real time:

```typescript
server.transactions()
  .forAccount(issuerPublicKey)
  .cursor('now')
  .stream({
    onmessage: (tx) => console.log('New tx:', tx.hash),
    onerror: (err) => console.error(err),
  });
```

### Network Health Check

`GET /v1/stellar/network-status` returns the latest ledger sequence, base fee, and Soroban RPC health, sourced from `NetworkMonitorService`.

```http
GET /v1/stellar/network-status
```

```json
{
  "horizonStatus": "healthy",
  "latestLedger": 123456,
  "baseFeeStroops": 100,
  "sorobanRpcStatus": "healthy"
}
```

### Retry Strategy

All Soroban contract calls use exponential backoff (up to 3 attempts):

| Attempt | Delay |
|---|---|
| 1 | immediate |
| 2 | 1 000 ms |
| 3 | 2 000 ms |

If all attempts fail, the credential flow falls back to the Horizon `ManageData` path.

---

## Related Docs

- [stellar-auth.md](./stellar-auth.md) — SEP-0010 wallet authentication
- [contracts.md](./contracts.md) — Soroban smart contract reference
- [development-setup.md](./development-setup.md) — Local environment setup

## External Resources

- [Stellar Developer Docs](https://developers.stellar.org)
- [Soroban Documentation](https://soroban.stellar.org)
- [Horizon API Reference](https://developers.stellar.org/api/horizon)
- [Freighter Wallet](https://www.freighter.app/)
- [Stellar Laboratory](https://laboratory.stellar.org)
