# User-Based Rate Limiting

## Overview

The API implements per-user rate limiting with role-based thresholds to prevent abuse while allowing legitimate users appropriate access.

## Rate Limit Tiers

| Role | Limit | Window |
|------|-------|--------|
| Admin | 10,000 req/min | 60s |
| Instructor | 5,000 req/min | 60s |
| Student | 1,000 req/min | 60s |
| Guest | 100 req/min | 60s |

## Implementation

### Service: `UserRateLimitService`

Manages rate limit tracking and trusted client management:

```typescript
// Check if request is allowed
const allowed = await rateLimitService.checkRateLimit(userId, role);

// Get current status
const status = await rateLimitService.getRateLimitStatus(userId, role);

// Manage trusted clients (bypass rate limiting)
await rateLimitService.addTrustedClient(clientId);
await rateLimitService.isTrustedClient(clientId);
```

### Guard: `UserRateLimitGuard`

Applied globally to all routes. Automatically:
- Checks user rate limit
- Bypasses trusted clients
- Sets rate limit headers in response
- Returns 429 (Too Many Requests) when exceeded

### Response Headers

All responses include rate limit information:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 2026-04-27T16:00:00Z
```

## Trusted Clients

Bypass rate limiting for:
- Internal services
- Batch processing jobs
- Monitoring systems

```typescript
// Add trusted client (24-hour TTL by default)
await rateLimitService.addTrustedClient('internal-service-id');

// Remove trusted client
await rateLimitService.removeTrustedClient('internal-service-id');
```

## Monitoring

Rate limit data is stored in Redis with automatic expiration. Monitor:
- Requests approaching limits
- Frequent 429 responses
- Trusted client usage

## Configuration

Rate limits are configurable via environment variables:

```env
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
REDIS_URL=redis://localhost:6379
```

## Best Practices

1. **Batch Operations**: Use trusted client tokens for batch jobs
2. **Caching**: Implement client-side caching to reduce requests
3. **Backoff**: Implement exponential backoff on 429 responses
4. **Monitoring**: Track rate limit violations for abuse detection
