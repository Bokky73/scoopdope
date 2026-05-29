# Database Schema Documentation

PostgreSQL database for the scoopdope backend. Managed via TypeORM with explicit migrations (`synchronize: false` in all environments).

**Database:** `scoopdope` (default)  
**ORM:** TypeORM  
**Migration runner:** `npm run typeorm:run` — see [migrations.md](./migrations.md) for workflow details.

---

## Table of Contents

1. [ER Diagram](#1-er-diagram)
2. [Table Reference](#2-table-reference)
   - [users](#users)
   - [courses](#courses)
   - [course_modules](#course_modules)
   - [lessons](#lessons)
   - [enrollments](#enrollments)
   - [progress](#progress)
   - [credentials](#credentials)
   - [notifications](#notifications)
   - [reviews](#reviews)
   - [posts](#posts)
   - [replies](#replies)
   - [refresh_tokens](#refresh_tokens)
   - [password_reset_tokens](#password_reset_tokens)
   - [api_keys](#api_keys)
   - [kyc_customers](#kyc_customers)
3. [Relationship Summary](#3-relationship-summary)
4. [Migration History](#4-migration-history)
5. [Data Retention & Archival Policies](#5-data-retention--archival-policies)

---

## 1. ER Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   ┌──────────────┐         ┌──────────────────┐      ┌──────────────────┐  │
│   │    users     │────┐    │     courses      │──┐   │  course_modules  │  │
│   ├──────────────┤    │    ├──────────────────┤  │   ├──────────────────┤  │
│   │ id (PK)      │    │    │ id (PK)          │  │   │ id (PK)          │  │
│   │ email        │    │    │ title            │  └──►│ courseId (FK)    │  │
│   │ passwordHash │    │    │ description      │      │ title            │  │
│   │ stellarPubKey│    │    │ level            │      │ order            │  │
│   │ role         │    │    │ durationHours    │      └────────┬─────────┘  │
│   │ isBanned     │    │    │ isPublished      │               │            │
│   │ isVerified   │    │    │ isDeleted        │               ▼            │
│   │ deletedAt    │    │    │ requiresKyc      │      ┌──────────────────┐  │
│   │ mfaEnabled   │    │    │ instructorId(FK)─┼──────┤    lessons       │  │
│   │ createdAt    │    │    │ createdAt        │      ├──────────────────┤  │
│   └──────┬───────┘    │    └──────────────────┘      │ id (PK)          │  │
│          │            │                               │ moduleId (FK)    │  │
│          │            │                               │ title            │  │
│   ┌──────▼──────────┐ │    ┌──────────────────┐      │ content          │  │
│   │  refresh_tokens │ │    │   enrollments    │      │ videoUrl         │  │
│   ├─────────────────┤ │    ├──────────────────┤      │ order            │  │
│   │ id (PK)         │ │    │ id (PK)          │      │ durationMinutes  │  │
│   │ userId (FK)     │ │    │ userId (FK)──────┼──┐   └──────────────────┘  │
│   │ tokenHash       │ │    │ courseId (FK)    │  │                         │
│   │ expiresAt       │ │    │ enrolledAt       │  │   ┌──────────────────┐  │
│   │ revoked         │ │    │ completedAt      │  │   │    progress      │  │
│   └─────────────────┘ │    └──────────────────┘  │   ├──────────────────┤  │
│                        │                          └──►│ userId (FK)      │  │
│   ┌─────────────────┐  │    ┌──────────────────┐      │ courseId (FK)    │  │
│   │  pwd_reset_tkns │  │    │  credentials     │      │ lessonId         │  │
│   ├─────────────────┤  │    ├──────────────────┤      │ progressPct      │  │
│   │ id (PK)         │  │    │ id (PK)          │      │ completedAt      │  │
│   │ userId (FK)     │  │    │ userId (FK)      │      │ txHash           │  │
│   │ tokenHash       │  │    │ courseId (FK)    │      │ updatedAt        │  │
│   │ expiresAt       │  │    │ txHash           │      └──────────────────┘  │
│   │ used            │  │    │ stellarPublicKey │                            │
│   └─────────────────┘  │    │ issuedAt         │      ┌──────────────────┐  │
│                         │    └──────────────────┘      │  notifications   │  │
│   ┌─────────────────┐   │                              ├──────────────────┤  │
│   │    api_keys     │   │    ┌──────────────────┐      │ id (PK)          │  │
│   ├─────────────────┤   │    │    reviews       │      │ userId           │  │
│   │ id (PK)         │   │    ├──────────────────┤      │ type (enum)      │  │
│   │ userId (FK)─────┼───┘    │ id (PK)          │      │ message          │  │
│   │ name            │        │ userId (FK)      │      │ isRead           │  │
│   │ keyHash         │        │ courseId (FK)    │      │ createdAt        │  │
│   │ isActive        │        │ rating           │      └──────────────────┘  │
│   │ lastUsedAt      │        │ comment          │                            │
│   └─────────────────┘        │ createdAt        │      ┌──────────────────┐  │
│                               └──────────────────┘      │  kyc_customers   │  │
│   ┌──────────────────────────────────────────┐          ├──────────────────┤  │
│   │                 posts                    │          │ id (PK)          │  │
│   ├──────────────────────────────────────────┤          │ stellarPublicKey │  │
│   │ id (PK)  courseId (FK)  userId (FK)      │          │ status           │  │
│   │ title    content        isPinned         │          │ providerId       │  │
│   │ answerReplyId           createdAt        │          └──────────────────┘  │
│   └──────────────────┬───────────────────────┘                               │
│                       │                                                       │
│   ┌───────────────────▼──────────────────────┐                               │
│   │                replies                   │                               │
│   ├──────────────────────────────────────────┤                               │
│   │ id (PK)  postId (FK)  userId (FK)        │                               │
│   │ content  isAnswer     createdAt          │                               │
│   └──────────────────────────────────────────┘                               │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

**Legend:** `(PK)` = primary key · `(FK)` = foreign key · `──►` = one-to-many

---

## 2. Table Reference

### `users`

Central identity table. Every other table that tracks user activity references this table.

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | NO | `uuid_generate_v4()` | PK |
| `email` | varchar | NO | — | UNIQUE |
| `username` | varchar | YES | — | UNIQUE |
| `passwordHash` | varchar | NO | — | bcrypt hash |
| `avatar` | varchar | YES | — | URL to avatar image |
| `bio` | text | YES | — | |
| `stellarPublicKey` | varchar | YES | — | Stellar G-address |
| `role` | varchar | NO | `'student'` | `'student'` \| `'instructor'` \| `'admin'` |
| `isBanned` | boolean | NO | `false` | Soft-ban flag |
| `isVerified` | boolean | NO | `false` | Email verified |
| `deletedAt` | timestamp | YES | — | Soft-delete timestamp |
| `verificationToken` | varchar | YES | — | Hashed email verification token |
| `verificationTokenExpiresAt` | datetime | YES | — | |
| `mfaEnabled` | boolean | NO | `false` | TOTP MFA active |
| `mfaSecret` | varchar | YES | — | Encrypted TOTP secret |
| `createdAt` | timestamp | NO | `now()` | |

**Indexes:** `email` (unique), `username` (unique)  
**Soft-delete:** Rows are never hard-deleted. `deletedAt IS NOT NULL` means the account is deactivated. Queries should filter `WHERE "deletedAt" IS NULL` for active users.

---

### `courses`

Catalogue of learning courses. Supports soft-delete via `isDeleted`.

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | NO | `uuid_generate_v4()` | PK |
| `title` | varchar | NO | — | |
| `description` | text | NO | — | |
| `level` | varchar | NO | `'beginner'` | `'beginner'` \| `'intermediate'` \| `'advanced'` |
| `durationHours` | int | NO | `0` | Estimated total hours |
| `isPublished` | boolean | NO | `true` | Visible to students |
| `isDeleted` | boolean | NO | `false` | Soft-delete flag |
| `requiresKyc` | boolean | NO | `false` | KYC gate for enrollment |
| `instructorId` | uuid | YES | — | FK → `users.id` ON DELETE SET NULL |
| `createdAt` | timestamp | NO | `now()` | |

**Relationships:** `instructorId` → `users` (SET NULL on user delete), `modules` → `course_modules`, `reviews` → `reviews`

---

### `course_modules`

Ordered sections within a course. Deleted when the parent course is deleted.

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | NO | `uuid_generate_v4()` | PK |
| `courseId` | uuid | NO | — | FK → `courses.id` ON DELETE CASCADE |
| `title` | varchar | NO | — | |
| `order` | int | NO | `0` | Display order within course |
| `createdAt` | timestamp | NO | `now()` | |

---

### `lessons`

Individual content units within a module. Deleted when the parent module is deleted.

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | NO | `uuid_generate_v4()` | PK |
| `moduleId` | uuid | NO | — | FK → `course_modules.id` ON DELETE CASCADE |
| `title` | varchar | NO | — | |
| `content` | text | NO | — | Lesson body (HTML/Markdown) |
| `videoUrl` | varchar | YES | — | Optional video embed URL |
| `order` | int | NO | `0` | Display order within module |
| `durationMinutes` | int | NO | `0` | Estimated reading/watch time |
| `createdAt` | timestamp | NO | `now()` | |

---

### `enrollments`

Records which users are enrolled in which courses. The composite unique constraint prevents duplicate enrollments.

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | NO | `uuid_generate_v4()` | PK |
| `userId` | uuid | NO | — | FK → `users.id` ON DELETE CASCADE |
| `courseId` | uuid | NO | — | FK → `courses.id` ON DELETE CASCADE |
| `enrolledAt` | timestamp | NO | `now()` | |
| `completedAt` | timestamp | YES | — | Set when progress reaches 100% |

**Indexes:** UNIQUE (`userId`, `courseId`)

---

### `progress`

Tracks a student's current progress percentage for each enrolled course. Updated on every lesson completion. The `txHash` column links to the corresponding on-chain Analytics contract transaction.

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | NO | `uuid_generate_v4()` | PK |
| `userId` | uuid | NO | — | FK → `users.id` ON DELETE CASCADE |
| `courseId` | uuid | NO | — | FK → `courses.id` ON DELETE CASCADE |
| `lessonId` | uuid | YES | — | Last completed lesson (no FK constraint) |
| `progressPct` | int | NO | `0` | 0–100 |
| `completedAt` | timestamp | YES | — | Set when `progressPct` reaches 100 |
| `txHash` | varchar | YES | — | Stellar transaction hash from Analytics contract |
| `updatedAt` | timestamp | NO | auto | Updated on every write |

---

### `credentials`

Issued on-chain certificates. One credential per `(userId, courseId)` pair. The `txHash` is the Stellar transaction that recorded the credential issuance.

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | NO | `uuid_generate_v4()` | PK |
| `userId` | uuid | NO | — | FK → `users.id` ON DELETE CASCADE |
| `courseId` | uuid | NO | — | FK → `courses.id` ON DELETE CASCADE |
| `txHash` | varchar | YES | — | Stellar transaction hash |
| `stellarPublicKey` | varchar | YES | — | Recipient's Stellar address at issuance time |
| `issuedAt` | timestamp | NO | `now()` | |

---

### `notifications`

In-app notification feed per user. Not linked via FK to `users` — userId is stored as a plain column to allow notifications to survive user soft-deletes.

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | NO | `uuid_generate_v4()` | PK |
| `userId` | uuid | NO | — | References `users.id` (no FK constraint) |
| `type` | enum | NO | — | `enrollment` \| `completion` \| `credential_issued` |
| `message` | varchar | NO | — | Human-readable message |
| `isRead` | boolean | NO | `false` | |
| `createdAt` | timestamp | NO | `now()` | |

**Indexes:** `userId` (recommended for `WHERE userId = ?` queries)

---

### `reviews`

One review per `(userId, courseId)` pair. Rating is an integer (expected range 1–5, enforced at application layer).

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | NO | `uuid_generate_v4()` | PK |
| `userId` | uuid | NO | — | FK → `users.id` ON DELETE CASCADE |
| `courseId` | uuid | NO | — | FK → `courses.id` ON DELETE CASCADE |
| `rating` | int | NO | — | 1–5 |
| `comment` | text | YES | — | |
| `createdAt` | timestamp | NO | `now()` | |

**Indexes:** UNIQUE (`userId`, `courseId`)

---

### `posts`

Forum discussion threads scoped to a course. `answerReplyId` is set when an instructor or moderator marks a reply as the accepted answer.

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | NO | `uuid_generate_v4()` | PK |
| `courseId` | uuid | NO | — | FK → `courses.id` ON DELETE CASCADE |
| `userId` | uuid | NO | — | FK → `users.id` ON DELETE CASCADE |
| `title` | varchar | NO | — | |
| `content` | text | NO | — | |
| `isPinned` | boolean | NO | `false` | Pinned to top of forum |
| `answerReplyId` | uuid | YES | — | Self-referencing accepted answer (no FK) |
| `createdAt` | timestamp | NO | `now()` | |

---

### `replies`

Replies to forum posts. `isAnswer` is `true` when this reply is the accepted answer (mirrors `posts.answerReplyId`).

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | NO | `uuid_generate_v4()` | PK |
| `postId` | uuid | NO | — | FK → `posts.id` ON DELETE CASCADE |
| `userId` | uuid | NO | — | FK → `users.id` ON DELETE CASCADE |
| `content` | text | NO | — | |
| `isAnswer` | boolean | NO | `false` | |
| `createdAt` | timestamp | NO | `now()` | |

---

### `refresh_tokens`

Stores hashed refresh tokens for JWT rotation. Tokens are revoked (not deleted) on logout so that replay attacks can be detected.

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | NO | `uuid_generate_v4()` | PK |
| `userId` | uuid | NO | — | FK → `users.id` ON DELETE CASCADE |
| `tokenHash` | varchar | NO | — | SHA-256 hash of the opaque token |
| `expiresAt` | timestamp | NO | — | |
| `revoked` | boolean | NO | `false` | Set to `true` on logout |
| `createdAt` | timestamp | NO | `now()` | |

---

### `password_reset_tokens`

Single-use tokens for the forgot-password flow. Marked `used = true` after redemption rather than deleted.

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | NO | `uuid_generate_v4()` | PK |
| `userId` | uuid | NO | — | FK → `users.id` ON DELETE CASCADE |
| `tokenHash` | varchar | NO | — | SHA-256 hash of the emailed token |
| `expiresAt` | timestamp | NO | — | |
| `used` | boolean | NO | `false` | |
| `createdAt` | timestamp | NO | `now()` | |

---

### `api_keys`

Programmatic API access keys for integrations. The raw key is shown once at creation; only the hash is stored.

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | NO | `uuid_generate_v4()` | PK |
| `userId` | uuid | NO | — | FK → `users.id` ON DELETE CASCADE |
| `name` | varchar | NO | — | Human label |
| `keyHash` | varchar | NO | — | UNIQUE — SHA-256 of the raw key |
| `isActive` | boolean | NO | `true` | Revoke by setting to `false` |
| `lastUsedAt` | timestamp | YES | — | Updated on each authenticated request |
| `createdAt` | timestamp | NO | `now()` | |

**Indexes:** `keyHash` (unique) — used for O(1) lookup on every API request

---

### `kyc_customers`

KYC verification status keyed by Stellar public key. Decoupled from `users` so that KYC state can be checked without a user account lookup.

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | NO | `uuid_generate_v4()` | PK |
| `stellarPublicKey` | varchar | NO | — | UNIQUE |
| `status` | varchar | NO | `'none'` | `'none'` \| `'pending'` \| `'approved'` \| `'rejected'` |
| `providerId` | varchar | YES | — | External ID from KYC provider |
| `createdAt` | timestamp | NO | `now()` | |
| `updatedAt` | timestamp | NO | auto | |

---

## 3. Relationship Summary

```
users ──< enrollments >── courses
users ──< progress    >── courses
users ──< credentials >── courses
users ──< reviews     >── courses
users ──< posts       >── courses
users ──< replies     >── posts
users ──< refresh_tokens
users ──< password_reset_tokens
users ──< api_keys
users ──< notifications
courses ──< course_modules ──< lessons
```

**Cascade behaviour:**

| Parent deleted | Child behaviour |
|---|---|
| `users` | CASCADE: enrollments, progress, credentials, reviews, posts, replies, refresh_tokens, password_reset_tokens, api_keys |
| `courses` | CASCADE: course_modules, enrollments, progress, credentials, reviews, posts |
| `course_modules` | CASCADE: lessons |
| `posts` | CASCADE: replies |
| `courses` (instructor deleted) | SET NULL: `courses.instructorId` |

---

## 4. Migration History

Migrations live in `apps/backend/src/migrations/` and are applied in timestamp order.

| Timestamp | Class | Tables Created |
|---|---|---|
| `1700000000000` | `InitialMigration` | `users`, `courses`, `notifications` |
| `1711700000000` | `AddApiKeys` | `api_keys` |
| `1711800000000` | `AddReviews` | `reviews` |
| `1711900000000` | `AddForums` | `posts`, `replies` |

> The following tables are managed by TypeORM `synchronize` during initial development and do not yet have explicit migration files: `course_modules`, `lessons`, `enrollments`, `progress`, `credentials`, `refresh_tokens`, `password_reset_tokens`, `kyc_customers`.
>
> **Action required:** Before the next production deployment, generate explicit migrations for these tables:
> ```bash
> npm run typeorm:generate -- src/migrations/AddRemainingTables
> ```

### Adding a New Migration

```bash
# 1. Modify the relevant entity
# 2. Generate
npm run typeorm:generate -- src/migrations/DescriptiveName

# 3. Review the generated file, then apply
npm run typeorm:run

# Rollback if needed
npm run typeorm:revert
```

See [migrations.md](./migrations.md) for the full workflow and production checklist.

---

## 5. Data Retention & Archival Policies

### Active Data

| Table | Retention | Notes |
|---|---|---|
| `users` | Indefinite | Soft-deleted via `deletedAt`; hard-delete only on explicit GDPR erasure request |
| `courses` | Indefinite | Soft-deleted via `isDeleted`; preserves credential/progress history |
| `course_modules` / `lessons` | Lifetime of course | Cascade-deleted with course |
| `enrollments` | Indefinite | Historical record of participation |
| `progress` | Indefinite | Source of truth for completion; backed by on-chain record |
| `credentials` | Indefinite | Legal record of certification; must never be deleted |
| `reviews` | Indefinite | Deleted only if user requests erasure |
| `posts` / `replies` | Indefinite | Moderation soft-delete recommended (add `deletedAt` column in future migration) |
| `notifications` | 90 days | Purge `WHERE "isRead" = true AND "createdAt" < NOW() - INTERVAL '90 days'` |
| `kyc_customers` | Indefinite | Regulatory requirement; status changes are audited via `updatedAt` |

### Short-Lived / Expiring Data

| Table | Retention | Cleanup Strategy |
|---|---|---|
| `refresh_tokens` | Until `expiresAt` | Scheduled job: `DELETE WHERE "expiresAt" < NOW()` — run nightly |
| `password_reset_tokens` | Until `expiresAt` or `used = true` | Scheduled job: `DELETE WHERE "expiresAt" < NOW() OR "used" = true` — run nightly |
| `api_keys` | Until revoked | No automatic expiry; `isActive = false` disables without deleting audit trail |

### Recommended Cleanup Job

Add a scheduled NestJS task (or a PostgreSQL `pg_cron` job) to purge expired tokens and old read notifications:

```sql
-- Expired auth tokens
DELETE FROM refresh_tokens        WHERE "expiresAt" < NOW();
DELETE FROM password_reset_tokens WHERE "expiresAt" < NOW() OR used = true;

-- Old read notifications (90-day window)
DELETE FROM notifications
  WHERE "isRead" = true
    AND "createdAt" < NOW() - INTERVAL '90 days';
```

### GDPR / Right to Erasure

When a user requests account deletion:

1. Hard-delete the `users` row — cascades to all linked tables automatically.
2. Anonymise `credentials` rows instead of deleting them (credentials are legal records):
   ```sql
   UPDATE credentials
   SET "stellarPublicKey" = '[redacted]'
   WHERE "userId" = $1;
   ```
3. Remove the `kyc_customers` row for the user's Stellar public key.
4. Log the erasure event in your audit log.

### Archival

For long-term analytics, consider archiving completed `progress` and `enrollments` rows older than 2 years to a separate `archive` schema or a data warehouse before purging from the operational database. The `txHash` column on `progress` and `credentials` provides a permanent on-chain audit trail independent of the PostgreSQL data.
