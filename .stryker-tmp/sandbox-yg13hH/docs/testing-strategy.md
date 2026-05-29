# Testing Strategy

Comprehensive guide to the testing approach across the scoopdope platform.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Unit, Integration & E2E Testing](#2-unit-integration--e2e-testing)
3. [Test Coverage Requirements](#3-test-coverage-requirements)
4. [Layer-by-Layer Examples](#4-layer-by-layer-examples)
5. [Pact Contract Testing](#5-pact-contract-testing)
6. [Load Testing with k6](#6-load-testing-with-k6)

---

## 1. Overview

scoopdope uses a layered testing strategy across three application layers:

| Layer | Framework | Test Types |
|---|---|---|
| Backend (NestJS) | Jest | Unit, Integration, E2E, Pact provider |
| Frontend (Next.js) | Vitest + Playwright | Unit, Pact consumer, E2E |
| Contracts (Soroban/Rust) | `cargo test` + `proptest` | Unit, Fuzz |
| API performance | k6 | Load / SLO validation |

All tests run automatically in CI on every push and pull request.

---

## 2. Unit, Integration & E2E Testing

### Unit Tests

Test a single class or function in isolation. All external dependencies are mocked.

**When to write:** For every service method, guard, utility, and pure function.

**Backend** — Jest, located alongside source files (`*.spec.ts`):

```bash
npm run test --workspace=apps/backend
```

**Frontend** — Vitest, located in `src/__tests__/`:

```bash
npm run test --workspace=apps/frontend
```

**Contracts** — `cargo test`, located in `src/tests.rs`:

```bash
cargo test -p analytics
```

### Integration Tests

Test multiple units working together, typically with a real (or in-memory) database.

**When to write:** For repository interactions, service-to-service calls, and middleware chains.

**Backend** — separate Jest config (`jest-integration.config.js`), runs serially:

```bash
npm run test:integration --workspace=apps/backend
```

Integration tests spin up a test database via environment variables. Ensure `DATABASE_URL` points to a test DB before running locally.

### E2E Tests

Test complete user flows through the running application.

**When to write:** For critical user journeys (register → enroll → complete lesson, credential issuance).

**Backend** — Jest E2E config (`jest-e2e.config.js`), boots the full NestJS app:

```bash
npm run test:e2e --workspace=apps/backend
```

**Frontend** — Playwright, located in `apps/frontend/e2e/`:

```bash
npm run test:e2e --workspace=apps/frontend
```

Run with UI for debugging:

```bash
npx playwright test --ui
```

---

## 3. Test Coverage Requirements

Coverage is enforced via SonarCloud quality gates on every PR.

| Layer | Minimum Coverage |
|---|---|
| Backend | ≥ 70% (lines) |
| Frontend | ≥ 70% (lines) |
| Contracts | Best-effort; all public functions must have at least one test |

Generate coverage reports locally:

```bash
# Backend
npm run test --workspace=apps/backend -- --coverage

# Frontend
npm run test:coverage --workspace=apps/frontend

# Contracts
cargo tarpaulin -p analytics --out Html
```

**Guidelines:**

- Prioritize coverage of business logic, guards, and error paths over boilerplate.
- A PR that drops coverage below the threshold will fail the quality gate and must not be merged.
- Do not write tests purely to inflate coverage — test meaningful behaviour.

---

## 4. Layer-by-Layer Examples

### Backend — Unit Test (NestJS Service)

```typescript
// apps/backend/src/auth/auth.service.spec.ts
describe('AuthService', () => {
  it('should throw BadRequestException if email already in use', async () => {
    mockUsersService.findByEmail.mockResolvedValue({ email: 'user@example.com' });

    await expect(service.register('user@example.com', 'pass')).rejects.toThrow(
      BadRequestException,
    );
    expect(mockUsersService.create).not.toHaveBeenCalled();
  });
});
```

Key patterns:
- Use `@nestjs/testing` `Test.createTestingModule` to build an isolated module.
- Replace real providers with `jest.fn()` mocks via `useValue`.
- Call `jest.clearAllMocks()` in `afterEach` to prevent state leakage.

### Frontend — Unit Test (Vitest Hook)

```typescript
// apps/frontend/src/__tests__/hooks/useAuth.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';

it('sets user on successful login', async () => {
  const { result } = renderHook(() => useAuth());
  await act(() => result.current.login('user@example.com', 'password123'));
  expect(result.current.user).not.toBeNull();
});
```

Key patterns:
- Use `renderHook` + `act` for React hooks.
- Mock `axios` or API modules with `vi.mock(...)`.

### Frontend — E2E Test (Playwright)

```typescript
// apps/frontend/e2e/user-journey.spec.ts
test('register → enroll → complete lesson', async ({ page }) => {
  await page.goto('/auth/register');
  await page.getByLabel(/email/i).fill('user@example.com');
  await page.getByLabel(/^password$/i).fill('Test@1234!');
  await page.getByRole('button', { name: /register/i }).click();
  await expect(page).toHaveURL(/dashboard|courses/);
});
```

Key patterns:
- Use role-based locators (`getByRole`, `getByLabel`) — they are resilient to markup changes.
- Generate unique users per test run (`Date.now()`) to avoid collisions.
- Set `baseURL` in `playwright.config.ts` so tests are environment-agnostic.

### Contracts — Unit + Fuzz Test (Rust/Soroban)

```rust
// contracts/analytics/src/tests.rs
#[test]
fn test_completed_flag_at_100() {
    let (env, client) = setup();
    let student = Address::generate(&env);
    client.record_progress(&student, &symbol_short!("RUST101"), &100);
    let rec = client.get_progress(&student, &course).unwrap();
    assert!(rec.completed);
}

proptest! {
    #[test]
    fn fuzz_record_progress_valid_range(progress_pct in 0u32..=100u32) {
        let (env, client) = setup();
        let student = Address::generate(&env);
        client.record_progress(&student, &symbol_short!("TEST"), &progress_pct);
        let rec = client.get_progress(&student, &symbol_short!("TEST")).unwrap();
        prop_assert_eq!(rec.progress_pct, progress_pct);
    }
}
```

Key patterns:
- Use `Env::default()` with `mock_all_auths()` for a sandboxed Soroban environment.
- Use `proptest` for fuzz/property-based testing of numeric invariants.
- Use `#[should_panic(expected = "...")]` to assert contract panics on invalid input.

---

## 5. Pact Contract Testing

Pact ensures the frontend and backend agree on API contracts without requiring both to run simultaneously.

### How It Works

1. **Consumer (Frontend)** defines expected request/response interactions and generates a pact file (JSON) in `apps/frontend/pacts/`.
2. **Provider (Backend)** replays those interactions against the real running app and verifies they hold.

### Consumer Tests (Frontend — Vitest)

Located in `apps/frontend/src/__tests__/api/*.pact.test.ts`.

```typescript
// auth.pact.test.ts
const pact = new PactV3({
  consumer: 'Scoopdope-Frontend',
  provider: 'Scoopdope-Backend',
  dir: './pacts',
});

it('returns JWT token on successful login', async () => {
  await pact
    .addInteraction()
    .uponReceiving('a login request with valid credentials')
    .withRequest('POST', '/auth/login', (b) => {
      b.jsonBody({ email: 'user@example.com', password: 'password123' });
    })
    .willRespondWith(200, (b) => {
      b.jsonBody({ access_token: expect.any(String) });
    });

  const res = await axios.post(`${pact.mockService.baseUrl}/auth/login`, {
    email: 'user@example.com',
    password: 'password123',
  });
  expect(res.data).toHaveProperty('access_token');
});
```

Run consumer tests:

```bash
npm run test:pact --workspace=apps/frontend
```

This generates pact files in `apps/frontend/pacts/`.

### Provider Verification (Backend — Jest)

Located in `apps/backend/test/pact.provider.spec.ts`. Boots the full NestJS app and replays each consumer interaction.

```typescript
const verifier = new Verifier({
  provider: 'Scoopdope-Backend',
  providerBaseUrl: 'http://localhost:3000',
  pactFiles: [path.resolve(__dirname, '../../pacts')],
  stateHandlers: {
    'user is authenticated': async () => { /* seed auth state */ },
    'course exists': async () => { /* seed course data */ },
  },
});

await verifier.verifyProvider();
```

Run provider verification:

```bash
npm run test:pact --workspace=apps/backend
```

### Workflow

```
Frontend pact tests  →  pacts/*.json  →  Backend provider verification
      (consumer)                               (provider)
```

**Rules:**
- Consumer tests must pass and generate pact files before provider verification runs.
- In CI, consumer tests run first; the generated pact files are passed to the backend job.
- Never manually edit pact JSON files — they are generated artefacts.
- Add a `stateHandler` for every provider state referenced in consumer tests.

---

## 6. Load Testing with k6

Load tests validate that the API meets its SLOs under realistic concurrent traffic.

### SLOs

| Metric | Target |
|---|---|
| p95 response time | < 500 ms |
| p99 response time | < 1000 ms |
| Error rate | < 1% |

### Test Scripts

Located in `scripts/load-tests/`:

| Script | Endpoint | Virtual Users | Duration |
|---|---|---|---|
| `courses.js` | `GET /courses` | 500 | 30s |
| `auth-login.js` | `POST /auth/login` | 100 | 30s |
| `stellar-balance.js` | `GET /stellar/balance/:key` | 50 | 30s |

### Running Load Tests

Run all scripts:

```bash
./scripts/load-test.sh
```

Run a single script:

```bash
k6 run --vus 500 --duration 30s scripts/load-tests/courses.js
```

Against a non-local environment:

```bash
API_URL=https://staging.example.com ./scripts/load-test.sh
```

### Interpreting Results

A passing run looks like:

```
checks.........................: 99.5% ✓ 1990 ✗ 10
http_req_duration..............: p(95)=350ms  p(99)=480ms
http_req_failed................: 0.5%
```

If k6 exits with a non-zero code, at least one threshold was breached. Check:

- `http_req_duration` p95/p99 values against the SLO table above.
- `http_req_failed` for error rate.
- Backend logs for 5xx errors or database timeouts.

### CI Integration

Load tests run against a staging environment on PRs targeting `main`:

```yaml
- name: Run load tests
  run: ./scripts/load-test.sh
  env:
    API_URL: ${{ secrets.STAGING_API_URL }}
```

A threshold breach fails the CI job and blocks the merge.

For full k6 setup and troubleshooting, see [docs/load-testing.md](./load-testing.md).

---

## Running the Full Test Suite

```bash
# Backend: unit + integration + e2e
npm run test --workspace=apps/backend
npm run test:integration --workspace=apps/backend
npm run test:e2e --workspace=apps/backend

# Frontend: unit + pact + e2e
npm run test --workspace=apps/frontend
npm run test:pact --workspace=apps/frontend
npm run test:e2e --workspace=apps/frontend

# Contracts
cargo test --workspace

# Load tests (requires running backend)
./scripts/load-test.sh
```
