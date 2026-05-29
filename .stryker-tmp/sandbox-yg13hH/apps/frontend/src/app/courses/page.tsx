'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWRInfinite from 'swr/infinite';
import Link from 'next/link';
import Image from 'next/image';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useBookmarksStore } from '@/store/bookmarks.store';
import { useCompareStore } from '@/store/compare.store';
import { CompareBar } from '@/components/courses/CompareBar';
import { BundleCard } from '@/components/ui/BundleCard';
import api from '@/lib/api';
import { toast } from '@/lib/toast';

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error('Failed to fetch courses');
    return res.json();
  });

type Course = {
  id: string;
  title: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  language?: string;
  category?: string;
  durationHours?: number;
  price?: number;
  rating?: number;
  enrollments?: number;
  description?: string;
  thumbnailUrl?: string;
};

type CoursesResponse = { data: Course[]; total: number; page: number; limit: number };

type SortOption = 'newest' | 'popular' | 'rating';

const LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
const CATEGORIES = ['Blockchain', 'DeFi', 'Smart Contracts', 'Web3', 'Stellar'] as const;
const LANGUAGES = [
  { label: 'English', value: 'en' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'Arabic', value: 'ar' },
] as const;
const DURATIONS = [
  { label: '< 2h', value: '0-2' },
  { label: '2–5h', value: '2-5' },
  { label: '5–10h', value: '5-10' },
  { label: '10h+', value: '10-999' },
];
const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Newest', value: 'newest' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Top Rated', value: 'rating' },
];

function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function SkeletonCard() {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900 animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs px-3 py-1">
      {label}
      <button onClick={onRemove} aria-label={`Remove ${label} filter`} className="hover:text-blue-900 dark:hover:text-blue-100">✕</button>
    </span>
  );
}

function BookmarkButton({ course }: { course: Course }) {
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarksStore();
  const bookmarked = isBookmarked(course.id);
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        bookmarked ? removeBookmark(course.id) : addBookmark(course);
      }}
      aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark course'}
      aria-pressed={bookmarked}
      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      <svg className={`w-4 h-4 ${bookmarked ? 'fill-blue-500 text-blue-500' : 'fill-none text-gray-400'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    </button>
  );
}

function CompareCheckbox({ course }: { course: Course }) {
  const { isSelected, toggle, isFull } = useCompareStore();
  const selected = isSelected(course.id);
  const full = isFull();
  return (
    <label className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={selected}
        disabled={!selected && full}
        onChange={() => toggle(course)}
        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
        aria-label={`Compare ${course.title}`}
      />
      Compare
    </label>
  );
}

function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors z-50"
      aria-label="Back to top"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  );
}

export default function CoursesPage() {
  const [bundles, setBundles] = useState<any[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchBookmarks } = useBookmarksStore();
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchBookmarks(); }, [fetchBookmarks]);

  useEffect(() => {
    api.get('/bundles').then((res) => {
      setBundles(res.data);
    }).catch(() => {});
  }, []);

  // Scroll position preservation
  useEffect(() => {
    const scrollPos = sessionStorage.getItem('courses-scroll-pos');
    if (scrollPos) {
      window.scrollTo(0, parseInt(scrollPos, 10));
      sessionStorage.removeItem('courses-scroll-pos');
    }

    const handleBeforeUnload = () => {
      sessionStorage.setItem('courses-scroll-pos', window.pageYOffset.toString());
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Read initial state from URL
  const [query, setQuery] = useState(() => searchParams.get('search') ?? '');
  const [level, setLevel] = useState(() => searchParams.get('level') ?? '');
  const [language, setLanguage] = useState(() => searchParams.get('language') ?? '');
  const [category, setCategory] = useState(() => searchParams.get('category') ?? '');
  const [duration, setDuration] = useState(() => searchParams.get('duration') ?? '');
  const [sort, setSort] = useState<SortOption>(() => (searchParams.get('sort') as SortOption) ?? 'newest');

  const debouncedQuery = useDebounce(query);

  // Sync URL when filters change
  const pushUrl = useCallback(
    (overrides: Record<string, string> = {}) => {
      const p = new URLSearchParams();
      const q = overrides.search ?? debouncedQuery;
      const l = overrides.level ?? level;
      const lang = overrides.language ?? language;
      const c = overrides.category ?? category;
      const d = overrides.duration ?? duration;
      const s = overrides.sort ?? sort;
      if (q.trim()) p.set('search', q.trim());
      if (l) p.set('level', l);
      if (lang) p.set('language', lang);
      if (c) p.set('category', c);
      if (d) p.set('duration', d);
      if (s !== 'newest') p.set('sort', s);
      router.push(`/courses?${p.toString()}`, { scroll: false });
    },
    [debouncedQuery, level, language, category, duration, sort, router]
  );

  // Push URL on debounced query change
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    pushUrl({ search: debouncedQuery });
  }, [debouncedQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const filterKey = `${debouncedQuery}-${level}-${language}-${category}-${duration}-${sort}`;

  const getKey = (pageIndex: number, previousPageData: CoursesResponse | null) => {
    if (previousPageData && previousPageData.data.length === 0) return null; // reached the end
    const p = new URLSearchParams();
    if (debouncedQuery.trim()) p.set('search', debouncedQuery.trim());
    if (level) p.set('level', level);
    if (language) p.set('language', language);
    if (category) p.set('category', category);
    if (duration) { const [min, max] = duration.split('-'); p.set('durationMin', min); p.set('durationMax', max); }
    p.set('sort', sort);
    p.set('page', String(pageIndex + 1));
    p.set('limit', '9');
    return `/courses?${p.toString()}`;
  };

  const { data, error, isLoading, isValidating, size, setSize } = useSWRInfinite<CoursesResponse>(
    getKey,
    fetcher,
    { revalidateOnFocus: false, revalidateFirstPage: false }
  );

  // Reset size when filters change
  useEffect(() => {
    setSize(1);
  }, [filterKey, setSize]);

  const courses = data ? data.flatMap(page => page.data) : [];
  const isLoadingMore = isValidating && size > 1;
  const hasMore = data && data[data.length - 1]?.data.length === 9; // assuming limit is 9

  // Intersection observer for loading more
  useEffect(() => {
    if (!observerRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          setSize(size + 1);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, size, setSize]);

  function applyFilter(key: string, value: string) {
    const updates: Record<string, string> = { [key]: value };
    if (key === 'level') setLevel(value);
    if (key === 'language') setLanguage(value);
    if (key === 'category') setCategory(value);
    if (key === 'duration') setDuration(value);
    if (key === 'sort') setSort(value as SortOption);
    pushUrl(updates);
  }

  // Active filter chips
  const activeFilters: { label: string; clear: () => void }[] = [
    ...(level ? [{ label: `Level: ${level}`, clear: () => applyFilter('level', '') }] : []),
    ...(language ? [{ label: `Language: ${LANGUAGES.find((l) => l.value === language)?.label ?? language}`, clear: () => applyFilter('language', '') }] : []),
    ...(category ? [{ label: `Category: ${category}`, clear: () => applyFilter('category', '') }] : []),
    ...(duration ? [{ label: `Duration: ${DURATIONS.find((d) => d.value === duration)?.label ?? duration}`, clear: () => applyFilter('duration', '') }] : []),
    ...(sort !== 'newest' ? [{ label: `Sort: ${SORT_OPTIONS.find((s) => s.value === sort)?.label}`, clear: () => applyFilter('sort', 'newest') }] : []),
  ];

  const clearAll = () => {
    setLevel(''); setLanguage(''); setCategory(''); setDuration(''); setSort('newest');
    router.push('/courses', { scroll: false });
  };

  const handlePurchaseBundle = async (bundle: any) => {
    try {
      await api.post(`/bundles/${bundle.id}/purchase`);
      toast.success(`Successfully purchased ${bundle.title}!`);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to purchase bundle');
    }
  };

  return (
    <ProtectedRoute>
      <main className="max-w-5xl mx-auto p-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Courses</h1>

        {/* Bundles Section */}
        {bundles.length > 0 && !debouncedQuery && !level && !language && !category && !duration && (
          <section className="space-y-4 mb-12">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Course Bundles</h2>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">Special Offers</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bundles.map((bundle) => (
                <BundleCard
                  key={bundle.id}
                  bundle={bundle}
                  onViewDetails={() => router.push(`/bundles/${bundle.id}`)}
                  onPurchase={handlePurchaseBundle}
                />
              ))}
            </div>
            <div className="border-b dark:border-gray-800 pb-8" />
          </section>
        )}

        {/* Search */}
        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses…"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Search courses"
          />
          <svg className="absolute left-3 top-3 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-3">
          <select value={level} onChange={(e) => applyFilter('level', e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
            aria-label="Filter by level">
            <option value="">All Levels</option>
            {LEVELS.map((l) => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
          </select>

          <select value={language} onChange={(e) => applyFilter('language', e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
            aria-label="Filter by language">
            <option value="">All Languages</option>
            {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>

          <select value={category} onChange={(e) => applyFilter('category', e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
            aria-label="Filter by category">
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select value={duration} onChange={(e) => applyFilter('duration', e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
            aria-label="Filter by duration">
            <option value="">Any Duration</option>
            {DURATIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>

          <select value={sort} onChange={(e) => applyFilter('sort', e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
            aria-label="Sort courses">
            {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* Active Filter Chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            {activeFilters.map((f) => (
              <FilterChip key={f.label} label={f.label} onRemove={f.clear} />
            ))}
            <button onClick={clearAll} className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline">
              Clear all
            </button>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-700 dark:bg-red-900/20" role="alert">
            Error: {error.message}
          </div>
        )}

        {/* Results */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" role="grid" aria-label="Courses list">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : courses.length === 0
            ? <p className="col-span-3 text-gray-500 dark:text-gray-400">No courses match those filters.</p>
            : courses.map((course, index) => (
                <div
                  key={course.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900 flex flex-col gap-2"
                  ref={index === courses.length - 1 ? observerRef : null}
                  role="gridcell"
                >
                  {course.thumbnailUrl && (
                    <div className="relative w-full h-36">
                      <Image
                        src={course.thumbnailUrl}
                        alt={course.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-5 flex flex-col gap-2 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-snug">{course.title}</h2>
                    <BookmarkButton course={course} />
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <span className="capitalize">{course.level}</span>
                    {course.language && <><span>·</span><span className="uppercase">{course.language}</span></>}
                    {course.category && <><span>·</span><span>{course.category}</span></>}
                    {course.durationHours != null && <><span>·</span><span>{course.durationHours}h</span></>}
                    {course.rating != null && <><span>·</span><span>★ {course.rating}</span></>}
                  </div>
                  {course.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{course.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <CompareCheckbox course={course} />
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
                </div>
              ))}
        </div>

        {/* Loading indicator */}
        {isLoadingMore && (
          <div className="flex justify-center py-8" aria-live="polite">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Loading more courses...
            </div>
          </div>
        )}

        {/* No more courses indicator */}
        {!isLoading && !hasMore && courses.length > 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            You've reached the end of the list.
          </div>
        )}
      </main>
      <CompareBar />
      <BackToTopButton />
    </ProtectedRoute>
  );
}
