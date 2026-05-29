# Smart Contract Interaction Guide

This guide covers how to interact with the scoopdope Soroban smart contracts deployed on the Stellar network. It targets backend (NestJS/TypeScript) and frontend (Next.js/TypeScript) developers, as well as Rust developers writing cross-contract calls.

---

## Table of Contents

1. [Prerequisites & Setup](#1-prerequisites--setup)
2. [Contract Overview](#2-contract-overview)
3. [Analytics Contract](#3-analytics-contract)
4. [Token Contract (BST)](#4-token-contract-bst)
5. [Certificate Contract](#5-certificate-contract)
6. [Governance Contract](#6-governance-contract)
7. [Shared Contract (RBAC)](#7-shared-contract-rbac)
8. [Badges Contract](#8-badges-contract)
9. [Reputation Contract](#9-reputation-contract)
10. [NFT Contract](#10-nft-contract)
11. [Invoking Contracts from the Backend](#11-invoking-contracts-from-the-backend)
12. [Invoking Contracts from the Frontend](#12-invoking-contracts-from-the-frontend)
13. [Error Codes Reference](#13-error-codes-reference)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Prerequisites & Setup

### Environment Variables

```env
STELLAR_SECRET_KEY=S...          # Signing keypair (admin / backend issuer)
STELLAR_NETWORK=testnet          # "testnet" or "mainnet"
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
ANALYTICS_CONTRACT_ID=C...
TOKEN_CONTRACT_ID=C...
CERTIFICATE_CONTRACT_ID=C...
GOVERNANCE_CONTRACT_ID=C...
SHARED_CONTRACT_ID=C...
```

### TypeScript Dependencies

```bash
npm install @stellar/stellar-sdk
```

### Shared Client Bootstrap (TypeScript)

```typescript
import {
  Keypair, Networks, TransactionBuilder, BASE_FEE,
  Operation, Address, nativeToScVal, xdr,
} from '@stellar/stellar-sdk';
import { SorobanRpc } from '@stellar/stellar-sdk';

const isTestnet = process.env.STELLAR_NETWORK !== 'mainnet';
const networkPassphrase = isTestnet ? Networks.TESTNET : Networks.PUBLIC;
const rpcUrl = process.env.SOROBAN_RPC_URL!;
const server = new SorobanRpc.Server(rpcUrl);
const issuerKeypair = Keypair.fromSecret(process.env.STELLAR_SECRET_KEY!);
```

### Helper: Build, Simulate, Sign & Submit

```typescript
async function invokeContract(
  contractId: string,
  method: string,
  args: xdr.ScVal[],
): Promise<string> {
  const source = await server.getAccount(issuerKeypair.publicKey());
  const tx = new TransactionBuilder(source, { fee: BASE_FEE, networkPassphrase })
    .addOperation(Operation.invokeContractFunction({ contract: contractId, function: method, args }))
    .setTimeout(30)
    .build();

  const prepared = await server.prepareTransaction(tx);
  prepared.sign(issuerKeypair);

  const result = await server.sendTransaction(prepared);
  if (result.status === 'ERROR') throw new Error(`Contract call failed: ${result.hash}`);

  // Poll for confirmation
  let response = await server.getTransaction(result.hash);
  while (response.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND) {
    await new Promise(r => setTimeout(r, 1000));
    response = await server.getTransaction(result.hash);
  }
  if (response.status === SorobanRpc.Api.GetTransactionStatus.FAILED)
    throw new Error(`Transaction failed: ${result.hash}`);

  return result.hash;
}

async function simulateContract(
  contractId: string,
  method: string,
  args: xdr.ScVal[],
): Promise<xdr.ScVal | undefined> {
  const source = await server.getAccount(issuerKeypair.publicKey());
  const tx = new TransactionBuilder(source, { fee: BASE_FEE, networkPassphrase })
    .addOperation(Operation.invokeContractFunction({ contract: contractId, function: method, args }))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (SorobanRpc.Api.isSimulationError(sim)) throw new Error(`Simulation failed: ${sim.error}`);
  return (sim as SorobanRpc.Api.SimulateTransactionSuccessResponse).result?.retval;
}
```

---

## 2. Contract Overview

| Contract | ID Env Var | Purpose |
|---|---|---|
| Analytics | `ANALYTICS_CONTRACT_ID` | Records per-student, per-course progress on-chain |
| Token | `TOKEN_CONTRACT_ID` | BST reward token (SEP-0041 compatible) |
| Certificate | `CERTIFICATE_CONTRACT_ID` | Soulbound NFT certificates for course completion |
| Governance | `GOVERNANCE_CONTRACT_ID` | Token-weighted proposal voting |
| Shared | `SHARED_CONTRACT_ID` | RBAC — roles and permissions |
| Badges | `BADGES_CONTRACT_ID` | Achievement badges minted to students |
| Reputation | `REPUTATION_CONTRACT_ID` | On-chain reputation scores with decay |
| NFT | `NFT_CONTRACT_ID` | Course access NFTs with royalty distribution |

All contracts require an `initialize(admin)` call once after deployment. Double-initialization panics with `"Already initialized"`.

---

## 3. Analytics Contract

Tracks student progress (0–100%) per course. Progress is stored in persistent storage with automatic TTL extension.

### Public Interface

| Function | Auth Required | Description |
|---|---|---|
| `initialize(admin)` | admin | One-time setup |
| `set_admin(new_admin)` | current admin | Transfer admin |
| `get_admin()` | none | Read current admin |
| `record_progress(caller, student, course_id, progress_pct)` | caller (student or admin) | Write progress (0–100) |
| `reset_progress(admin, student, course_id)` | admin | Delete a progress record |
| `get_progress(student, course_id)` | none | Read one record |
| `get_all_progress(student)` | none | Read all records for a student |

**`ProgressRecord` shape:**
```
{ student, course_id, progress_pct: u32, completed: bool, timestamp: u64 }
```

**Events emitted by `record_progress`:**
- `("analytics", "prog_upd")` → `(student, course_id, progress_pct)` — always
- `("analytics", "completed")` → `(student, course_id)` — only when `progress_pct == 100`

### TypeScript Examples

```typescript
const ANALYTICS = process.env.ANALYTICS_CONTRACT_ID!;

// Record progress (backend, signed by admin/issuer)
await invokeContract(ANALYTICS, 'record_progress', [
  new Address(issuerKeypair.publicKey()).toScVal(),   // caller
  new Address(studentPublicKey).toScVal(),            // student
  nativeToScVal('RUST101', { type: 'symbol' }),       // course_id
  nativeToScVal(75, { type: 'u32' }),                 // progress_pct
]);

// Read progress (simulate — no fee)
const retval = await simulateContract(ANALYTICS, 'get_progress', [
  new Address(studentPublicKey).toScVal(),
  nativeToScVal('RUST101', { type: 'symbol' }),
]);
// retval is an Option<ProgressRecord> ScVal; null means no record
```

### Rust Cross-Contract Call

```rust
let progress: Option<ProgressRecord> = env.invoke_contract(
    &analytics_contract_id,
    &soroban_sdk::symbol_short!("get_progress"),
    soroban_sdk::vec![&env, student.into_val(&env), course_id.into_val(&env)],
);
```

---

## 4. Token Contract (BST)

SEP-0041 compatible fungible token. Max supply: 1 billion BST (stored with 7 decimal places, so `1_000_000_0000000` raw units). Includes a reentrancy guard on mutating operations.

### Public Interface

| Function | Auth Required | Description |
|---|---|---|
| `initialize(admin)` | admin | One-time setup |
| `name()` | none | Returns `"scoopdope Token"` |
| `symbol()` | none | Returns `"BST"` |
| `decimals()` | none | Returns `7` |
| `balance(addr)` | none | Token balance for address |
| `total_supply()` | none | Total minted supply |
| `mint(to, amount)` | admin | Mint tokens (admin only) |
| `mint_reward(caller, recipient, amount)` | caller (admin) | Mint reward tokens |
| `burn(from, amount)` | from | Burn own tokens |
| `burn_from(spender, from, amount)` | spender | Burn with allowance |
| `transfer(from, to, amount)` | from | Transfer tokens |
| `transfer_from(spender, from, to, amount)` | spender | Transfer with allowance |
| `approve(owner, spender, amount)` | owner | Set allowance |
| `allowance(owner, spender)` | none | Read allowance |
| `create_vesting(admin, beneficiary, total, start, cliff, end)` | admin | Create vesting schedule |
| `claim_vesting(beneficiary)` | beneficiary | Claim vested tokens |
| `get_vesting(beneficiary)` | none | Read vesting schedule |

**Events:**
- `("transfer", "to", to)` → `amount`
- `("approve", ...)` → `amount`
- `("mint", "to", to)` → `amount`
- `("burn", "from", from)` → `amount`

### TypeScript Examples

```typescript
const TOKEN = process.env.TOKEN_CONTRACT_ID!;

// Read balance (simulate)
const retval = await simulateContract(TOKEN, 'balance', [
  new Address(studentPublicKey).toScVal(),
]);
const balance = retval ? BigInt(retval.value() as bigint).toString() : '0';

// Mint reward (state-changing, signed by admin)
await invokeContract(TOKEN, 'mint_reward', [
  new Address(issuerKeypair.publicKey()).toScVal(), // caller (admin)
  new Address(studentPublicKey).toScVal(),          // recipient
  nativeToScVal(100_0000000, { type: 'i128' }),     // 100 BST (7 decimals)
]);

// Transfer (signed by token holder — requires their keypair)
const holderKeypair = Keypair.fromSecret(holderSecret);
// Build tx with holderKeypair as source and signer
```

> **Decimal note:** All amounts are in raw units. 1 BST = `10_000_000` (7 decimal places). Always multiply user-facing amounts by `10_000_000` before passing to the contract.

---

## 5. Certificate Contract

Issues soulbound (non-transferable) NFT certificates. Each certificate has an auto-incrementing `u64` ID. Attempting to call `transfer` panics with `"soulbound"`.

### Public Interface

| Function | Auth Required | Description |
|---|---|---|
| `initialize(admin)` | admin | One-time setup |
| `get_admin()` | none | Read admin |
| `mint_certificate(admin, recipient, course_id, metadata_url)` | admin | Issue certificate, returns `u64` ID |
| `get_certificate(id)` | none | Fetch by ID → `Option<CertificateRecord>` |
| `get_certificates_by_owner(owner)` | none | All certificates for an address |
| `transfer(...)` | — | Always panics (`"soulbound"`) |

**`CertificateRecord` shape:**
```
{ id: u64, owner, course_id, metadata_url: String, issued_at: u64 }
```

**Events:**
- `("mint", "to", recipient)` → `(id, course_id)`

### TypeScript Examples

```typescript
const CERT = process.env.CERTIFICATE_CONTRACT_ID!;

// Mint a certificate
await invokeContract(CERT, 'mint_certificate', [
  new Address(issuerKeypair.publicKey()).toScVal(),  // admin
  new Address(studentPublicKey).toScVal(),           // recipient
  nativeToScVal('RUST101', { type: 'symbol' }),      // course_id
  nativeToScVal('https://Scoopdope.io/certs/42', { type: 'string' }), // metadata_url
]);

// Fetch all certificates for a student
const retval = await simulateContract(CERT, 'get_certificates_by_owner', [
  new Address(studentPublicKey).toScVal(),
]);
```

---

## 6. Governance Contract

Token-weighted proposal voting. Voting power equals the voter's BST balance at vote time (cross-contract call to the Token contract). A proposal passes when `votes_for > votes_against` after the voting period ends.

### Public Interface

| Function | Auth Required | Description |
|---|---|---|
| `initialize(admin, token_contract)` | admin | One-time setup |
| `get_admin()` | none | Read admin |
| `create_proposal(proposer, title, description, voting_end_ledger)` | proposer | Create proposal, returns `u64` ID |
| `vote(voter, proposal_id, support)` | voter | Cast vote (once per address) |
| `execute_proposal(proposal_id)` | none | Execute a passed proposal |
| `get_proposal(proposal_id)` | none | Fetch proposal → `Option<ProposalRecord>` |
| `has_voted(proposal_id, voter)` | none | Check if address has voted |

**`ProposalRecord` shape:**
```
{ id, proposer, title, description, voting_end_ledger: u32,
  votes_for: i128, votes_against: i128, executed: bool, created_at: u64 }
```

**Events:**
- `("prop_new", "id")` → `id`
- `("vote", "voter")` → `(proposal_id, support)`
- `("exec", ...)` on execution

### TypeScript Examples

```typescript
const GOV = process.env.GOVERNANCE_CONTRACT_ID!;

// Create a proposal (proposer signs)
await invokeContract(GOV, 'create_proposal', [
  new Address(proposerPublicKey).toScVal(),
  nativeToScVal('Increase reward rate', { type: 'string' }),
  nativeToScVal('Proposal to increase BST rewards by 10%', { type: 'string' }),
  nativeToScVal(currentLedger + 1000, { type: 'u32' }), // voting_end_ledger
]);

// Vote (voter signs — requires voter's keypair as transaction source)
// Cast vote: support=true means "for"
await invokeContract(GOV, 'vote', [
  new Address(voterPublicKey).toScVal(),
  nativeToScVal(1n, { type: 'u64' }),   // proposal_id
  nativeToScVal(true, { type: 'bool' }),
]);

// Execute after voting ends
await invokeContract(GOV, 'execute_proposal', [
  nativeToScVal(1n, { type: 'u64' }),
]);
```

> **Note:** `vote` requires the voter's auth. The backend cannot sign on behalf of voters. This call must originate from the frontend with the user's wallet.

---

## 7. Shared Contract (RBAC)

Provides role assignment and permission checks used across the platform.

### Roles & Permissions

| Role | Permissions |
|---|---|
| `Admin` | All permissions |
| `Instructor` | `CreateCourse`, `EnrollStudent` |
| `Student` | None |

Available permissions: `CreateCourse`, `EnrollStudent`, `IssueCredential`, `MintToken`, `ManageUsers`.

### Public Interface

| Function | Auth Required | Description |
|---|---|---|
| `initialize(admin)` | admin | One-time setup |
| `assign_role(caller, target, role)` | admin | Assign role to address |
| `has_role(addr, role)` | none | Check role |
| `has_permission(addr, permission)` | none | Check permission |
| `upgrade(admin, new_wasm_hash)` | admin | Upgrade contract WASM |

**Events:**
- `("rbac", "role_asgn")` → `(target, role)`

### TypeScript Examples

```typescript
const SHARED = process.env.SHARED_CONTRACT_ID!;

// Assign instructor role
await invokeContract(SHARED, 'assign_role', [
  new Address(issuerKeypair.publicKey()).toScVal(), // caller (admin)
  new Address(instructorPublicKey).toScVal(),       // target
  // Role enum variant — encode as ScVal symbol
  xdr.ScVal.scvVec([xdr.ScVal.scvSymbol('Instructor')]),
]);

// Check permission (simulate)
const retval = await simulateContract(SHARED, 'has_permission', [
  new Address(instructorPublicKey).toScVal(),
  xdr.ScVal.scvVec([xdr.ScVal.scvSymbol('CreateCourse')]),
]);
const hasPermission = retval?.value() === true;
```

---

## 8. Badges Contract

Achievement badges are minted to students when they reach milestones (e.g. first course completed, 10 courses completed). Each badge has a `badge_type` symbol and an auto-incrementing `u64` ID.

### Public Interface

| Function | Auth Required | Description |
|---|---|---|
| `initialize(admin)` | admin | One-time setup |
| `create_badge_type(admin, name, description)` | admin | Register a new badge type |
| `mint_badge(admin, owner, badge_type)` | admin | Mint a badge to a student, returns `u64` ID |
| `get_badge(id)` | none | Fetch badge by ID → `Option<BadgeRecord>` |
| `get_badges_by_owner(owner)` | none | All badge IDs for an address |
| `get_badge_type(name)` | none | Fetch badge type metadata |

**`BadgeRecord` shape:**
```
{ id: u64, owner, badge_type: Symbol, minted_at: u64 }
```

### TypeScript Examples

```typescript
const BADGES = process.env.BADGES_CONTRACT_ID!;

// Mint a badge (admin signs)
await invokeContract(BADGES, 'mint_badge', [
  new Address(issuerKeypair.publicKey()).toScVal(),  // admin
  new Address(studentPublicKey).toScVal(),           // owner
  nativeToScVal('first_course', { type: 'symbol' }), // badge_type
]);

// Fetch all badges for a student (simulate)
const retval = await simulateContract(BADGES, 'get_badges_by_owner', [
  new Address(studentPublicKey).toScVal(),
]);
```

### Rust Cross-Contract Call

```rust
let badge_ids: Vec<u64> = env.invoke_contract(
    &badges_contract_id,
    &soroban_sdk::symbol_short!("get_badges"),
    soroban_sdk::vec![&env, owner.into_val(&env)],
);
```

### Stellar CLI

```bash
stellar contract invoke \
  --id $BADGES_CONTRACT_ID \
  --network testnet \
  --source dev-account \
  -- mint_badge \
  --admin $(stellar keys address dev-account) \
  --owner GSTUDENT... \
  --badge_type first_course
```

---

## 9. Reputation Contract

Tracks on-chain reputation scores for students. Scores increase on course completion, reviews, and rewards, and decay over time based on a configurable decay config.

### Public Interface

| Function | Auth Required | Description |
|---|---|---|
| `initialize(admin)` | admin | One-time setup |
| `update_reputation(admin, user, score_change, reason, course_id)` | admin | Add/subtract reputation |
| `apply_decay(admin, user)` | admin | Apply time-based decay to a user's score |
| `get_reputation(user)` | none | Fetch `ReputationRecord` |
| `get_history(user)` | none | Fetch reputation update history |
| `get_total_reputation()` | none | Platform-wide total reputation |

**`ReputationRecord` shape:**
```
{ user, score: i128, level: u8, last_updated: u32, total_updates: u32 }
```

**Reason symbols:** `course_complete`, `review`, `decay`, `reward`

### TypeScript Examples

```typescript
const REP = process.env.REPUTATION_CONTRACT_ID!;

// Award reputation on course completion
await invokeContract(REP, 'update_reputation', [
  new Address(issuerKeypair.publicKey()).toScVal(),       // admin
  new Address(studentPublicKey).toScVal(),                // user
  nativeToScVal(100n, { type: 'i128' }),                  // score_change
  nativeToScVal('course_complete', { type: 'symbol' }),   // reason
  nativeToScVal(null),                                    // course_id (Option<u64>)
]);

// Read reputation (simulate)
const retval = await simulateContract(REP, 'get_reputation', [
  new Address(studentPublicKey).toScVal(),
]);
```

---

## 10. NFT Contract

Course access NFTs allow students to purchase permanent access to a course. Each NFT carries royalty metadata so instructors receive a share of secondary sales.

### Public Interface

| Function | Auth Required | Description |
|---|---|---|
| `initialize(admin)` | admin | One-time setup |
| `mint_nft(admin, owner, course_id, course_name, royalty_basis)` | admin | Mint course access NFT, returns `u32` ID |
| `transfer_nft(from, to, nft_id)` | from | Transfer NFT (royalty paid on transfer) |
| `get_nft(nft_id)` | none | Fetch `NFTMetadata` |
| `get_nfts_by_owner(owner)` | none | All NFT IDs for an address |
| `has_access(nft_id, holder)` | none | Check if address has course access |
| `get_royalty_info(nft_id)` | none | Fetch royalty basis points and recipient |

**`NFTMetadata` shape:**
```
{ nft_id: u32, course_id: Symbol, course_name: String, owner, purchase_date: u64, royalty_basis: u32 }
```

> **Royalty basis points:** `500` = 5%. Applied on secondary transfers, paid to the original instructor.

### TypeScript Examples

```typescript
const NFT = process.env.NFT_CONTRACT_ID!;

// Mint course access NFT
await invokeContract(NFT, 'mint_nft', [
  new Address(issuerKeypair.publicKey()).toScVal(),
  new Address(studentPublicKey).toScVal(),
  nativeToScVal('RUST101', { type: 'symbol' }),
  nativeToScVal('Introduction to Rust', { type: 'string' }),
  nativeToScVal(500, { type: 'u32' }),  // 5% royalty
]);

// Check course access
const retval = await simulateContract(NFT, 'has_access', [
  nativeToScVal(1, { type: 'u32' }),   // nft_id
  new Address(studentPublicKey).toScVal(),
]);
const hasAccess = retval?.value() === true;
```

---

## 11. Invoking Contracts from the Backend

The `StellarService` in `apps/backend/src/stellar/stellar.service.ts` is the central integration point. Extend it for new contract calls.

### Pattern: Read-Only (Simulate)

Use `simulateTransaction` — no fee, no signing required beyond building the transaction.

```typescript
// In StellarService
async getProgress(studentPublicKey: string, courseId: string) {
  return this.simulateContract(
    this.analyticsContractId,
    'get_progress',
    [
      new Address(studentPublicKey).toScVal(),
      nativeToScVal(courseId, { type: 'symbol' }),
    ],
  );
}
```

### Pattern: State-Changing (Submit)

Use `prepareTransaction` → sign → `sendTransaction` → poll.

```typescript
// In StellarService
async recordProgress(studentPublicKey: string, courseId: string, pct: number) {
  return this.retryWithBackoff(() =>
    this.invokeContract(this.analyticsContractId, 'record_progress', [
      new Address(this.issuerKeypair.publicKey()).toScVal(),
      new Address(studentPublicKey).toScVal(),
      nativeToScVal(courseId, { type: 'symbol' }),
      nativeToScVal(pct, { type: 'u32' }),
    ]),
  );
}
```

The existing `retryWithBackoff` helper handles transient RPC failures with exponential backoff (3 attempts by default).

### Caching Read Results

Wrap simulate calls with the injected `CacheManager` to avoid redundant RPC calls:

```typescript
const cacheKey = `progress:${studentPublicKey}:${courseId}`;
const cached = await this.cacheManager.get(cacheKey);
if (cached) return cached;
const result = await this.simulateContract(...);
await this.cacheManager.set(cacheKey, result, 30_000); // 30s TTL
return result;
```

---

## 12. Invoking Contracts from the Frontend

The frontend should only call **read-only** (simulate) operations directly. State-changing operations that require the user's wallet signature use Freighter or a compatible Stellar wallet.

### Read-Only: Fetch Token Balance

```typescript
// apps/frontend — e.g. in a React hook
import { SorobanRpc, TransactionBuilder, BASE_FEE, Networks, Operation, Address, nativeToScVal, Keypair } from '@stellar/stellar-sdk';

const server = new SorobanRpc.Server(process.env.NEXT_PUBLIC_SOROBAN_RPC_URL!);

async function fetchTokenBalance(publicKey: string): Promise<string> {
  // Use a throwaway keypair for simulation source — no secret needed
  const dummyKeypair = Keypair.random();
  const source = await server.getAccount(dummyKeypair.publicKey()).catch(() => {
    // Fallback: use a known funded account as simulation source
    throw new Error('Configure a funded simulation account');
  });

  const tx = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(Operation.invokeContractFunction({
      contract: process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ID!,
      function: 'balance',
      args: [new Address(publicKey).toScVal()],
    }))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (SorobanRpc.Api.isSimulationError(sim)) throw new Error(sim.error);
  const retval = (sim as SorobanRpc.Api.SimulateTransactionSuccessResponse).result?.retval;
  return retval ? BigInt(retval.value() as bigint).toString() : '0';
}
```

> **Tip:** For frontend simulations, route through the backend API (`GET /v1/users/:id/token-balance`) to avoid exposing RPC URLs and to benefit from server-side caching.

### State-Changing: Vote via Freighter Wallet

```typescript
import freighter from '@stellar/freighter-api';

async function castVote(proposalId: bigint, support: boolean) {
  const publicKey = await freighter.getPublicKey();
  const source = await server.getAccount(publicKey);

  const tx = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(Operation.invokeContractFunction({
      contract: process.env.NEXT_PUBLIC_GOVERNANCE_CONTRACT_ID!,
      function: 'vote',
      args: [
        new Address(publicKey).toScVal(),
        nativeToScVal(proposalId, { type: 'u64' }),
        nativeToScVal(support, { type: 'bool' }),
      ],
    }))
    .setTimeout(30)
    .build();

  const prepared = await server.prepareTransaction(tx);
  const signedXdr = await freighter.signTransaction(prepared.toXDR(), {
    networkPassphrase: Networks.TESTNET,
  });

  const result = await server.sendTransaction(
    TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET),
  );
  return result.hash;
}
```

---

## 13. Error Codes Reference

### Panic Strings → HTTP Errors

| Contract panic string | HTTP status | Meaning |
|---|---|---|
| `"Already initialized"` | 409 Conflict | Contract already initialized |
| `"Unauthorized"` | 403 Forbidden | Caller not authorized |
| `"Only admin"` | 403 Forbidden | Admin authorization required |
| `"Progress must be 0-100"` | 400 Bad Request | Progress value out of range |
| `"Insufficient balance"` | 400 Bad Request | Insufficient token balance |
| `"Already voted"` | 409 Conflict | Address has already voted |
| `"Voting period ended"` | 400 Bad Request | Voting period has closed |
| `"Proposal did not pass"` | 400 Bad Request | Proposal did not reach quorum |
| `"soulbound"` | 400 Bad Request | Certificates are non-transferable |
| `"reentrant call"` | 500 Internal | Reentrancy guard triggered |
| `"No voting power"` | 400 Bad Request | Voter holds zero BST |
| `"Max supply reached"` | 400 Bad Request | Token mint would exceed 1B BST |

### Contract Panics → TypeScript Errors

Soroban contract panics surface as simulation or submission errors. Map them to meaningful application errors:

```typescript
async function safeInvoke(contractId: string, method: string, args: xdr.ScVal[]) {
  try {
    return await invokeContract(contractId, method, args);
  } catch (err: any) {
    const msg: string = err.message ?? '';

    if (msg.includes('Already initialized'))   throw new ConflictException('Contract already initialized');
    if (msg.includes('Unauthorized'))          throw new ForbiddenException('Caller not authorized');
    if (msg.includes('Progress must be 0-100')) throw new BadRequestException('Progress must be between 0 and 100');
    if (msg.includes('Insufficient balance'))  throw new BadRequestException('Insufficient token balance');
    if (msg.includes('Already voted'))         throw new ConflictException('Address has already voted on this proposal');
    if (msg.includes('Voting period ended'))   throw new BadRequestException('Voting period has ended');
    if (msg.includes('Proposal did not pass')) throw new BadRequestException('Proposal did not reach quorum');
    if (msg.includes('soulbound'))             throw new BadRequestException('Certificates are non-transferable');
    if (msg.includes('Only admin'))            throw new ForbiddenException('Admin authorization required');

    throw new InternalServerErrorException(`Contract error: ${msg}`);
  }
}
```

### Non-Fatal On-Chain Failures

For operations where the off-chain record is the source of truth (e.g. progress tracking), catch and log contract errors without failing the request:

```typescript
try {
  txHash = await this.stellarService.recordProgress(publicKey, courseId, pct);
} catch (err) {
  this.logger.warn(`On-chain progress record failed (non-fatal): ${err.message}`);
}
// Continue saving to DB regardless
```

### RPC Timeout / Network Errors

Use the existing `retryWithBackoff` in `StellarService` for all state-changing calls. For reads, a single retry is usually sufficient:

```typescript
const result = await Promise.race([
  this.simulateContract(...),
  new Promise((_, reject) => setTimeout(() => reject(new Error('RPC timeout')), 10_000)),
]);
```

---

## 14. Troubleshooting

### `"Already initialized"` on deploy

The contract's `initialize` function was called more than once. Each contract can only be initialized once. Re-deploy a fresh contract instance if you need to reset state.

### `"TOKEN_CONTRACT_ID not configured"` / `"ANALYTICS_CONTRACT_ID not configured"`

The corresponding env var is missing or empty. Verify `.env` contains all five contract IDs and that `ConfigService` maps them correctly in `apps/backend/src/config/configuration.ts`.

### Simulation succeeds but submission fails

This usually means the ledger state changed between simulation and submission (e.g. another transaction modified the same storage entry). Retry the full build → simulate → submit cycle.

### `"reentrant call"` panic

The Token and Analytics contracts have reentrancy guards. This panic means a contract call triggered a re-entry into the same contract. This should not happen in normal usage — check for unexpected cross-contract call chains.

### `"No voting power"` on `vote`

The voter's BST balance is `0` at vote time. The Governance contract reads the balance via a cross-contract call to the Token contract. Ensure the voter holds BST before voting.

### Transaction stuck in `NOT_FOUND`

The Soroban RPC may take several seconds to index a submitted transaction. The polling loop in `invokeContract` waits up to ~30 seconds. If it times out, check the transaction hash on [Stellar Expert](https://stellar.expert) or the [Stellar Laboratory](https://laboratory.stellar.org).

### `"Friendbot is only available on testnet"`

`fundTestnetAccount` is gated to testnet. On mainnet, accounts must be funded via a real XLM transfer.

### Contract returns `None` / empty Vec

- `get_progress` returns `None` if no record exists for that `(student, course_id)` pair.
- `get_certificates_by_owner` returns an empty Vec if the student has no certificates.
- `get_proposal` returns `None` for unknown proposal IDs.

Always handle the `Option` / empty case in your application code before accessing fields.

### TTL expiry (persistent storage)

Analytics and Certificate records use persistent storage with TTL thresholds (`TTL_THRESHOLD=100`, `TTL_EXTEND_TO=500` ledgers). Any read operation automatically extends the TTL. If a record has expired, it will return `None` as if it never existed. For long-lived data, consider archiving records off-chain.
