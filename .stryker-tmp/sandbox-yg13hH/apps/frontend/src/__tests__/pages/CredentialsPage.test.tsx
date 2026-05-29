import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { server } from '../mocks/server';
import { useAuthStore } from '@/store/auth.store';

const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => '/',
}));
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import CredentialsPage from '@/app/[locale]/credentials/page';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  useAuthStore.setState({ user: null, token: null });
  mockReplace.mockClear();
});
afterAll(() => server.close());

describe('CredentialsPage', () => {
  it('redirects unauthenticated users and renders nothing', () => {
    render(<CredentialsPage />);
    expect(screen.queryByRole('heading')).toBeNull();
    expect(mockReplace).toHaveBeenCalledWith('/auth/login');
  });

  it('renders credentials for authenticated user', async () => {
    useAuthStore.setState({
      token: 'tok',
      user: { id: 'user-1', username: 'alice', email: 'a@b.com', role: 'student' },
    });
    render(<CredentialsPage />);
    await waitFor(() =>
      expect(screen.getByText('Intro to Stellar Blockchain')).toBeInTheDocument()
    );
    expect(screen.getByText(/Verify on Stellar/)).toBeInTheDocument();
  });

  it('shows empty state when no credentials', async () => {
    const { http, HttpResponse } = await import('msw');
    server.use(http.get('http://localhost:3000/credentials/:userId', () => HttpResponse.json([])));
    useAuthStore.setState({
      token: 'tok',
      user: { id: 'user-1', username: 'alice', email: 'a@b.com', role: 'student' },
    });
    render(<CredentialsPage />);
    await waitFor(() => expect(screen.getByText(/No credentials yet/)).toBeInTheDocument());
  });
});
