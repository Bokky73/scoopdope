#!/usr/bin/env bash
set -euo pipefail

NETWORK=${1:-testnet}
CONTRACT_NAME=${2:-analytics}
FUNCTION=${3:-}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Validate inputs
if [[ ! "$NETWORK" =~ ^(testnet|mainnet)$ ]]; then
    echo "Error: NETWORK must be 'testnet' or 'mainnet'" >&2
    exit 1
fi

if [ -z "$FUNCTION" ]; then
    echo "Usage: $0 <network> <contract_name> <function> [args...]" >&2
    echo "Example: $0 testnet analytics initialize <admin_address>" >&2
    exit 1
fi

# Check if STELLAR_SECRET_KEY is set
if [ -z "${STELLAR_SECRET_KEY:-}" ]; then
    echo "Error: STELLAR_SECRET_KEY environment variable not set" >&2
    exit 1
fi

# Read contract ID from deployed-contracts.json
if [ ! -f "$SCRIPT_DIR/deployed-contracts.json" ]; then
    echo "Error: deployed-contracts.json not found. Run deploy.sh first." >&2
    exit 1
fi

CONTRACT_ID=$(jq -r ".\"$NETWORK\".\"$CONTRACT_NAME\"" "$SCRIPT_DIR/deployed-contracts.json")

if [ "$CONTRACT_ID" = "null" ] || [ -z "$CONTRACT_ID" ]; then
    echo "Error: Contract ID not found for $CONTRACT_NAME on $NETWORK" >&2
    exit 1
fi

# Shift to get remaining arguments
shift 3

echo "Invoking $FUNCTION on $CONTRACT_NAME ($CONTRACT_ID) on $NETWORK..."

stellar contract invoke \
  --id "$CONTRACT_ID" \
  --source "$STELLAR_SECRET_KEY" \
  --network "$NETWORK" \
  -- "$FUNCTION" "$@"
