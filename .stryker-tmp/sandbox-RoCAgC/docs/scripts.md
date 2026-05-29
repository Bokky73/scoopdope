# scoopdope Scripts Documentation

## Overview

This directory contains build, deployment, and contract interaction scripts for the scoopdope platform.

## Scripts

### build.sh

Builds all Soroban smart contracts in the `contracts/` directory.

**Usage:**
```bash
./scripts/build.sh
```

**Features:**
- Loops over all contracts in `contracts/` directory
- Uses `--release` flag for optimized builds
- Displays WASM file sizes
- Error handling with `set -euo pipefail`

**Output:**
```
Building scoopdope smart contracts...
Building analytics...
Building token...
Building shared...

Build complete. WASM files and sizes:
  target/wasm32-unknown-unknown/release/brain_storm_analytics.wasm (123K)
  target/wasm32-unknown-unknown/release/brain_storm_token.wasm (456K)
  target/wasm32-unknown-unknown/release/brain_storm_shared.wasm (78K)
```

### deploy.sh

Deploys a specific contract to Stellar testnet or mainnet.

**Usage:**
```bash
./scripts/deploy.sh <network> <contract_name>
```

**Arguments:**
- `network`: `testnet` or `mainnet` (default: `testnet`)
- `contract_name`: Contract name (default: `analytics`)

**Examples:**
```bash
# Deploy analytics to testnet
./scripts/deploy.sh testnet analytics

# Deploy token to mainnet
./scripts/deploy.sh mainnet token
```

**Requirements:**
- `STELLAR_SECRET_KEY` environment variable must be set
- Contract must be built first (run `./scripts/build.sh`)
- `jq` must be installed for JSON parsing

**Features:**
- Validates network and contract name
- Checks for WASM file existence
- Automatically updates `deployed-contracts.json` with contract ID
- Error handling with `set -euo pipefail`

### invoke.sh

Calls a function on a deployed contract.

**Usage:**
```bash
./scripts/invoke.sh <network> <contract_name> <function> [args...]
```

**Arguments:**
- `network`: `testnet` or `mainnet`
- `contract_name`: Contract name (must be in `deployed-contracts.json`)
- `function`: Contract function to invoke
- `args`: Function arguments (optional)

**Examples:**
```bash
# Initialize shared contract
./scripts/invoke.sh testnet shared initialize GBUQWP3BOUZX34ULNQG23RQ6F4YUSXHTQSXUSMIQ75XABZXVQRLLOG4

# Record progress
./scripts/invoke.sh testnet analytics record_progress <student_id> <course_id> <progress>
```

**Requirements:**
- `STELLAR_SECRET_KEY` environment variable must be set
- Contract must be deployed first (run `./scripts/deploy.sh`)
- `deployed-contracts.json` must exist with contract IDs
- `jq` must be installed for JSON parsing

**Features:**
- Reads contract ID from `deployed-contracts.json`
- Validates network and contract name
- Error handling with `set -euo pipefail`

## deployed-contracts.json

Stores contract IDs for each network and contract.

**Format:**
```json
{
  "testnet": {
    "analytics": "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4",
    "token": "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4",
    "shared": "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4"
  },
  "mainnet": {
    "analytics": "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4",
    "token": "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4",
    "shared": "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4"
  }
}
```

**Auto-updated by:** `deploy.sh` after successful deployment

## Environment Variables

All scripts require:
- `STELLAR_SECRET_KEY`: Your Stellar account secret key for signing transactions

**Example:**
```bash
export STELLAR_SECRET_KEY="SAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
./scripts/deploy.sh testnet analytics
```

## Error Handling

All scripts use `set -euo pipefail` for robust error handling:
- `set -e`: Exit on any error
- `set -u`: Exit on undefined variable
- `set -o pipefail`: Exit if any command in a pipe fails

## Dependencies

- `bash` (v4+)
- `stellar-cli` (v21.5.0+)
- `jq` (for JSON parsing in deploy.sh and invoke.sh)
- `cargo` (for build.sh)

## Troubleshooting

### "STELLAR_SECRET_KEY environment variable not set"
```bash
export STELLAR_SECRET_KEY="your-secret-key"
```

### "Contract not found in contracts/"
Ensure the contract directory exists and contains a `Cargo.toml` file.

### "WASM file not found"
Run `./scripts/build.sh` first to build all contracts.

### "jq: command not found"
Install jq:
```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq

# CentOS/RHEL
sudo yum install jq
```
