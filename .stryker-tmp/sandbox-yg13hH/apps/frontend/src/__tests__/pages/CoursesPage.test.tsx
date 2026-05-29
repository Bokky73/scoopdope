import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { server } from '../mocks/server';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(''),
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
      isLoading: false,
      token: 'fake-token',
      user: { id: 'user-1', username: 'testuser', email: 'test@example.com' },
    },
  }),
}));

import CoursesPage from '@/app/courses/page';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CoursesPage', () => {
  it('loads and displays courses from API with pagination controls', async () => {
    render(<CoursesPage />);

    expect(screen.getByText('Courses')).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByText('Intro to Stellar Blockchain')).toBeInTheDocument()
    );
    expect(screen.getByText('Soroban Smart Contracts')).toBeInTheDocument();

    const nextButton = screen.getByRole('button', { name: 'Next' });
    expect(nextButton).toBeEnabled();

    fireEvent.click(nextButton);

    await waitFor(() => expect(screen.getByText('Page 2 of')).toBeInTheDocument());
  });

  it('filters courses by search term', async () => {
    render(<CoursesPage />);

    await waitFor(() =>
      expect(screen.getByText('Intro to Stellar Blockchain')).toBeInTheDocument()
    );

    const input = screen.getByPlaceholderText('Search courses...');
    fireEvent.change(input, { target: { value: 'DeFi' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() => expect(screen.getByText('DeFi on Stellar')).toBeInTheDocument());
    expect(screen.queryByText('Intro to Stellar Blockchain')).not.toBeInTheDocument();
  });
});
