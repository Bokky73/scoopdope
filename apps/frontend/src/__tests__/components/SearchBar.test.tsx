import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { SearchBar } from '@/components/ui/SearchBar';

expect.extend(toHaveNoViolations);

// useDebounce relies on setTimeout; vitest fake timers handle this
describe('SearchBar', () => {
  const setup = (props: Partial<Parameters<typeof SearchBar>[0]> = {}) => {
    const onSearch = vi.fn();
    const utils = render(
      <SearchBar
        value={props.value ?? ''}
        onSearch={props.onSearch ?? onSearch}
        placeholder={props.placeholder ?? 'Search courses…'}
        debounceMs={props.debounceMs ?? 0} // 0 ms in tests for immediate resolution
        {...(props.autoFocus !== undefined ? { autoFocus: props.autoFocus } : {})}
      />
    );
    return { ...utils, onSearch };
  };

  it('renders a search input with the correct placeholder', () => {
    setup();
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search courses…')).toBeInTheDocument();
  });

  it('has the role="search" landmark', () => {
    setup();
    expect(screen.getByRole('search')).toBeInTheDocument();
  });

  it('displays the current value', () => {
    setup({ value: 'stellar' });
    expect(screen.getByRole('searchbox')).toHaveValue('stellar');
  });

  it('calls onSearch when user types (after debounce)', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar value="" onSearch={onSearch} debounceMs={0} />);

    await user.type(screen.getByRole('searchbox'), 'defi');
    await waitFor(() => expect(onSearch).toHaveBeenCalledWith('defi'));
  });

  it('calls onSearch immediately when Enter is pressed', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar value="" onSearch={onSearch} debounceMs={500} />);

    const input = screen.getByRole('searchbox');
    await user.type(input, 'stellar');
    onSearch.mockClear();
    await user.keyboard('{Enter}');

    expect(onSearch).toHaveBeenCalledWith('stellar');
  });

  it('shows a clear button when input has a value', async () => {
    const user = userEvent.setup();
    setup({ value: '' });

    const input = screen.getByRole('searchbox');
    await user.type(input, 'web3');

    expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument();
  });

  it('does not show a clear button when input is empty', () => {
    setup({ value: '' });
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
  });

  it('clears the input and calls onSearch("") when clear button is clicked', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar value="" onSearch={onSearch} debounceMs={0} />);

    await user.type(screen.getByRole('searchbox'), 'defi');
    onSearch.mockClear();

    const clearBtn = screen.getByRole('button', { name: 'Clear search' });
    await user.click(clearBtn);

    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(onSearch).toHaveBeenCalledWith('');
  });

  it('restores focus to the input after clearing', async () => {
    const user = userEvent.setup();
    render(<SearchBar value="" onSearch={vi.fn()} debounceMs={0} />);

    await user.type(screen.getByRole('searchbox'), 'hello');
    await user.click(screen.getByRole('button', { name: 'Clear search' }));

    expect(screen.getByRole('searchbox')).toHaveFocus();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<SearchBar value="" onSearch={vi.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations when input has a value', async () => {
    const { container } = render(<SearchBar value="blockchain" onSearch={vi.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
