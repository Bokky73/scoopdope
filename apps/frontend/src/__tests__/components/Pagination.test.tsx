import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Pagination } from '@/components/ui/Pagination';

expect.extend(toHaveNoViolations);

const defaultProps = {
  currentPage: 1,
  totalItems: 100,
  pageSize: 10,
  onPageChange: vi.fn(),
};

describe('Pagination', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders a navigation landmark', () => {
      render(<Pagination {...defaultProps} />);
      expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
    });

    it('displays total item count and range', () => {
      render(<Pagination {...defaultProps} />);
      // Summary text: "Showing 1 – 10 of 100 results"
      expect(screen.getByText(/showing/i).closest('p')).toHaveTextContent('1');
      expect(screen.getByText(/showing/i).closest('p')).toHaveTextContent('100');
    });

    it('shows "No results" when totalItems is 0', () => {
      render(<Pagination {...defaultProps} totalItems={0} />);
      expect(screen.getByText('No results')).toBeInTheDocument();
    });

    it('highlights the current page button with aria-current="page"', () => {
      render(<Pagination {...defaultProps} currentPage={3} totalItems={100} pageSize={10} />);
      expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page');
    });

    it('renders page number buttons', () => {
      render(<Pagination {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument();
    });
  });

  describe('disabled states', () => {
    it('disables previous and first-page buttons on first page', () => {
      render(<Pagination {...defaultProps} currentPage={1} />);
      expect(screen.getByRole('button', { name: 'Go to previous page' })).toHaveAttribute(
        'aria-disabled',
        'true'
      );
      expect(screen.getByRole('button', { name: 'Go to first page' })).toHaveAttribute(
        'aria-disabled',
        'true'
      );
    });

    it('disables next and last-page buttons on last page', () => {
      render(<Pagination {...defaultProps} currentPage={10} />);
      expect(screen.getByRole('button', { name: 'Go to next page' })).toHaveAttribute(
        'aria-disabled',
        'true'
      );
      expect(screen.getByRole('button', { name: 'Go to last page' })).toHaveAttribute(
        'aria-disabled',
        'true'
      );
    });

    it('enables previous button on page 2+', () => {
      render(<Pagination {...defaultProps} currentPage={2} />);
      expect(screen.getByRole('button', { name: 'Go to previous page' })).not.toHaveAttribute(
        'aria-disabled',
        'true'
      );
    });
  });

  describe('navigation', () => {
    it('calls onPageChange with next page when Next is clicked', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      render(<Pagination {...defaultProps} currentPage={3} onPageChange={onPageChange} />);

      await user.click(screen.getByRole('button', { name: 'Go to next page' }));
      expect(onPageChange).toHaveBeenCalledWith(4);
    });

    it('calls onPageChange with previous page when Prev is clicked', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      render(<Pagination {...defaultProps} currentPage={5} onPageChange={onPageChange} />);

      await user.click(screen.getByRole('button', { name: 'Go to previous page' }));
      expect(onPageChange).toHaveBeenCalledWith(4);
    });

    it('calls onPageChange(1) when First is clicked', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      render(<Pagination {...defaultProps} currentPage={5} onPageChange={onPageChange} />);

      await user.click(screen.getByRole('button', { name: 'Go to first page' }));
      expect(onPageChange).toHaveBeenCalledWith(1);
    });

    it('calls onPageChange(totalPages) when Last is clicked', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      render(<Pagination {...defaultProps} currentPage={3} onPageChange={onPageChange} />);

      await user.click(screen.getByRole('button', { name: 'Go to last page' }));
      expect(onPageChange).toHaveBeenCalledWith(10);
    });

    it('calls onPageChange with selected page when a page number is clicked', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      render(<Pagination {...defaultProps} currentPage={1} onPageChange={onPageChange} />);

      await user.click(screen.getByRole('button', { name: 'Page 3' }));
      expect(onPageChange).toHaveBeenCalledWith(3);
    });

    it('does not call onPageChange when current page button is clicked', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      render(<Pagination {...defaultProps} currentPage={1} onPageChange={onPageChange} />);

      await user.click(screen.getByRole('button', { name: 'Page 1' }));
      expect(onPageChange).not.toHaveBeenCalled();
    });
  });

  describe('page size selector', () => {
    it('renders the results-per-page select when onPageSizeChange is provided', () => {
      render(
        <Pagination {...defaultProps} onPageSizeChange={vi.fn()} pageSizeOptions={[10, 20, 50]} />
      );
      expect(screen.getByRole('combobox', { name: 'Results per page' })).toBeInTheDocument();
    });

    it('does not render the select when onPageSizeChange is omitted', () => {
      render(<Pagination {...defaultProps} />);
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });

    it('calls onPageSizeChange with selected value', async () => {
      const user = userEvent.setup();
      const onPageSizeChange = vi.fn();
      render(
        <Pagination
          {...defaultProps}
          onPageSizeChange={onPageSizeChange}
          pageSizeOptions={[10, 20, 50]}
        />
      );
      await user.selectOptions(screen.getByRole('combobox'), '20');
      expect(onPageSizeChange).toHaveBeenCalledWith(20);
    });
  });

  describe('accessibility', () => {
    it('has no violations on page 1', async () => {
      const { container } = render(<Pagination {...defaultProps} onPageSizeChange={vi.fn()} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no violations on a middle page', async () => {
      const { container } = render(
        <Pagination {...defaultProps} currentPage={5} onPageSizeChange={vi.fn()} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no violations on the last page', async () => {
      const { container } = render(
        <Pagination {...defaultProps} currentPage={10} onPageSizeChange={vi.fn()} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no violations with zero results', async () => {
      const { container } = render(<Pagination {...defaultProps} totalItems={0} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
