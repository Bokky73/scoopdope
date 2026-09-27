'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useBookmarksStore } from '@/store/bookmarks.store';
import { CompareBar } from '@/components/courses/CompareBar';
import { BundleCard } from '@/components/ui/BundleCard';
import { Badge } from '@/components/ui/Badge';
import { BackToTopButton } from '@/components/ui/BackToTopButton';
import { FilterChip } from '@/components/courses/FilterChip';
import { CourseSkeletonCard } from '@/components/courses/CourseSkeletonCard';
import { CourseCard } from '@/components/courses/CourseCard';
import { CourseFilters } from '@/components/courses/CourseFilters';
import { SearchBar } from '@/components/ui/SearchBar';
import { useCoursesFilter } from './useCoursesFilter';
import api from '@/lib/api';
import { toast } from '@/lib/toast';

export default function CoursesPage() {
  const router = useRouter();
  const { fetchBookmarks } = useBookmarksStore();
  const observerRef = useRef<HTMLDivElement>(null);
  const [bundles, setBundles] = useState<any[]>([]);

  const {
    query, setQuery, level, language, category, duration, price, sort, dq,
    instructor, minRating, enrollmentRange, dateRange,
    applyFilter, clearAll, activeFilters,
    courses, error, isLoading, isLoadingMore, hasMore, size, setSize,
  } = useCoursesFilter();

  useEffect(() => { fetchBookmarks(); }, [fetchBookmarks]);
  useEffect(() => { api.get('/bundles').then((r) => setBundles(r.data)).catch(() => {}); }, []);
  useEffect(() => {
    const pos = sessionStorage.getItem('courses-scroll-pos');
    if (pos) { window.scrollTo(0, parseInt(pos, 10)); sessionStorage.removeItem('courses-scroll-pos'); }
    const save = () => sessionStorage.setItem('courses-scroll-pos', window.pageYOffset.toString());
    window.addEventListener('beforeunload', save);
    return () => window.removeEventListener('beforeunload', save);
  }, []);

  useEffect(() => {
    if (!observerRef.current || !hasMore) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting && !isLoadingMore) setSize(size + 1); }, { threshold: 0.1 });
    obs.observe(observerRef.current);
    return () => obs.disconnect();
  }, [hasMore, isLoadingMore, size, setSize]);

  const handlePurchaseBundle = async (bundle: any) => {
    try { await api.post(`/bundles/${bundle.id}/purchase`); toast.success(`Successfully purchased ${bundle.title}!`); router.push('/dashboard'); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Failed to purchase bundle'); }
  };

  return (
    <ProtectedRoute>
      <main className="max-w-5xl mx-auto p-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Courses</h1>

        {bundles.length > 0 && !dq && !level && !language && !category && !duration && (
          <section className="space-y-4 mb-12">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Course Bundles</h2>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">Special Offers</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bundles.map((b) => (
                <BundleCard key={b.id} bundle={b} onViewDetails={() => router.push(`/bundles/${b.id}`)} onPurchase={handlePurchaseBundle} />
              ))}
            </div>
            <div className="border-b dark:border-gray-800 pb-8" />
          </section>
        )}

        <SearchBar
          value={query}
          onSearch={setQuery}
          placeholder="Search courses…"
          debounceMs={300}
        />

        <CourseFilters level={level} language={language} category={category} duration={duration} price={price} sort={sort} instructor={instructor} minRating={minRating} enrollmentRange={enrollmentRange} dateRange={dateRange} onChange={applyFilter} />

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            {activeFilters.map((f) => <FilterChip key={f.label} label={f.label} onRemove={f.clear} />)}
            <button onClick={clearAll} className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline">Clear all</button>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-700 dark:bg-red-900/20" role="alert">
            Error: {error.message}
          </div>
        )}

        {/* Announce result count to screen readers whenever results change */}
        {!isLoading && (
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {query
              ? `${courses.length} course${courses.length !== 1 ? 's' : ''} found for "${query}"`
              : `${courses.length} course${courses.length !== 1 ? 's' : ''} found`}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" role="grid" aria-label="Courses list">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <CourseSkeletonCard key={i} />)
            : courses.length === 0
            ? <p className="col-span-3 text-gray-500 dark:text-gray-400">No courses match those filters.</p>
            : courses.map((course, i) => (
                <CourseCard key={course.id} course={course} observerRef={i === courses.length - 1 ? observerRef : undefined} />
              ))}
        </div>

        {isLoadingMore && (
          <div className="flex justify-center py-8" aria-live="polite">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
              Loading more courses...
            </div>
          </div>
        )}
        {!isLoading && !hasMore && courses.length > 0 && (
          <p className="text-center py-8 text-gray-500 dark:text-gray-400">You've reached the end of the list.</p>
        )}
      </main>
      <CompareBar />
      <BackToTopButton />
    </ProtectedRoute>
  );
}
