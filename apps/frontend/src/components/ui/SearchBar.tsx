'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useDebounce } from '@/app/courses/courses.config';

interface SearchBarProps {
  /** Current search value (controlled) */
  value: string;
  /** Called with the debounced value whenever it settles */
  onSearch: (query: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Delay in ms before onSearch fires (default: 300) */
  debounceMs?: number;
  /** Additional className for the wrapper */
  className?: string;
  /** Whether to auto-focus on mount */
  autoFocus?: boolean;
}

/**
 * SearchBar — accessible, debounced search input with clear button.
 *
 * - Debounces input before calling onSearch
 * - Clear button resets the query and calls onSearch('')
 * - Pressing Enter submits immediately (bypasses debounce)
 * - Keyboard and screen-reader friendly
 */
export function SearchBar({
  value,
  onSearch,
  placeholder = 'Search…',
  debounceMs = 300,
  className = '',
  autoFocus = false,
}: SearchBarProps) {
  // Internal state tracks the raw input value so the UI is responsive
  const [inputValue, setInputValue] = useState(value);
  const debouncedValue = useDebounce(inputValue, debounceMs);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchId = useId();
  // Track whether the last change came from an Enter keypress so we can
  // skip the debounce and call onSearch immediately
  const submitImmediately = useRef(false);

  // Sync external value changes (e.g. URL param reset) back into local state
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Call onSearch whenever the debounced value settles, unless we already
  // called it immediately on Enter
  useEffect(() => {
    if (submitImmediately.current) {
      submitImmediately.current = false;
      return;
    }
    onSearch(debouncedValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitImmediately.current = true;
      onSearch(inputValue);
    }
  };

  const handleClear = () => {
    setInputValue('');
    submitImmediately.current = true;
    onSearch('');
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`} role="search">
      {/* Visually hidden label for screen readers */}
      <label htmlFor={searchId} className="sr-only">
        {placeholder}
      </label>

      {/* Search icon */}
      <svg
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
        />
      </svg>

      <input
        ref={inputRef}
        id={searchId}
        type="search"
        role="searchbox"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        aria-label={placeholder}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 pl-10 pr-10 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-sm"
      />

      {/* Clear button — only shown when there is a value */}
      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
