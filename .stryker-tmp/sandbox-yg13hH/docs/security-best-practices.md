# Security Best Practices

Security guidelines for contributors and operators of the scoopdope platform.

---

## Table of Contents

1. [Authentication & Authorization](#1-authentication--authorization)
2. [Input Validation & Sanitization](#2-input-validation--sanitization)
3. [Secrets Management](#3-secrets-management)
4. [OWASP Top 10 Mitigations](#4-owasp-top-10-mitigations)
5. [Security Testing Procedures](#5-security-testing-procedures)

---

## 1. Authentication & Authorization

### JWT Authentication

scoopdope uses JWT (JSON Web Tokens) via `@nestjs/passport` and `passport-jwt`.

**Best practices:**

- Use a strong, randomly generated `JWT_SECRET` (minimum 32 characters). Never reuse secrets across environments.
- Set short token expiry (`JWT_EXPIRATION=15m`) and implement refresh token rotation.
- Always validate the `alg` header — reject tokens using `alg: none`.
- Store JWTs in `httpOnly`, `Secure`, `SameSite=Strict` cookies on the frontend. Avoid `localStorage`.

```typescript
// apps/backend — JWT strategy example
JwtModule.register({
  secret: process.env.JWT_SECRET,
  signOptions: { expiresIn: '15m', algorithm: 'HS256' },
});
```

### Role-Based Access Control (RBAC)

Roles (`Admin`, `Instructor`, `Student`) are enforced at both the API layer (NestJS `RolesGuard`) and on-chain (Soroban shared contract).

**Best practices:**

- Apply `@Roles()` and `@UseGuards(JwtAuthGuard, RolesGuard)` to every protected route. Never rely on frontend-only role checks.
- Follow the principle of least privilege — grant only the minimum role required.
- Validate on-chain RBAC for any action that mutates contract state.

```typescript
@Get('admin/users')
@Roles(Role.Admin)
@UseGuards(JwtAuthGuard, RolesGuard)
getAllUsers() { ... }
```

### Stellar Wallet Authentication

- Never expose the `STELLAR_SECRET_KEY` to the frontend or logs.
- Verify Stellar transaction signatures server-side before issuing credentials.
- Use testnet keys during development; rotate mainnet keys immediately if compromised.

---

## 2. Input Validation & Sanitization

### API Layer (NestJS)

Use `class-validator` and `class-transformer` with the global `ValidationPipe`.

```typescript
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,       // strip unknown properties
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

**Best practices:**

- Annotate every DTO with `class-validator` decorators (`@IsString()`, `@IsEmail()`, `@MaxLength()`, etc.).
- Use `whitelist: true` to automatically strip properties not defined in the DTO.
- Validate and sanitize all path params and query strings — never pass raw user input to database queries.

### Database (TypeORM)

- Always use TypeORM's query builder or repository methods — never concatenate raw SQL strings.
- Use parameterized queries for any custom SQL:

```typescript
// Safe
repo.createQueryBuilder('user')
  .where('user.email = :email', { email })
  .getOne();

// Never do this
repo.query(`SELECT * FROM user WHERE email = '${email}'`);
```

### Frontend (Next.js)

- React auto-escapes JSX output — never use `dangerouslySetInnerHTML` with user-supplied content.
- Sanitize any rich-text or markdown content with a library like `DOMPurify` before rendering.
- Validate all form inputs client-side as a UX aid, but always re-validate server-side.

### Smart Contracts (Soroban/Rust)

- Validate all input arguments at the top of every contract function before any state mutation.
- Use Rust's type system and `require!` / `panic!` macros to enforce invariants.
- Reject zero-address or out-of-range values explicitly.

---

## 3. Secrets Management

### Environment Variables

- Copy `.env.example` to `.env` and populate locally. **Never commit `.env` to version control.**
- `.env` is listed in `.gitignore` — verify this before every commit.
- Use separate `.env` files per environment (`development`, `staging`, `production`).

### Production Secrets

- Store production secrets in a secrets manager (AWS Secrets Manager, HashiCorp Vault, or GitHub Actions encrypted secrets).
- Rotate `JWT_SECRET` and `STELLAR_SECRET_KEY` on a scheduled basis and immediately after any suspected exposure.
- Limit secret access to only the services and IAM roles that require them.

### Key Variables Reference

| Variable | Sensitivity | Notes |
|---|---|---|
| `JWT_SECRET` | Critical | Min 32 chars, random |
| `STELLAR_SECRET_KEY` | Critical | Never log or expose |
| `DATABASE_PASSWORD` | High | Use strong password |
| `REDIS_PASSWORD` | High | Enable AUTH in Redis |
| `NEXT_PUBLIC_*` | Public | Safe to expose to browser |

### What Not to Do

- Do not log secrets, tokens, or passwords — audit log statements before merging.
- Do not hardcode secrets in source code, Dockerfiles, or CI config files.
- Do not share secrets over Slack, email, or unencrypted channels.

---

## 4. OWASP Top 10 Mitigations

### A01 — Broken Access Control

- Enforce `RolesGuard` on every protected NestJS route (see [§1](#1-authentication--authorization)).
- Validate resource ownership before returning data (e.g., a student can only access their own progress).
- Deny by default — routes are private unless explicitly marked public.

### A02 — Cryptographic Failures

- Use HTTPS in all environments. Redirect HTTP → HTTPS at the load balancer.
- Never store plaintext passwords — use `bcrypt` with a cost factor ≥ 12.
- Use TLS 1.2+ for all database and Redis connections.

### A03 — Injection

- Use parameterized queries and TypeORM (see [§2](#2-input-validation--sanitization)).
- Validate and whitelist all user input via `ValidationPipe`.
- Escape output in templates; rely on React's default escaping.

### A04 — Insecure Design

- Threat-model new features before implementation.
- Apply rate limiting on auth endpoints to prevent brute-force attacks:

```typescript
// Using @nestjs/throttler
ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }])
```

### A05 — Security Misconfiguration

- Remove all default credentials and unused endpoints before deploying.
- Set security headers via NestJS Helmet middleware:

```typescript
import helmet from 'helmet';
app.use(helmet());
```

- Disable stack traces in production (`NODE_ENV=production`).

### A06 — Vulnerable & Outdated Components

- Run `npm audit` and `cargo audit` in CI on every push (see `docs/security.md`).
- Keep dependencies up to date — use Dependabot or Renovate for automated PRs.
- Review `cargo deny` output for license and vulnerability policy violations.

### A07 — Identification & Authentication Failures

- Enforce strong password policies (min 8 chars, mixed case, numbers).
- Implement account lockout after repeated failed login attempts.
- Use short-lived JWTs with refresh token rotation (see [§1](#1-authentication--authorization)).

### A08 — Software & Data Integrity Failures

- Verify Stellar transaction signatures server-side before issuing credentials.
- Pin dependency versions in `package-lock.json` and `Cargo.lock` — commit both files.
- Use GitHub Actions OIDC for CI/CD instead of long-lived static credentials.

### A09 — Security Logging & Monitoring Failures

- Log authentication events (login, logout, failed attempts) with timestamps and IP addresses.
- Do not log sensitive data (passwords, tokens, secret keys).
- Set up alerts for anomalous patterns (e.g., spike in 401/403 responses).

### A10 — Server-Side Request Forgery (SSRF)

- Validate and allowlist any URLs accepted as user input before making server-side HTTP requests.
- Block requests to internal metadata endpoints (e.g., `169.254.169.254`) at the network level.
- Use a dedicated HTTP client with timeout and redirect limits.

---

## 5. Security Testing Procedures

### Pre-Merge Checklist

Before opening a pull request, verify:

- [ ] No secrets or credentials in the diff (`git diff` review)
- [ ] All new routes have appropriate auth guards
- [ ] New DTOs use `class-validator` decorators
- [ ] `npm audit` passes with no high/critical findings
- [ ] `cargo audit` passes (for contract changes)

### Automated CI Checks

The following security checks run automatically on every PR (see `.github/workflows/`):

| Check | Tool | Failure Threshold |
|---|---|---|
| Dependency vulnerabilities (Node) | `npm audit` | High/Critical |
| Dependency vulnerabilities (Rust) | `cargo audit` | Any advisory |
| DAST scan | OWASP ZAP | High severity |
| Static analysis | ESLint security rules | Error level |
| Rust linting | `cargo clippy` | Warnings as errors |

### Manual Security Review

For features involving auth, payments, or credential issuance, request a manual security review:

1. Tag the PR with the `security-review` label.
2. Assign a reviewer with security expertise.
3. Reviewer checks: threat model, access control logic, input handling, and secret usage.

### Penetration Testing

- Run OWASP ZAP locally against a staging environment before major releases (see `docs/security.md` for setup).
- Document findings and resolutions in the PR or a linked issue.
- Re-scan after fixes to confirm resolution.

### Reporting Vulnerabilities

Do not open public GitHub issues for security vulnerabilities. Instead:

1. Email the maintainers directly or use GitHub's private vulnerability reporting feature.
2. Include: description, reproduction steps, affected versions, and suggested fix.
3. Allow reasonable time for a fix before public disclosure.

---

*For tooling-specific details (ZAP setup, cargo audit, SonarCloud), see [docs/security.md](./security.md).*
