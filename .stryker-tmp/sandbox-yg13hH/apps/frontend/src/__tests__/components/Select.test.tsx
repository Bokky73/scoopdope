import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Select } from '@/components/ui/Select';

const options = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
];

describe('Select', () => {
  it('renders with a label', () => {
    render(<Select label="Level" options={options} />);
    expect(screen.getByLabelText('Level')).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(<Select label="Level" options={options} />);
    expect(screen.getByRole('option', { name: 'Option A' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Option B' })).toBeInTheDocument();
  });

  it('shows error message and sets aria-invalid', () => {
    render(<Select label="Level" options={options} error="Required" />);
    expect(screen.getByLabelText('Level')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
  });

  it('shows helper text when no error', () => {
    render(<Select label="Level" options={options} helperText="Pick one" />);
    expect(screen.getByText('Pick one')).toBeInTheDocument();
  });
});
