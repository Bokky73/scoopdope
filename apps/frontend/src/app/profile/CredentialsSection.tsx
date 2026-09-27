'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import api from '@/lib/api';
import { toast } from '@/lib/toast';
import type { CredentialRecord } from './types';

const STELLAR_EXPLORER_BASE =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'mainnet'
    ? 'https://stellar.expert/explorer/public/tx'
    : 'https://stellar.expert/explorer/testnet/tx';

function truncateTxHash(hash: string): string {
  if (hash.length <= 16) return hash;
  return `${hash.slice(0, 8)}…${hash.slice(-8)}`;
}

interface CredentialsSectionProps {
  credentials: CredentialRecord[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}

function CredentialCard({ credential }: { credential: CredentialRecord }) {
  const [downloading, setDownloading] = useState(false);

  const courseTitle =
    credential.course?.title ?? credential.courseTitle ?? `Course ${credential.courseId}`;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await api.get(`/credentials/${credential.id}/pdf`, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `credential-${credential.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download certificate. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-white">{courseTitle}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Issued{' '}
            {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
              new Date(credential.issuedAt)
            )}
          </p>

          {credential.txHash ? (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Tx:{' '}
              <a
                href={`${STELLAR_EXPLORER_BASE}/${credential.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View transaction ${credential.txHash} on Stellar Explorer`}
                className="text-blue-600 dark:text-blue-400 hover:underline font-mono"
              >
                {truncateTxHash(credential.txHash)}
              </a>
            </p>
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">
              Not yet anchored on-chain
            </p>
          )}
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          aria-label={`Download PDF certificate for ${courseTitle}`}
          className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {downloading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Downloading…
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2m-4-4-4 4m0 0-4-4m4 4V4" />
              </svg>
              PDF
            </>
          )}
        </button>
      </div>
    </Card>
  );
}

/**
 * Displays the student's earned on-chain credentials.
 */
export function CredentialsSection({
  credentials,
  loading,
  error,
  onRetry,
}: CredentialsSectionProps) {
  return (
    <section aria-labelledby="credentials-heading">
      <h2
        id="credentials-heading"
        className="text-xl font-semibold text-gray-900 dark:text-white mb-4"
      >
        Credentials
      </h2>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div
          role="alert"
          className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <p className="text-sm text-red-700 dark:text-red-300 mb-2">
            Failed to load your credentials.
          </p>
          <button
            onClick={onRetry}
            aria-label="Retry loading credentials"
            className="text-sm text-red-700 dark:text-red-300 underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      ) : credentials.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          You haven't earned any credentials yet. Complete a course to earn your first one!
        </p>
      ) : (
        <div className="space-y-3">
          {credentials.map((cred) => (
            <CredentialCard key={cred.id} credential={cred} />
          ))}
        </div>
      )}
    </section>
  );
}
