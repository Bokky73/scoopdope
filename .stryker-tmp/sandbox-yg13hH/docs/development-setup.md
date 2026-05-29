# Developer Setup Guide

Complete guide for setting up scoopdope locally from scratch.

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | v18+ | [nodejs.org](https://nodejs.org) |
| npm | v9+ | Bundled with Node.js |
| Rust | v1.75+ | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| Stellar CLI | v21.5.0 | See below |
| PostgreSQL | v12+ | [postgresql.org](https://www.postgresql.org/download/) or Docker |
| Redis | v6+ | [redis.io](https://redis.io/download) or Docker |
| Docker | Optional | [docker.com](https://docs.docker.com/get-docker/) |

### Install Stellar CLI

```bash
curl -sSL https://github.com/stellar/stellar-cli/releases/download/v21.5.0/stellar-cli-21.5.0-x86_64-unknown-linux-gnu.tar.gz | tar xz
sudo mv stellar /usr/local/bin/
stellar --version  # should print v21.5.0
```

---

## 1. Clone & Configure Environment

```bash
git clone https://github.com/your-org/scoopdope.git
cd scoopdope
cp .env.example .env
```

Edit `.env` and fill in the required values:

| Variable | Example Value | Notes |
|---|---|---|
| `DATABASE_HOST` | `localhost` | Use `postgres` inside Docker |
| `DATABASE_PORT` | `5432` | |
| `DATABASE_NAME` | `scoopdope` | |
| `DATABASE_USERNAME` | `postgres` | |
| `DATABASE_PASSWORD` | `postgres` | |
| `REDIS_HOST` | `localhost` | Use `redis` inside Docker |
| `REDIS_PORT` | `6379` | |
| `JWT_SECRET` | `<random-32-char-string>` | `openssl rand -hex 32` |
| `STELLAR_NETWORK` | `testnet` | |
| `STELLAR_SECRET_KEY` | `S...` | See Stellar testnet section below |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000` | |

---

## 2. Database Setup

### Option A — Docker (recommended)

```bash
docker compose up -d postgres redis
```

PostgreSQL will be available at `localhost:5432` and Redis at `localhost:6379`.

### Option B — Manual

```bash
# PostgreSQL
createdb scoopdope
psql -c "CREATE USER postgres WITH PASSWORD 'postgres';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE \"scoopdope\" TO postgres;"

# Redis — start the server
redis-server --daemonize yes
```

---

## 3. Stellar Testnet Account

1. Generate a new keypair:
   ```bash
   stellar keys generate --network testnet dev-account
   stellar keys address dev-account   # prints your public key
   stellar keys show dev-account      # prints your secret key (starts with S)
   ```

2. Fund the account via Friendbot:
   ```bash
   curl "https://friendbot.stellar.org?addr=$(stellar keys address dev-account)"
   ```
   Or use [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=testnet).

3. Copy the secret key into `STELLAR_SECRET_KEY` in your `.env`.

### Re-funding an existing account

Testnet accounts are reset periodically. To re-fund the account configured in `.env`:

```bash
./scripts/fund-testnet.sh
```

The script reads `STELLAR_SECRET_KEY` from `.env`, derives the public key, and calls Friendbot automatically.

### API endpoint (testnet only)

When `STELLAR_NETWORK=testnet`, the backend exposes a funding endpoint:

```
POST /v1/stellar/fund-testnet
Content-Type: application/json

{ "publicKey": "G..." }
```

This is disabled (returns 400) when `STELLAR_NETWORK=mainnet`.

### Profile page

On the profile page, a **Fund Testnet Account** button appears in the wallet section whenever `NEXT_PUBLIC_STELLAR_NETWORK=testnet`. Clicking it calls the endpoint above for the linked wallet address.

---

## 4. Install Dependencies & Build Contracts

```bash
# Install all Node.js dependencies (root + workspaces)
npm install

# Add Wasm compilation target
rustup target add wasm32-unknown-unknown

# Build all Soroban contracts
./scripts/build.sh
```

---

## 5. Deploy Contracts to Testnet

```bash
./scripts/deploy.sh testnet analytics
./scripts/deploy.sh testnet token
./scripts/deploy.sh testnet certificate
```

Contract addresses are saved to `scripts/deployed-contracts.json`. Copy the relevant addresses into your `.env`.

---

## 6. Run the Application

```bash
# Terminal 1 — Backend (http://localhost:3000)
npm run dev:backend

# Terminal 2 — Frontend (http://localhost:3001)
npm run dev:frontend
```

Swagger docs: http://localhost:3000/api/docs

---

## Makefile Shortcuts

```bash
make setup   # install deps + build contracts
make dev     # start backend & frontend concurrently
make test    # run all tests
make build   # production build
make lint    # lint all workspaces
make clean   # remove build artifacts
```

---

## Automated Setup Script

For a fully automated first-time setup:

```bash
./scripts/setup.sh
```

This script checks prerequisites, copies `.env`, installs dependencies, builds contracts, and starts Docker services.

---

## Troubleshooting

### `Error: connect ECONNREFUSED 127.0.0.1:5432` (Database)
- Check PostgreSQL is running: `docker ps` or `pg_isready`
- Verify `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USERNAME`, `DATABASE_PASSWORD` in `.env`
- If using Docker: `docker compose up -d postgres`

### `Error: connect ECONNREFUSED 127.0.0.1:6379` (Redis)
- Check Redis is running: `docker ps` or `redis-cli ping`
- If using Docker: `docker compose up -d redis`
- Verify `REDIS_HOST` and `REDIS_PORT` in `.env`

### `Account not found` (Stellar)
- Your testnet account needs funding. Run:
  ```bash
  curl "https://friendbot.stellar.org?addr=<YOUR_PUBLIC_KEY>"
  ```

### `error[E0463]: can't find crate for wasm32`
- Run: `rustup target add wasm32-unknown-unknown`

### `Port 3000 / 3001 already in use`
- Find and kill the process: `lsof -ti:3000 | xargs kill -9`
- Or change `PORT` in `.env`

### `nest: command not found`
- Run `npm install` from the repo root first.
- Or use: `npx nest start --watch` inside `apps/backend`

### `JWT_SECRET is not defined`
- Ensure `.env` exists and contains `JWT_SECRET`.
- Generate one: `openssl rand -hex 32`

### Contract deployment fails with `insufficient funds`
- Re-fund your testnet account via Friendbot (see step 3 above).

### `cargo audit` fails in CI
- Run `cargo update` to refresh `Cargo.lock`, then re-run.
