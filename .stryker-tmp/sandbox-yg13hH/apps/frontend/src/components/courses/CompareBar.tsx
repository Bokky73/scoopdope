'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCompareStore, ComparableCourse } from '@/store/compare.store';

function CompareView({ courses, onClose }: { courses: ComparableCourse[]; onClose: () => void }) {
  const rows: { label: string; key: keyof ComparableCourse; format?: (v: unknown) => string }[] = [
    { label: 'Level', key: 'level' },
    { label: 'Category', key: 'category' },
    { label: 'Duration', key: 'durationHours', format: (v) => (v != null ? `${v}h` : '—') },
    { label: 'Price', key: 'price', format: (v) => (v == null ? '—' : v === 0 ? 'Free' : `$${v}`) },
    { label: 'Rating', key: 'rating', format: (v) => (v != null ? `★ ${v}` : '—') },
    { label: 'Modules', key: 'moduleCount', format: (v) => (v != null ? String(v) : '—') },
    { label: 'Prerequisites', key: 'prerequisites', format: (v) => (Array.isArray(v) && v.length ? (v as string[]).join(', ') : 'None') },
    { label: 'Enrollments', key: 'enrollments', format: (v) => (v != null ? String(v) : '—') },
  ];

  const differs = (key: keyof ComparableCourse) => {
    const vals = courses.map((c) => JSON.stringify(c[key]));
    return new Set(vals).size > 1;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Compare Courses</h2>
          <button onClick={onClose} aria-label="Close comparison" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl leading-none">✕</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4 text-gray-500 dark:text-gray-400 font-medium w-28">Attribute</th>
                {courses.map((c) => (
                  <th key={c.id} className="p-4 text-left">
                    <p className="font-semibold text-gray-900 dark:text-white">{c.title}</p>
                    {c.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-normal mt-1 line-clamp-2">{c.description}</p>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ label, key, format }) => (
                <tr key={key} className={`border-b border-gray-100 dark:border-gray-800 ${differs(key) ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}`}>
                  <td className="p-4 text-gray-500 dark:text-gray-400 font-medium">{label}</td>
                  {courses.map((c) => (
                    <td key={c.id} className="p-4 text-gray-900 dark:text-gray-100">
                      {format ? format(c[key]) : (c[key] as string) ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="p-4 text-gray-500 dark:text-gray-400 font-medium">Enroll</td>
                {courses.map((c) => (
                  <td key={c.id} className="p-4">
                    <Link
                      href={`/courses/${c.id}`}
                      className="inline-block px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                      onClick={onClose}
                    >
                      Enroll →
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function CompareBar() {
  const { selected, remove, clear } = useCompareStore();
  const [open, setOpen] = useState(false);

  if (selected.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg px-6 py-3 flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Compare ({selected.length}/3):
        </span>
        {selected.map((c) => (
          <span key={c.id} className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs px-2 py-1 rounded-full">
            {c.title}
            <button onClick={() => remove(c.id)} aria-label={`Remove ${c.title} from comparison`} className="hover:text-blue-900 dark:hover:text-blue-100">✕</button>
          </span>
        ))}
        <div className="ml-auto flex gap-2">
          <button onClick={clear} className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline">
            Clear
          </button>
          <button
            onClick={() => setOpen(true)}
            disabled={selected.length < 2}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
          >
            Compare Now
          </button>
        </div>
      </div>
      {open && <CompareView courses={selected} onClose={() => setOpen(false)} />}
    </>
  );
}
