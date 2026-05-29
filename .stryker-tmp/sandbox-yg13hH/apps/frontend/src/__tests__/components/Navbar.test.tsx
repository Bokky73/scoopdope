import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAuthStore } from '@/store/auth.store';

vi.mock('next/navigation', () => ({
  usePathname: () => '/courses',
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock('@/components/ThemeToggle', () => ({ ThemeToggle: () => <button>Theme</button> }));
vi.mock('@/components/LanguageSwitcher', () => ({ LanguageSwitcher: () => <button>Lang</button> }));

import { Navbar } from '@/components/layout/Navbar';

beforeEach(() => useAuthStore.setState({ user: null, token: null }));

describe('Navbar', () => {
  it('renders the brand link', () => {
    render(<Navbar />);
    expect(screen.getByRole('link', { name: 'scoopdope' })).toBeInTheDocument();
  });

  it('renders Courses link', () => {
    render(<Navbar />);
    expect(screen.getByRole('link', { name: 'Courses' })).toBeInTheDocument();
  });

  it('shows Login when unauthenticated', () => {
    render(<Navbar />);
    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument();
  });

  it('shows user menu button when authenticated', () => {
    useAuthStore.setState({
      token: 'tok',
      user: { id: '1', username: 'alice', email: 'a@b.com', role: 'student' },
    });
    render(<Navbar />);
    expect(screen.getByRole('button', { name: 'User menu' })).toBeInTheDocument();
  });

  it('opens dropdown on avatar click', async () => {
    const user = userEvent.setup();
    useAuthStore.setState({
      token: 'tok',
      user: { id: '1', username: 'alice', email: 'a@b.com', role: 'student' },
    });
    render(<Navbar />);
    await user.click(screen.getByRole('button', { name: 'User menu' }));
    expect(screen.getByRole('menuitem', { name: 'Logout' })).toBeInTheDocument();
  });

  it('toggles mobile menu', async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    const hamburger = screen.getByRole('button', { name: 'Open menu' });
    await user.click(hamburger);
    expect(screen.getByRole('button', { name: 'Close menu' })).toBeInTheDocument();
  });
});
