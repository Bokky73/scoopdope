# @scoopdope/types

Shared TypeScript types, DTOs and interfaces for the scoopdope platform.

This package is the single source of truth for all data shapes exchanged between the frontend and backend. It eliminates type drift and ensures both apps stay in sync.

## Contents

| Module | Description |
|---|---|
| `common.types` | Pagination, API response wrappers, utility types |
| `course.types` | Course DTOs, query params, levels, statuses |
| `enrollment.types` | Enrollment records, progress DTOs |
| `notification.types` | Notification types and payloads |
| `quiz.types` | Quiz, question, answer, attempt types |
| `stellar.types` | Wallet, credential, Stellar-specific types |
| `user.types` | User profile, auth DTOs, JWT payload |

## Usage

```ts
import type {
  CreateCourseDto,
  UpdateUserDto,
  PaginatedResponse,
  UserProfile,
  RecordProgressDto,
} from '@scoopdope/types';
```

## Adding to a workspace app

In `apps/backend/package.json` or `apps/frontend/package.json`:

```json
{
  "dependencies": {
    "@scoopdope/types": "*"
  }
}
```

Then run `npm install` from the repo root.

## Type Generation from OpenAPI

To regenerate types from the backend OpenAPI spec:

```bash
# Export the OpenAPI spec from the backend
npm run export:openapi --workspace=apps/backend

# Generate types (requires openapi-typescript)
npx openapi-typescript openapi.json -o packages/types/src/generated.types.ts
```

## Type Usage Patterns

### Backend (NestJS)

```ts
import type { CreateCourseDto } from '@scoopdope/types';

@Post()
create(@Body() dto: CreateCourseDto) { ... }
```

### Frontend (Next.js)

```ts
import type { CourseSummary, PaginatedResponse } from '@scoopdope/types';

const { data } = useSWR<PaginatedResponse<CourseSummary>>('/api/courses');
```
