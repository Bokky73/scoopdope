'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Video, ExternalLink, Clock } from 'lucide-react';

interface LiveSession {
  id: string;
  title: string;
  description?: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingUrl?: string;
  status: 'scheduled' | 'cancelled' | 'completed';
}

export default function StudentLiveSessionsPage() {
  const { cohortId } = useParams<{ cohortId: string }>();
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/v1/cohorts/${cohortId}/live-sessions`)
      .then(({ data }) => setSessions(data))
      .finally(() => setLoading(false));
  }, [cohortId]);

  const upcoming = sessions.filter((s) => s.status === 'scheduled' && new Date(s.scheduledAt) > new Date());
  const past = sessions.filter((s) => s.status === 'completed' || new Date(s.scheduledAt) <= new Date());

  return (
    <main className="max-w-2xl mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <Video className="w-6 h-6 text-blue-500" /> Live Sessions
      </h1>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-20 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />)}
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300">Upcoming</h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming sessions.</p>
            ) : (
              upcoming.map((s) => <SessionCard key={s.id} session={s} />)
            )}
          </section>

          {past.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300">Past</h2>
              {past.map((s) => <SessionCard key={s.id} session={s} />)}
            </section>
          )}
        </>
      )}
    </main>
  );
}

function SessionCard({ session }: { session: LiveSession }) {
  const date = new Date(session.scheduledAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  const isLive = session.status === 'scheduled' && Math.abs(new Date(session.scheduledAt).getTime() - Date.now()) < 30 * 60_000;

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{session.title}</p>
          {session.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{session.description}</p>}
        </div>
        {isLive && (
          <span className="shrink-0 text-xs font-semibold text-white bg-red-500 px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
        )}
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{date}</span>
        <span>{session.durationMinutes} min</span>
      </div>
      {session.meetingUrl && session.status === 'scheduled' && (
        <a
          href={session.meetingUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg"
        >
          <ExternalLink className="w-3.5 h-3.5" /> Join Session
        </a>
      )}
      {session.status === 'cancelled' && (
        <span className="text-xs text-red-500 font-medium">Cancelled</span>
      )}
    </div>
  );
}
