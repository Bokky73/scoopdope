'use client';

import React from 'react';

export interface PaginationProps {
  /** Current page (1-indexed) */
  currentPage: number;
  /** Total number of items */
  totalItems: number;
  /** Number of items per page */
  pageSize: number;
  /** Called when user navigates to a different page */
  onPageChange: (page: number) => void;
  /** Called when user changes the page size */
  onPageSizeChange?: (pageSize: number) => void;
  /** Available page size options (default: [10, 20, 50]) */
  pageSizeOptions?: number[];
  /** How many page number buttons to show around the current page (default: 2) */
  siblingCount?: number;
  /** Additional className for the wrapper */
  className?: string;
}

/** Generate the list of page numbers and ellipsis markers to display. */
function usePaginationRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
): (number | 'ellipsis-start' | 'ellipsis-end')[] {
  if (totalPages <= 1) return [1];

  const left = Math.max(2, currentPage - siblingCount);
  const right = Math.min(totalPages - 1, currentPage + siblingCount);

  const range: (number | 'ellipsis-start' | 'ellipsis-end')[] = [1];

  if (left > 2) range.push('ellipsis-start');
  for (let i = left; i <= right; i++) range.push(i);
  if (right < totalPages - 1) range.push('ellipsis-end');

  range.push(totalPages);

  return range;
}

const PAGE_SIZE_OPTIONS_DEFAULT = [10, 20, 50];

/**
 * Pagination — full-featured, accessible pagination control.
 *
 * Acceptance criteria:
 * ✓ Previous button disabled on first page
 * ✓ Next button disabled on last page
 * ✓ Clickable page numbers to jump directly
 * ✓ Results per page selector (10, 20, 50)
 * ✓ Current page highlighted
 * ✓ Total count displayed
 * ✓ Mobile responsive (collapses gracefully on small screens)
 * ✓ Full keyboard and screen-reader support (aria-label, aria-current, aria-disabled)
 */
export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS_DEFAULT,
  siblingCount = 2,
  className = '',
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;

  // First/last item numbers shown in the summary (1-indexed)
  const firstItem = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const lastItem = Math.min(currentPage * pageSize, totalItems);

  const paginationRange = usePaginationRange(currentPage, totalPages, siblingCount);

  const goTo = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  const buttonBase =
    'inline-flex items-center justify-center rounded min-w-[36px] min-h-[36px] px-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 disabled:pointer-events-none';

  const navButtonClass = (disabled: boolean) =>
    `${buttonBase} border ${
      disabled
        ? 'border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed'
        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
    }`;

  return (
    <nav
      aria-label="Pagination"
      className={`flex flex-col sm:flex-row items-center gap-4 ${className}`}
    >
      {/* Results summary — always visible */}
      <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap order-1 sm:order-none">
        {totalItems === 0 ? (
          'No results'
        ) : (
          <>
            Showing{' '}
            <span className="font-medium text-gray-900 dark:text-gray-100">{firstItem}</span>
            {' – '}
            <span className="font-medium text-gray-900 dark:text-gray-100">{lastItem}</span>
            {' of '}
            <span className="font-medium text-gray-900 dark:text-gray-100">{totalItems}</span>
            {' results'}
          </>
        )}
      </p>

      {/* Page controls — centred on mobile, pushed to right on desktop */}
      <div className="flex items-center gap-1 flex-wrap justify-center sm:ml-auto order-2 sm:order-none">
        {/* First page */}
        <button
          onClick={() => goTo(1)}
          disabled={isFirst}
          aria-label="Go to first page"
          aria-disabled={isFirst}
          className={navButtonClass(isFirst)}
        >
          {/* Double chevron left */}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>

        {/* Previous page */}
        <button
          onClick={() => goTo(currentPage - 1)}
          disabled={isFirst}
          aria-label="Go to previous page"
          aria-disabled={isFirst}
          className={navButtonClass(isFirst)}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Page number buttons */}
        {paginationRange.map((item, idx) => {
          if (item === 'ellipsis-start' || item === 'ellipsis-end') {
            return (
              <span
                key={item}
                aria-hidden="true"
                className="inline-flex items-center justify-center min-w-[36px] min-h-[36px] text-sm text-gray-500 dark:text-gray-400 select-none"
              >
                &hellip;
              </span>
            );
          }

          const isCurrent = item === currentPage;
          return (
            <button
              key={item}
              onClick={() => goTo(item)}
              aria-label={`Page ${item}`}
              aria-current={isCurrent ? 'page' : undefined}
              className={`${buttonBase} border ${
                isCurrent
                  ? 'bg-blue-600 border-blue-600 text-white dark:bg-blue-500 dark:border-blue-500 cursor-default'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {item}
            </button>
          );
        })}

        {/* Next page */}
        <button
          onClick={() => goTo(currentPage + 1)}
          disabled={isLast}
          aria-label="Go to next page"
          aria-disabled={isLast}
          className={navButtonClass(isLast)}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Last page */}
        <button
          onClick={() => goTo(totalPages)}
          disabled={isLast}
          aria-label="Go to last page"
          aria-disabled={isLast}
          className={navButtonClass(isLast)}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Results per page selector */}
      {onPageSizeChange && (
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap order-3 sm:order-none">
          <span>Per page</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            aria-label="Results per page"
            className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-shadow"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      )}
    </nav>
  );
}
