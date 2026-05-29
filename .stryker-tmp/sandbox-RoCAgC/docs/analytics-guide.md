# Analytics Guide

Guide for on-chain progress tracking, leaderboard reporting, and data export.

---

## On-Chain Progress Tracking

The Analytics contract (`contracts/analytics`) stores per-student, per-course progress on the Stellar blockchain using Soroban persistent storage.

### Data Model

```rust
pub struct ProgressRecord {
    pub student: Address,    // Stellar address of the student
    pub course_id: Symbol,   // Course identifier (max 9 chars)
    pub progress_pct: u32,   // 0–100
    pub completed: bool,     // true when progress_pct == 100
    pub timestamp: u64,      // ledger timestamp at last update
}
```

### Storage Layout

| Key | Type | Description |
|-----|------|-------------|
| `Progress(Address, Symbol)` | `ProgressRecord` | Per-student, per-course record |
| `StudentCourses(Address)` | `Vec<Symbol>` | Secondary index: all courses a student has progress in |
| `Admin` | `Address` | Contract administrator |

Both `Progress` and `StudentCourses` entries use persistent storage with automatic TTL extension (threshold: 100 ledgers, extended to: 500 ledgers) on every read or write.

### Contract Functions

| Function | Auth | Description |
|----------|------|-------------|
| `initialize(admin)` | admin | One-time setup |
| `set_admin(new_admin)` | current admin | Transfer admin role |
| `get_admin()` | — | Read current admin |
| `record_progress(caller, student, course_id, progress_pct)` | caller (student or admin) | Record or update progress (0–100) |
| `get_progress(student, course_id)` | — | Read a single progress record |
| `get_all_progress(student)` | — | Read all progress records for a student via secondary index |
| `reset_progress(admin, student, course_id)` | admin | Delete a progress record and remove from secondary index |

### Authorization Rules

- `record_progress`: `caller` must be either the `student` themselves or the contract admin. The backend signer acts as the admin in production.
- `reset_progress`: admin only.
- All read functions are public.

### Events

**`analytics / prog_upd`** — emitted on every `record_progress` call.

```
topics: (Symbol("analytics"), Symbol("prog_upd"))
data:   (student: Address, course_id: Symbol, progress_pct: u32)
```

**`analytics / completed`** — emitted only when `progress_pct == 100`.

```
topics: (Symbol("analytics"), Symbol("completed"))
data:   (student: Address, course_id: Symbol)
```

The `StellarIndexerService` (`apps/backend/src/stellar/stellar-indexer.service.ts`) subscribes to these events and triggers downstream actions such as credential issuance.

---

## Reporting API Endpoints

All endpoints require a valid JWT (`Authorization: Bearer <token>`).

### Record Progress

```
POST /v1/progress
```

**Request body:**

```json
{
  "courseId": "uuid",
  "lessonId": "uuid",
  "progressPct": 75
}
```

**Response (201):**

```json
{
  "id": "uuid",
  "courseId": "uuid",
  "progressPct": 75,
  "txHash": "abc123..."
}
```

When `progressPct >= 100`, the backend automatically:
1. Sets `completedAt` on the progress record.
2. Issues an on-chain credential (Certificate NFT + 100 BST reward).
3. Mints 50 BST to the referrer if this is the student's first completed course.

On-chain recording is non-fatal — if the Soroban call fails, progress is still saved off-chain.

### Get User Progress

```
GET /v1/users/:id/progress
```

**Response (200):**

```json
[
  {
    "courseId": "uuid",
    "lessonId": "uuid",
    "progressPct": 100,
    "completedAt": "2024-06-01T12:00:00.000Z",
    "txHash": "abc123...",
    "updatedAt": "2024-06-01T12:00:00.000Z"
  }
]
```

Results are ordered by `updatedAt DESC`.

---

## Leaderboard Calculation

The leaderboard ranks students by their BST (scoopdope Token) balance on the Stellar network.

### Logic

1. Fetch all users with a `stellarPublicKey` that are not soft-deleted.
2. Query each user's BST balance via `StellarService.getTokenBalance()`. Users whose balance cannot be fetched are assigned `"0"`.
3. Sort descending by balance (BigInt comparison). Ties are broken alphabetically by email.
4. Return the top 50 entries.

### Caching

Results are cached in Redis under the key `leaderboard:top50` for **5 minutes** (300,000 ms). The cache is populated on first request and served from Redis on subsequent requests until expiry.

### Leaderboard Entry Shape

```json
{
  "userId": "uuid",
  "username": "alice",
  "email": "[email]",
  "stellarPublicKey": "G...",
  "balance": "1500000000"
}
```

`balance` is in stroops (1 BST = 10,000,000 stroops).

### Leaderboard Endpoint

```
GET /v1/leaderboard
```

No authentication required. Returns an array of up to 50 entries sorted by BST balance descending.

---

## Data Export Formats

Progress data can be exported from the PostgreSQL database or queried directly from the Soroban contract.

### JSON (via API)

```bash
curl -H "Authorization: Bearer <token>" \
  https://api.scoopdope.com/v1/users/<userId>/progress
```

### CSV (direct DB query)

```sql
COPY (
  SELECT user_id, course_id, progress_pct, completed_at, tx_hash, updated_at
  FROM progress
  WHERE user_id = '<userId>'
  ORDER BY updated_at DESC
) TO '/tmp/progress_export.csv' WITH CSV HEADER;
```

### On-Chain Export (Stellar CLI)

Fetch all progress records for a student directly from the contract:

```bash
stellar contract invoke \
  --id <ANALYTICS_CONTRACT_ID> \
  --network testnet \
  -- \
  get_all_progress \
  --student <STUDENT_ADDRESS>
```

---

## Privacy Considerations

- **On-chain data is public.** `ProgressRecord` entries stored in Soroban persistent storage are readable by anyone with the contract ID and the student's Stellar address. Do not store personally identifiable information in `course_id` or any contract field.
- **Stellar addresses are pseudonymous**, not anonymous. Linking a Stellar address to a real identity is possible if the address is publicly associated with the user.
- **Off-chain records** (PostgreSQL `progress` table) are subject to the platform's data retention and GDPR policies. See [`docs/data-privacy-gdpr.md`](./data-privacy-gdpr.md).
- **`reset_progress`** permanently removes the on-chain record. This action is irreversible on-chain but the off-chain PostgreSQL record remains until explicitly deleted.
- **Leaderboard exposure**: the leaderboard endpoint exposes `username`, `email`, and `stellarPublicKey`. Consider whether exposing `email` is appropriate for your deployment and restrict or mask it if needed.
- **TTL expiry**: progress records that are not accessed for more than 500 ledgers (~41 hours at 5 s/ledger) may be evicted by the Soroban runtime. The backend should periodically refresh TTLs for active students or re-submit progress if a record is found to be missing.
