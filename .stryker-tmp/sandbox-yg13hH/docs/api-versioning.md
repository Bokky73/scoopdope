# API Versioning Strategy

## Current approach

All endpoints are prefixed with `/v1`, set globally in `main.ts`:

```ts
app.setGlobalPrefix('v1');
```

This means every route is reachable at `/v1/<resource>`, e.g. `POST /v1/auth/login`.

The version prefix is intentionally coarse-grained — it covers the entire API surface, not individual endpoints. This keeps routing simple and avoids per-route version negotiation.

---

## What counts as a breaking change

A change is **breaking** if existing clients must update their code to keep working:

| Breaking | Not breaking |
|---|---|
| Removing an endpoint | Adding a new endpoint |
| Renaming / removing a required field | Adding an optional field |
| Changing a field's type | Adding a new optional query param |
| Changing HTTP method or status code | Expanding an enum with new values |
| Changing auth requirements | Performance improvements |
| Removing an enum value | Bug fixes that don't alter the contract |

---

## Introducing a new version

1. **Exhaust non-breaking options first.** Add optional fields, new endpoints, or query params before reaching for a version bump.

2. **Open a tracking issue** labelled `breaking-change` describing what changes and why. Link it from the PR.

3. **Implement `/v2` alongside `/v1`** — never modify `/v1` in place. In NestJS, scope the new controller with a versioned prefix:

   ```ts
   // apps/backend/src/auth/auth-v2.controller.ts
   @ApiTags('auth')
   @Controller('v2/auth')
   export class AuthV2Controller { ... }
   ```

   Register it in the module alongside the existing controller. Both versions run concurrently.

4. **Mark deprecated endpoints** in Swagger using `@ApiOperation({ deprecated: true })` and add a `Deprecation` response header:

   ```ts
   // In the v1 controller method
   @ApiOperation({ summary: 'Login (deprecated — use /v2/auth/login)', deprecated: true })
   @Header('Deprecation', 'version="v1"')
   @Header('Sunset', 'Sat, 01 Jan 2028 00:00:00 GMT')
   login(...) { ... }
   ```

5. **Update the OpenAPI spec** — regenerate and redeploy Swagger UI so consumers see the deprecation notice immediately.

---

## Deprecation timeline

| Phase | Duration | Action |
|---|---|---|
| Announcement | Day 0 | Issue opened, Swagger marked deprecated, `Deprecation` + `Sunset` headers added |
| Parallel support | ≥ 90 days | Both versions fully supported |
| Sunset | Day 90+ | v1 endpoints return `410 Gone` with a migration message |
| Removal | Next major release | v1 code deleted |

The 90-day minimum may be extended for endpoints with high traffic or external integrations — maintainers decide case by case.

---

## Communication process

1. **GitHub issue** — opened at announcement, linked from every related PR.
2. **CHANGELOG.md** — `feat!:` or `fix!:` commit triggers a MAJOR bump; the breaking change is described under `### ⚠ BREAKING CHANGES`.
3. **Swagger UI** — deprecated badge visible in the interactive docs at `/api/docs`.
4. **Response headers** — `Deprecation` and `Sunset` headers on every deprecated response so API clients can detect it programmatically.
5. **Release notes** — the GitHub release created by Release Please includes the full breaking-change description.

---

## Migration examples

### Renamed field: `avatar` → `avatarUrl`

**v1 response**
```json
{ "id": "abc", "email": "user@example.com", "avatar": "https://..." }
```

**v2 response**
```json
{ "id": "abc", "email": "user@example.com", "avatarUrl": "https://..." }
```

**Migration path for clients**
```diff
- const avatar = user.avatar;
+ const avatar = user.avatarUrl;
```

---

### Removed endpoint: `POST /v1/auth/legacy`

During the parallel-support window, v1 still works. After sunset:

```http
POST /v1/auth/legacy
→ 410 Gone
   { "message": "This endpoint was removed. Use POST /v2/auth/login instead." }
```

---

### New required field on request body

If a field becomes required in v2 but was absent in v1, the v1 endpoint continues to accept requests without it. The v2 controller validates the new field with a class-validator decorator:

```ts
// v2 DTO
class LoginV2Dto {
  @IsEmail() email: string;
  @IsString() @MinLength(8) password: string;
  @IsString() @IsNotEmpty() clientId: string; // new required field in v2
}
```

---

## Checklist for contributors introducing a breaking change

- [ ] Opened a `breaking-change` issue and linked it from the PR
- [ ] Implemented the change under a new version prefix (`/v2/...`)
- [ ] Left the old endpoint in place with `@ApiOperation({ deprecated: true })`
- [ ] Added `Deprecation` and `Sunset` response headers to the old endpoint
- [ ] Used `feat!:` or `BREAKING CHANGE:` footer in the commit message
- [ ] Updated this document if the strategy itself changes
