# Smart Contract Deployment Quick Start

## One-Time Setup

```bash
# 1. Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 2. Install wasm target
rustup target add wasm32-unknown-unknown

# 3. Install Stellar CLI
curl https://github.com/stellar/stellar-cli/releases/download/v21.5.0/stellar-cli-21.5.0-x86_64-unknown-linux-gnu.tar.gz | tar xz
sudo mv stellar /usr/local/bin/

# 4. Install jq (if not already installed)
# Ubuntu/Debian
sudo apt install jq
# macOS
brew install jq

# 5. Set your Stellar secret key
export STELLAR_SECRET_KEY='S...'  # Your secret key here
```

## Build Contracts

```bash
# Build all contracts
./scripts/build.sh

# Build specific contract
./scripts/build.sh analytics
```

## Deploy to Testnet

```bash
# Deploy analytics contract
./scripts/deploy.sh testnet analytics

# Deploy token contract
./scripts/deploy.sh testnet token

# Deploy shared contract
./scripts/deploy.sh testnet shared
```

## Deploy to Mainnet

```bash
# Deploy analytics to mainnet
./scripts/deploy.sh mainnet analytics

# Deploy token to mainnet
./scripts/deploy.sh mainnet token
```

## Check Deployment Status

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

## Common Workflow

```bash
# 1. Build
./scripts/build.sh

# 2. Deploy to testnet for testing
./scripts/deploy.sh testnet analytics
./scripts/deploy.sh testnet token

# 3. Verify on testnet
./scripts/deployment-status.sh testnet

# 4. Deploy to mainnet
./scripts/deploy.sh mainnet analytics
./scripts/deploy.sh mainnet token

# 5. Check mainnet status
./scripts/deployment-status.sh mainnet
```

## Update Environment Variables

After deployment, update your `.env` file with the contract IDs:

```bash
ANALYTICS_CONTRACT_ID=CBSPZ6I7HYAJVZ4FVWW6WGZQQQQQQQQQQQQQQQQQQQQQQQQQQQQQR5TV6J
TOKEN_CONTRACT_ID=CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF
SHARED_CONTRACT_ID=CBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBWZB
```

## Troubleshooting

### "STELLAR_SECRET_KEY not set"
```bash
export STELLAR_SECRET_KEY='S...'
```

### "Contract not found"
- Check contract exists in `contracts/<name>/`
- List available contracts: `ls contracts/`

### "Build failed"
```bash
# Clean and rebuild
cargo clean
./scripts/build.sh
```

### "Deployment failed"
- Check Stellar network status: https://status.stellar.org
- Verify account has balance: `stellar account info --source <your-public-key> --network testnet`
- Check error message for details

## Documentation

- **Full Guide**: [docs/smart-contract-deployment.md](docs/smart-contract-deployment.md)
- **Implementation Summary**: [DEPLOYMENT_AUTOMATION_SUMMARY.md](DEPLOYMENT_AUTOMATION_SUMMARY.md)
- **Stellar Docs**: https://developers.stellar.org

## Files Reference

- `scripts/build.sh` - Build contracts
- `scripts/deploy.sh` - Deploy contracts
- `scripts/deployment-status.sh` - Check status
- `scripts/deployment-helpers.sh` - Utility functions
- `scripts/deployed-contracts.json` - Contract ID registry
- `scripts/.deployment-history.json` - Deployment audit log
