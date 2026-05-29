# Environment Variables Reference

Complete reference for all environment variables used across the scoopdope platform.

> **Quick start:** Copy the root `.env.example` to `.env` and fill in the required values before running any service.

---

## Table of Contents

- [Overview](#overview)
- [Backend Variables](#backend-variables)
  - [Application](#application)
  - [Database](#database)
  - [Authentication](#authentication)
  - [Google OAuth](#google-oauth)
  - [Redis](#redis)
  - [Stellar & Soroban](#stellar--soroban)
  - [Email](#email)
  - [Rate Limiting](#rate-limiting)
  - [Monitoring & Observability](#monitoring--observability)
  - [KYC](#kyc)
- [Frontend Variables](#frontend-variables)
- [Scripts & CI/CD Variables](#scripts--cicd-variables)
- [Environment-Specific Examples](#environment-specific-examples)
  - [Development](#development)
  - [Staging](#staging)
  - [Production](#production)
- [Security Considerations](#security-considerations)

---

## Overview

| Symbol | Meaning |
|--------|---------|
| ✅ Required | Must be set; the application will fail to start without it |
| ⚙️ Optional | Has a sensible default; override only when needed |
| 🔒 Sensitive | Contains secrets — never commit to version control |

Variables are validated at startup by `apps/backend/src/config/validation.schema.ts` (Joi). Invalid or missing required values cause an immediate, descriptive error.

---

## Backend Variables

Consumed by `apps/backend`. Set these in the root `.env` (or `apps/backend/.env` for backend-only runs).

### Application

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | ⚙️ Optional | `3000` | TCP port the NestJS HTTP server listens on. |
| `NODE_ENV` | ⚙️ Optional | `development` | Runtime environment. Valid values: `development`, `production`, `test`. Controls TypeORM `synchronize`, Sentry sample rates, and other environment-aware behaviour. |
| `LOG_LEVEL` | ⚙️ Optional | `info` | Logging verbosity. Common values: `error`, `warn`, `info`, `debug`, `verbose`. |
| `EXPORT_OPENAPI` | ⚙️ Optional | — | When set to any truthy value, the backend exports the OpenAPI spec to disk on startup (used by the API-docs CI job). |

### Database

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_HOST` | ✅ Required | — | PostgreSQL server hostname or IP address. Use `postgres` when running inside Docker Compose. |
| `DATABASE_PORT` | ⚙️ Optional | `5432` | PostgreSQL port. |
| `DATABASE_USER` | ✅ Required | — | PostgreSQL login role. |
| `DATABASE_PASSWORD` | ✅ Required 🔒 | — | Password for `DATABASE_USER`. |
| `DATABASE_NAME` | ✅ Required | — | Name of the database to connect to (default in Docker: `scoopdope`). |
| `DATABASE_URL` | ⚙️ Optional | — | Full PostgreSQL connection string (e.g. `postgresql://user:pass@host:5432/db`). Used in CI security-scan jobs as a convenience alternative to the individual `DATABASE_*` variables. When set, individual variables are ignored by that job. |

> **Docker Compose note:** `docker-compose.yml` hard-codes `DATABASE_HOST=postgres`, `DATABASE_USER=scoopdope`, and `DATABASE_PASSWORD=scoopdope` for local development. Override these in `.env` for staging/production.

### Authentication

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | ✅ Required 🔒 | — | Secret used to sign and verify JWT tokens. Must be at least 16 characters. Use a cryptographically random string of 32+ characters in production. |

### Google OAuth

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_CLIENT_ID` | ⚙️ Optional | — | OAuth 2.0 client ID from Google Cloud Console. Required only if Google login is enabled. |
| `GOOGLE_CLIENT_SECRET` | ⚙️ Optional 🔒 | — | OAuth 2.0 client secret. Required only if Google login is enabled. |
| `GOOGLE_CALLBACK_URL` | ⚙️ Optional | `http://localhost:3000/auth/google/callback` | Redirect URI registered in Google Cloud Console. Must match exactly. |

### Redis

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REDIS_URL` | ✅ Required | — | Full Redis connection URI (e.g. `redis://localhost:6379`). Used for caching and rate-limiter storage. Use `redis://redis:6379` inside Docker Compose. |

### Stellar & Soroban

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `STELLAR_NETWORK` | ⚙️ Optional | `testnet` | Target Stellar network. Valid values: `testnet`, `mainnet`. |
| `STELLAR_SECRET_KEY` | ✅ Required 🔒 | — | Stellar account secret key (starts with `S`). Used to sign credential-issuance transactions. **Never expose this value.** |
| `STELLAR_HORIZON_URL` | ⚙️ Optional | `https://horizon-testnet.stellar.org` | Horizon REST API endpoint. Change to `https://horizon.stellar.org` for mainnet. |
| `STELLAR_WEB_AUTH_DOMAIN` | ⚙️ Optional | `localhost` | Domain used in SEP-10 Web Authentication challenges. Set to your public API domain in production. |
| `SOROBAN_RPC_URL` | ⚙️ Optional | `https://soroban-testnet.stellar.org` | Soroban RPC endpoint for smart contract interactions. Change to `https://soroban.stellar.org` for mainnet. |
| `SOROBAN_CONTRACT_ID` | ⚙️ Optional | `""` | Generic/legacy Soroban contract ID. Prefer the specific contract IDs below. |
| `ANALYTICS_CONTRACT_ID` | ⚙️ Optional | `""` | Contract ID of the deployed Analytics Soroban contract. Required for on-chain progress tracking. |
| `TOKEN_CONTRACT_ID` | ⚙️ Optional | `""` | Contract ID of the deployed Token (BST) Soroban contract. Required for reward token minting. |
| `INDEXER_POLL_INTERVAL_MS` | ⚙️ Optional | `5000` | Interval in milliseconds between Soroban event polling cycles. |

> **Obtaining contract IDs:** Deploy contracts with `./scripts/deploy.sh <network> <contract>`. IDs are saved to `scripts/deployed-contracts.json` and should be copied into your `.env`.

### Email

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `EMAIL_ENABLED` | ⚙️ Optional | `false` | Set to `true` to enable outbound email. When `false`, all mail is silently dropped. |
| `EMAIL_HOST` | ✅ Required* | — | SMTP server hostname (e.g. `smtp.sendgrid.net`). *Required when `EMAIL_ENABLED=true`. |
| `EMAIL_PORT` | ⚙️ Optional | `587` | SMTP port. Common values: `587` (STARTTLS), `465` (TLS), `25` (plain). |
| `EMAIL_SECURE` | ⚙️ Optional | `false` | Set to `true` to use TLS from the start of the connection (port 465). Leave `false` for STARTTLS (port 587). |
| `EMAIL_USER` | ✅ Required* | — | SMTP authentication username. *Required when `EMAIL_ENABLED=true`. |
| `EMAIL_PASS` | ✅ Required* 🔒 | — | SMTP authentication password or API key. *Required when `EMAIL_ENABLED=true`. |
| `EMAIL_FROM` | ⚙️ Optional | `"Scoopdope" <no-reply@Scoopdope.app>` | Sender address shown in outgoing emails. Use RFC 5322 format. |
| `FRONTEND_URL` | ⚙️ Optional | `http://localhost:3001` | Base URL of the frontend application. Embedded in email links (e.g. password-reset URLs). |

### Rate Limiting

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `THROTTLE_TTL` | ⚙️ Optional | `60000` | Time window in milliseconds for the rate-limiter sliding window. |
| `THROTTLE_LIMIT` | ⚙️ Optional | `100` | Maximum number of requests allowed per IP within `THROTTLE_TTL`. |

### Monitoring & Observability

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SENTRY_DSN` | ⚙️ Optional 🔒 | — | Sentry Data Source Name for backend error tracking. Obtain from your Sentry project settings. Leave empty to disable Sentry on the backend. |
| `GIT_COMMIT_SHA` | ⚙️ Optional | `unknown` | Git commit SHA injected at build time (set automatically in CI via `${{ github.sha }}`). Used as the Sentry release identifier for source-map linking. |

### KYC

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `KYC_PROVIDER_API_KEY` | ⚙️ Optional 🔒 | `""` | API key for the third-party KYC provider. Leave empty to disable KYC verification. |

---

## Frontend Variables

Consumed by `apps/frontend` (Next.js). Variables prefixed with `NEXT_PUBLIC_` are embedded into the client-side bundle at build time and are visible in the browser.

> ⚠️ **Never put secrets in `NEXT_PUBLIC_*` variables.** They are exposed to every visitor.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ Required | `http://localhost:3000` | Base URL of the backend API. The frontend uses this for all API calls. |
| `NEXT_PUBLIC_STELLAR_NETWORK` | ⚙️ Optional | `testnet` | Stellar network the frontend connects to. Valid values: `testnet`, `mainnet`. |
| `NEXT_PUBLIC_SENTRY_DSN` | ⚙️ Optional | — | Sentry DSN for client-side and edge error tracking. Can be the same DSN as the backend or a separate project. Leave empty to disable. |
| `NEXT_PUBLIC_GIT_COMMIT_SHA` | ⚙️ Optional | `unknown` | Git commit SHA for Sentry release tracking. Set automatically in CI. |
| `NEXT_PUBLIC_SITE_URL` | ⚙️ Optional | — | Canonical public URL of the site. Used for sitemap generation (`next-sitemap`). |
| `PLAYWRIGHT_BASE_URL` | ⚙️ Optional | — | Base URL used by Playwright end-to-end tests. Defaults to `http://localhost:3001` in `playwright.config.ts`. |

---

## Scripts & CI/CD Variables

Used by shell scripts in `scripts/` and GitHub Actions workflows in `.github/workflows/`.

| Variable | Where Used | Description |
|----------|-----------|-------------|
| `STELLAR_SECRET_KEY` | `scripts/deploy.sh`, CI | Stellar secret key for contract deployment. Must be set in the shell environment or as a GitHub Actions secret (`secrets.STELLAR_SECRET_KEY`). |
| `CI` | CI workflows | Set to `true` by GitHub Actions. Some test suites (e.g. Soroban spec tests) use this flag to adjust behaviour. |
| `GITHUB_REF` | CI / backend | Injected by GitHub Actions. Used internally for release tagging. |
| `SONAR_TOKEN` | CI (`ci.yml`) | Authentication token for SonarCloud code-quality scans. Store as a GitHub Actions secret. |
| `CHROMATIC_PROJECT_TOKEN` | CI (`ci.yml`) | Project token for Chromatic visual regression tests. Store as a GitHub Actions secret. |
| `AWS_ROLE_ARN` | CI (`deploy-production.yml`) | ARN of the AWS IAM role assumed via OIDC for production deployments. |
| `AWS_REGION` | CI (`deploy-production.yml`) | AWS region for ECS/RDS deployment targets. |
| `API_URL` | CI load tests | Base URL passed to k6 load-test scripts. Defaults to `http://localhost:3000`. |

---

## Environment-Specific Examples

### Development

Minimal local setup using Docker Compose for PostgreSQL and Redis.

```env
# apps/backend (or root .env)
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=scoopdope
DATABASE_PASSWORD=scoopdope
DATABASE_NAME=scoopdope

JWT_SECRET=dev-only-secret-change-in-production-32chars

REDIS_URL=redis://localhost:6379

STELLAR_NETWORK=testnet
STELLAR_SECRET_KEY=SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
ANALYTICS_CONTRACT_ID=
TOKEN_CONTRACT_ID=

EMAIL_ENABLED=false
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=dev@example.com
EMAIL_PASS=dev-password

FRONTEND_URL=http://localhost:3001
THROTTLE_TTL=60000
THROTTLE_LIMIT=1000

SENTRY_DSN=
GIT_COMMIT_SHA=local
```

```env
# apps/frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_GIT_COMMIT_SHA=local
```

### Staging

Mirrors production configuration but points to testnet and a staging database.

```env
PORT=3000
NODE_ENV=production
LOG_LEVEL=info

DATABASE_HOST=staging-db.internal
DATABASE_PORT=5432
DATABASE_USER=Scoopdope_staging
DATABASE_PASSWORD=<strong-random-password>
DATABASE_NAME=Scoopdope_staging

JWT_SECRET=<random-32+-char-secret>

REDIS_URL=redis://staging-redis.internal:6379

STELLAR_NETWORK=testnet
STELLAR_SECRET_KEY=<staging-stellar-secret>
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
ANALYTICS_CONTRACT_ID=<deployed-testnet-contract-id>
TOKEN_CONTRACT_ID=<deployed-testnet-contract-id>
STELLAR_WEB_AUTH_DOMAIN=staging.scoopdope.example.com

EMAIL_ENABLED=true
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=<sendgrid-api-key>
EMAIL_FROM="Scoopdope Staging" <no-reply@staging.scoopdope.example.com>

FRONTEND_URL=https://staging.scoopdope.example.com
THROTTLE_TTL=60000
THROTTLE_LIMIT=200

SENTRY_DSN=https://<key>@sentry.io/<project>
GIT_COMMIT_SHA=<git-sha>
KYC_PROVIDER_API_KEY=<staging-kyc-key>
```

```env
# Frontend (staging)
NEXT_PUBLIC_API_URL=https://api.staging.scoopdope.example.com
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_SENTRY_DSN=https://<key>@sentry.io/<project>
NEXT_PUBLIC_GIT_COMMIT_SHA=<git-sha>
NEXT_PUBLIC_SITE_URL=https://staging.scoopdope.example.com
```

### Production

```env
PORT=3000
NODE_ENV=production
LOG_LEVEL=warn

DATABASE_HOST=prod-db.internal
DATABASE_PORT=5432
DATABASE_USER=Scoopdope_prod
DATABASE_PASSWORD=<strong-random-password>
DATABASE_NAME=Scoopdope_prod

JWT_SECRET=<random-64-char-secret>

REDIS_URL=redis://prod-redis.internal:6379

STELLAR_NETWORK=mainnet
STELLAR_SECRET_KEY=<production-stellar-secret>
STELLAR_HORIZON_URL=https://horizon.stellar.org
SOROBAN_RPC_URL=https://soroban.stellar.org
ANALYTICS_CONTRACT_ID=<deployed-mainnet-contract-id>
TOKEN_CONTRACT_ID=<deployed-mainnet-contract-id>
STELLAR_WEB_AUTH_DOMAIN=scoopdope.example.com

EMAIL_ENABLED=true
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=<sendgrid-api-key>
EMAIL_FROM="Scoopdope" <no-reply@scoopdope.example.com>

FRONTEND_URL=https://scoopdope.example.com
THROTTLE_TTL=60000
THROTTLE_LIMIT=100

SENTRY_DSN=https://<key>@sentry.io/<project>
GIT_COMMIT_SHA=<git-sha>
KYC_PROVIDER_API_KEY=<production-kyc-key>
```

```env
# Frontend (production)
NEXT_PUBLIC_API_URL=https://api.scoopdope.example.com
NEXT_PUBLIC_STELLAR_NETWORK=mainnet
NEXT_PUBLIC_SENTRY_DSN=https://<key>@sentry.io/<project>
NEXT_PUBLIC_GIT_COMMIT_SHA=<git-sha>
NEXT_PUBLIC_SITE_URL=https://scoopdope.example.com
```

---

## Security Considerations

### Secrets management

- **Never commit `.env` files.** The root `.gitignore` excludes `.env` but not `.env.example`. Only example files (with placeholder values) should be committed.
- **Use a secrets manager in production.** Inject secrets via AWS Secrets Manager, HashiCorp Vault, or your cloud provider's equivalent rather than plain environment files.
- **Rotate secrets regularly.** Especially `JWT_SECRET`, `STELLAR_SECRET_KEY`, `DATABASE_PASSWORD`, and third-party API keys.

### High-risk variables

| Variable | Risk | Mitigation |
|----------|------|-----------|
| `STELLAR_SECRET_KEY` | Full control of the Stellar account — funds and credential issuance | Use a dedicated account with minimal XLM balance; restrict to signing only; rotate if exposed |
| `JWT_SECRET` | Forging arbitrary authentication tokens | Minimum 32 random characters; rotate on suspected compromise |
| `DATABASE_PASSWORD` | Full database access | Strong random password; restrict DB user permissions to the application schema only |
| `EMAIL_PASS` | Sending email as your domain | Use API keys scoped to send-only; enable SPF/DKIM/DMARC |
| `KYC_PROVIDER_API_KEY` | Access to user identity data | Scope to minimum required permissions; audit access logs |
| `GOOGLE_CLIENT_SECRET` | OAuth impersonation | Restrict allowed redirect URIs in Google Cloud Console |

### `NEXT_PUBLIC_*` variables

These are baked into the JavaScript bundle and sent to every browser. They must **never** contain secrets, private keys, or internal infrastructure details. Only public configuration (API URL, network name, public Sentry DSN) belongs here.

### `NODE_ENV=production` effects

- TypeORM `synchronize` is disabled (schema changes require explicit migrations).
- Sentry `tracesSampleRate` and `profilesSampleRate` drop to `0.1` to reduce overhead.
- NestJS disables detailed error stack traces in HTTP responses.

### Validation at startup

The backend validates all variables via Joi on startup (`apps/backend/src/config/validation.schema.ts`). If a required variable is missing or has an invalid value, the process exits immediately with a descriptive error — preventing silent misconfiguration in production.
