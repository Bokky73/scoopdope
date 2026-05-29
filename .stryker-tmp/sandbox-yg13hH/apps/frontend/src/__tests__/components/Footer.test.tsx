import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { vi } from 'vitest';
import { Footer } from '@/components/layout/Footer';

describe('Footer', () => {
  it('renders copyright text', () => {
    render(<Footer />);
    expect(screen.getByText(/scoopdope/)).toBeInTheDocument();
  });

  it('renders Docs link', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Docs' })).toBeInTheDocument();
  });

  it('renders GitHub link', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();
  });

  it('renders Stellar Status link', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Stellar network status' })).toBeInTheDocument();
  });

  it('has accessible footer navigation', () => {
    render(<Footer />);
    expect(screen.getByRole('navigation', { name: 'Footer navigation' })).toBeInTheDocument();
  });
});
