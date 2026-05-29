# Performance Optimization Guide

Best practices for optimizing performance across the scoopdope stack — backend caching, frontend rendering, database queries, Soroban contract gas, and CDN/asset delivery.

---

## Table of Contents

1. [Backend Caching Strategies (Redis)](#backend-caching-strategies-redis)
2. [Frontend Optimization (Next.js SSR/SSG)](#frontend-optimization-nextjs-ssrssg)
3. [Database Query Optimization](#database-query-optimization)
4. [Contract Gas Optimization](#contract-gas-optimization)
5. [CDN and Asset Optimization](#cdn-and-asset-optimization)

---

## Backend Caching Strategies (Redis)

scoopdope uses `cache-manager` with `cache-manager-redis-store` as a global NestJS cache module. Redis also backs the rate-limiter via `ThrottlerStorageRedisService`.

### Global TTL

The default cache TTL is **60 seconds**, set in `AppModule`:

```typescript
CacheModule.registerAsync({
  useFactory: (config: ConfigService) => ({
    store: redisStore,
    url: config.get<string>('redis.url'),
    ttl: 60, // seconds — global default
  }),
});
```

Override per call by passing an explicit TTL (in milliseconds) to `cacheManager.set()`.

### Cache-Aside Pattern

All service-level caching follows the cache-aside pattern: check cache → on miss, fetch from source → populate cache.

```typescript
const cached = await this.cacheManager.get<T>(cacheKey);
if (cached) return cached;

const data = await this.repo.find(/* ... */);
await this.cacheManager.set(cacheKey, data, ttlMs);
return data;
```

### TTL Reference

| Data | Cache Key | TTL |
|---|---|---|
| All courses list | `courses:all` | 60 s (global default) |
| Leaderboard top 50 | `leaderboard:top50` | 300 s (5 min) |
| BST token balance | `token_balance:<publicKey>` | 30 s |

### Cache Invalidation

Mutating operations (create, update, delete) must invalidate the relevant cache key immediately:

```typescript
// courses.service.ts
private async invalidateCache() {
  await this.cacheManager.del('courses:all');
}

async create(data: Partial<Course>) {
  const course = await this.repo.save(this.repo.create(data));
  await this.invalidateCache(); // keep cache consistent
  return course;
}
```

### Rate Limiting with Redis

The global throttler uses Redis as its backing store, ensuring rate-limit counters are shared across all backend instances (important in multi-replica deployments):

```typescript
ThrottlerModule.forRootAsync({
  useFactory: (config: ConfigService) => ({
    throttlers: [{ ttl: 60_000, limit: 100 }],
    storage: new ThrottlerStorageRedisService(config.get('redis.url')),
  }),
});
```

Sensitive endpoints (e.g. credential minting) apply a tighter per-route limit:

```typescript
@Throttle({ default: { limit: 3, ttl: 60_000 } })
@Post('mint')
mintCredential() { /* ... */ }
```

### Tips

- Keep Redis co-located with the backend (same VPC/subnet) to minimize network latency.
- Use a dedicated Redis instance for caching vs. one for sessions/rate-limiting if traffic is high.
- Monitor cache hit rates with `redis-cli info stats` (`keyspace_hits` / `keyspace_misses`).
- Avoid caching user-specific data under shared keys — always include the user ID or public key in the cache key.

---

## Frontend Optimization (Next.js SSR/SSG)

The frontend uses Next.js 14 App Router with `output: 'standalone'` for lean Docker images.

### Rendering Strategy

| Page type | Strategy | When to use |
|---|---|---|
| Course catalogue | SSG + ISR | Content changes infrequently |
| Course detail | SSG + ISR | Per-course, low mutation rate |
| User dashboard | SSR | Personalized, auth-gated |
| Leaderboard | SSR or client fetch | Near-real-time data |

**Static Generation with revalidation (ISR):**

```typescript
// app/courses/page.tsx
export const revalidate = 60; // regenerate at most every 60 s

export default async function CoursesPage() {
  const courses = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/courses`, {
    next: { revalidate: 60 },
  }).then(r => r.json());
  return <CourseList courses={courses} />;
}
```

**Server-side rendering for auth-gated pages:**

```typescript
// app/dashboard/page.tsx
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const data = await fetchWithAuth('/v1/users/me');
  return <Dashboard data={data} />;
}
```

### Image Optimization

Next.js `<Image>` automatically serves WebP/AVIF, resizes on demand, and lazy-loads. Always prefer it over `<img>`:

```typescript
import Image from 'next/image';

<Image
  src={course.thumbnailUrl}
  alt={course.title}
  width={640}
  height={360}
  priority={isAboveFold} // set true for hero images only
/>
```

Remote image domains are whitelisted in `next.config.js`. Avoid the catch-all `hostname: '**'` in production — restrict to your actual CDN domain.

### Bundle Size

- Use dynamic imports for heavy components (e.g. Stellar SDK, wallet UI):

```typescript
import dynamic from 'next/dynamic';

const WalletConnect = dynamic(() => import('@/components/WalletConnect'), {
  ssr: false, // wallet APIs are browser-only
});
```

- Analyze bundle size with:

```bash
ANALYZE=true npm run build:frontend
```

### Standalone Output

`output: 'standalone'` in `next.config.js` produces a minimal Docker image by tracing only the files actually used. Keep this enabled for production deployments.

---

## Database Query Optimization

scoopdope uses TypeORM with PostgreSQL. The following patterns are already in use and should be maintained.

### Pagination

All list endpoints accept `page` and `limit` parameters. Always paginate — never load unbounded result sets:

```typescript
const { page = 1, limit = 20 } = query;
const offset = (page - 1) * limit;

qb.skip(offset).take(limit);
```

### QueryBuilder over `find()` for Complex Queries

Use `createQueryBuilder` when you need joins, aggregates, or conditional filters. Avoid N+1 queries by joining relations in a single query:

```typescript
// Good — single query with join + aggregate
const { raw, entities } = await qb
  .leftJoin('course.reviews', 'review')
  .addSelect('COALESCE(AVG(review.rating), 0)', 'course_averageRating')
  .groupBy('course.id')
  .getRawAndEntities();

// Bad — N+1: one query per course to fetch reviews
const courses = await this.repo.find({ relations: ['reviews'] });
courses.map(c => average(c.reviews));
```

### Indexes

Add indexes on columns used in `WHERE`, `ORDER BY`, and `JOIN` conditions. TypeORM decorators:

```typescript
import { Entity, Column, Index } from 'typeorm';

@Entity()
@Index(['isPublished', 'isDeleted']) // composite index for the common filter
export class Course {
  @Column() isPublished: boolean;
  @Column() isDeleted: boolean;

  @Index()
  @Column() createdAt: Date;
}
```

Key columns to index in scoopdope:

| Table | Column(s) | Reason |
|---|---|---|
| `course` | `is_published`, `is_deleted` | Every list query filters on both |
| `course` | `created_at` | Default sort column |
| `user` | `stellar_public_key` | Leaderboard + balance lookups |
| `progress` | `user_id`, `course_id` | Progress lookups by student + course |

### Select Only What You Need

Avoid `SELECT *` on wide tables. Use `.select()` to limit columns:

```typescript
qb.select(['course.id', 'course.title', 'course.level', 'course.createdAt']);
```

### Connection Pooling

TypeORM uses a connection pool by default. Tune it for your workload in `AppModule`:

```typescript
TypeOrmModule.forRootAsync({
  useFactory: (config) => ({
    // ...
    extra: {
      max: 20,  // max pool size (default 10)
      idleTimeoutMillis: 30_000,
    },
  }),
});
```

---

## Contract Gas Optimization

Soroban charges fees based on CPU instructions, memory, and ledger entry reads/writes. The following patterns are used in scoopdope contracts and should be followed for any new contract work.

### Use `instance` Storage for Shared State

`instance` storage (e.g. `Admin`, `TotalSupply`) is loaded once per transaction invocation. Prefer it over `persistent` for values read on every call:

```rust
// Cheap — loaded with the contract instance
env.storage().instance().get(&DataKey::Admin)

// More expensive — separate ledger entry read
env.storage().persistent().get(&DataKey::Progress(addr, course))
```

### Extend TTL Proactively

Persistent entries that expire are archived and cost more to restore. Extend TTL when entries are accessed:

```rust
const TTL_THRESHOLD: u32 = 100;  // extend if fewer than 100 ledgers remain
const TTL_EXTEND_TO: u32 = 500;  // extend to 500 ledgers (~42 hours on mainnet)

env.storage().persistent().extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND_TO);
```

This pattern is already used in the Analytics contract. Apply it consistently in any new persistent storage writes.

### Minimize Ledger Entry Writes

Each `set()` on persistent storage costs more than a read. Batch updates where possible and avoid writing unchanged values:

```rust
// Only write if value actually changed
let current: u32 = env.storage().persistent().get(&key).unwrap_or(0);
if current != new_value {
    env.storage().persistent().set(&key, &new_value);
}
```

### Use `symbol_short!` for Keys

Short symbols (≤ 9 chars) are encoded inline and cheaper than heap-allocated strings:

```rust
// Good
const TRANSFER: Symbol = symbol_short!("transfer");

// Avoid for frequently-used keys
let key = Symbol::new(&env, "transfer_event_key");
```

### Avoid Unnecessary Auth Checks

`require_auth()` adds CPU cost. Only call it on the addresses that actually need to authorize the operation — not on read-only functions:

```rust
// Only admin-mutating functions need this
pub fn set_admin(env: Env, new_admin: Address) {
    let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
    admin.require_auth(); // necessary
    // ...
}

pub fn get_progress(env: Env, student: Address, course_id: Symbol) -> ProgressRecord {
    // No require_auth — read-only, anyone can query
}
```

### Simulate Before Submitting

Always simulate transactions before submitting to catch errors cheaply and get an accurate fee estimate:

```typescript
const simResult = await sorobanServer.simulateTransaction(tx);
if (SorobanRpc.Api.isSimulationError(simResult)) {
  throw new Error(simResult.error);
}
// simResult.minResourceFee gives the minimum fee
const prepared = await sorobanServer.prepareTransaction(tx);
```

---

## CDN and Asset Optimization

### Static Assets via Next.js

Next.js serves files in `apps/frontend/public/` at the root path. For production, put a CDN (e.g. CloudFront) in front of the Next.js origin and cache static assets aggressively.

Recommended CloudFront cache behaviors:

| Path pattern | Cache TTL | Notes |
|---|---|---|
| `/_next/static/*` | 1 year | Content-hashed filenames — safe to cache forever |
| `/images/*` | 7 days | Versioned via query string if needed |
| `/api/*` | No cache | Dynamic — bypass CDN |
| `/*` (default) | 60 s | HTML pages — short TTL for ISR compatibility |

### Cache-Control Headers

Set long-lived headers for hashed assets. Next.js does this automatically for `/_next/static/`. For custom static files, add headers in `next.config.js`:

```javascript
async headers() {
  return [
    {
      source: '/fonts/:path*',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    },
  ];
}
```

### Image Delivery

- Use Next.js `<Image>` — it serves WebP/AVIF and generates srcsets automatically.
- For user-uploaded content (e.g. course thumbnails), store originals in S3 and serve via CloudFront. Pass the CloudFront domain as a whitelisted `remotePattern` in `next.config.js`.
- Remove the catch-all `hostname: '**'` pattern in production and replace with your specific CDN hostname.

### Font Optimization

Use `next/font` to self-host fonts — it eliminates the external font request and inlines the `font-face` declaration:

```typescript
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], display: 'swap' });
```

### Compression

Ensure gzip/Brotli compression is enabled at the reverse proxy or CDN layer. Next.js standalone mode does not enable compression by default — configure it in Nginx or your load balancer:

```nginx
gzip on;
gzip_types text/plain text/css application/javascript application/json;
gzip_min_length 1024;
```

---

## Related Docs

- [development-setup.md](./development-setup.md) — Local environment setup
- [contracts.md](./contracts.md) — Soroban contract reference
- [monitoring.md](./monitoring.md) — Metrics and observability
