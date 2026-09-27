'use client';

/**
 * ConfirmationDialog — issue #859
 *
 * Renders a modal dialog that requires the user to explicitly confirm a
 * destructive action before it proceeds. The confirm button label matches the
 * action being performed (e.g. "Delete", "Withdraw", "Suspend") so there is no
 * ambiguity about what will happen.
 *
 * Usage:
 *   <ConfirmationDialog
 *     isOpen={showConfirm}
 *     onClose={() => setShowConfirm(false)}
 *     onConfirm={handleDelete}
 *     title="Delete course?"
 *     description="This will permanently remove the course and all its lessons. This action cannot be undone."
 *     confirmLabel="Delete"
 *     variant="danger"
 *   />
 */

import { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

export type ConfirmationVariant = 'danger' | 'warning' | 'info';

export interface ConfirmationDialogProps {
  /** Controls dialog visibility */
  isOpen: boolean;
  /** Called when the dialog is dismissed without confirming */
  onClose: () => void;
  /** Called when the user clicks the confirm button */
  onConfirm: () => void;
  /** Short title describing the action, e.g. "Delete course?" */
  title: string;
  /**
   * Sentence or two explaining what will happen and any consequences.
   * Should make the user aware of irreversibility.
   */
  description: string;
  /**
   * Label for the confirm button. Should match the action verb so the
   * user knows exactly what they are clicking (e.g. "Delete", "Withdraw").
   * Defaults to "Confirm".
   */
  confirmLabel?: string;
  /** Label for the cancel button. Defaults to "Cancel". */
  cancelLabel?: string;
  /**
   * Visual style of the confirm button.
   * - danger  → red  (for irreversible destructive actions)
   * - warning → amber (for reversible but significant actions)
   * - info    → blue (for neutral confirmations)
   */
  variant?: ConfirmationVariant;
  /** Disables the confirm button while an async action is in flight */
  isLoading?: boolean;
}

const variantStyles: Record<ConfirmationVariant, { icon: string; button: string }> = {
  danger: {
    icon: 'text-red-500',
    button:
      'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500 text-white disabled:bg-red-400',
  },
  warning: {
    icon: 'text-amber-500',
    button:
      'bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-400 text-white disabled:bg-amber-300',
  },
  info: {
    icon: 'text-blue-500',
    button:
      'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500 text-white disabled:bg-blue-400',
  },
};

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmationDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const styles = variantStyles[variant];

  // Focus the cancel button when the dialog opens (safer default)
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => cancelRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Lock body scroll and hide background content from screen-readers
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-desc"
    >
      {/* Overlay — clicking it cancels (unless loading) */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
        onClick={() => !isLoading && onClose()}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Icon + Title row */}
        <div className="flex items-start gap-4 p-6">
          <span
            className={`mt-0.5 flex-shrink-0 ${styles.icon}`}
            aria-hidden="true"
          >
            <AlertTriangle className="h-6 w-6" />
          </span>
          <div className="flex-1 min-w-0">
            <h2
              id="confirmation-dialog-title"
              className="text-base font-semibold text-gray-900 dark:text-gray-100"
            >
              {title}
            </h2>
            <p
              id="confirmation-dialog-desc"
              className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
            >
              {description}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          {/* Cancel — focused by default so accidental keyboard Enter doesn't confirm */}
          <button
            ref={cancelRef}
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="w-full sm:w-auto rounded-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 disabled:opacity-50 transition-colors"
          >
            {cancelLabel}
          </button>

          {/* Confirm — uses the action verb so user knows what they are clicking */}
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`w-full sm:w-auto rounded-lg px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed transition-colors ${styles.button}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Processing…
              </span>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
