# API Versioning Strategy

This document describes the versioning scheme used by the scoopdope REST API,
what constitutes a breaking change, how long deprecated versions are supported,
and how clients can negotiate and detect version information at runtime.

---

## Table of Contents

1. [Versioning scheme](#versioning-scheme)
2. [Version resolution — how the server picks a version](#version-resolution)
3. [Runtime version headers](#runtime-version-headers)
4. [What counts as a breaking change](#what-counts-as-a-breaking-change)
5. [Introducing a new version](#introducing-a-new-version)
6. [Deprecation and sunset timeline](#deprecation-and-sunset-timeline)
7. [Communication process](#communication-process)
8. [Migration examples](#migration-examples)
9. [Checklist for contributors introducing a breaking change](#checklist)

---

## Versioning scheme

The API uses **URL-based major versioning**. Every route is prefixed with the
current major version:

```
/api/v1/<resource>
```

This prefix is applied globally in `apps/backend/src/main.ts`:

```ts
app.setGlobalPrefix('api/v1', {
  exclude: ['health', 'health/live', 'health/ready', ...],
});
```

Health and observability endpoints are intentionally excluded from the prefix so
infrastructure probes (AWS ALB, Kubernetes liveness) never need to be updated
when the API version changes.

The version prefix is **coarse-grained** — it covers the entire API surface, not
individual endpoints. This keeps routing simple and avoids per-route version
negotiation for the common case.

### Version manifest

All supported versions and their lifecycle dates are tracked in
`apps/backend/src/common/versioning/api-version.constants.ts`:

```ts
export const VERSION_MANIFEST: Record<ApiVersion, VersionInfo> = {
  v1: {
    version: 'v1',
    releaseDate: new Date('2025-01-01'),
    changelog: 'Initial stable release.',
    // deprecationDate and sunsetDate are set when a version is retired
  },
};
```

When a version is deprecated, its `deprecationDate` and `sunsetDate` are added
to this manifest. The interceptor reads these dates to set the appropriate
response headers automatically (see [Runtime version headers](#runtime-version-headers)).

---

## Version resolution

Every incoming request is processed by `ApiVersionMiddleware`, which resolves
the version in this priority order:

| Priority | Source | Example |
|----------|--------|---------|
| 1 (highest) | URL path prefix | `GET /v1/courses` → `v1` |
| 2 | `Accept-Version` request header | `Accept-Version: v1` |
| 3 (fallback) | Default (current latest) | automatically `v1` |

The resolved version is stored on `req.metadata.version` and is available to
all downstream handlers and interceptors.

### Requesting a specific version via header

When you want to decouple your code from the URL structure, you can send the
`Accept-Version` header instead of embedding the version in the path:

```http
GET /courses
Accept-Version: v1
```

If the requested version is unavailable, the server falls back to the default
version and adds a `Warning` header:

```http
Warning: 299 - Requested version "v2" is not available; using "v1"
```

---

## Runtime version headers

Every API response includes headers that allow clients to detect the served
version and any deprecation status without parsing URLs.

| Header | Direction | Description |
|--------|-----------|-------------|
| `Accept-Version` | Request | Ask for a specific version (e.g. `v1`) |
| `X-API-Version` | Response | The version actually served |
| `X-API-Deprecated` | Response | Present when the served version is deprecated; value includes the deprecation date |
| `X-API-Sunset` | Response | ISO 8601 date after which the version will be removed |
| `Warning` | Response | Present when the requested version is unavailable and a fallback was used |

Example response for a deprecated version:

```http
HTTP/1.1 200 OK
X-API-Version: v1
X-API-Deprecated: true; deprecation_date=2026-01-01T00:00:00.000Z
X-API-Sunset: 2026-04-01T00:00:00.000Z
```

Additionally, every JSON object response includes an `apiVersion` field injected
by `ApiVersionInterceptor`:

```json
{
  "id": "abc123",
  "email": "user@example.com",
  "apiVersion": "v1"
}
```

---

## What counts as a breaking change

A change is **breaking** if existing clients must update their code to keep
working.

| Breaking ✗ | Not breaking ✓ |
|------------|---------------|
| Removing an endpoint | Adding a new endpoint |
| Renaming or removing a required field | Adding a new optional field |
| Changing a field's type | Adding a new optional query param |
| Changing an HTTP method | Expanding an enum with new values |
| Changing a success status code | Performance improvements |
| Changing auth requirements | Bug fixes that don't alter the contract |
| Removing an enum value | New optional request headers |
| Making an optional field required | New response headers |
| Changing pagination behaviour | New filter/sort capabilities |

When in doubt, treat the change as breaking and introduce a new version.

---

## Introducing a new version

Follow these steps any time a breaking change is unavoidable.

### 1. Exhaust non-breaking options first

Add optional fields, new endpoints, or query parameters before reaching for a
version bump. A version bump has a real cost for consumers.

### 2. Open a tracking issue

Label it `breaking-change` and describe:
- what is changing and why
- which endpoints are affected
- a draft migration path for consumers

Link the issue from every PR that contributes to the new version.

### 3. Implement the new version alongside the old one

Never modify an existing version in place. Add the new controller with an
explicit version prefix:

```ts
// apps/backend/src/auth/auth-v2.controller.ts
@ApiTags('auth')
@Controller('v2/auth')
export class AuthV2Controller {
  @Post('login')
  login(@Body() dto: LoginV2Dto) { ... }
}
```

Register both controllers in the module. Both versions run concurrently.

### 4. Add the new version to the manifest

In `apps/backend/src/common/versioning/api-version.constants.ts`:

```ts
export const API_VERSIONS = ['v1', 'v2'] as const;
export const LATEST_API_VERSION: ApiVersion = 'v2';

export const VERSION_MANIFEST: Record<ApiVersion, VersionInfo> = {
  v1: {
    version: 'v1',
    releaseDate: new Date('2025-01-01'),
    deprecationDate: new Date('2026-06-01'),   // add when retiring
    sunsetDate: new Date('2026-09-01'),         // 90 days later
    changelog: 'Initial stable release.',
  },
  v2: {
    version: 'v2',
    releaseDate: new Date('2026-06-01'),
    changelog: 'Breaking: renamed avatar → avatarUrl on user responses.',
  },
};
```

The `ApiVersionInterceptor` reads these dates and sets `X-API-Deprecated` and
`X-API-Sunset` headers automatically on every v1 response from that point on.

### 5. Mark old endpoints as deprecated in Swagger

```ts
// In the v1 controller
@ApiOperation({
  summary: 'Login (deprecated — use POST /v2/auth/login)',
  deprecated: true,
})
@Header('Deprecation', 'version="v1"')
@Header('Sunset', 'Mon, 01 Sep 2026 00:00:00 GMT')
login(...) { ... }
```

### 6. Update the global prefix and Swagger servers

```ts
// main.ts — update the global prefix to the new latest version
app.setGlobalPrefix('v2', { exclude: [...] });

// Swagger — add the new server and update LATEST_API_VERSION reference
config.addServer('/v2', 'API v2 (latest)')
      .addServer('/v1', 'API v1 (deprecated)');
```

### 7. Regenerate and redeploy the OpenAPI spec

```bash
EXPORT_OPENAPI=true node dist/main.js
```

Commit the updated `openapi.json` so GitHub Pages Swagger UI reflects the
deprecation immediately.

---

## Deprecation and sunset timeline

| Phase | Duration | What happens |
|-------|----------|-------------|
| **Announcement** | Day 0 | Tracking issue opened; `deprecationDate` set in manifest; `@ApiOperation({ deprecated: true })` added; `Deprecation` + `Sunset` + `X-API-Deprecated` + `X-API-Sunset` headers active on all deprecated-version responses |
| **Parallel support** | ≥ 90 days | Both versions fully functional; no features removed from the old version |
| **Sunset** | Day 90+ | Old version endpoints return `410 Gone` with a JSON body pointing to the replacement |
| **Removal** | Next major release cycle | Old version code and routes deleted from the codebase |

The 90-day minimum **may be extended** for:
- Endpoints with high external traffic (check analytics before retiring)
- Integrations with third-party systems where the consumer cannot update quickly
- During major platform events (launches, migrations)

Maintainers decide extensions on a case-by-case basis and document the decision
in the tracking issue.

### 410 Gone response format

After the sunset date, deprecated endpoints return:

```json
HTTP/1.1 410 Gone
Content-Type: application/json

{
  "statusCode": 410,
  "error": "Gone",
  "message": "API v1 has been sunset. Please migrate to /v2. See https://github.com/augustina-jpg/scoopdope/blob/main/docs/api-versioning.md for the migration guide."
}
```

---

## Communication process

1. **GitHub issue** — opened at announcement day, labelled `breaking-change`,
   linked from every related PR.

2. **CHANGELOG.md** — a `feat!:` or `fix!:` commit (or a `BREAKING CHANGE:`
   footer) triggers a MAJOR semver bump via Release Please. The breaking change
   description appears under `### ⚠ BREAKING CHANGES` in the generated release
   notes.

3. **Swagger UI** — the deprecated badge is visible on every affected operation
   in the interactive docs at `/api/docs` as soon as the change is deployed.

4. **Response headers** — `X-API-Deprecated` and `X-API-Sunset` on every
   deprecated-version response allow API clients and monitoring tools to detect
   deprecations programmatically without reading docs.

5. **GitHub Release** — the release created by Release Please includes the full
   breaking-change description and links to this migration guide.

---

## Migration examples

### Renamed field: `avatar` → `avatarUrl`

**v1 response**
```json
{ "id": "abc", "email": "user@example.com", "avatar": "https://cdn.example.com/a.png" }
```

**v2 response**
```json
{ "id": "abc", "email": "user@example.com", "avatarUrl": "https://cdn.example.com/a.png" }
```

**Client migration**
```diff
- const src = user.avatar;
+ const src = user.avatarUrl;
```

---

### Removed endpoint: `POST /v1/auth/legacy`

During the 90-day parallel window, v1 still works. After sunset:

```http
POST /v1/auth/legacy
→ 410 Gone
   { "statusCode": 410, "message": "This endpoint has been removed. Use POST /v2/auth/login." }
```

---

### New required field on request body

If a field becomes required in v2 but was optional/absent in v1, the v1 endpoint
continues to accept requests without it. The v2 controller validates the new
field:

```ts
// v1 DTO — unchanged
class LoginDto {
  @IsEmail() email: string;
  @IsString() password: string;
}

// v2 DTO — new required field
class LoginV2Dto {
  @IsEmail() email: string;
  @IsString() @MinLength(8) password: string;
  @IsString() @IsNotEmpty() clientId: string; // required in v2
}
```

---

### Changed response shape (paginated list)

**v1** returns a plain array:
```json
[{ "id": "1", "title": "Intro to Stellar" }, ...]
```

**v2** returns a paginated envelope:
```json
{
  "data": [{ "id": "1", "title": "Intro to Stellar" }, ...],
  "total": 42,
  "page": 1,
  "pageSize": 20
}
```

**Client migration**
```diff
- const courses = await api.get('/v1/courses');
- courses.forEach(c => render(c));
+ const { data: courses } = await api.get('/v2/courses');
+ courses.forEach(c => render(c));
```

---

## Checklist

Use this checklist on every PR that introduces a breaking change:

- [ ] Opened a `breaking-change` GitHub issue and linked it from this PR
- [ ] New endpoint/behaviour implemented under a new version prefix (`/v2/...`)
- [ ] Old endpoint left in place with `@ApiOperation({ deprecated: true })`
- [ ] `Deprecation` and `Sunset` response headers added to old endpoint
- [ ] `deprecationDate` and `sunsetDate` set in `VERSION_MANIFEST`
- [ ] `LATEST_API_VERSION` updated in `api-version.constants.ts`
- [ ] Global prefix and Swagger servers updated in `main.ts`
- [ ] OpenAPI spec regenerated and committed
- [ ] Used `feat!:` or `BREAKING CHANGE:` footer in the commit message
- [ ] This document updated if the strategy itself changes
