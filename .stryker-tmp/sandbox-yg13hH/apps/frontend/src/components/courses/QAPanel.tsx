'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { toast } from '@/lib/toast';

interface QaQuestion {
  id: string;
  body: string;
  upvotes: number;
  answer: string | null;
  answeredAt: string | null;
  timestampSeconds: number | null;
  createdAt: string;
  user?: { username?: string; email?: string };
}

interface QAPanelProps {
  courseId: string;
  instructorId?: string;
  isInstructor?: boolean;
  currentUserId?: string;
}

export function QAPanel({ courseId, instructorId, isInstructor, currentUserId }: QAPanelProps) {
  const [questions, setQuestions] = useState<QaQuestion[]>([]);
  const [body, setBody] = useState('');
  const [answerMap, setAnswerMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    const res = await api.get<QaQuestion[]>('/v1/qa', { params: { courseId } });
    setQuestions(res.data);
    setLoading(false);
  }, [courseId]);

  useEffect(() => { refresh(); }, [refresh]);

  const ask = async () => {
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/v1/qa', { courseId, body, instructorId });
      setBody('');
      toast.success('Question submitted!');
      await refresh();
    } finally {
      setSubmitting(false);
    }
  };

  const answer = async (id: string) => {
    const text = answerMap[id];
    if (!text?.trim()) return;
    await api.patch(`/v1/qa/${id}/answer`, { answer: text });
    setAnswerMap((m) => ({ ...m, [id]: '' }));
    toast.success('Answer posted!');
    await refresh();
  };

  const upvote = async (id: string) => {
    await api.patch(`/v1/qa/${id}/upvote`);
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, upvotes: q.upvotes + 1 } : q)),
    );
  };

  const remove = async (id: string) => {
    await api.delete(`/v1/qa/${id}`);
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Ask a question */}
      <div className="space-y-2">
        <label htmlFor="qa-body" className="text-sm font-medium">
          Ask a question
        </label>
        <textarea
          id="qa-body"
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What would you like to know?"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button onClick={ask} disabled={submitting || !body.trim()} className="text-sm">
          {submitting ? 'Submitting…' : 'Submit Question'}
        </Button>
      </div>

      {/* Question list */}
      {loading ? (
        <p className="text-sm text-gray-500">Loading questions…</p>
      ) : questions.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No questions yet. Be the first!</p>
      ) : (
        <ul className="space-y-4">
          {questions.map((q) => (
            <li key={q.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium flex-1">{q.body}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => upvote(q.id)}
                    className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1"
                    aria-label="Upvote question"
                  >
                    ▲ {q.upvotes}
                  </button>
                  {q.user && (
                    <span className="text-xs text-gray-400">
                      {q.user.username ?? q.user.email}
                    </span>
                  )}
                  {currentUserId && q.user && (
                    <button
                      onClick={() => remove(q.id)}
                      className="text-xs text-red-400 hover:text-red-600"
                      aria-label="Delete question"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {q.timestampSeconds != null && (
                <p className="text-xs text-gray-400">
                  @ {Math.floor(q.timestampSeconds / 60)}:{String(q.timestampSeconds % 60).padStart(2, '0')}
                </p>
              )}

              {q.answer ? (
                <div className="rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3">
                  <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">
                    Instructor Answer
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{q.answer}</p>
                </div>
              ) : isInstructor ? (
                <div className="space-y-2">
                  <textarea
                    rows={2}
                    value={answerMap[q.id] ?? ''}
                    onChange={(e) => setAnswerMap((m) => ({ ...m, [q.id]: e.target.value }))}
                    placeholder="Write your answer…"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    onClick={() => answer(q.id)}
                    disabled={!answerMap[q.id]?.trim()}
                    className="text-xs"
                  >
                    Post Answer
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">Awaiting instructor answer…</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
