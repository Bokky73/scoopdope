#!/usr/bin/env bash
set -e

echo "🚀 scoopdope — automated local setup"
echo "======================================="

# ── Helpers ──────────────────────────────────────────────────────────────────
require() {
  if ! command -v "$1" &>/dev/null; then
    echo "❌  '$1' not found. $2"
    exit 1
  fi
}

# ── Prerequisite checks ───────────────────────────────────────────────────────
echo ""
echo "🔍 Checking prerequisites..."

require node  "Install from https://nodejs.org (v18+)"
require npm   "Bundled with Node.js"
require rustc "Run: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"

NODE_MAJOR=$(node -e "process.stdout.write(process.versions.node.split('.')[0])")
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "❌  Node.js v18+ required (found $(node -v))"
  exit 1
fi

if ! command -v stellar &>/dev/null; then
  echo "⚠️   Stellar CLI not found. Contract deployment will be unavailable."
  echo "    Install: https://github.com/stellar/stellar-cli/releases/tag/v21.5.0"
fi

echo "   Node.js $(node -v) ✓"
echo "   npm $(npm -v) ✓"
echo "   Rust $(rustc --version) ✓"

# ── Environment file ──────────────────────────────────────────────────────────
echo ""
echo "📄 Configuring environment..."

if [ ! -f .env ]; then
  cp .env.example .env
  echo "   Created .env from .env.example"
  echo "   ⚠️   Edit .env and fill in JWT_SECRET, STELLAR_SECRET_KEY, etc."
else
  echo "   .env already exists — skipping"
fi

# ── Node.js dependencies ──────────────────────────────────────────────────────
echo ""
echo "📦 Installing Node.js dependencies..."
npm install

# ── Rust / Wasm ───────────────────────────────────────────────────────────────
echo ""
echo "🦀 Configuring Rust toolchain..."
rustup target add wasm32-unknown-unknown

# ── Smart contracts ───────────────────────────────────────────────────────────
echo ""
echo "🛠️  Building smart contracts..."
if ./scripts/build.sh; then
  echo "   Contracts built successfully ✓"
else
  echo "   ⚠️   Contract build failed — check output above"
fi

# ── Docker services ───────────────────────────────────────────────────────────
echo ""
echo "🐳 Starting PostgreSQL and Redis..."
if command -v docker &>/dev/null; then
  if docker compose up -d postgres redis; then
    echo "   PostgreSQL and Redis started ✓"
    echo "   Waiting for PostgreSQL to be ready..."
    for i in $(seq 1 15); do
      if docker compose exec -T postgres pg_isready -U postgres &>/dev/null; then
        echo "   PostgreSQL ready ✓"
        break
      fi
      sleep 2
    done
  else
    echo "   ⚠️   Docker Compose failed — start PostgreSQL and Redis manually"
  fi
else
  echo "   ⚠️   Docker not found — start PostgreSQL and Redis manually"
fi

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit .env with your credentials (JWT_SECRET, STELLAR_SECRET_KEY, etc.)"
echo "  2. Fund your Stellar testnet account:"
echo "     curl \"https://friendbot.stellar.org?addr=<YOUR_PUBLIC_KEY>\""
echo "  3. Deploy contracts: ./scripts/deploy.sh testnet analytics"
echo "  4. Start the app:    make dev"
echo "     Backend  → http://localhost:3000"
echo "     Frontend → http://localhost:3001"
echo "     Swagger  → http://localhost:3000/api/docs"
