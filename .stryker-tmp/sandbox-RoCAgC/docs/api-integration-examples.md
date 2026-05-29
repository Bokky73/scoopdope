# API Integration Examples

Real-world examples for integrating with the scoopdope API using TypeScript/JavaScript.

**Base URL:** `http://localhost:3000/v1` (development) · `https://api.scoopdope.example.com/v1` (production)  
**Interactive docs:** `http://localhost:3000/api/docs`

---

## Table of Contents

- [Setup](#setup)
- [Response & Error Shapes](#response--error-shapes)
- [Authentication](#authentication)
  - [JWT Flow (register → login → refresh → logout)](#jwt-flow)
  - [API Key Authentication](#api-key-authentication)
  - [Stellar SEP-10 Authentication](#stellar-sep-10-authentication)
- [Courses](#courses)
- [Enrollment & Progress Tracking](#enrollment--progress-tracking)
- [Stellar Balances & Credential Minting](#stellar-balances--credential-minting)
- [Error Handling & Retry Logic](#error-handling--retry-logic)
- [Rate Limiting Best Practices](#rate-limiting-best-practices)

---

## Setup

Install a minimal HTTP client. All examples use the native `fetch` API (Node 18+). No extra dependencies required.

```typescript
// client.ts
const BASE_URL = process.env.API_URL ?? 'http://localhost:3000/v1';

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string; apiKey?: string } = {},
): Promise<T> {
  const { token, apiKey, ...init } = options;

  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token)  headers.set('Authorization', `Bearer ${token}`);
  if (apiKey) headers.set('X-API-KEY', apiKey);

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiError(res.status, err.message ?? res.statusText, err.path);
  }

  return res.json();
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly path?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

---

## Response & Error Shapes

Every successful response is wrapped by the global transform interceptor:

```json
{
  "data": { },
  "statusCode": 200,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Every error response follows:

```json
{
  "statusCode": 404,
  "message": "Course not found",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/v1/courses/unknown-id"
}
```

---

## Authentication

### JWT Flow

```typescript
// auth.ts
import { apiFetch, ApiError } from './client';

interface AuthTokens {
  data: { access_token: string; refresh_token: string };
}

// 1. Register
export async function register(email: string, password: string) {
  return apiFetch<AuthTokens>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// 2. Login
export async function login(email: string, password: string) {
  return apiFetch<AuthTokens>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// 3. Refresh access token before it expires
export async function refreshToken(refresh_token: string) {
  return apiFetch<{ data: { access_token: string } }>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token }),
  });
}

// 4. Logout (invalidates the refresh token server-side)
export async function logout(refresh_token: string) {
  return apiFetch('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refresh_token }),
  });
}
```

**Usage:**

```typescript
const { data } = await register('user@example.com', 'password123');
// or
const { data } = await login('user@example.com', 'password123');

const { access_token, refresh_token } = data;

// Store tokens (use httpOnly cookies in browser environments)
// access_token is short-lived; refresh_token is long-lived
```

---

### API Key Authentication

API keys are issued by admins and sent via the `X-API-KEY` header. They are SHA-256 hashed server-side, so the raw key is only visible at creation time.

```typescript
// Using an API key instead of a JWT
const courses = await apiFetch('/courses', {
  apiKey: process.env.Scoopdope_API_KEY,
});
```

To generate an API key (admin only):

```typescript
const { data } = await apiFetch<{ data: { key: string; id: string } }>(
  '/auth/admin/api-keys',
  {
    method: 'POST',
    token: adminAccessToken,
    body: JSON.stringify({ userId: 'user-uuid', name: 'my-integration' }),
  },
);

// Save data.key immediately — it cannot be retrieved again
console.log('API key:', data.key);
```

To revoke a key:

```typescript
await apiFetch('/auth/admin/api-keys/revoke', {
  method: 'POST',
  token: adminAccessToken,
  body: JSON.stringify({ id: data.id }),
});
```

---

### Stellar SEP-10 Authentication

SEP-10 lets users authenticate by signing a challenge with their Stellar wallet, receiving a JWT without a password.

```typescript
import { Keypair, Transaction, Networks } from '@stellar/stellar-sdk';

async function stellarLogin(secretKey: string): Promise<string> {
  const keypair = Keypair.fromSecret(secretKey);
  const publicKey = keypair.publicKey();

  // 1. Fetch challenge XDR
  const { data: challenge } = await apiFetch<{
    data: { transaction: string; network_passphrase: string };
  }>(`/auth/stellar?account=${publicKey}`);

  // 2. Sign the challenge transaction
  const tx = new Transaction(challenge.transaction, challenge.network_passphrase);
  tx.sign(keypair);
  const signedXdr = tx.toEnvelope().toXDR('base64');

  // 3. Submit signed transaction to receive JWT
  const { data: auth } = await apiFetch<{ data: { access_token: string } }>(
    '/auth/stellar',
    {
      method: 'POST',
      body: JSON.stringify({ transaction: signedXdr }),
    },
  );

  return auth.access_token;
}
```

---

## Courses

```typescript
// courses.ts
import { apiFetch } from './client';

interface Course {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

interface PaginatedCourses {
  data: { data: Course[]; total: number; page: number; limit: number };
}

// List courses with optional filters
export async function getCourses(params?: {
  search?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  page?: number;
  limit?: number;
}) {
  const qs = new URLSearchParams(
    Object.entries(params ?? {})
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)]),
  ).toString();

  return apiFetch<PaginatedCourses>(`/courses${qs ? `?${qs}` : ''}`);
}

// Get a single course
export async function getCourse(id: string) {
  return apiFetch<{ data: Course }>(`/courses/${id}`);
}

// Create a course (admin / instructor only)
export async function createCourse(
  token: string,
  payload: { title: string; description: string; level: string },
) {
  return apiFetch<{ data: Course }>('/courses', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}
```

**Usage:**

```typescript
// Browse all beginner courses, page 2
const { data } = await getCourses({ level: 'beginner', page: 2, limit: 10 });
console.log(`${data.total} courses found, showing page ${data.page}`);

// Get a specific course
const { data: course } = await getCourse('course-uuid');
```

---

## Enrollment & Progress Tracking

```typescript
// learning.ts
import { apiFetch } from './client';

// Enroll in a course
export async function enroll(token: string, courseId: string) {
  return apiFetch(`/courses/${courseId}/enroll`, {
    method: 'POST',
    token,
  });
}

// Unenroll from a course
export async function unenroll(token: string, courseId: string) {
  return apiFetch(`/courses/${courseId}/enroll`, {
    method: 'DELETE',
    token,
  });
}

// Get all enrollments for a user
export async function getEnrollments(token: string, userId: string) {
  return apiFetch(`/users/${userId}/enrollments`, { token });
}

// Record lesson progress (also updates on-chain via Soroban)
export async function recordProgress(
  token: string,
  payload: { courseId: string; lessonId?: string; progressPct: number },
) {
  return apiFetch('/progress', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

// Get all progress records for a user
export async function getUserProgress(token: string, userId: string) {
  return apiFetch(`/users/${userId}/progress`, { token });
}
```

**Full learning flow:**

```typescript
const token = (await login('user@example.com', 'password123')).data.access_token;
const userId = 'user-uuid';
const courseId = 'course-uuid';

// Enroll
await enroll(token, courseId);

// Record progress as the user completes lessons
await recordProgress(token, { courseId, lessonId: 'lesson-1-uuid', progressPct: 25 });
await recordProgress(token, { courseId, lessonId: 'lesson-2-uuid', progressPct: 50 });
await recordProgress(token, { courseId, progressPct: 100 }); // course complete

// Check progress
const { data: progress } = await getUserProgress(token, userId);
console.log(progress); // [{ courseId, progressPct: 100, updatedAt: '...' }]
```

---

## Stellar Balances & Credential Minting

```typescript
// stellar.ts
import { apiFetch } from './client';

// Get Stellar account balances (public endpoint)
export async function getBalance(publicKey: string) {
  return apiFetch(`/stellar/balance/${publicKey}`);
}

// Mint a credential NFT on course completion (admin only)
export async function mintCredential(
  adminToken: string,
  recipientPublicKey: string,
  courseId: string,
) {
  return apiFetch('/stellar/mint', {
    method: 'POST',
    token: adminToken,
    body: JSON.stringify({ recipientPublicKey, courseId }),
  });
}

// Fund a testnet account via Friendbot (testnet only)
export async function fundTestnetAccount(publicKey: string) {
  return apiFetch('/stellar/fund-testnet', {
    method: 'POST',
    body: JSON.stringify({ publicKey }),
  });
}
```

**Usage:**

```typescript
// Check a learner's BST token balance
const { data: balances } = await getBalance('GABC...XYZ');

// After a learner completes a course, mint their on-chain credential
const { data: txHash } = await mintCredential(
  adminToken,
  'GABC...XYZ',   // learner's Stellar public key
  'course-uuid',
);
console.log('Credential minted, tx:', txHash);
```

---

## Error Handling & Retry Logic

```typescript
// retry.ts
import { ApiError } from './client';

const RETRYABLE_STATUSES = new Set([429, 502, 503, 504]);

/**
 * Retries a request with exponential backoff.
 * Only retries on network errors and specific HTTP status codes.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  { maxAttempts = 3, baseDelayMs = 500 }: { maxAttempts?: number; baseDelayMs?: number } = {},
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      const isRetryable =
        !(err instanceof ApiError) ||          // network / parse error
        RETRYABLE_STATUSES.has(err.status);    // rate-limited or server error

      if (!isRetryable || attempt === maxAttempts) throw err;

      const delay = baseDelayMs * 2 ** (attempt - 1); // 500ms, 1s, 2s …
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError;
}
```

**Handling specific errors:**

```typescript
import { ApiError } from './client';
import { withRetry } from './retry';

try {
  const { data } = await withRetry(() => enroll(token, courseId));
  console.log('Enrolled:', data);
} catch (err) {
  if (err instanceof ApiError) {
    switch (err.status) {
      case 401:
        // Token expired — refresh and retry
        const { data } = await refreshToken(storedRefreshToken);
        token = data.access_token;
        break;
      case 403:
        console.error('Insufficient permissions');
        break;
      case 404:
        console.error('Course not found');
        break;
      case 409:
        console.error('Already enrolled in this course');
        break;
      case 429:
        console.error('Rate limit hit — back off and retry');
        break;
      default:
        console.error(`Unexpected error ${err.status}: ${err.message}`);
    }
  } else {
    // Network failure
    console.error('Network error:', err);
  }
}
```

**Auto-refreshing token wrapper:**

```typescript
// session.ts
let accessToken = '';
let refreshTokenValue = '';

export async function authedFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  try {
    return await apiFetch<T>(path, { ...options, token: accessToken });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401 && refreshTokenValue) {
      // Attempt a single token refresh
      const { data } = await refreshToken(refreshTokenValue);
      accessToken = data.access_token;
      return apiFetch<T>(path, { ...options, token: accessToken });
    }
    throw err;
  }
}
```

---

## Rate Limiting Best Practices

The API enforces per-IP rate limits. Exceeding them returns `429 Too Many Requests`.

| Endpoint group | Limit |
|---|---|
| `POST /auth/register` | 5 requests / min |
| `POST /auth/login` | 5 requests / min |
| `POST /auth/forgot-password` | 3 requests / hour |
| `GET/POST /auth/stellar` | 10 requests / min |
| `POST /stellar/mint` | 3 requests / min |
| All other endpoints | 100 requests / min (default) |

**Recommendations:**

1. **Cache tokens** — store `access_token` in memory and `refresh_token` in a secure store. Don't re-login on every request.

2. **Respect `Retry-After`** — when you receive a `429`, wait before retrying:

   ```typescript
   async function fetchWithRateLimit<T>(path: string, options = {}): Promise<T> {
     const res = await fetch(`${BASE_URL}${path}`, options);
     if (res.status === 429) {
       const retryAfter = Number(res.headers.get('Retry-After') ?? 1);
       await new Promise((r) => setTimeout(r, retryAfter * 1000));
       return fetchWithRateLimit(path, options); // single retry
     }
     return res.json();
   }
   ```

3. **Batch reads, not writes** — fetch course lists once and cache locally rather than making individual requests per course.

4. **Avoid polling** — use the progress endpoint to record state changes, not to poll for updates. Fetch progress once on page load.

5. **Use API keys for server-to-server** — API keys are not rate-limited per user session and are better suited for backend integrations. Keep them in environment variables, never in client-side code.

6. **Stagger bulk operations** — if you need to record progress for many users (e.g. a migration), add a small delay between requests:

   ```typescript
   for (const record of records) {
     await recordProgress(token, record);
     await new Promise((r) => setTimeout(r, 100)); // 10 req/s max
   }
   ```
