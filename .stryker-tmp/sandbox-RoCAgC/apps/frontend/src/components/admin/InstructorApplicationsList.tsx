// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Application {
  id: string;
  userId: string;
  bio: string;
  expertise: string;
  motivation: string;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  status: 'pending' | 'approved' | 'rejected';
  adminNote: string | null;
  createdAt: string;
  user?: { email: string; username: string };
}

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export function InstructorApplicationsList() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('pending');
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<Application[]>(
        `/v1/instructor-applications${filter ? `?status=${filter}` : ''}`
      );
      setApplications(res.data);
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api.patch(`/v1/instructor-applications/${id}/review`, {
        status,
        adminNote: note || undefined,
      });
      setReviewing(null);
      setNote('');
      load();
    } catch {
      // error handled by api interceptor
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {['pending', 'approved', 'rejected', ''].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === s
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">No applications found.</p>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                      {app.user?.username ?? app.userId}
                    </span>
                    <span className="text-xs text-gray-400">{app.user?.email}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[app.status]}`}
                    >
                      {app.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <strong>Expertise:</strong> {app.expertise}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{app.bio}</p>
                  {app.adminNote && (
                    <p className="mt-2 text-xs text-gray-400 italic">Note: {app.adminNote}</p>
                  )}
                </div>

                {app.status === 'pending' && (
                  <div className="flex-shrink-0">
                    {reviewing === app.id ? (
                      <div className="flex flex-col gap-2 w-48">
                        <input
                          type="text"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="Optional note…"
                          className="text-xs rounded border border-gray-300 dark:border-gray-600 px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReview(app.id, 'approved')}
                            className="flex-1 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReview(app.id, 'rejected')}
                            className="flex-1 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                        <button
                          onClick={() => { setReviewing(null); setNote(''); }}
                          className="text-xs text-gray-400 hover:text-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReviewing(app.id)}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Review
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
