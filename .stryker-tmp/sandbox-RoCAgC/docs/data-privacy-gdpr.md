# Data Privacy & GDPR Guide

This document describes how scoopdope collects, stores, processes, and deletes personal data, and how the platform meets obligations under the **General Data Protection Regulation (GDPR)** and similar privacy regulations.

---

## Table of Contents

1. [Data Collection and Storage Practices](#data-collection-and-storage-practices)
2. [User Data Export](#user-data-export)
3. [Data Deletion Procedures](#data-deletion-procedures)
4. [Cookie Policy and Consent Management](#cookie-policy-and-consent-management)
5. [Data Retention Policies](#data-retention-policies)

---

## Data Collection and Storage Practices

### Legal Basis for Processing

| Purpose | Legal basis (GDPR Art. 6) |
|---|---|
| Account creation and authentication | Contract performance (Art. 6(1)(b)) |
| Course progress and credential issuance | Contract performance (Art. 6(1)(b)) |
| KYC identity verification | Legal obligation (Art. 6(1)(c)) |
| Email notifications | Legitimate interest / consent (Art. 6(1)(a/f)) |
| Analytics and platform improvement | Legitimate interest (Art. 6(1)(f)) |

### Personal Data Collected

#### `users` table (PostgreSQL)

| Field | Description | Personal data |
|---|---|---|
| `id` | UUID primary key | No |
| `email` | Login identifier and contact address | **Yes** |
| `username` | Display name (optional) | **Yes** |
| `passwordHash` | bcrypt hash — plaintext never stored | No |
| `avatar` | Profile image URL | **Yes** |
| `bio` | Free-text self-description | **Yes** |
| `stellarPublicKey` | Stellar wallet address | **Yes** (pseudonymous) |
| `role` | `student` / `instructor` / `admin` | No |
| `isBanned` | Account status flag | No |
| `isVerified` | Email verification status | No |
| `deletedAt` | Soft-delete timestamp | No |
| `verificationToken` | One-time email verification hash | No |
| `mfaEnabled` | MFA status flag | No |
| `mfaSecret` | TOTP secret (encrypted at rest) | **Yes** |
| `createdAt` | Account creation timestamp | No |

#### `kyc_customers` table (PostgreSQL)

| Field | Description | Personal data |
|---|---|---|
| `stellarPublicKey` | Links KYC record to user | **Yes** (pseudonymous) |
| `status` | `none` / `pending` / `approved` / `rejected` | No |
| `providerId` | Session ID from Synaps.io KYC provider | **Yes** |

KYC identity documents (passport, ID card, selfie) are processed and stored exclusively by the third-party provider **Synaps.io**. scoopdope does not receive or store raw identity documents.

#### `notifications` table (PostgreSQL)

Stores `userId`, notification `type` (`enrollment`, `completion`, `credential_issued`), and a `message` string. No additional personal data beyond the user reference.

#### `refresh_tokens` and `password_reset_tokens` tables

Short-lived tokens linked to `userId`. Contain no personal data beyond the user reference and expiry timestamp.

#### `api_keys` table

Hashed API keys linked to `userId`. The plaintext key is shown once at creation and never stored.

#### Redis (in-memory)

Used for:
- Rate-limit counters (keyed by IP or user ID — no personal data stored)
- Short-lived cache entries (e.g. leaderboard, token balances — keyed by Stellar public key)
- Session data (if applicable)

Redis data is ephemeral and not persisted to disk in the default configuration.

#### Stellar Blockchain (on-chain)

Course completion credentials are recorded on the Stellar ledger as `ManageData` entries and via Soroban contract state. **On-chain data is permanent and cannot be deleted.** Only the Stellar public key (pseudonymous) and a course identifier are written on-chain — no names, emails, or other directly identifying information.

### Data Minimisation

- Passwords are never stored in plaintext — only bcrypt hashes.
- MFA secrets are stored encrypted at rest.
- `username`, `avatar`, `bio`, and `stellarPublicKey` are all optional.
- KYC documents are never stored by scoopdope — only the provider session ID and approval status.

### Third-Party Processors

| Processor | Purpose | Data shared |
|---|---|---|
| Synaps.io | KYC identity verification | Stellar public key, identity documents |
| Google OAuth | Social login | Email, name (from Google profile) |
| Sentry | Error monitoring | Stack traces, request metadata (no PII by default) |
| AWS (ECS, RDS, ElastiCache) | Infrastructure hosting | All data at rest |

Ensure Data Processing Agreements (DPAs) are in place with each processor before going to production.

---

## User Data Export

GDPR Article 20 grants users the **right to data portability** — the right to receive their personal data in a structured, machine-readable format.

### Current State

A dedicated data export endpoint does not yet exist. The following implementation is required to achieve GDPR compliance.

### Required Implementation

Add a `GET /v1/users/:id/export` endpoint that returns all personal data held for the authenticated user:

```typescript
// users.controller.ts
@Get(':id/export')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Export all personal data for the authenticated user (GDPR Art. 20)' })
async exportData(
  @Param('id') id: string,
  @Request() req: { user: { id: string } },
) {
  if (req.user.id !== id) throw new ForbiddenException();
  return this.usersService.exportUserData(id);
}
```

```typescript
// users.service.ts
async exportUserData(id: string) {
  const user = await this.repo.findOne({ where: { id } });
  if (!user) throw new NotFoundException();

  // Omit sensitive internal fields
  const { passwordHash, verificationToken, mfaSecret, ...profile } = user;

  return {
    exportedAt: new Date().toISOString(),
    profile,
    // Extend to include enrollments, progress, notifications, credentials
  };
}
```

The response must be JSON (or optionally CSV) and must cover all tables that reference the user's ID.

### Data Export Scope

A complete export must include:

| Data category | Source |
|---|---|
| Profile (email, username, avatar, bio, stellarPublicKey, role, createdAt) | `users` table |
| KYC status and provider reference | `kyc_customers` table |
| Course enrollments | `enrollments` table |
| Course progress | `progress` table |
| Notifications | `notifications` table |
| Credentials issued | Stellar ledger (transaction hashes) |

---

## Data Deletion Procedures

### Right to Erasure (GDPR Art. 17)

Users have the right to request deletion of their personal data. scoopdope implements **soft deletion** — setting `deletedAt` on the `users` row — which excludes the user from all queries while preserving referential integrity.

#### Soft Delete (current implementation)

```typescript
// UsersService.softDelete()
async softDelete(id: string) {
  const user = await this.findById(id);
  return this.repo.save({ ...user, deletedAt: new Date() });
}
```

Soft-deleted users:
- Are excluded from all `findAll` queries (`WHERE deletedAt IS NULL`)
- Cannot log in (authentication checks `deletedAt`)
- Retain their row for referential integrity with enrollments, credentials, and notifications

#### Hard Delete (required for full GDPR compliance)

To fully honour erasure requests, a hard delete procedure must anonymise or remove the personal data fields while preserving non-personal records:

```typescript
async hardDelete(id: string) {
  await this.repo.update(id, {
    email: `deleted-${id}@deleted.invalid`,
    username: null,
    avatar: null,
    bio: null,
    stellarPublicKey: null,
    passwordHash: '',
    mfaSecret: null,
    verificationToken: null,
    deletedAt: new Date(),
  });
}
```

> **Note:** On-chain Stellar records (credentials, `ManageData` entries) are **immutable** and cannot be deleted. This is a known limitation of blockchain-based credential systems and should be disclosed in the platform's privacy notice. Only the Stellar public key (pseudonymous) is stored on-chain.

#### Admin-Triggered Deletion

Admins can soft-delete any user via:

```http
DELETE /v1/admin/users/:id
Authorization: Bearer <admin-jwt>
```

Self-service deletion (user deleting their own account) requires a dedicated endpoint — currently not implemented.

### KYC Data Deletion

KYC records in the `kyc_customers` table can be deleted directly. For data held by Synaps.io, submit a deletion request through their data subject request process per your DPA.

### Redis Cache Invalidation

When a user is deleted, invalidate any cached entries keyed to their ID or Stellar public key:

```typescript
await this.cacheManager.del(`token_balance:${user.stellarPublicKey}`);
await this.cacheManager.del('leaderboard:top50');
```

---

## Cookie Policy and Consent Management

### Cookies Currently in Use

scoopdope does not set first-party cookies for tracking or advertising. The following technical cookies may be set:

| Cookie | Purpose | Type | Duration |
|---|---|---|---|
| `access_token` (if stored in cookie) | JWT authentication | Strictly necessary | Session / JWT expiry |
| `next-intl` locale preference | Language selection | Functional | 1 year |
| `theme` | Dark/light mode preference | Functional | 1 year |

> If JWTs are stored in `localStorage` rather than `HttpOnly` cookies, no authentication cookie is set. Confirm the storage mechanism before publishing the cookie policy.

### Third-Party Cookies

- **Sentry** may set cookies for session replay if enabled. Review Sentry's cookie documentation and disable session replay if not required.
- **Google OAuth** sets cookies during the OAuth flow on `accounts.google.com` — these are subject to Google's own cookie policy.

### Consent Management Requirements

Under GDPR, strictly necessary cookies do not require consent. Functional and analytics cookies do.

#### Required Implementation

A cookie consent banner must be added to the frontend before launch. Recommended approach:

1. On first visit, display a consent banner before setting any non-essential cookies.
2. Store the user's consent choice in `localStorage` (e.g. `cookie_consent: "accepted" | "rejected"`).
3. Only initialise analytics/monitoring scripts after consent is granted.

```typescript
// apps/frontend/src/lib/consent.ts
export function hasConsent(): boolean {
  return localStorage.getItem('cookie_consent') === 'accepted';
}

export function setConsent(accepted: boolean) {
  localStorage.setItem('cookie_consent', accepted ? 'accepted' : 'rejected');
}
```

```tsx
// Conditionally load Sentry only after consent
if (hasConsent()) {
  await import('../instrument'); // Sentry initialisation
}
```

---

## Data Retention Policies

### Recommended Retention Periods

| Data category | Retention period | Basis |
|---|---|---|
| Active user accounts | Duration of account + 30 days after deletion request | Contract |
| Soft-deleted user records | 30 days, then hard delete / anonymise | GDPR Art. 5(1)(e) |
| Password reset tokens | 1 hour (enforced at application level) | Minimisation |
| Email verification tokens | 24 hours (enforced at application level) | Minimisation |
| Refresh tokens | 7 days (or until revoked) | Security |
| API keys | Until revoked by user | Contract |
| Notifications | 90 days | Legitimate interest |
| KYC records (scoopdope) | Duration of account + 5 years | Legal obligation (AML) |
| KYC documents (Synaps.io) | Per Synaps.io DPA | Legal obligation |
| Application logs | 30 days | Legitimate interest |
| Redis cache entries | Per TTL (30 s – 5 min) | Technical necessity |
| On-chain Stellar records | Permanent (immutable) | Blockchain limitation |

### Automated Retention Enforcement

Implement a scheduled job to enforce retention periods:

```typescript
// Example: purge soft-deleted users older than 30 days
@Cron('0 2 * * *') // daily at 02:00
async purgeDeletedUsers() {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  await this.repo
    .createQueryBuilder()
    .delete()
    .from(User)
    .where('deletedAt IS NOT NULL AND deletedAt < :cutoff', { cutoff })
    .execute();
}
```

### Data Subject Rights Summary

| Right | GDPR Article | Current support | Action required |
|---|---|---|---|
| Right of access | Art. 15 | Partial (profile via `GET /users/:id`) | Full export endpoint |
| Right to rectification | Art. 16 | ✅ `PATCH /users/:id` | — |
| Right to erasure | Art. 17 | Partial (soft delete only) | Hard delete / anonymisation |
| Right to data portability | Art. 20 | ❌ Not implemented | Export endpoint |
| Right to restrict processing | Art. 18 | Partial (ban flag) | Formal restriction mechanism |
| Right to object | Art. 21 | ❌ Not implemented | Opt-out mechanism |

---

## Related Docs

- [security.md](./security.md) — Security scanning and vulnerability management
- [stellar-integration.md](./stellar-integration.md) — On-chain data and Stellar integration
- [development-setup.md](./development-setup.md) — Local environment setup

## External References

- [GDPR Full Text](https://gdpr-info.eu/)
- [ICO Guide to GDPR](https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/)
- [Synaps.io Privacy Policy](https://synaps.io/privacy-policy)
