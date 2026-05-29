# Requirements Document

## Introduction

This feature enhances the existing student profile page (`/profile`) in the scoopdope learning platform. The current page only shows basic user info and a wallet section. This spec adds a comprehensive learning journey view: enrolled courses with completion status, earned credentials and certificates, BST token balance with transaction history, an achievements/badges section derived from learning milestones, and a leaderboard ranking.

The implementation is entirely frontend-side. All required data is already available through existing backend endpoints: `GET /users/:id/progress`, `GET /credentials/:userId`, `GET /users/:id/token-balance`, `GET /leaderboard`, `GET /users/:id/enrollments`, and `GET /stellar/balance/:publicKey`.

## Glossary

- **ProfilePage**: The Next.js page at `/profile` that displays the authenticated student's learning journey.
- **EnrolledCoursesSection**: The UI section listing all courses the student is enrolled in, with progress percentage and completion status.
- **CredentialsSection**: The UI section listing earned credentials (certificates) with blockchain transaction hashes and PDF download links.
- **TokenSection**: The UI section showing the student's BST token balance and a list of recent Stellar account transactions.
- **AchievementsSection**: The UI section displaying earned badges derived from learning milestones (e.g., first course completed, 5 courses completed, 100 BST earned).
- **LeaderboardSection**: The UI section showing the student's rank among all BST holders on the platform leaderboard.
- **BST**: scoopdope Token — the platform's Stellar-based reward token.
- **Credential**: A blockchain-anchored certificate issued when a student completes a course, stored in the `credentials` table and on the Stellar network.
- **Achievement**: A badge awarded to a student when a specific milestone condition is met, computed client-side from existing data.
- **ProgressRecord**: A record from `GET /users/:id/progress` containing `courseId` and `progressPct` (0–100).
- **LeaderboardEntry**: An entry from `GET /leaderboard` containing `userId`, `username`, `balance`, and `stellarPublicKey`.

---

## Requirements

### Requirement 1: Enrolled Courses and Completion Status

**User Story:** As a student, I want to see all my enrolled courses and their completion status on my profile, so that I can track my overall learning progress at a glance.

#### Acceptance Criteria

1. WHEN the ProfilePage loads, THE EnrolledCoursesSection SHALL fetch and display all courses the student is enrolled in using `GET /users/:id/progress`.
2. WHEN a course has `progressPct` equal to 100, THE EnrolledCoursesSection SHALL display that course with a "Completed" status indicator.
3. WHEN a course has `progressPct` less than 100, THE EnrolledCoursesSection SHALL display a progress bar showing the exact percentage.
4. WHEN the student has no enrolled courses, THE EnrolledCoursesSection SHALL display an empty-state message prompting the student to browse courses.
5. WHILE the enrolled courses data is loading, THE EnrolledCoursesSection SHALL display skeleton placeholder elements.
6. IF the `GET /users/:id/progress` request fails, THEN THE EnrolledCoursesSection SHALL display an error message with a retry option.

---

### Requirement 2: Credentials and Certificates

**User Story:** As a student, I want to view and download my earned credentials and certificates, so that I can share proof of my course completions.

#### Acceptance Criteria

1. WHEN the ProfilePage loads, THE CredentialsSection SHALL fetch and display all credentials using `GET /credentials/:userId`.
2. WHEN a credential is displayed, THE CredentialsSection SHALL show the course name, issue date, and blockchain transaction hash.
3. WHEN a student clicks the download button for a credential, THE CredentialsSection SHALL initiate a PDF download via `GET /credentials/:id/pdf`.
4. WHEN a credential has a `txHash`, THE CredentialsSection SHALL display a link to verify the credential on the Stellar blockchain explorer.
5. WHEN the student has no credentials, THE CredentialsSection SHALL display an empty-state message explaining that credentials are earned by completing courses.
6. WHILE the credentials data is loading, THE CredentialsSection SHALL display skeleton placeholder elements.
7. IF the `GET /credentials/:userId` request fails, THEN THE CredentialsSection SHALL display an error message with a retry option.

---

### Requirement 3: Token Balance and Transaction History

**User Story:** As a student, I want to see my BST token balance and recent transaction history, so that I can understand how I've earned tokens through my learning activity.

#### Acceptance Criteria

1. WHEN the ProfilePage loads and the student has a linked Stellar wallet, THE TokenSection SHALL fetch and display the BST balance using `GET /users/:id/token-balance`.
2. WHEN the ProfilePage loads and the student has a linked Stellar wallet, THE TokenSection SHALL fetch and display recent Stellar account transactions using `GET /stellar/balance/:publicKey`.
3. WHEN the student has no linked Stellar wallet, THE TokenSection SHALL display a prompt to link a wallet via the existing WalletSection.
4. WHEN a transaction is displayed, THE TokenSection SHALL show the transaction type, amount, and date.
5. WHILE the token data is loading, THE TokenSection SHALL display skeleton placeholder elements.
6. IF the `GET /users/:id/token-balance` request fails, THEN THE TokenSection SHALL display a balance of "—" and an error indicator.

---

### Requirement 4: Achievements and Badges

**User Story:** As a student, I want to see my earned achievements and badges, so that I can feel recognized for my learning milestones and stay motivated.

#### Acceptance Criteria

1. WHEN the ProfilePage loads, THE AchievementsSection SHALL compute and display earned badges based on the student's existing progress, credentials, and token balance data.
2. THE AchievementsSection SHALL award the "First Step" badge WHEN the student has at least 1 credential.
3. THE AchievementsSection SHALL award the "Course Collector" badge WHEN the student has at least 5 credentials.
4. THE AchievementsSection SHALL award the "Token Earner" badge WHEN the student's BST balance is greater than 0.
5. THE AchievementsSection SHALL award the "High Achiever" badge WHEN the student's BST balance is at least 500.
6. THE AchievementsSection SHALL award the "Dedicated Learner" badge WHEN the student has at least 1 course with `progressPct` greater than 0 and less than 100.
7. WHEN a badge has not been earned, THE AchievementsSection SHALL display it in a visually distinct locked state.
8. WHEN a badge is earned, THE AchievementsSection SHALL display it in a visually distinct unlocked state with the badge name and a short description.

---

### Requirement 5: Leaderboard Ranking

**User Story:** As a student, I want to see my ranking on the platform leaderboard, so that I can understand how my BST balance compares to other learners.

#### Acceptance Criteria

1. WHEN the ProfilePage loads and the student has a linked Stellar wallet, THE LeaderboardSection SHALL fetch the leaderboard using `GET /leaderboard` and compute the student's rank.
2. WHEN the student appears in the leaderboard data, THE LeaderboardSection SHALL display their rank (e.g., "#3 of 50") and BST balance.
3. WHEN the student does not appear in the leaderboard top 50, THE LeaderboardSection SHALL display a message indicating they are not yet ranked.
4. WHEN the student has no linked Stellar wallet, THE LeaderboardSection SHALL display a prompt to link a wallet to appear on the leaderboard.
5. WHILE the leaderboard data is loading, THE LeaderboardSection SHALL display a skeleton placeholder.
6. IF the `GET /leaderboard` request fails, THEN THE LeaderboardSection SHALL display an error indicator without blocking other profile sections.

---

### Requirement 6: Page Layout and Navigation

**User Story:** As a student, I want the profile page to be well-organized and easy to navigate, so that I can quickly find the information I need.

#### Acceptance Criteria

1. THE ProfilePage SHALL organize content into clearly labeled sections: Profile Info, Enrolled Courses, Credentials, Token & Wallet, Achievements, and Leaderboard.
2. THE ProfilePage SHALL load all sections in parallel using `Promise.all` to minimize total load time.
3. WHEN any individual section fails to load, THE ProfilePage SHALL display that section's error state without affecting other sections.
4. THE ProfilePage SHALL be accessible only to authenticated users, redirecting unauthenticated users to the login page via the existing `ProtectedRoute` component.
5. THE ProfilePage SHALL support dark mode using the existing Tailwind dark-mode classes consistent with the rest of the application.
6. THE ProfilePage SHALL be responsive, displaying sections in a single-column layout on mobile and a two-column layout on screens wider than 768px.
