'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { toast } from '@/lib/toast';

interface Announcement {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  instructor?: { username?: string; email?: string };
}

interface AnnouncementsPanelProps {
  courseId: string;
  isInstructor?: boolean;
}

export function AnnouncementsPanel({ courseId, isInstructor }: AnnouncementsPanelProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    const res = await api.get<Announcement[]>('/v1/announcements', { params: { courseId } });
    setAnnouncements(res.data);
    setLoading(false);
  }, [courseId]);

  useEffect(() => { refresh(); }, [refresh]);

  const create = async () => {
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/v1/announcements', { courseId, title, body });
      setTitle('');
      setBody('');
      toast.success('Announcement sent to all enrolled students!');
      await refresh();
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    await api.delete(`/v1/announcements/${id}`);
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    toast.success('Announcement deleted.');
  };

  return (
    <div className="space-y-6">
      {isInstructor && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <h3 className="text-sm font-semibold">New Announcement</h3>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your announcement…"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            onClick={create}
            disabled={submitting || !title.trim() || !body.trim()}
            className="text-sm"
          >
            {submitting ? 'Sending…' : 'Send to All Students'}
          </Button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading announcements…</p>
      ) : announcements.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No announcements yet.</p>
      ) : (
        <ul className="space-y-4">
          {announcements.map((a) => (
            <li key={a.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-semibold">{a.title}</h4>
                {isInstructor && (
                  <button
                    onClick={() => remove(a.id)}
                    className="text-xs text-red-400 hover:text-red-600 shrink-0"
                    aria-label="Delete announcement"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{a.body}</p>
              <p className="text-xs text-gray-400">
                {a.instructor?.username ?? a.instructor?.email} ·{' '}
                {new Date(a.createdAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
