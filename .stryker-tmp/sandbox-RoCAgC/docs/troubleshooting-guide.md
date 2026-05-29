# Troubleshooting Guide

Common issues and solutions for developers and operators running scoopdope.

---

## Setup Errors

### `Error: connect ECONNREFUSED 127.0.0.1:5432`

PostgreSQL is not running or the connection details are wrong.

**Fix:**
```bash
docker compose up -d postgres

# Verify .env values
DATABASE_HOST=localhost   # use 'postgres' inside Docker
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=scoopdope
```

### `Error: connect ECONNREFUSED 127.0.0.1:6379`

Redis is not running.

**Fix:**
```bash
docker compose up -d redis
redis-cli ping   # should return PONG
```

### `JWT_SECRET is not defined`

The `.env` file is missing or incomplete.

**Fix:**
```bash
cp .env.example .env
openssl rand -hex 32   # paste result as JWT_SECRET in .env
```

### `nest: command not found`

`node_modules` is missing.

**Fix:**
```bash
npm install
```

### `Port 3000 already in use`

**Fix:**
```bash
lsof -ti:3000 | xargs kill -9
```

---

## Stellar Network Connectivity

### `Account not found` / `HostError: Error(Value, Missing)`

The Stellar account has not been funded.

**Fix (testnet):**
```bash
curl "https://friendbot.stellar.org?addr=<YOUR_PUBLIC_KEY>"
# or
./scripts/fund-testnet.sh
```

### Horizon or Soroban RPC unreachable

The backend polls network health every 60 seconds. Check current status:

```
GET /v1/health
```

- If `horizon` or `soroban` shows `"down"`, check [status.stellar.org](https://status.stellar.org).
- Verify `SOROBAN_RPC_URL` in `.env` (default: `https://soroban-testnet.stellar.org`).

### `tx_bad_seq` — transaction sequence mismatch

Retry the operation. The SDK re-fetches the latest sequence number on the next `getAccount()` call.

### `insufficient funds` during contract deployment

```bash
curl "https://friendbot.stellar.org?addr=$(stellar keys address dev-account)"
```

---

## Database Migration Problems

### Migrations not applied on startup

In production (`NODE_ENV=production`), `synchronize` is disabled. Run migrations explicitly:

```bash
cd apps/backend && npm run typeorm:run
```

### `relation already exists`

A partial migration left the schema inconsistent.

**Fix:**
```bash
npm run typeorm:revert   # roll back last migration
npm run typeorm:run      # re-apply
```

### `column does not exist`

Code references a column that hasn't been migrated yet.

**Fix:**
```bash
npm run typeorm:run
```

### Generating a new migration after entity changes

```bash
cd apps/backend
npm run typeorm:generate -- src/migrations/DescriptiveName
npm run typeorm:run
```

---

## Contract Deployment Failures

### `can't find crate for wasm32`

```bash
rustup target add wasm32-unknown-unknown
```

### `cargo build` fails with dependency errors

```bash
cargo update && ./scripts/build.sh
```

### `Already initialized` panic

`initialize()` is a one-time operation. Deploy a new contract instance and update the address in `.env` and `scripts/deployed-contracts.json`.

### `Unauthorized: must be student or admin`

The backend signer (`STELLAR_SECRET_KEY`) does not match the admin stored in the Analytics contract. Re-deploy or re-initialize the contract with the correct admin address.

---

## Performance Troubleshooting

### Slow API responses

1. Enable PostgreSQL slow query logging:
   ```sql
   SET log_min_duration_statement = 500;
   ```
2. Confirm Redis is running — if it's down, every leaderboard request triggers one Stellar RPC call per user.
3. Check Stellar RPC latency via `GET /v1/health`. High latency directly impacts progress recording and credential issuance.

### Leaderboard endpoint is slow

The leaderboard caches results in Redis for 5 minutes (`leaderboard:top50`). If the cache is cold or Redis is unavailable, the endpoint fetches BST balances for every user with a wallet.

**Fix:**
```bash
redis-cli ping          # confirm Redis is reachable
redis-cli ttl leaderboard:top50   # check remaining cache TTL
```

### High memory or CPU in backend

Use the Prometheus `/metrics` endpoint and the Grafana dashboards in `infra/monitoring/` to identify trends. Check for unclosed DB connections or WebSocket clients that failed to disconnect.
