# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| `main` (latest) | ✅ |
| Older releases | ❌ — please upgrade |

## Responsible Disclosure Policy

scoopdope takes security seriously. If you discover a potential vulnerability, we ask that you follow responsible disclosure:

1. **Do not open a public GitHub issue** for security vulnerabilities.
2. **Email us privately** at `security@Scoopdope.app` with:
   - A clear description of the vulnerability.
   - Steps to reproduce (proof-of-concept if possible).
   - The potential impact and affected components.
   - Your suggested fix (optional but appreciated).
3. **Allow us reasonable time** to investigate and release a fix before any public disclosure. We aim to:
   - Acknowledge your report within **48 hours**.
   - Provide an initial assessment within **5 business days**.
   - Release a fix or mitigation within **30 days** for critical issues.
4. **Act in good faith** — avoid accessing, modifying, or deleting user data beyond what is needed to demonstrate the vulnerability.

We will credit researchers who responsibly disclose vulnerabilities (unless you prefer to remain anonymous).

## Scope

The following are in scope:

- `apps/backend` — NestJS REST API
- `apps/frontend` — Next.js web application
- `contracts/` — Soroban smart contracts
- Authentication and authorisation flows
- Data handling and storage

The following are **out of scope**:

- Denial-of-service attacks
- Social engineering of maintainers
- Vulnerabilities in third-party dependencies (report those upstream)
- Issues already publicly known

## What We Consider a Vulnerability

- Cross-Site Scripting (XSS)
- SQL Injection
- Broken Access Control / IDOR
- Authentication bypass
- Sensitive data exposure
- Smart contract exploits (reentrancy, integer overflow, etc.)
- JWT secret exposure or weak signing

## Security Measures in Place

- Input sanitisation via `class-sanitizer` and `sanitize-html` on all DTO string fields.
- TypeORM parameterised queries — no raw string interpolation.
- JWT authentication with short-lived access tokens (15 min) and rotating refresh tokens.
- API key authentication (SHA-256 hashed) for service-to-service calls.
- Rate limiting via `@nestjs/throttler` backed by Redis.
- MFA (TOTP) support for user accounts.
- Helmet and CORS configured on the API.

Thank you for helping keep scoopdope and its users safe!
