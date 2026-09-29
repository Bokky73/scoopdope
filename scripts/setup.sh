#!/usr/bin/env bash
#
# Developer onboarding script.
#
# Installs project dependencies, sets up the local .env file, and seeds the
# database so a fresh checkout is ready to run.
#
# Usage: ./scripts/setup.sh

set -euo pipefail

# Resolve the repository root regardless of where the script is invoked from.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${ROOT_DIR}"

log() {
  printf '\033[1;34m[setup]\033[0m %s\n' "$1"
}

# ---------------------------------------------------------------------------
# 1. Install dependencies
# ---------------------------------------------------------------------------
log "Installing dependencies..."
if [ -f "pnpm-lock.yaml" ]; then
  pnpm install
elif [ -f "yarn.lock" ]; then
  yarn install
elif [ -f "package-lock.json" ]; then
  npm install
elif [ -f "package.json" ]; then
  npm install
else
  log "No JavaScript package manifest found; skipping dependency install."
fi

# ---------------------------------------------------------------------------
# 2. Set up .env from .env.example (never overwrite an existing .env)
# ---------------------------------------------------------------------------
if [ -f ".env" ]; then
  log ".env already exists; leaving it untouched."
elif [ -f ".env.example" ]; then
  log "Creating .env from .env.example..."
  cp .env.example .env
else
  log "No .env.example found; skipping .env setup."
fi

# ---------------------------------------------------------------------------
# 3. Seed the database using the project's existing seed mechanism
# ---------------------------------------------------------------------------
log "Seeding the database..."
if [ -f "package.json" ] && grep -q '"seed"' package.json; then
  if [ -f "pnpm-lock.yaml" ]; then
    pnpm run seed
  elif [ -f "yarn.lock" ]; then
    yarn seed
  else
    npm run seed
  fi
elif [ -f "Makefile" ] && grep -qE '^seed:' Makefile; then
  make seed
else
  log "No seed script found; skipping database seed."
fi

log "Setup complete. Happy hacking!"
