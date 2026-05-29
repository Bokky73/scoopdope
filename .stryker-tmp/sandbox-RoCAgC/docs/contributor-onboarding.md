# Contributor Onboarding Guide

Welcome to scoopdope! This guide gets you from zero to your first merged pull request. It assumes basic familiarity with Git and TypeScript but no prior knowledge of the codebase.

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Architecture Overview](#2-architecture-overview)
3. [Local Development Setup](#3-local-development-setup)
4. [Your First Contribution](#4-your-first-contribution)
5. [Code Walkthroughs](#5-code-walkthroughs)
6. [Good First Issues & Labeling System](#6-good-first-issues--labeling-system)
7. [Getting Help](#7-getting-help)

---

## 1. Project Structure

```
scoopdope/
├── apps/
│   ├── backend/               # NestJS REST API (TypeScript)
│   │   └── src/
│   │       ├── auth/          # JWT, refresh tokens, MFA, Google OAuth, Stellar auth
│   │       ├── courses/       # Courses, modules, lessons, reviews
│   │       ├── enrollments/   # Enroll / unenroll
│   │       ├── progress/      # Lesson completion tracking
│   │       ├── credentials/   # On-chain certificate issuance
│   │       ├── stellar/       # Soroban contract calls, Horizon, event indexer
│   │       ├── users/         # User profiles, admin management
│   │       ├── notifications/ # In-app notification feed
│   │       ├── forums/        # Course discussion posts & replies
│   │       ├── leaderboard/   # Top earners SSE stream
│   │       ├── kyc/           # KYC verification status
│   │       ├── common/        # Shared guards, pipes, filters, logger
│   │       ├── config/        # Env validation schema
│   │       ├── migrations/    # TypeORM migration files
│   │       └── main.ts        # App bootstrap
│   └── frontend/              # Next.js 14 App Router (TypeScript)
│       └── src/
│           ├── app/           # Route segments (pages)
│           ├── components/    # Shared UI components
│           │   ├── ui/        # Primitives: Button, Input, Card, Modal…
│           │   └── layout/    # Navbar, Footer
│           ├── store/         # Zustand stores (auth, courses, progress)
│           ├── lib/           # API client, auth context, toast helpers
│           └── hooks/         # Custom React hooks
├── contracts/
│   ├── analytics/             # On-chain progress tracking (Rust/Soroban)
│   ├── token/                 # BST reward token (Rust/Soroban)
│   ├── certificate/           # Soulbound NFT certificates (Rust/Soroban)
│   ├── governance/            # Token-weighted voting (Rust/Soroban)
│   └── shared/                # RBAC utilities (Rust/Soroban)
├── scripts/                   # build.sh, deploy.sh, health-check.sh, setup.sh
├── docs/                      # All project documentation
├── infra/                     # Terraform, Prometheus/Grafana configs
└── .github/workflows/         # CI/CD pipelines
```

### Key conventions

- Every backend feature lives in its own directory with `*.module.ts`, `*.service.ts`, `*.controller.ts`, `*.entity.ts`.
- The `common/` directory holds cross-cutting concerns — never put business logic there.
- Frontend pages live under `src/app/` following Next.js App Router conventions. Shared UI primitives go in `src/components/ui/`.
- Smart contracts are independent Rust crates. Each has its own `Cargo.toml` and `src/lib.rs`.

---

## 2. Architecture Overview

Understanding the data flow helps you know where to make changes without breaking other parts of the system.

### Request lifecycle (REST API)

```
Browser / Mobile
    │
    ▼
Next.js Frontend (port 3001)
    │  fetch() / Axios via NEXT_PUBLIC_API_URL
    ▼
NestJS Backend (port 3000)
    ├── JWT Guard → validates Bearer token
    ├── Roles Guard → checks user role (admin / instructor / student)
    ├── Validation Pipe → validates & sanitizes DTOs
    ├── Service layer → business logic, DB queries, cache
    │       ├── TypeORM → PostgreSQL
    │       ├── CacheManager → Redis (60s TTL for catalog)
    │       └── StellarService → Soroban RPC
    └── Response Interceptor → wraps { data, statusCode, timestamp }
```

### Credential issuance flow

This is the most important business flow. When a student completes a course:

```
Student marks lesson complete
    │
    ▼
ProgressService.record()
    ├── Saves progress to PostgreSQL
    ├── StellarService.recordProgress()   → Analytics contract (on-chain)
    └── if progress == 100%:
          CredentialsService.issue()
              ├── KYC gate (if course.requiresKyc)
              ├── StellarService.issueCredential()  → Horizon + Certificate contract
              └── StellarService.mintReward()        → Token contract (100 BST)
```

### Smart contract architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Soroban Contracts                     │
│                                                         │
│  Analytics ──────────────────────────────────────────┐  │
│  (progress tracking)                                 │  │
│                                                      │  │
│  Token (BST) ────────────────────────────────────┐   │  │
│  (SEP-0041 fungible token, vesting, staking)     │   │  │
│                                                  │   │  │
│  Certificate ────────────────────────────────┐   │   │  │
│  (soulbound NFTs)                            │   │   │  │
│                                              ▼   ▼   ▼  │
│  Governance ──────────────────────► Shared (RBAC)       │
│  (token-weighted voting)            roles & permissions  │
│                                                         │
│  Badges / Reputation / NFT ─────────────────────────┘  │
│  (achievements, scores, course access)                  │
└─────────────────────────────────────────────────────────┘
```

All contracts are deployed independently. The Governance contract holds a reference to the Token contract for reading voting power. The Shared contract is used by the backend to verify roles before issuing credentials.

### Frontend state management

```
Zustand stores (src/store/)
    ├── auth.store.ts      — JWT token, user profile, login/logout
    ├── courses.store.ts   — course list, current course
    ├── progress.store.ts  — lesson completion state
    └── bookmarks.store.ts — bookmarked courses (persisted to localStorage)

API calls go through src/lib/api.ts (Axios instance with JWT interceptor).
Auth state is also exposed via src/lib/auth-context.tsx for React context consumers.
```

---

## 3. Local Development Setup

### Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | v18+ | [nodejs.org](https://nodejs.org) |
| Rust | v1.75+ | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| Docker | any | [docker.com](https://docs.docker.com/get-docker/) |
| Stellar CLI | v21.5.0 | See below |

```bash
# Install Stellar CLI
curl -sSL https://github.com/stellar/stellar-cli/releases/download/v21.5.0/stellar-cli-21.5.0-x86_64-unknown-linux-gnu.tar.gz | tar xz
sudo mv stellar /usr/local/bin/
```

### Automated setup (recommended)

```bash
git clone https://github.com/BrainTease/scoopdope.git
cd scoopdope
./scripts/setup.sh
```

The script checks prerequisites, copies `.env.example` → `.env`, installs Node dependencies, adds the `wasm32` Rust target, builds contracts, and starts PostgreSQL + Redis via Docker.

### Manual setup

```bash
# 1. Clone and configure
git clone https://github.com/BrainTease/scoopdope.git
cd scoopdope
cp .env.example .env          # then edit .env — see below

# 2. Start database services
docker compose up -d postgres redis

# 3. Install dependencies
npm install

# 4. Build smart contracts
rustup target add wasm32-unknown-unknown
./scripts/build.sh

# 5. Start the apps
npm run dev:backend   # http://localhost:3000  (Swagger: /api/docs)
npm run dev:frontend  # http://localhost:3001
```

### Required `.env` values

The only values you must set manually after copying `.env.example`:

| Variable | How to get it |
|---|---|
| `JWT_SECRET` | `openssl rand -hex 32` |
| `STELLAR_SECRET_KEY` | Generate below |

Everything else works with the defaults for local development.

### Stellar testnet account

```bash
# Generate a keypair and fund it
stellar keys generate --network testnet dev-account
curl "https://friendbot.stellar.org?addr=$(stellar keys address dev-account)"

# Copy the secret key into .env
stellar keys show dev-account   # starts with S...
```

### Troubleshooting

| Error | Fix |
|---|---|
| `ECONNREFUSED 127.0.0.1:5432` | `docker compose up -d postgres` |
| `ECONNREFUSED 127.0.0.1:6379` | `docker compose up -d redis` |
| `Account not found` (Stellar) | Re-fund via Friendbot (testnet resets periodically) |
| `can't find crate for wasm32` | `rustup target add wasm32-unknown-unknown` |
| `Port 3000 already in use` | `lsof -ti:3000 \| xargs kill -9` |
| `nest: command not found` | Run `npm install` from the repo root first |
| `JWT_SECRET is not defined` | Ensure `.env` exists with `JWT_SECRET` set |
| Contract deploy fails `insufficient funds` | Re-fund testnet account via Friendbot |

---

## 4. Your First Contribution

This is a complete walkthrough of the contribution lifecycle using a real example: **adding a `category` field to courses**.

### Step 1 — Find an issue

Browse [good first issues](https://github.com/BrainTease/scoopdope/issues?q=is%3Aopen+label%3A%22good+first+issue%22) on GitHub. Pick one that's unassigned and leave a comment: _"I'd like to work on this."_

### Step 2 — Fork and branch

```bash
# Fork on GitHub, then:
git clone https://github.com/<your-username>/scoopdope.git
cd scoopdope
git remote add upstream https://github.com/BrainTease/scoopdope.git
git checkout -b feat/course-category
```

Branch naming: `feat/`, `fix/`, `docs/`, `chore/`, `refactor/`, `test/` — lowercase, hyphens only.

### Step 3 — Make the change

**a) Update the entity** (`apps/backend/src/courses/course.entity.ts`):

```typescript
@Column({ nullable: true, default: 'general' })
category: string;
```

**b) Generate a migration:**

```bash
npm run typeorm:generate -- src/migrations/AddCourseCategory
```

Review the generated file in `src/migrations/` — make sure it only adds the column.

**c) Apply the migration locally:**

```bash
npm run typeorm:run --workspace=apps/backend
```

**d) Update the DTO** (`apps/backend/src/courses/dto/create-course.dto.ts`):

```typescript
@IsOptional()
@IsString()
category?: string;
```

**e) Verify the API still works:**

```bash
curl http://localhost:3000/v1/courses | jq '.data[0].category'
```

### Step 4 — Run checks locally

```bash
npm run lint --workspace=apps/backend   # must pass
npm run test --workspace=apps/backend   # must pass
cargo test                              # if you touched contracts
```

### Step 5 — Commit

Commits are validated by `commitlint` on every `git commit`. The format is:

```
<type>(<scope>): <short summary>
```

```bash
git add .
git commit -m "feat(courses): add category field to course entity"
```

Common types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`. See [COMMIT_CONVENTIONS.md](./contributing/COMMIT_CONVENTIONS.md) for the full reference.

### Step 6 — Push and open a PR

```bash
git push origin feat/course-category
```

Open a pull request on GitHub against `main`. Fill in the PR template completely:
- Link the issue: `Closes #<number>`
- Describe what changed and why
- Check off the checklist items

### Step 7 — Address review feedback

Reviewers will leave comments. Push additional commits to the same branch — they appear in the PR automatically. Once approved, a maintainer will squash-merge your PR.

---

## 5. Code Walkthroughs

These walkthroughs show how the most common tasks are implemented so you can follow the same patterns.

### 5a. Adding a new API endpoint (backend)

The pattern is: **entity → service → controller → module**.

Here's how `GET /v1/courses` is wired up end-to-end:

**Entity** (`courses/course.entity.ts`) — TypeORM class decorated with `@Entity`:
```typescript
@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() title: string;
  // ...
}
```

**Service** (`courses/courses.service.ts`) — business logic, database queries, cache:
```typescript
@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course) private repo: Repository<Course>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll(query: CourseQueryDto) {
    // QueryBuilder with search, level filter, pagination, avg rating join
    const { data, total, page, limit } = await ...;
    return { data, total, page, limit };
  }
}
```

**Controller** (`courses/courses.controller.ts`) — HTTP routing, guards, Swagger decorators:
```typescript
@Controller('v1/courses')
export class CoursesController {
  @Get()
  @ApiOperation({ summary: 'Get all published courses' })
  findAll(@Query() query: CourseQueryDto) {
    return this.coursesService.findAll(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  create(@Body() data: any) {
    return this.coursesService.create(data);
  }
}
```

**Module** (`courses/courses.module.ts`) — wires everything together:
```typescript
@Module({
  imports: [TypeOrmModule.forFeature([Course, ...])],
  providers: [CoursesService, ...],
  controllers: [CoursesController, ...],
  exports: [CoursesService],
})
export class CoursesModule {}
```

To add a new endpoint: add the method to the service, add the route to the controller with appropriate guards and Swagger decorators, and register any new entities in the module's `TypeOrmModule.forFeature([...])`.

### 5b. The credential issuance flow

This is the most important business flow — understanding it helps with any blockchain-related work.

```
Student completes lesson (progressPct = 100)
  └─► ProgressService.record()
        ├─► StellarService.recordProgress()   ← writes to Analytics contract on-chain
        └─► CredentialsService.issue()
              ├─► Check for duplicate credential
              ├─► KYC gate (if course.requiresKyc)
              ├─► StellarService.issueCredential()  ← records on Horizon + Soroban
              └─► StellarService.mintReward()        ← mints 100 BST to student
```

Key files:
- `progress/progress.service.ts` — triggers the flow
- `credentials/credentials.service.ts` — orchestrates issuance + KYC check
- `stellar/stellar.service.ts` — all Soroban contract calls and Horizon interactions

### 5c. Adding a new Soroban contract call (backend)

All contract interactions go through `StellarService`. Follow this pattern:

```typescript
// In stellar/stellar.service.ts

// Read-only: use simulateTransaction (no fee, no signing)
async getMyData(publicKey: string): Promise<string> {
  const retval = await this.simulateContract(
    this.myContractId,
    'get_data',
    [new Address(publicKey).toScVal()],
  );
  return retval ? scValToNative(retval) : null;
}

// State-changing: use invokeContract (builds, signs, submits, polls)
async setMyData(publicKey: string, value: string): Promise<string> {
  return this.retryWithBackoff(() =>
    this.invokeContract(this.myContractId, 'set_data', [
      new Address(publicKey).toScVal(),
      nativeToScVal(value, { type: 'string' }),
    ]),
  );
}
```

Add the new contract ID to `.env.example`, `config/configuration.ts`, and `config/validation.schema.ts`. See [smart-contract-interaction-guide.md](./smart-contract-interaction-guide.md) for the full reference.

### 5d. Adding a frontend page

Pages live under `src/app/` following Next.js App Router conventions. The API client is in `src/lib/api.ts` and state is managed with Zustand stores in `src/store/`.

```typescript
// src/app/courses/page.tsx — typical pattern
'use client';
import { useEffect } from 'react';
import { useCourseStore } from '@/store/courses.store';

export default function CoursesPage() {
  const { courses, fetchCourses, loading } = useCourseStore();

  useEffect(() => { fetchCourses(); }, []);

  if (loading) return <Spinner />;
  return <div>{courses.map(c => <CourseCard key={c.id} course={c} />)}</div>;
}
```

Protected routes wrap content with `<ProtectedRoute>` from `src/components/ProtectedRoute.tsx`. Auth state comes from the Zustand `auth.store.ts` and `src/lib/auth-context.tsx`.

### 5e. Writing a test

**Unit test** (backend) — mock dependencies with Jest:

```typescript
// courses/courses.service.spec.ts
describe('CoursesService', () => {
  let service: CoursesService;
  const mockRepo = { findOne: jest.fn(), save: jest.fn(), create: jest.fn() };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: getRepositoryToken(Course), useValue: mockRepo },
        { provide: CACHE_MANAGER, useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() } },
      ],
    }).compile();
    service = module.get(CoursesService);
  });

  it('throws NotFoundException for unknown course', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
  });
});
```

**Integration test** — uses a real PostgreSQL instance spun up by the test setup:

```typescript
// courses/courses.service.integration-spec.ts
// Uses setupTestDatabase() / teardownTestDatabase() from src/test/integration-test.setup.ts
```

**Contract test** (Rust):

```rust
#[test]
fn test_my_feature() {
    let env = Env::default();
    env.mock_all_auths();
    let id = env.register_contract(None, MyContract);
    let client = MyContractClient::new(&env, &id);
    // ...
    assert_eq!(client.my_function(&arg), expected);
}
```

Run with `cargo test` from the repo root.

---

## 6. Good First Issues & Labeling System

### GitHub Labels

We use a structured labeling system to help contributors find the right issues:

| Label | Color | Meaning |
|---|---|---|
| `good first issue` | green | Scoped, well-defined — ideal for first contributions |
| `help wanted` | blue | Maintainers welcome external contributions |
| `bug` | red | Confirmed bug with reproduction steps |
| `docs` | yellow | Documentation improvements, no code required |
| `feat` | purple | New feature request |
| `performance` | orange | Performance improvement |
| `security` | dark red | Security-related — discuss privately first |
| `backend` | teal | Affects NestJS backend |
| `frontend` | cyan | Affects Next.js frontend |
| `contracts` | indigo | Affects Soroban smart contracts |
| `i18n` | pink | Internationalization / translation |
| `blocked` | grey | Waiting on another issue or external dependency |

### Finding good first issues

```
https://github.com/BrainTease/scoopdope/issues?q=is%3Aopen+label%3A%22good+first+issue%22
```

### What makes a good first issue?

- Touches a single module (e.g. only `courses/` or only a contract)
- Has clear acceptance criteria in the issue description
- Doesn't require understanding the Stellar/Soroban integration
- Has a linked failing test or a clear expected vs actual behaviour

### Suggesting your own

If you spot something — a missing validation, a typo in an error message, a missing Swagger description — open an issue first with the `good first issue` label and describe the fix. Maintainers will confirm scope before you start coding.

### Labeling guidelines for maintainers

When triaging new issues:
1. Apply at least one **area** label (`backend`, `frontend`, `contracts`, `docs`).
2. Apply a **type** label (`bug`, `feat`, `docs`, `performance`).
3. If the issue is suitable for new contributors, add `good first issue` and write clear acceptance criteria.
4. If the issue is blocked, add `blocked` and link the blocking issue in a comment.

---

## 7. Getting Help

- **Stuck on setup?** Check the [troubleshooting table](#troubleshooting) above, then open a [GitHub Discussion](https://github.com/BrainTease/scoopdope/discussions).
- **Question about a specific file?** Leave a comment on the relevant issue or PR.
- **Stellar/Soroban questions?** The [Stellar Discord](https://discord.gg/stellardev) `#soroban` channel is very active.
- **Security issue?** Do **not** open a public issue — follow the [Security Policy](../SECURITY.md).

### Useful references

| Resource | Link |
|---|---|
| Commit conventions | [docs/contributing/COMMIT_CONVENTIONS.md](./contributing/COMMIT_CONVENTIONS.md) |
| Release process | [docs/contributing/RELEASE_PROCESS.md](./contributing/RELEASE_PROCESS.md) |
| Database schema | [docs/database-schema.md](./database-schema.md) |
| Smart contract guide | [docs/smart-contract-interaction-guide.md](./smart-contract-interaction-guide.md) |
| Deployment runbook | [docs/deployment-runbook.md](./deployment-runbook.md) |
| Migration guide | [docs/migrations.md](./migrations.md) |
| Swagger UI (local) | http://localhost:3000/api/docs |
| Stellar docs | https://developers.stellar.org |
| Soroban docs | https://soroban.stellar.org |
