# API Rate Limiting Guide

## Overview

The API enforces request throttling to protect services from abuse, preserve capacity, and ensure fair use. Rate limiting is implemented using Redis-backed counters and configurable thresholds.

## Rate limit tiers and thresholds

The API supports multiple tiers of rate limiting:

- **Authentication endpoints**: strict limits for high-risk operations such as login, registration, password reset, and Stellar wallet requests.
- **Write-heavy endpoints**: tighter limits for state-changing operations such as minting, posting course progress, or submitting feedback.
- **Default endpoints**: a higher base threshold for standard read requests.
- **Trusted clients**: special bypass or elevated quotas for internal services, server-to-server integrations, and whitelisted partners.

Example thresholds:

| Tier | Endpoint examples | Threshold |
|---|---|---|
| Authentication | `POST /auth/login`, `POST /auth/register` | 5 requests / minute |
| Account recovery | `POST /auth/forgot-password` | 3 requests / hour |
| High-risk operations | `POST /stellar/mint`, `POST /courses/*/submit` | 3-10 requests / minute |
| Default API traffic | `GET /courses`, `GET /users/{id}` | 100 requests / minute |
| Trusted service clients | internal API keys / allowlisted IPs | 1,000+ requests / minute or custom policy |

These values should be treated as a starting point and tuned based on actual traffic patterns and service capacity.

## Redis-backed throttling mechanism

Rate limiting uses Redis as the centralized state store for request counters. This enables distributed API instances to share a consistent view of current usage.

Typical implementation details:

- Each request is assigned a rate-limit key based on the client identity (IP address, API key, user ID, or custom client ID).
- Redis stores request counters with short TTLs matching the rate-limit window.
- The system increments the counter atomically and checks whether the client has exceeded the configured limit.
- When a counter expires, Redis automatically removes the key, so the window slides naturally.

A common pattern is the **sliding window counter** or a **fixed window** with Redis `INCR` and `EXPIRE`:

- `INCR key`
- if the counter is newly created, set `EXPIRE key ttl`
- compare the counter with the limit
- if it exceeds the limit, reject with `429`

Redis also supports more advanced algorithms such as sorted-set leaky bucket implementations for smooth bursting and accurate window enforcement.

## Rate limit headers documentation

When the API returns rate limiting information, clients should rely on standard headers for guidance.

- `X-RateLimit-Limit`: the maximum number of requests allowed in the current window.
- `X-RateLimit-Remaining`: the number of requests still available before the limit is reached.
- `X-RateLimit-Reset`: the UTC timestamp or number of seconds until the current window resets.
- `Retry-After`: the number of seconds to wait before making a new request after receiving `429 Too Many Requests`.

Example response headers:

```
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 23
Retry-After: 23
```

Clients should use these headers to back off gracefully and avoid repeated retries.

## Trusted client bypass mechanisms

Trusted clients require higher throughput or exemption from public rate limits. This can be achieved safely with one or more of the following approaches:

- **API key allowlist**: grant elevated limits to known API keys stored securely in configuration.
- **IP allowlist**: allow traffic from internal service IPs or private network ranges to bypass public throttling.
- **Service-to-service authentication**: use signed service credentials or mutual TLS to identify trusted clients.
- **Custom rate-limit policies**: assign dedicated quotas per tenant or integration rather than applying the default limit.

When bypassing rate limits, ensure trusted clients are still monitored and audited. Do not disable protection entirely for any client without a clear operational reason.

## Rate limit monitoring

Monitoring helps detect abusive traffic, misconfigured clients, and trending API usage.

Recommended monitoring points:

- request count and request rate per endpoint group
- number of `429` responses over time
- Redis throttling key usage and expirations
- high-water marks for client-level counters
- service latency spikes caused by throttling

A monitoring stack may include:

- Prometheus/Grafana metrics for request rate, throttled requests, and Redis availability
- alerting for sustained `429` rate increases or Redis errors
- logging of denied requests with client identifiers and endpoint information
- periodic review of top rate-limited clients and traffic patterns

Monitoring rate limiting allows teams to adjust thresholds, detect abusive behavior, and keep the API reliable as traffic grows.
