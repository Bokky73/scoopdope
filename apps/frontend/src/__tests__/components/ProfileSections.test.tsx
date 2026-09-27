import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EnrolledCoursesSection } from '@/app/profile/EnrolledCoursesSection';
import { CredentialsSection } from '@/app/profile/CredentialsSection';
import { TokenSection } from '@/app/profile/TokenSection';
import AchievementsSection from '@/app/profile/AchievementsSection';
import { LeaderboardSection } from '@/app/profile/LeaderboardSection';
import type { ProgressRecord, CredentialRecord, StellarBalance, LeaderboardEntry, BadgeState } from '@/app/profile/types';

// Silence API calls from CredentialsSection download
vi.mock('@/lib/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }) },
}));
vi.mock('@/lib/toast', () => ({
  toast: { error: vi.fn(), info: vi.fn() },
}));

// ── EnrolledCoursesSection ────────────────────────────────────────────────────

describe('EnrolledCoursesSection', () => {
  const mockProgress: ProgressRecord[] = [
    { id: '1', courseId: 'c1', progressPct: 50, updatedAt: new Date().toISOString() },
    { id: '2', courseId: 'c2', progressPct: 100, updatedAt: new Date().toISOString() },
  ];
  const mockCourses = {
    c1: { id: 'c1', title: 'Intro to Stellar' },
    c2: { id: 'c2', title: 'Advanced Soroban' },
  };

  it('renders section heading', () => {
    render(
      <EnrolledCoursesSection
        progress={mockProgress}
        courses={mockCourses}
        loading={false}
        error={false}
        onRetry={vi.fn()}
      />
    );
    expect(screen.getByText('Enrolled Courses')).toBeInTheDocument();
  });

  it('shows skeleton when loading', () => {
    render(
      <EnrolledCoursesSection
        progress={[]}
        courses={{}}
        loading={true}
        error={false}
        onRetry={vi.fn()}
      />
    );
    // Skeletons render as divs with animate classes; just ensure no course cards
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('shows error state with retry button on error', () => {
    const onRetry = vi.fn();
    render(
      <EnrolledCoursesSection
        progress={[]}
        courses={{}}
        loading={false}
        error={true}
        onRetry={onRetry}
      />
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
  });

  it('shows empty state when no progress records', () => {
    render(
      <EnrolledCoursesSection
        progress={[]}
        courses={{}}
        loading={false}
        error={false}
        onRetry={vi.fn()}
      />
    );
    expect(screen.getByText(/haven't enrolled/i)).toBeInTheDocument();
  });

  it('renders a progress bar for in-progress courses', () => {
    render(
      <EnrolledCoursesSection
        progress={[mockProgress[0]]}
        courses={mockCourses}
        loading={false}
        error={false}
        onRetry={vi.fn()}
      />
    );
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
  });

  it('shows Completed badge for completed courses', () => {
    render(
      <EnrolledCoursesSection
        progress={[mockProgress[1]]}
        courses={mockCourses}
        loading={false}
        error={false}
        onRetry={vi.fn()}
      />
    );
    expect(screen.getByText(/completed/i)).toBeInTheDocument();
  });

  it('uses course title from courses map', () => {
    render(
      <EnrolledCoursesSection
        progress={mockProgress}
        courses={mockCourses}
        loading={false}
        error={false}
        onRetry={vi.fn()}
      />
    );
    expect(screen.getByText('Intro to Stellar')).toBeInTheDocument();
    expect(screen.getByText('Advanced Soroban')).toBeInTheDocument();
  });

  it('falls back to Course {id} when course title is not found', () => {
    render(
      <EnrolledCoursesSection
        progress={mockProgress}
        courses={{}}
        loading={false}
        error={false}
        onRetry={vi.fn()}
      />
    );
    expect(screen.getByText('Course c1')).toBeInTheDocument();
  });
});

// ── CredentialsSection ────────────────────────────────────────────────────────

describe('CredentialsSection', () => {
  const mockCredentials: CredentialRecord[] = [
    {
      id: 'cred-1',
      courseId: 'c1',
      txHash: 'abc123def456',
      stellarPublicKey: 'GXYZ',
      issuedAt: new Date().toISOString(),
      course: { id: 'c1', title: 'Intro to Stellar' },
    },
    {
      id: 'cred-2',
      courseId: 'c2',
      txHash: null,
      stellarPublicKey: null,
      issuedAt: new Date().toISOString(),
      course: { id: 'c2', title: 'Soroban Basics' },
    },
  ];

  it('renders credentials with course name', () => {
    render(
      <CredentialsSection
        credentials={mockCredentials}
        loading={false}
        error={false}
        onRetry={vi.fn()}
      />
    );
    expect(screen.getByText('Intro to Stellar')).toBeInTheDocument();
    expect(screen.getByText('Soroban Basics')).toBeInTheDocument();
  });

  it('shows txHash explorer link when txHash is present', () => {
    render(
      <CredentialsSection
        credentials={[mockCredentials[0]]}
        loading={false}
        error={false}
        onRetry={vi.fn()}
      />
    );
    const link = screen.getByRole('link', { name: /view transaction/i });
    expect(link).toHaveAttribute('href', expect.stringContaining('abc123def456'));
  });

  it('shows "Not yet anchored on-chain" when txHash is null', () => {
    render(
      <CredentialsSection
        credentials={[mockCredentials[1]]}
        loading={false}
        error={false}
        onRetry={vi.fn()}
      />
    );
    expect(screen.getByText(/not yet anchored/i)).toBeInTheDocument();
  });

  it('renders PDF download button per credential', () => {
    render(
      <CredentialsSection
        credentials={mockCredentials}
        loading={false}
        error={false}
        onRetry={vi.fn()}
      />
    );
    const buttons = screen.getAllByLabelText(/download pdf certificate/i);
    expect(buttons).toHaveLength(2);
  });

  it('shows empty state when no credentials', () => {
    render(
      <CredentialsSection
        credentials={[]}
        loading={false}
        error={false}
        onRetry={vi.fn()}
      />
    );
    expect(screen.getByText(/haven't earned any credentials/i)).toBeInTheDocument();
  });

  it('shows error state on error', () => {
    render(
      <CredentialsSection
        credentials={[]}
        loading={false}
        error={true}
        onRetry={vi.fn()}
      />
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});

// ── TokenSection ──────────────────────────────────────────────────────────────

describe('TokenSection', () => {
  const mockBalances: StellarBalance[] = [
    { asset_type: 'native', balance: '10.0000000' },
    { asset_code: 'BST', asset_type: 'credit_alphanum4', balance: '250.0000000' },
  ];

  it('shows BST balance prominently', () => {
    render(
      <TokenSection
        stellarPublicKey="GXYZ"
        tokenBalance="250.0000000"
        stellarBalances={mockBalances}
        loading={false}
        error={false}
      />
    );
    expect(screen.getByText(/BST Balance/i)).toBeInTheDocument();
    // "BST" appears both in the balance label and in the Stellar balances list
    expect(screen.getAllByText(/^BST$/)).toHaveLength(2);
  });

  it('shows wallet-link prompt when no stellarPublicKey', () => {
    render(
      <TokenSection
        stellarPublicKey={undefined}
        tokenBalance={null}
        stellarBalances={null}
        loading={false}
        error={false}
      />
    );
    expect(screen.getByText(/connect your stellar wallet/i)).toBeInTheDocument();
  });

  it('renders Stellar balance list when wallet is linked', () => {
    render(
      <TokenSection
        stellarPublicKey="GXYZ"
        tokenBalance="100"
        stellarBalances={mockBalances}
        loading={false}
        error={false}
      />
    );
    // "XLM" for native, "BST" for the other asset
    expect(screen.getByText('XLM')).toBeInTheDocument();
    // BST appears in both the balance label unit and the balance list
    expect(screen.getAllByText('BST').length).toBeGreaterThanOrEqual(1);
  });

  it('shows "—" when tokenBalance is null due to error', () => {
    render(
      <TokenSection
        stellarPublicKey="GXYZ"
        tokenBalance={null}
        stellarBalances={null}
        loading={false}
        error={true}
      />
    );
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});

// ── AchievementsSection ───────────────────────────────────────────────────────

describe('AchievementsSection', () => {
  const earnedBadge: BadgeState = {
    id: 'first-step',
    name: 'First Step',
    description: 'Complete your first course',
    earned: true,
  };
  const lockedBadge: BadgeState = {
    id: 'course-collector',
    name: 'Course Collector',
    description: 'Earn 5 course credentials',
    earned: false,
  };

  it('renders all badges', () => {
    render(<AchievementsSection badges={[earnedBadge, lockedBadge]} />);
    expect(screen.getByText('First Step')).toBeInTheDocument();
    expect(screen.getByText('Course Collector')).toBeInTheDocument();
  });

  it('shows description for earned badges', () => {
    render(<AchievementsSection badges={[earnedBadge]} />);
    expect(screen.getByText('Complete your first course')).toBeInTheDocument();
  });

  it('shows lock icon for unearned badges', () => {
    render(<AchievementsSection badges={[lockedBadge]} />);
    expect(screen.getByTestId('badge-locked')).toBeInTheDocument();
  });

  it('does NOT show lock icon for earned badges', () => {
    render(<AchievementsSection badges={[earnedBadge]} />);
    expect(screen.queryByTestId('badge-locked')).not.toBeInTheDocument();
  });

  it('applies grayscale class to unearned badges', () => {
    const { container } = render(<AchievementsSection badges={[lockedBadge]} />);
    const card = container.querySelector('.grayscale');
    expect(card).toBeInTheDocument();
  });
});

// ── LeaderboardSection ────────────────────────────────────────────────────────

describe('LeaderboardSection', () => {
  const leaderboard: LeaderboardEntry[] = [
    { userId: 'user-1', username: 'alice', email: 'a@a.com', stellarPublicKey: 'GABC', balance: '500' },
    { userId: 'user-2', username: 'bob', email: 'b@b.com', stellarPublicKey: 'GDEF', balance: '300' },
    { userId: 'user-3', username: null, email: 'c@c.com', stellarPublicKey: 'GHIJ', balance: '100' },
  ];

  it('shows rank correctly for user in leaderboard', () => {
    render(
      <LeaderboardSection
        leaderboard={leaderboard}
        userId="user-2"
        stellarPublicKey="GDEF"
        loading={false}
        error={false}
      />
    );
    expect(screen.getByText(/#2/i)).toBeInTheDocument();
  });

  it('shows total count', () => {
    render(
      <LeaderboardSection
        leaderboard={leaderboard}
        userId="user-1"
        stellarPublicKey="GABC"
        loading={false}
        error={false}
      />
    );
    expect(screen.getByText(/of 3/i)).toBeInTheDocument();
  });

  it('shows unranked message when user not in leaderboard', () => {
    render(
      <LeaderboardSection
        leaderboard={leaderboard}
        userId="user-999"
        stellarPublicKey="GZZZ"
        loading={false}
        error={false}
      />
    );
    expect(screen.getByText(/unranked/i)).toBeInTheDocument();
  });

  it('shows wallet-link prompt when no stellarPublicKey', () => {
    render(
      <LeaderboardSection
        leaderboard={leaderboard}
        userId="user-1"
        stellarPublicKey={undefined}
        loading={false}
        error={false}
      />
    );
    expect(screen.getByText(/link your stellar wallet/i)).toBeInTheDocument();
  });

  it('shows error indicator on error', () => {
    render(
      <LeaderboardSection
        leaderboard={[]}
        userId="user-1"
        stellarPublicKey="GABC"
        loading={false}
        error={true}
      />
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows skeleton when loading', () => {
    const { container } = render(
      <LeaderboardSection
        leaderboard={[]}
        userId="user-1"
        stellarPublicKey="GABC"
        loading={true}
        error={false}
      />
    );
    // When loading, skeleton divs should be rendered, not the rank
    expect(screen.queryByText(/#1/i)).not.toBeInTheDocument();
  });

  it('falls back to email when username is null', () => {
    render(
      <LeaderboardSection
        leaderboard={leaderboard}
        userId="user-1"
        stellarPublicKey="GABC"
        loading={false}
        error={false}
      />
    );
    // user-3 has null username; their email should show in top 3 list
    expect(screen.getByText('c@c.com')).toBeInTheDocument();
  });
});
