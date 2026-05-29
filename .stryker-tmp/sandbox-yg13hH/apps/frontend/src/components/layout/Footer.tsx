'use client';

import Link from 'next/link';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
        <span>© {year} scoopdope. All rights reserved.</span>
        <nav
          aria-label="Footer navigation"
          className="flex items-center gap-4 flex-wrap justify-center"
        >
          <Link
            href="/docs"
            className="hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Docs
          </Link>
          <a
            href="https://github.com/your-org/scoopdope"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://status.stellar.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-white transition-colors"
            aria-label="Stellar network status"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" aria-hidden="true" />
            Stellar Status
          </a>
        </nav>
      </div>
    </footer>
  );
}
