# Smart Contract ABI Guide

This document explains how scoopdope manages Soroban contract ABI files: what they are, where they live, how to generate/update them, and how to validate them.

---

## What are ABIs?

An **ABI (Application Binary Interface)** describes the public interface of a Soroban smart contract — its functions, their argument types, return types, custom types, and events. The backend and frontend use ABI files to know exactly how to call a contract without having to parse Rust source code at runtime.

---

## Where ABIs live

All ABI JSON files are stored under version control at:

```
contracts/abis/
├── index.json        ← manifest listing all contracts
├── analytics.json    ← on-chain progress tracking
├── certificate.json  ← certificate NFT minting
├── token.json        ← BST reward token (SEP-0041)
└── shared.json       ← RBAC & shared utilities
```

---

## ABI file schema

Each `<contract>.json` follows this structure:

```jsonc
{
  "contract_name": "analytics",    // Must match filename
  "version": "1.0.0",              // Semver
  "network": "stellar/soroban",
  "description": "...",            // Optional
  "functions": [
    {
      "name": "record_progress",
      "doc": "...",                // Optional docstring
      "inputs": [
        { "name": "student",      "type": "address" },
        { "name": "course_id",    "type": "symbol"  },
        { "name": "progress_pct", "type": "i32"     }
      ],
      "outputs": [{ "type": "void" }]
    }
  ],
  "types": {
    "ProgressRecord": {
      "fields": [
        { "name": "student",      "type": "address" },
        { "name": "progress_pct", "type": "u32"     }
      ]
    }
  },
  "events": [
    {
      "name": "mint",
      "topics": ["mint", "certificate_id"],
      "data": { "type": "CertificateRecord" }
    }
  ]
}
```

**Supported primitive types:** `address`, `bool`, `i32`, `i64`, `i128`, `i256`, `u32`, `u64`, `u128`, `u256`, `string`, `symbol`, `bytes`, `bytesN`, `void`

**Generic wrappers:** `Vec<T>`, `Option<T>`, `Map<K, V>`

---

## How to generate / update ABIs

### Automatic (preferred — future work)

> Automatic ABI generation on build is out of scope for #875. This section documents the manual process.

### Manual process

When a contract's public interface changes (new function, renamed argument, changed return type), update the corresponding ABI file by hand:

1. **Open the Rust source file** for the contract, e.g. `contracts/analytics/src/lib.rs`.
2. **Find the `#[contractimpl]` block** — every `pub fn` in that block is part of the public ABI.
3. **Update `contracts/abis/<contract>.json`** to reflect the changes:
   - Add/remove entries in `"functions"`.
   - Update argument `"type"` strings to match the Rust types (see mapping table below).
   - Add any new `#[contracttype]` structs or enums to the `"types"` section.
4. **Bump the `"version"` field** in the ABI file (semver).
5. **Run validation** (see below) to confirm no schema errors.
6. **Commit both files** — the Rust source change and the ABI JSON update — in the same commit.

### Rust → ABI type mapping

| Rust type         | ABI type string |
|-------------------|-----------------|
| `Address`         | `address`       |
| `bool`            | `bool`          |
| `i32`             | `i32`           |
| `i64`             | `i64`           |
| `i128`            | `i128`          |
| `u32`             | `u32`           |
| `u64`             | `u64`           |
| `String`          | `string`        |
| `Symbol`          | `symbol`        |
| `Bytes`           | `bytes`         |
| `BytesN<32>`      | `bytesN`        |
| `Vec<T>`          | `Vec<T>`        |
| `Option<T>`       | `Option<T>`     |
| `()` / no return  | `void`          |
| Custom struct     | Use struct name as listed in `"types"` |

---

## Validating ABIs

Run the validation script before merging any contract change:

```bash
# From the repo root
node scripts/validate-abis.js

# Via npm (from apps/backend)
npm run abi:validate
```

The script checks:

- All files listed in `index.json` exist on disk
- Every ABI has required top-level fields (`contract_name`, `version`, `network`, `functions`, `types`, `events`)
- `contract_name` matches the filename
- `version` is a valid semver string
- All function inputs/outputs reference known primitive types or defined `types` entries
- No duplicate function names
- Event definitions are well-formed

**Exit code 0 = all valid. Exit code 1 = validation errors found.**

---

## Using ABIs at runtime

### Backend (NestJS / Node.js)

```typescript
import { loadAbi, getFunction } from 'src/stellar/abi-loader';

// Load the full ABI
const abi = loadAbi('analytics');

// Look up a specific function definition
const fn = getFunction('analytics', 'record_progress');
console.log(fn.inputs); // [{ name: 'student', type: 'address' }, ...]
```

### Frontend (Next.js / browser)

```typescript
import { loadAbi, getFunction } from '@/lib/abi-loader';

// Async — bundler includes the JSON at build time
const abi = await loadAbi('token');
const fn  = await getFunction('token', 'mint_reward');
```

---

## CI integration

The ABI validation runs as part of the CI pipeline (`contracts` job). A failing validation blocks merges. See `.github/workflows/ci.yml`.

To add it manually to your workflow:

```yaml
- name: Validate contract ABIs
  run: node scripts/validate-abis.js
```

---

## Adding a new contract

1. Create the contract source in `contracts/<name>/`.
2. Write the ABI JSON at `contracts/abis/<name>.json` following the schema above.
3. Add an entry to `contracts/abis/index.json`:
   ```json
   { "name": "<name>", "file": "<name>.json", "description": "..." }
   ```
4. Add the contract to `KNOWN_CONTRACTS` in both:
   - `apps/backend/src/stellar/abi-loader.ts`
   - `apps/frontend/src/lib/abi-loader.ts`
5. Run `node scripts/validate-abis.js` — it must exit 0.
