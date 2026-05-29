import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { server } from '../mocks/server';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/dashboard',
}));
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    state: {
      user: { id: 'user-1', username: 'testuser', email: 'test@example.com' },
      token: 'fake-token',
      isLoading: false,
    },
    dispatch: vi.fn(),
  }),
}));

import DashboardPage from '@/app/dashboard/page';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('DashboardPage', () => {
  it('renders welcome section and data from API', async () => {
    render(<DashboardPage />);

    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText(/BST Token Balance/i)).toBeInTheDocument());
    expect(screen.getByText(/850 BST/i)).toBeInTheDocument();

    expect(screen.getByText('Intro to Stellar Blockchain')).toBeInTheDocument();
    expect(screen.getByText('Soroban Smart Contracts')).toBeInTheDocument();

    expect(screen.getByText(/Recent Credentials/i)).toBeInTheDocument();
    expect(screen.getByText('Soroban Smart Contracts')).toBeInTheDocument();
  });
});
