'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/Button';

export default function CoursesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const reportIssue = () => {
    const subject = encodeURIComponent('Courses Error Report from Scoopdope App');
    const body = encodeURIComponent(
      `Error Details:\n${error?.message || 'Unknown error'}\n\nStack Trace:\n${error?.stack || 'No stack trace'}\n\nPlease describe what you were doing when this error occurred:`
    );
    window.location.href = `mailto:support@Scoopdope.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <div className="text-6xl mb-6">⚠️</div>
      <h1 className="text-2xl font-bold mb-2">Courses Error</h1>
      <p className="text-gray-500 mb-6 max-w-md">
        Something went wrong loading courses. Please try again.
      </p>
      {error?.message && (
        <p className="text-xs text-gray-400 bg-gray-100 rounded px-3 py-2 mb-6 max-w-md break-all">
          {error.message}
        </p>
      )}
      <div className="flex gap-3 flex-wrap justify-center">
        <Button onClick={reset}>Try Again</Button>
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
        <Button variant="secondary" onClick={reportIssue}>
          Report Issue
        </Button>
      </div>
    </div>
  );
}