'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ThreadList } from '@/components/forum/ThreadList';
import { RichTextEditor } from '@/components/forum/RichTextEditor';
import { Button } from '@/components/ui/Button';
import { forumApi } from '@/lib/forumApi';

interface ForumPageProps {
  params: { id: string };
}

export default function ForumPage({ params }: ForumPageProps) {
  const courseId = params.id;
  const [showNewThread, setShowNewThread] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('General');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listKey, setListKey] = useState(0);

  async function handleCreateThread(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await forumApi.createThread(courseId, { title, body, category });
      setTitle('');
      setBody('');
      setShowNewThread(false);
      setListKey((k) => k + 1);
    } catch {
      setError('Failed to create thread. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href={`/courses/${courseId}`} className="text-blue-600 hover:underline text-sm">
            ← Back to Course
          </Link>
          <h1 className="text-2xl font-bold mt-1">Discussion Forum</h1>
        </div>
        <Button onClick={() => setShowNewThread((v) => !v)}>
          {showNewThread ? 'Cancel' : 'New Thread'}
        </Button>
      </div>

      {showNewThread && (
        <form onSubmit={handleCreateThread} className="border rounded-xl p-6 mb-6 space-y-4 bg-gray-50">
          <h2 className="font-semibold">Create New Thread</h2>
          <input
            type="text"
            placeholder="Thread title"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
          />
          <select
            className="border rounded-lg px-2 py-2 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Thread category"
          >
            {['General', 'Questions', 'Announcements', 'Resources'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <RichTextEditor value={body} onChange={setBody} placeholder="Write your post…" />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button type="submit" disabled={loading || !title.trim() || !body.trim()}>
            {loading ? 'Posting…' : 'Post Thread'}
          </Button>
        </form>
      )}

      <ThreadList key={listKey} courseId={courseId} />
    </main>
  );
}
