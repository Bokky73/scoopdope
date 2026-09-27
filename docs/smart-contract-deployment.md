# Smart Contract Deployment Guide

This guide covers building and deploying scoopdope Soroban smart contracts to Stellar testnet and mainnet.

## Overview

The scoopdope platform includes automated deployment scripts for managing Soroban smart contracts:

- **`build.sh`** — Compiles contracts to WebAssembly (WASM)
- **`deploy.sh`** — Deploys compiled contracts to Stellar networks
- **`deployment-status.sh`** — Views deployment history and contract IDs
- **`deployment-helpers.sh`** — Reusable utility functions for deployment automation

## Prerequisites

### Required Tools

- **Node.js** v18+ and npm/yarn
- **Rust** v1.75+ with wasm32 target (`rustup target add wasm32-unknown-unknown`)
- **Stellar CLI** v21.5.0+
  - Install: https://github.com/stellar/stellar-cli
- **jq** (JSON processor)
  - Linux: `apt install jq`
  - macOS: `brew install jq`
  - Windows: Download from https://stedolan.github.io/jq/

### Environment Setup

1. **Stellar Secret Key**

   Set your Stellar account secret key as an environment variable:
   ```bash
   export STELLAR_SECRET_KEY='S...'  # Your secret key
   ```

   > **⚠️ Security Warning**: Never commit or share your secret key. Use a `.env` file locally (add to `.gitignore`) or secure secret management in CI/CD.

2. **Network Selection**

   The deployment scripts default to **testnet**. For mainnet deployments, explicitly specify the network:
   ```bash
   ./scripts/deploy.sh mainnet token
   ```

## Building Contracts

### Build All Contracts

```bash
./scripts/build.sh
```

This compiles all contracts in the `contracts/` directory to WASM.

**Output:**
```
ℹ Scoopdope Smart Contract Build
ℹ Building: analytics
✓ Built: analytics
ℹ Building: token
✓ Built: token
ℹ Building: shared
✓ Built: shared

ℹ Build artifacts:
  scoopdope_analytics.wasm (64K)
  scoopdope_token.wasm (128K)
  scoopdope_shared.wasm (96K)

✓ All builds completed successfully
```

### Build Specific Contract

```bash
./scripts/build.sh analytics
```

## Deploying Contracts

### Deploy to Testnet

```bash
./scripts/deploy.sh testnet analytics
```

### Deploy to Mainnet

```bash
./scripts/deploy.sh mainnet token
```

### Deployment Output

```
ℹ Scoopdope Smart Contract Deployment
ℹ Validating prerequisites...
✓ All required tools found
✓ Network: testnet
✓ Contract: analytics
✓ STELLAR_SECRET_KEY is set

ℹ Building contract: analytics
✓ Build successful

ℹ Deploying to testnet...
ℹ Deploying WASM file: scoopdope_analytics.wasm (64K)
✓ Deployment successful

  Contract ID: CBSPZ6I7HYAJVZ4FVWW6WGZQQQQQQQQQQQQQQQQQQQQQQQQQQQQQR5TV6J

ℹ Verifying contract deployment...
✓ Contract verification successful

ℹ Updating deployment registry...
✓ Deployment registry updated
ℹ Recording deployment history...
✓ Deployment recorded in history

════════════════════════════════════════════════════════════
  Deployment Successful
════════════════════════════════════════════════════════════

  Network:       testnet
  Contract:      analytics
  Contract ID:   CBSPZ6I7HYAJVZ4FVWW6WGZQQQQQQQQQQQQQQQQQQQQQQQQQQQQQR5TV6J

  Duration:      45s
  Time:          Thu Aug 27 11:35:42 UTC 2026

════════════════════════════════════════════════════════════

Next steps:
  1. Update your .env file with the contract ID:
     ANALYTICS_CONTRACT_ID=CBSPZ6I7HYAJVZ4FVWW6WGZQQQQQQQQQQQQQQQQQQQQQQQQQQQQQR5TV6J

  2. Verify contract interactions:
     stellar contract invoke --id CBSPZ6I7HYAJVZ4FVWW6WGZQQQQQQQQQQQQQQQQQQQQQQQQQQQQQR5TV6J ...

  3. Reference deployment records:
     scripts/deployed-contracts.json
     scripts/.deployment-history.json
```

## Available Contracts

The following contracts can be deployed independently:

| Contract | Purpose |
|----------|---------|
| `analytics` | On-chain progress tracking per student/course |
| `token` | Reward token (BST) minting and transfers |
| `shared` | RBAC, reentrancy guards, validation utilities |
| `certificate` | Course completion certificates |
| `governance` | Governance and voting mechanisms |
| `reputation` | Reputation scoring system |

## Deployment Registry

All deployed contract IDs are stored in `scripts/deployed-contracts.json`:

```json
{
  "testnet": {
    "analytics": "CBSPZ6I7HYAJVZ4FVWW6WGZQQQQQQQQQQQQQQQQQQQQQQQQQQQQQR5TV6J",
    "token": "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"
  },
  "mainnet": {
    "analytics": "CAKRJPY5BNM3BQSQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ46QZQ"
  }
}
```

Access contract IDs programmatically:

```bash
# View all deployments
./scripts/deployment-status.sh

# View testnet deployments
./scripts/deployment-status.sh testnet

# View mainnet deployments
./scripts/deployment-status.sh mainnet

# View deployment history
./scripts/deployment-status.sh history 20
```

## Deployment History

Each deployment is recorded in `scripts/.deployment-history.json` with metadata:

```json
[
  {
    "timestamp": "2026-08-27T11:35:42Z",
    "network": "testnet",
    "contract": "analytics",
    "contract_id": "CBSPZ6I7HYAJVZ4FVWW6WGZQQQQQQQQQQQQQQQQQQQQQQQQQQQQQR5TV6J",
    "git_commit": "abc1234"
  }
]
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `STELLAR_SECRET_KEY` | ✓ | Stellar account secret for deployment |
| `STELLAR_NETWORK` | | Default network (`testnet` or `mainnet`) |

### Script Configuration (in `deploy.sh`)

- **WASM Target**: `wasm32-unknown-unknown` (fixed, required for Soroban)
- **Build Profile**: `release` (optimized for production)
- **Wasm Optimization**: size-optimized (`opt-level = "z"`) per `Cargo.toml`

## Error Handling

### Common Errors

**Error: "STELLAR_SECRET_KEY environment variable not set"**
```bash
export STELLAR_SECRET_KEY='S...'
./scripts/deploy.sh testnet analytics
```

**Error: "Contract not found"**
- Verify the contract directory exists in `contracts/<name>/`
- Ensure `Cargo.toml` is present

**Error: "WASM file not found"**
- Run `./scripts/build.sh` to compile contracts first
- Check build logs for compilation errors

**Error: "Failed to extract contract ID"**
- Verify your Stellar secret key is valid
- Check network connectivity to Stellar
- Ensure account has sufficient balance

### Network Errors

The deployment script handles network errors gracefully:
- Validates prerequisites before deployment
- Provides clear error messages with remediation steps
- Does not update registries on failed deployments

## Usage in CI/CD

### GitHub Actions Example

```yaml
name: Deploy Contracts

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          target: wasm32-unknown-unknown
      
      - name: Install Stellar CLI
        run: |
          curl https://github.com/stellar/stellar-cli/releases/download/v21.5.0/stellar-cli-21.5.0-x86_64-unknown-linux-gnu.tar.gz | tar xz
          sudo mv stellar /usr/local/bin/
      
      - name: Build Contracts
        run: ./scripts/build.sh
      
      - name: Deploy to Testnet
        env:
          STELLAR_SECRET_KEY: ${{ secrets.STELLAR_TESTNET_SECRET_KEY }}
        run: |
          ./scripts/deploy.sh testnet analytics
          ./scripts/deploy.sh testnet token
      
      - name: Upload Deployment Registry
        uses: actions/upload-artifact@v3
        with:
          name: deployment-registry
          path: scripts/deployed-contracts.json
```

### Using Deployment Helpers

Source `deployment-helpers.sh` in custom scripts:

```bash
#!/usr/bin/env bash
source ./scripts/deployment-helpers.sh

# Build and deploy
build_contract "analytics"
wasm_file=$(find_wasm_file "analytics")
contract_id=$(deploy_contract_to_network "$wasm_file" "testnet")

# Update environment
update_env_contract_id "analytics" "$contract_id"

# Verify
verify_contract_exists "$contract_id" "testnet"

log_success "Deployment complete: $contract_id"
```

## Verification

### Verify Contract on Network

```bash
stellar contract info --id CBSPZ6I7HYAJVZ4FVWW6WGZQQQQQQQQQQQQQQQQQQQQQQQQQQQQQR5TV6J --network testnet
```

### Invoke Contract

```bash
stellar contract invoke \
  --id CBSPZ6I7HYAJVZ4FVWW6WGZQQQQQQQQQQQQQQQQQQQQQQQQQQQQQR5TV6J \
  --source $STELLAR_SECRET_KEY \
  --network testnet \
  -- get_data
```

### View Transaction History

```bash
stellar tx --id CBSPZ6I7HYAJVZ4FVWW6WGZQQQQQQQQQQQQQQQQQQQQQQQQQQQQQR5TV6J --network testnet
```

## Troubleshooting

### Deployment Stuck or Slow

- Check Stellar network status: https://status.stellar.org
- Increase Stellar CLI timeout if needed
- Verify network connectivity

### Contract ID Not Recognized

- Wait a few seconds for network propagation
- Verify contract was actually deployed (check transaction on Stellar Lab)
- Check for deployment errors in logs

### Build Fails

- Ensure Rust toolchain is up-to-date: `rustup update`
- Clear cache and rebuild: `cargo clean && ./scripts/build.sh`
- Check for Rust compilation errors in output

## Best Practices

1. **Always build before deploying**
   ```bash
   ./scripts/build.sh && ./scripts/deploy.sh testnet analytics
   ```

2. **Test on testnet first**
   - Deploy to testnet
   - Verify contract behavior
   - Then deploy to mainnet

3. **Keep secret keys secure**
   - Use environment variables or secret managers
   - Never commit keys to repository
   - Rotate keys regularly

4. **Track deployments**
   - Commit `scripts/deployed-contracts.json` to version control
   - Review deployment history regularly
   - Keep `.deployment-history.json` for audit trail

5. **Automate in CI/CD**
   - Use GitHub Actions or equivalent
   - Deploy on release tags for mainnet
   - Deploy on push to main for testnet

6. **Document contract versions**
   - Tag releases with contract versions
   - Record contract IDs with release notes
   - Maintain compatibility matrix

## Support

For issues or questions:
1. Check error output and this guide
2. Review deployment history: `./scripts/deployment-status.sh history`
3. Check Stellar documentation: https://developers.stellar.org
4. Open an issue on GitHub: https://github.com/scoopdope/scoopdope

## See Also

- [Stellar Documentation](https://developers.stellar.org)
- [Soroban Smart Contracts](https://soroban.stellar.org)
- [Stellar Laboratory](https://laboratory.stellar.org)
- [Architecture Guide](./architecture.md)
