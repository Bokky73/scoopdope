'use client';

import { useEffect, useState } from 'react';
import {
  LEVELS,
  CATEGORIES,
  LANGUAGES,
  DURATIONS,
  PRICE_RANGES,
  SORT_OPTIONS,
  RATING_FILTERS,
  ENROLLMENT_RANGES,
  DATE_RANGES,
  type SortOption,
} from '@/app/courses/courses.config';
import api from '@/lib/api';

const cls =
  'rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500';

type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  iconName: string | null;
};

type Props = {
  level: string;
  language: string;
  category: string;
  duration: string;
  price: string;
  sort: SortOption;
  instructor: string;
  minRating: string;
  enrollmentRange: string;
  dateRange: string;
  onChange: (key: string, value: string) => void;
};

export function CourseFilters({ level, language, category, duration, price, sort, onChange }: Props) {
  const [apiCategories, setApiCategories] = useState<ApiCategory[]>([]);

  // Fetch categories once; falls back to empty (no filter options shown) on error.
  useEffect(() => {
    api.get<ApiCategory[]>('/v1/categories')
      .then((res) => setApiCategories(res.data))
      .catch(() => {
        // Silently fall back — the filter just won't show category options.
      });
  }, []);

  return (
    <div className="flex flex-wrap gap-3">
      <select value={level} onChange={(e) => onChange('level', e.target.value)} className={cls} aria-label="Filter by level">
        <option value="">All Levels</option>
        {LEVELS.map((l) => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
      </select>

      <select value={language} onChange={(e) => onChange('language', e.target.value)} className={cls} aria-label="Filter by language">
        <option value="">All Languages</option>
        {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
      </select>

      {/* Category filter — populated from the API so icons & names are always in sync */}
      <select value={category} onChange={(e) => onChange('category', e.target.value)} className={cls} aria-label="Filter by category">
        <option value="">All Categories</option>
        {apiCategories.map((c) => (
          <option key={c.slug} value={c.slug}>
            {/* <option> elements cannot render HTML, so we compose a text label */}
            {c.iconName ? `${c.name}` : c.name}
          </option>
        ))}
      </select>

      {/* Category icon legend — shown beneath the filter when categories are loaded */}
      {apiCategories.length > 0 && (
        <div className="w-full flex flex-wrap gap-2 -mt-1">
          {apiCategories.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => onChange('category', category === c.slug ? '' : c.slug)}
              aria-pressed={category === c.slug}
              aria-label={`Filter by ${c.name}`}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-colors
                ${category === c.slug
                  ? 'bg-blue-600 border-blue-600 text-white dark:bg-blue-500 dark:border-blue-500'
                  : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              {c.iconName && (
                <i className={`fa-solid ${c.iconName} text-[10px]`} aria-hidden="true" />
              )}
              {c.name}
            </button>
          ))}
        </div>
      )}

      <select value={duration} onChange={(e) => onChange('duration', e.target.value)} className={cls} aria-label="Filter by duration">
        <option value="">Any Duration</option>
        {DURATIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
      </select>

      <select value={price} onChange={(e) => onChange('price', e.target.value)} className={cls} aria-label="Filter by price">
        <option value="">Any Price</option>
        {PRICE_RANGES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
      </select>

      <select value={sort} onChange={(e) => onChange('sort', e.target.value)} className={cls} aria-label="Sort courses">
        {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
    </div>
  );
}

