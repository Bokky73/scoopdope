# Smart Contracts Interaction Guide

This guide covers all deployed Soroban smart contracts on the Stellar network for the scoopdope platform.

---

## Contract Addresses

| Contract | Testnet | Mainnet |
|----------|---------|---------|
| Certificate | `CDA...` *(replace with deployed address)* | TBD |
| Token (BST) | `CAS...` *(replace with deployed address)* | TBD |
| Analytics | `CBZ...` *(replace with deployed address)* | TBD |
| Governance | `CGV...` *(replace with deployed address)* | TBD |

> Deployed addresses are also stored in `scripts/deployed-contracts.json` after running `./scripts/deploy.sh`.

---

## Prerequisites

```bash
# Install Stellar CLI
cargo install --locked stellar-cli --features opt

# Configure testnet identity (one-time)
stellar keys generate --global admin --network testnet
stellar keys fund admin --network testnet
```

---

## Certificate Contract

Manages soulbound NFT certificates issued to students upon course completion.

### Function Signatures

| Function | Parameters | Returns | Auth |
|----------|-----------|---------|------|
| `initialize` | `admin: Address` | — | None (once) |
| `mint_certificate` | `admin: Address, recipient: Address, course_id: Symbol, metadata_url: String` | `u64` (cert ID) | Admin |
| `get_certificate` | `id: u64` | `Option<CertificateRecord>` | None |
| `get_certificates_by_owner` | `owner: Address` | `Vec<CertificateRecord>` | None |

### Event Schema

| Topic 1 | Topic 2 | Data |
|---------|---------|------|
| `Symbol("mint")` | `Symbol("to")` | `(id: u64, course_id: Symbol)` |

### CLI Examples

```bash
# Mint a certificate
stellar contract invoke \
  --id <CERT_CONTRACT_ID> \
  --source admin \
  --network testnet \
  -- \
  mint_certificate \
  --admin <ADMIN_ADDRESS> \
  --recipient <STUDENT_ADDRESS> \
  --course_id RUST101 \
  --metadata_url "https://api.scoopdope.com/v1/certs/1"

# Read a certificate
stellar contract invoke \
  --id <CERT_CONTRACT_ID> \
  --network testnet \
  -- \
  get_certificate \
  --id 1

# List all certificates for a student
stellar contract invoke \
  --id <CERT_CONTRACT_ID> \
  --network testnet \
  -- \
  get_certificates_by_owner \
  --owner <STUDENT_ADDRESS>
```

---

## Token Contract (BST)

scoopdope Token (BST) — SEP-0041 compatible token with instructor vesting.

### Function Signatures

| Function | Parameters | Returns | Auth |
|----------|-----------|---------|------|
| `mint` | `to: Address, amount: i128` | — | Admin |
| `transfer` | `from: Address, to: Address, amount: i128` | — | `from` |
| `balance` | `id: Address` | `i128` | None |
| `create_vesting` | `admin: Address, beneficiary: Address, total_amount: i128, cliff_ledger: u32, end_ledger: u32` | — | Admin |
| `claim_vesting` | `beneficiary: Address` | `i128` (claimed) | Beneficiary |

### Event Schema

| Topic 1 | Topic 2 | Data |
|---------|---------|------|
| `Symbol("transfer")` | `Symbol("from")` | `(from: Address, to: Address, amount: i128)` |
| `Symbol("mint")` | `Symbol("to")` | `(to: Address, amount: i128)` |

### CLI Examples

```bash
# Mint 100 BST (amount in stroops: 100 * 10^7)
stellar contract invoke \
  --id <TOKEN_ID> \
  --source admin \
  --network testnet \
  -- \
  mint \
  --to <USER_ADDRESS> \
  --amount 1000000000

# Check balance
stellar contract invoke \
  --id <TOKEN_ID> \
  --network testnet \
  -- \
  balance \
  --id <USER_ADDRESS>

# Create vesting schedule for an instructor
stellar contract invoke \
  --id <TOKEN_ID> \
  --source admin \
  --network testnet \
  -- \
  create_vesting \
  --admin <ADMIN_ADDRESS> \
  --beneficiary <INSTRUCTOR_ADDRESS> \
  --total_amount 10000000000 \
  --cliff_ledger 500000 \
  --end_ledger 1000000
```

---

## Analytics Contract

Tracks per-student, per-course progress on-chain.

### Function Signatures

| Function | Parameters | Returns | Auth |
|----------|-----------|---------|------|
| `record_progress` | `caller: Address, student: Address, course_id: Symbol, progress_pct: u32` | — | Caller (backend) |
| `get_progress` | `student: Address, course_id: Symbol` | `Option<ProgressRecord>` | None |

### Event Schema

| Topic 1 | Topic 2 | Data |
|---------|---------|------|
| `Symbol("analytics")` | `Symbol("prog_upd")` | `(student: Address, course_id: Symbol, progress_pct: u32)` |
| `Symbol("analytics")` | `Symbol("completed")` | `(student: Address, course_id: Symbol)` |

### CLI Examples

```bash
# Record 75% progress
stellar contract invoke \
  --id <ANALYTICS_ID> \
  --source backend-signer \
  --network testnet \
  -- \
  record_progress \
  --caller <BACKEND_ADDRESS> \
  --student <STUDENT_ADDRESS> \
  --course_id RUST101 \
  --progress_pct 75

# Read progress
stellar contract invoke \
  --id <ANALYTICS_ID> \
  --network testnet \
  -- \
  get_progress \
  --student <STUDENT_ADDRESS> \
  --course_id RUST101
```

---

## Governance Contract

On-chain proposal and voting for platform parameter changes.

### Function Signatures

| Function | Parameters | Returns | Auth |
|----------|-----------|---------|------|
| `create_proposal` | `proposer: Address, title: Symbol, description: String, voting_end_ledger: u32` | `u32` (proposal ID) | BST holder |
| `vote` | `voter: Address, proposal_id: u32, support: bool` | — | BST holder |
| `execute_proposal` | `proposal_id: u32` | — | Anyone (after voting ends) |
| `get_proposal` | `proposal_id: u32` | `Option<Proposal>` | None |

### CLI Examples

```bash
# Create a proposal
stellar contract invoke \
  --id <GOVERNANCE_ID> \
  --source proposer \
  --network testnet \
  -- \
  create_proposal \
  --proposer <PROPOSER_ADDRESS> \
  --title "Increase reward rate" \
  --description "Proposal to increase BST rewards per course completion from 100 to 150." \
  --voting_end_ledger 600000

# Vote in favour
stellar contract invoke \
  --id <GOVERNANCE_ID> \
  --source voter \
  --network testnet \
  -- \
  vote \
  --voter <VOTER_ADDRESS> \
  --proposal_id 1 \
  --support true
```

---

## TypeScript / JavaScript Integration

Install the SDK:

```bash
npm install @stellar/stellar-sdk
```

### Mint a Certificate

```typescript
import {
  Contract,
  Address,
  xdr,
  TransactionBuilder,
  Networks,
  Keypair,
  SorobanRpc,
} from '@stellar/stellar-sdk';

const CERT_CONTRACT_ID = process.env.SOROBAN_CONTRACT_ID!;
const server = new SorobanRpc.Server('https://soroban-testnet.stellar.org');

async function mintCertificate(
  adminKeypair: Keypair,
  studentAddress: string,
  courseId: string,
  metadataUrl: string,
): Promise<string> {
  const adminAccount = await server.getAccount(adminKeypair.publicKey());
  const contract = new Contract(CERT_CONTRACT_ID);

  const tx = new TransactionBuilder(adminAccount, {
    fee: '100',
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      contract.call(
        'mint_certificate',
        Address.fromString(adminKeypair.publicKey()).toScVal(),
        Address.fromString(studentAddress).toScVal(),
        xdr.ScVal.scvSymbol(courseId),
        xdr.ScVal.scvString(metadataUrl),
      ),
    )
    .setTimeout(30)
    .build();

  const prepared = await server.prepareTransaction(tx);
  prepared.sign(adminKeypair);

  const result = await server.sendTransaction(prepared);
  return result.hash;
}
```

### Record Progress

```typescript
async function recordProgress(
  backendKeypair: Keypair,
  studentAddress: string,
  courseId: string,
  progressPct: number,
): Promise<void> {
  const account = await server.getAccount(backendKeypair.publicKey());
  const contract = new Contract(process.env.ANALYTICS_CONTRACT_ID!);

  const tx = new TransactionBuilder(account, {
    fee: '100',
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      contract.call(
        'record_progress',
        Address.fromString(backendKeypair.publicKey()).toScVal(),
        Address.fromString(studentAddress).toScVal(),
        xdr.ScVal.scvSymbol(courseId),
        xdr.ScVal.scvU32(progressPct),
      ),
    )
    .setTimeout(30)
    .build();

  const prepared = await server.prepareTransaction(tx);
  prepared.sign(backendKeypair);
  await server.sendTransaction(prepared);
}
```

### Get BST Token Balance

```typescript
async function getTokenBalance(userAddress: string): Promise<bigint> {
  const account = await server.getAccount(userAddress);
  const contract = new Contract(process.env.TOKEN_CONTRACT_ID!);

  const tx = new TransactionBuilder(account, {
    fee: '100',
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      contract.call('balance', Address.fromString(userAddress).toScVal()),
    )
    .setTimeout(30)
    .build();

  const result = await server.simulateTransaction(tx);
  if (SorobanRpc.Api.isSimulationSuccess(result)) {
    return result.result!.retval.i128().lo().toBigInt();
  }
  throw new Error('Simulation failed');
}
```

---

## End-to-End Credential Issuance Flow

```
Student completes lesson
        │
        ▼
Backend: POST /v1/progress  ──► AnalyticsContract.record_progress(student, course, pct)
        │
        │  (pct == 100)
        ▼
AnalyticsContract emits  ──► event: analytics / completed
        │
        ▼
Backend listener detects completion
        │
        ▼
Backend: POST /v1/credentials/issue  (JWT or API key auth)
        │
        ▼
CredentialsService.issue()
  ├── CertificateContract.mint_certificate(admin, student, courseId, metadataUrl)
  └── TokenContract.mint(student, 100 BST)
        │
        ▼
Credential record saved to PostgreSQL (txHash stored)
        │
        ▼
Student dashboard: GET /v1/credentials/:userId  ──► shows new certificate
```

### Verifying a Credential

```bash
# Via API
curl https://api.scoopdope.com/v1/credentials/verify/<TX_HASH>

# Via Stellar CLI
stellar tx fetch --hash <TX_HASH> --network testnet
```
