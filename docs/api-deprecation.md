# API Deprecation Policy

This document describes how the scoopdope platform handles API endpoint deprecation — the headers clients should watch for, how developers apply the `@Deprecated` decorator, and how clients should migrate away from deprecated endpoints.

---

## Deprecation Policy

When an endpoint is scheduled for removal, it enters a **90-day sunset window**:

1. The endpoint is annotated with `@Deprecated` in the source code.
2. Every response from that endpoint carries a standard set of deprecation headers (see below).
3. A `sunset` date is set to **90 days after the deprecation date**.
4. After the sunset date the endpoint is removed and returns `410 Gone`.

The 90-day window gives clients time to migrate with no service interruption.

---

## Response Headers

When a deprecated endpoint is called, the following headers are present in the HTTP response:

| Header | Format | Example |
|---|---|---|
| `Deprecation` | RFC 8594 — `true` | `true` |
| `Sunset` | RFC 7231 HTTP-date | `Mon, 01 Sep 2025 00:00:00 GMT` |
| `Link` | RFC 8594 successor relation | `<https://docs.example.com/api/v2/stellar/health>; rel="successor-version"` |
| `X-API-Deprecated` | Custom header | `true; deprecation_date=2025-06-01T00:00:00.000Z` |
| `X-API-Sunset` | Custom header (ISO 8601) | `2025-09-01T00:00:00.000Z` |

### Example response headers for a deprecated endpoint

```http
HTTP/1.1 200 OK
Deprecation: true
Sunset: Mon, 01 Sep 2025 00:00:00 GMT
Link: <https://docs.example.com/api/v2/stellar/health>; rel="successor-version"
X-API-Deprecated: true; deprecation_date=2025-06-01T00:00:00.000Z
X-API-Sunset: 2025-09-01T00:00:00.000Z
X-API-Version: v1
Content-Type: application/json
```

---

## Applying `@Deprecated` to an Endpoint

Import the decorator and apply it to any controller method:

```typescript
import { Deprecated } from '../common/versioning/deprecated.decorator';

@Get('legacy-endpoint')
@Deprecated({
  since: '2025-06-01',           // ISO date when deprecated
  sunset: '2025-09-01',          // ISO date when removed (90 days later)
  migrationUrl: 'https://docs.example.com/api/v2/new-endpoint',
  reason: 'Use GET /v1/new-endpoint instead',
})
@ApiOperation({ summary: '...' })
legacyEndpoint() {
  // ...
}
```

### `DeprecationInfo` fields

| Field | Type | Required | Description |
|---|---|---|---|
| `since` | `string` (ISO date) | Yes | When the endpoint was deprecated |
| `sunset` | `string` (ISO date) | Yes | When the endpoint will be removed (90 days after `since`) |
| `migrationUrl` | `string` | No | URL to migration docs or the replacement endpoint |
| `reason` | `string` | No | Human-readable explanation for the deprecation |

---

## How it Works

The `DeprecationInterceptor` is registered globally in `AppModule` via `APP_INTERCEPTOR`. On every request it:

1. Checks whether the route handler has a `@Deprecated` metadata key (set by `SetMetadata`).
2. If found, sets all deprecation headers on the response.
3. Emits a `Logger.warn` line: `Deprecated endpoint accessed: <METHOD> <PATH>`.

The interceptor is completely independent of the `ApiVersionInterceptor` — version-level deprecation (from `VERSION_MANIFEST`) and endpoint-level deprecation (from `@Deprecated`) coexist without interfering with each other.

---

## Demonstration: Deprecated Endpoint

The following endpoint is currently deprecated and serves as a live example of the feature:

| Method | Path | Deprecated Since | Sunset | Replacement |
|---|---|---|---|---|
| `GET` | `/v1/stellar/network-status` | 2025-06-01 | 2025-09-01 | `GET /v1/health` |

When you call `GET /v1/stellar/network-status`, the response will include the full set of deprecation headers listed above.

---

## Migration Guidance for Clients

1. **Monitor headers** — Check responses for `Deprecation: true` or `X-API-Deprecated` on every integration.
2. **Record the sunset date** — The `Sunset` and `X-API-Sunset` headers give you the hard deadline.
3. **Follow the `Link` header** — The `rel="successor-version"` link points to the replacement endpoint or migration documentation.
4. **Migrate before the sunset date** — After the sunset date the endpoint is removed and returns `410 Gone`.
5. **Contact support** — If the 90-day window is insufficient for your use case, open an issue before the sunset date.

---

## Server-Side Logging

Every access to a deprecated endpoint produces a warning log line in the backend process:

```
[DeprecationInterceptor] Deprecated endpoint accessed: GET /v1/stellar/network-status
```

Operators can monitor these logs to understand which clients still depend on deprecated endpoints, prioritise outreach, and decide when it is safe to remove the endpoint.

---

## Related Documentation

- [API Versioning Policy](./api-versioning.md)
- [API Rate Limiting](./api-rate-limiting.md)
