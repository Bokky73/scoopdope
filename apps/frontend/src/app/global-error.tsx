'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: error.stack ?? 'No stack trace available',
        },
      },
    });
  }, [error]);

  const reportIssue = () => {
    const subject = encodeURIComponent('Critical Error Report from Scoopdope App');
    const body = encodeURIComponent(
      `Error Details:\n${error?.message || 'Unknown error'}\n\nStack Trace:\n${error?.stack || 'No stack trace'}\n\nPlease describe what you were doing when this error occurred:`
    );
    window.location.href = `mailto:support@Scoopdope.com?subject=${subject}&body=${body}`;
  };

  return (
    <html>
      <body>
        <style>{`
          .ge-root { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; text-align: center; background: #fff; font-family: system-ui, sans-serif; }
          @media (prefers-color-scheme: dark) { .ge-root { background: #030712; } }
          .ge-error { max-width: 32rem; }
          .ge-icon { font-size: 4rem; margin-bottom: 1.5rem; }
          .ge-title { font-size: 1.5rem; font-weight: 700; color: #111827; margin-bottom: 0.5rem; }
          @media (prefers-color-scheme: dark) { .ge-title { color: #fff; } }
          .ge-text { color: #6b7280; font-size: 0.875rem; line-height: 1.5; }
          @media (prefers-color-scheme: dark) { .ge-text { color: #9ca3af; } }
          .ge-message { font-size: 0.75rem; color: #9ca3af; background: #f3f4f6; border-radius: 0.5rem; padding: 0.75rem 1rem; word-break: break-all; text-align: left; font-family: ui-monospace, monospace; }
          @media (prefers-color-scheme: dark) { .ge-message { background: #1f2937; color: #6b7280; } }
          .ge-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center; }
        `}</style>
        <main className="ge-root" role="alert">
          <div className="ge-error">
            <div className="text-6xl" aria-hidden="true">
              ⚠️
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Something went wrong
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                A critical error occurred. Our team has been notified.
                Please try refreshing the page.
              </p>
            </div>

            {error?.message && (
              <p className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3 break-all text-left font-mono">
                {error.message}
              </p>
            )}

            <div className="ge-actions">
              <Button onClick={reset}>
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = '/')}
              >
                Go Home
              </Button>
              <Button variant="secondary" onClick={reportIssue}>
                Report Issue
              </Button>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
