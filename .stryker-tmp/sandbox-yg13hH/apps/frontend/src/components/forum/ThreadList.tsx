'use client';
import { useEffect, useRef, useState } from 'react';
import { forumApi, Thread, ThreadSort } from '@/lib/forumApi';
import { ThreadCard } from './ThreadCard';
import { Button } from '@/components/ui/Button';

interface ThreadListProps {
  courseId: string;
}

const SORT_OPTIONS: { value: ThreadSort; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'upvoted', label: 'Most Upvoted' },
  { value: 'replies', label: 'Most Replies' },
];

const CATEGORIES = ['All', 'General', 'Questions', 'Announcements', 'Resources'];

export function ThreadList({ courseId }: ThreadListProps) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [sort, setSort] = useState<ThreadSort>('newest');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function load(p: number, s: ThreadSort, q: string, cat: string) {
    setLoading(true);
    forumApi.getThreads(courseId, s, q || undefined, cat !== 'All' ? cat : undefined).then((data) => {
      setThreads(data.threads);
      setTotal(data.total);
      setLoading(false);
    });
  }

  useEffect(() => { load(page, sort, search, category); }, [sort, category, page]);

  function handleSearch(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setPage(1); load(1, sort, value, category); }, 300);
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="search"
          placeholder="Search threads…"
          className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          aria-label="Search threads"
        />
        <select
          className="border rounded-lg px-2 py-2 text-sm"
          value={sort}
          onChange={(e) => { setSort(e.target.value as ThreadSort); setPage(1); }}
          aria-label="Sort threads"
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => { setCategory(cat); setPage(1); }}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              category === cat ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-600 hover:border-blue-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse border rounded-lg p-4 h-20 bg-gray-50" />
          ))}
        </div>
      ) : threads.length === 0 ? (
        <p className="text-gray-500 text-sm">No threads found.</p>
      ) : (
        <ul className="space-y-3">
          {threads.map((t) => (
            <li key={t.id}><ThreadCard thread={t} courseId={courseId} /></li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="flex gap-2 items-center text-sm">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span>{page} / {totalPages}</span>
          <Button variant="outline" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
