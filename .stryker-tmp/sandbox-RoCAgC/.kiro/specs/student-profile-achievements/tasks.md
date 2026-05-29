# Implementation Plan: Student Profile Page with Achievements

## Overview

Expand the existing `/profile` page into a comprehensive learning journey dashboard by adding five new section components, a pure `computeAchievements` function, and parallel data fetching. All data comes from existing backend APIs.

## Tasks

- [ ] 1. Define shared TypeScript interfaces and the `computeAchievements` pure function
  - [ ] 1.1 Create `apps/frontend/src/app/profile/types.ts` with `ProgressRecord`, `CredentialRecord`, `StellarBalance`, `LeaderboardEntry`, and `BadgeState` interfaces
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_
  - [ ] 1.2 Create `apps/frontend/src/app/profile/computeAchievements.ts` implementing the five badge conditions (First Step, Course Collector, Token Earner, High Achiever, Dedicated Learner)
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6_
  - [ ]* 1.3 Write property tests for `computeAchievements`
    - **Property 4: Credential-count badge correctness** — `fc.nat()` for credentialCount, assert `first-step` and `course-collector` earned flags match thresholds
    - **Property 5: BST balance badge correctness** — `fc.nat()` for bstBalance, assert `token-earner` and `high-achiever` earned flags match thresholds
    - **Property 6: In-progress badge correctness** — `fc.array` of progress records, assert `dedicated-learner` earned iff any record has `0 < progressPct < 100`
    - **Property 9: Always returns 5 distinct badges** — arbitrary input, assert array length === 5 and all ids are distinct
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ] 2. Implement `EnrolledCoursesSection` component
  - [ ] 2.1 Create `apps/frontend/src/app/profile/EnrolledCoursesSection.tsx` accepting `progress`, `courses`, `loading`, `error`, and `onRetry` props; render `CircularProgress` + progress bar per course; show "Completed" badge when `progressPct === 100`; show skeleton when loading; show error + retry when error
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  - [ ]* 2.2 Write property test for progress display correctness
    - **Property 1: Progress display correctness** — `fc.array` of records with random `progressPct`, assert completed indicator XOR progress bar per record
    - _Requirements: 1.2, 1.3_

- [ ] 3. Implement `CredentialsSection` component
  - [ ] 3.1 Create `apps/frontend/src/app/profile/CredentialsSection.tsx` accepting `credentials`, `loading`, `error`, and `onRetry` props; render course name, issue date, truncated txHash with Stellar explorer link, and PDF download button per credential; show skeleton when loading; show error + retry when error
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
  - [ ]* 3.2 Write property test for credential card completeness
    - **Property 2: Credential card completeness** — `fc.array` of credentials with optional txHash, assert required fields present and txHash link conditional
    - _Requirements: 2.2, 2.4_

- [ ] 4. Implement `TokenSection` component
  - [ ] 4.1 Create `apps/frontend/src/app/profile/TokenSection.tsx` accepting `stellarPublicKey`, `tokenBalance`, `stellarBalances`, `loading`, and `error` props; display BST balance prominently; list Stellar balance entries with asset code and amount; show wallet-link prompt when no `stellarPublicKey`; show skeleton when loading
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  - [ ]* 4.2 Write property test for transaction display completeness
    - **Property 3: Transaction display completeness** — `fc.array` of balance entries with optional `asset_code`, assert asset label and balance string present in each rendered row
    - _Requirements: 3.4_

- [ ] 5. Implement `AchievementsSection` component
  - [ ] 5.1 Create `apps/frontend/src/app/profile/AchievementsSection.tsx` accepting a `badges: BadgeState[]` prop; render a responsive grid of badge cards; earned badges show full color with name and description; unearned badges show grayscale with a lock icon
    - _Requirements: 4.1, 4.7, 4.8_
  - [ ]* 5.2 Write property test for badge locked/unlocked rendering
    - **Property 7: Badge locked/unlocked rendering** — `fc.array` of BadgeState with random `earned` flag, assert locked indicator present iff `earned === false`
    - _Requirements: 4.7, 4.8_

- [ ] 6. Implement `LeaderboardSection` component
  - [ ] 6.1 Create `apps/frontend/src/app/profile/LeaderboardSection.tsx` accepting `leaderboard`, `userId`, `stellarPublicKey`, `loading`, and `error` props; find the student's entry by `userId`; display rank as "#N of M" and BST balance; show "unranked" message when not found; show wallet-link prompt when no `stellarPublicKey`; show skeleton when loading; show error indicator when error
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  - [ ]* 6.2 Write property test for leaderboard rank computation
    - **Property 8: Leaderboard rank computation** — `fc.array` of leaderboard entries + `fc.uuid()` for userId, assert displayed rank equals index+1 when found, or unranked message when not found
    - _Requirements: 5.2, 5.3_

- [ ] 7. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Wire all sections into the updated `ProfilePage`
  - [ ] 8.1 Refactor `apps/frontend/src/app/profile/page.tsx` to fetch all data in parallel using `Promise.allSettled` (progress, credentials, token balance, stellar balances, leaderboard); store per-section loading/error state; pass resolved data to each section component; wrap in `ProtectedRoute`; apply two-column responsive layout on md+ screens
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  - [ ] 8.2 Resolve course titles for progress records by fetching `GET /courses/:id` for each unique `courseId` and building a `courses` lookup map, consistent with the existing dashboard pattern
    - _Requirements: 1.1_

- [ ] 9. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- `computeAchievements` is a pure function — no mocking needed for its tests
- `fast-check` must be added as a dev dependency: `npm install -D fast-check` in `apps/frontend`
- The Stellar explorer link for a txHash should point to `https://stellar.expert/explorer/testnet/tx/{txHash}` (or mainnet based on `NEXT_PUBLIC_STELLAR_NETWORK`)
- Reuse existing UI primitives: `Card`, `Badge`, `Skeleton`, `CircularProgress`, `ProgressBar`
