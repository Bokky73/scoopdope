'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWRInfinite from 'swr/infinite';
import {
  LANGUAGES,
  DURATIONS,
  PRICE_RANGES,
  SORT_OPTIONS,
  RATING_FILTERS,
  ENROLLMENT_RANGES,
  DATE_RANGES,
  useDebounce,
  type SortOption,
} from './courses.config';
import type { Course } from '@/components/courses/CourseCard';

type CoursesResponse = { data: Course[]; total: number; page: number; limit: number };

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error('Failed to fetch courses');
    return r.json();
  });

export function useCoursesFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Basic filters
  const [query, setQuery] = useState(() => searchParams.get('search') ?? '');
  const [level, setLevel] = useState(() => searchParams.get('level') ?? '');
  const [language, setLanguage] = useState(() => searchParams.get('language') ?? '');
  const [category, setCategory] = useState(() => searchParams.get('category') ?? '');
  const [duration, setDuration] = useState(() => searchParams.get('duration') ?? '');
  const [price, setPrice] = useState(() => searchParams.get('price') ?? '');
  const [sort, setSort] = useState<SortOption>(
    () => (searchParams.get('sort') as SortOption) ?? 'newest',
  );

  // Advanced filters
  const [instructor, setInstructor] = useState(() => searchParams.get('instructor') ?? '');
  const [minRating, setMinRating] = useState(() => searchParams.get('minRating') ?? '');
  const [enrollmentRange, setEnrollmentRange] = useState(
    () => searchParams.get('enrollmentRange') ?? '',
  );
  const [dateRange, setDateRange] = useState(() => searchParams.get('dateRange') ?? '');

  const dq = useDebounce(query);
  const dInstructor = useDebounce(instructor);

  const pushUrl = useCallback(
    (overrides: Record<string, string> = {}) => {
      const p = new URLSearchParams();
      const v = {
        search: dq,
        level,
        language,
        category,
        duration,
        sort,
        price,
        instructor: dInstructor,
        minRating,
        enrollmentRange,
        dateRange,
        ...overrides,
      };
      if (v.search?.trim()) p.set('search', v.search.trim());
      if (v.level) p.set('level', v.level);
      if (v.language) p.set('language', v.language);
      if (v.category) p.set('category', v.category);
      if (v.duration) p.set('duration', v.duration);
      if (v.price) p.set('price', v.price);
      if (v.sort !== 'newest') p.set('sort', v.sort);
      if (v.instructor) p.set('instructor', v.instructor);
      if (v.minRating) p.set('minRating', v.minRating);
      if (v.enrollmentRange) p.set('enrollmentRange', v.enrollmentRange);
      if (v.dateRange) p.set('dateRange', v.dateRange);
      router.push(`/courses?${p.toString()}`, { scroll: false });
    },
    [dq, level, language, category, duration, sort, price, dInstructor, minRating, enrollmentRange, dateRange, router],
  );

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    pushUrl({ search: dq });
  }, [dq]); // eslint-disable-line react-hooks/exhaustive-deps

  // Also push when instructor debounce settles
  const isFirstInstructor = useRef(true);
  useEffect(() => {
    if (isFirstInstructor.current) {
      isFirstInstructor.current = false;
      return;
    }
    pushUrl({ instructor: dInstructor });
  }, [dInstructor]); // eslint-disable-line react-hooks/exhaustive-deps

  function applyFilter(key: string, value: string) {
    switch (key) {
      case 'level': setLevel(value); break;
      case 'language': setLanguage(value); break;
      case 'category': setCategory(value); break;
      case 'duration': setDuration(value); break;
      case 'price': setPrice(value); break;
      case 'sort': setSort(value as SortOption); break;
      case 'instructor': setInstructor(value); return; // debounced push handles it
      case 'minRating': setMinRating(value); break;
      case 'enrollmentRange': setEnrollmentRange(value); break;
      case 'dateRange': setDateRange(value); break;
    }
    pushUrl({ [key]: value });
  }

  const clearAll = () => {
    setLevel('');
    setLanguage('');
    setCategory('');
    setDuration('');
    setPrice('');
    setSort('newest');
    setInstructor('');
    setMinRating('');
    setEnrollmentRange('');
    setDateRange('');
    router.push('/courses', { scroll: false });
  };

  const getKey = (pageIndex: number, prev: CoursesResponse | null) => {
    if (prev && prev.data.length === 0) return null;
    const p = new URLSearchParams();
    if (dq.trim()) p.set('search', dq.trim());
    if (level) p.set('level', level);
    if (language) p.set('language', language);
    if (category) p.set('category', category);
    if (sort) p.set('sort', sort);

    // Duration → durationMin/durationMax
    if (duration) {
      const [mn, mx] = duration.split('-');
      p.set('durationMin', mn);
      p.set('durationMax', mx);
    }

    // Price → priceMin/priceMax
    if (price) {
      if (price === 'free') {
        p.set('priceMax', '0');
      } else {
        const [mn, mx] = price.split('-');
        p.set('priceMin', mn);
        p.set('priceMax', mx);
      }
    }

    // Advanced filters
    if (dInstructor) p.set('instructor', dInstructor);
    if (minRating) p.set('minRating', minRating);

    // Enrollment range → minEnrollments/maxEnrollments
    if (enrollmentRange) {
      const [mn, mx] = enrollmentRange.split('-');
      p.set('minEnrollments', mn);
      p.set('maxEnrollments', mx);
    }

    // Date range → publishedAfter
    if (dateRange) {
      const days = parseInt(dateRange, 10);
      const after = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      p.set('publishedAfter', after);
    }

    p.set('page', String(pageIndex + 1));
    p.set('limit', '9');
    return `/courses?${p.toString()}`;
  };

  const filterKey = `${dq}-${level}-${language}-${category}-${duration}-${price}-${sort}-${dInstructor}-${minRating}-${enrollmentRange}-${dateRange}`;

  const { data, error, isLoading, isValidating, size, setSize } =
    useSWRInfinite<CoursesResponse>(getKey, fetcher, {
      revalidateOnFocus: false,
      revalidateFirstPage: false,
    });

  useEffect(() => {
    setSize(1);
  }, [filterKey, setSize]);

  const courses = data ? data.flatMap((p) => p.data) : [];
  const isLoadingMore = isValidating && size > 1;
  const hasMore = !!(data && data[data.length - 1]?.data.length === 9);

  const activeFilters = [
    ...(level ? [{ label: `Level: ${level}`, clear: () => applyFilter('level', '') }] : []),
    ...(language
      ? [{ label: `Language: ${LANGUAGES.find((l) => l.value === language)?.label ?? language}`, clear: () => applyFilter('language', '') }]
      : []),
    ...(category ? [{ label: `Category: ${category}`, clear: () => applyFilter('category', '') }] : []),
    ...(duration
      ? [{ label: `Duration: ${DURATIONS.find((d) => d.value === duration)?.label ?? duration}`, clear: () => applyFilter('duration', '') }]
      : []),
    ...(price
      ? [{ label: `Price: ${PRICE_RANGES.find((p) => p.value === price)?.label ?? price}`, clear: () => applyFilter('price', '') }]
      : []),
    ...(sort !== 'newest'
      ? [{ label: `Sort: ${SORT_OPTIONS.find((s) => s.value === sort)?.label}`, clear: () => applyFilter('sort', 'newest') }]
      : []),
    ...(instructor ? [{ label: `Instructor: ${instructor}`, clear: () => applyFilter('instructor', '') }] : []),
    ...(minRating
      ? [{ label: `Rating: ${RATING_FILTERS.find((r) => r.value === minRating)?.label ?? `${minRating}★+`}`, clear: () => applyFilter('minRating', '') }]
      : []),
    ...(enrollmentRange
      ? [{ label: `Enrollment: ${ENROLLMENT_RANGES.find((e) => e.value === enrollmentRange)?.label ?? enrollmentRange}`, clear: () => applyFilter('enrollmentRange', '') }]
      : []),
    ...(dateRange
      ? [{ label: `Published: ${DATE_RANGES.find((d) => d.value === dateRange)?.label ?? `Last ${dateRange} days`}`, clear: () => applyFilter('dateRange', '') }]
      : []),
  ];

  return {
    query,
    setQuery,
    level,
    language,
    category,
    duration,
    price,
    sort,
    dq,
    instructor,
    minRating,
    enrollmentRange,
    dateRange,
    applyFilter,
    clearAll,
    activeFilters,
    courses,
    error,
    isLoading,
    isLoadingMore,
    hasMore,
    size,
    setSize,
  };
}
