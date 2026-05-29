'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useBookmarksStore } from '@/store/bookmarks.store';

export default function BookmarksPage() {
  const { bookmarks, loading, fetchBookmarks, removeBookmark } = useBookmarksStore();

  useEffect(() => { fetchBookmarks(); }, [fetchBookmarks]);

  return (
    <ProtectedRoute>
      <main className="max-w-5xl mx-auto p-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Bookmarks</h1>

        {loading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              </div>
            ))}
          </div>
        )}

        {!loading && bookmarks.length === 0 && (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <p className="text-lg mb-4">No bookmarks yet.</p>
            <Link href="/courses" className="text-blue-600 dark:text-blue-400 hover:underline">
              Browse courses →
            </Link>
          </div>
        )}

        {!loading && bookmarks.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bookmarks.map((course) => (
              <div key={course.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-white dark:bg-gray-900 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-snug">{course.title}</h2>
                  <button
                    onClick={() => removeBookmark(course.id)}
                    aria-label="Remove bookmark"
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                  >
                    <svg className="w-4 h-4 fill-blue-500 text-blue-500" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <span className="capitalize">{course.level}</span>
                  {course.category && <><span>·</span><span>{course.category}</span></>}
                  {course.durationHours != null && <><span>·</span><span>{course.durationHours}h</span></>}
                  {course.rating != null && <><span>·</span><span>★ {course.rating}</span></>}
                </div>
                {course.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{course.description}</p>
                )}
                <div className="flex items-center justify-between mt-auto pt-2">
                  {course.price != null && (
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {course.price === 0 ? 'Free' : `$${course.price}`}
                    </span>
                  )}
                  <Link href={`/courses/${course.id}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline ml-auto">
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
