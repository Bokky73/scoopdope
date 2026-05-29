'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { toast } from '@/lib/toast';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Video, Trash2, Plus } from 'lucide-react';

interface LiveSession {
  id: string;
  title: string;
  description?: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingUrl?: string;
  status: 'scheduled' | 'cancelled' | 'completed';
}

const empty = { title: '', description: '', scheduledAt: '', durationMinutes: 60, meetingUrl: '' };

export default function InstructorLiveSessionsPage() {
  const { cohortId } = useParams<{ cohortId: string }>();
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get(`/v1/cohorts/${cohortId}/live-sessions`);
      setSessions(data);
    } catch {
      toast.error('Failed to load sessions');
    }
  };

  useEffect(() => { load(); }, [cohortId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/v1/cohorts/${cohortId}/live-sessions`, {
        ...form,
        durationMinutes: Number(form.durationMinutes),
        meetingUrl: form.meetingUrl || undefined,
        description: form.description || undefined,
      });
      toast.success('Session scheduled — calendar invites sent');
      setForm(empty);
      load();
    } catch {
      toast.error('Failed to schedule session');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this session?')) return;
    try {
      await api.delete(`/v1/cohorts/${cohortId}/live-sessions/${id}`);
      toast.success('Session cancelled');
      load();
    } catch {
      toast.error('Failed to cancel session');
    }
  };

  return (
    <ProtectedRoute>
      <main className="max-w-3xl mx-auto p-8 space-y-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Video className="w-6 h-6 text-blue-500" /> Live Sessions
        </h1>

        {/* Schedule form */}
        <section className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <Plus className="w-4 h-4" /> Schedule a Session
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Week 3 Live Q&A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date & Time *</label>
                <input
                  required
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  min={1}
                  value={form.durationMinutes}
                  onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zoom / Google Meet URL</label>
              <input
                type="url"
                value={form.meetingUrl}
                onChange={(e) => setForm((f) => ({ ...f, meetingUrl: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://zoom.us/j/..."
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 text-white px-5 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Scheduling…' : 'Schedule & Send Invites'}
            </button>
          </form>
        </section>

        {/* Session list */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Sessions</h2>
          {sessions.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No sessions scheduled yet.</p>
          ) : (
            sessions.map((s) => <SessionCard key={s.id} session={s} onCancel={() => handleCancel(s.id)} />)
          )}
        </section>
      </main>
    </ProtectedRoute>
  );
}

function SessionCard({ session, onCancel }: { session: LiveSession; onCancel: () => void }) {
  const date = new Date(session.scheduledAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  const statusColor = session.status === 'scheduled' ? 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
    : session.status === 'cancelled' ? 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400'
    : 'text-gray-500 bg-gray-100 dark:bg-gray-800';

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 flex items-start justify-between gap-4">
      <div className="space-y-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-white">{session.title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{date} · {session.durationMinutes} min</p>
        {session.meetingUrl && (
          <a href={session.meetingUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline truncate block">
            {session.meetingUrl}
          </a>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusColor}`}>{session.status}</span>
        {session.status === 'scheduled' && (
          <button onClick={onCancel} className="text-gray-400 hover:text-red-500 transition-colors" title="Cancel session">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
