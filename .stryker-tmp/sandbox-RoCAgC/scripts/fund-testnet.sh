#!/usr/bin/env bash
set -euo pipefail

# Load .env if present
if [ -f "$(dirname "$0")/../.env" ]; then
  # shellcheck disable=SC1091
  set -a; source "$(dirname "$0")/../.env"; set +a
fi

if [ -z "${STELLAR_SECRET_KEY:-}" ]; then
  echo "Error: STELLAR_SECRET_KEY is not set" >&2
  exit 1
fi

PUBLIC_KEY=$(stellar keys address --secret-key "$STELLAR_SECRET_KEY" 2>/dev/null || \
  node -e "const sdk=require('@stellar/stellar-sdk'); console.log(sdk.Keypair.fromSecret(process.env.STELLAR_SECRET_KEY).publicKey())")

echo "Funding testnet account: $PUBLIC_KEY"
curl -sf "https://friendbot.stellar.org?addr=${PUBLIC_KEY}" | grep -q '"successful"' \
  && echo "Account funded successfully." \
  || { echo "Friendbot request failed."; exit 1; }
