'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { reviewsApi } from '@/lib/reviewsApi';

const MAX_REPLY_CHARS = 500;

interface InstructorReplyProps {
  courseId: string;
  reviewId: string;
  existingReply?: { text: string; createdAt: string };
  isInstructor: boolean;
}

export function InstructorReply({ courseId, reviewId, existingReply, isInstructor }: InstructorReplyProps) {
  const [showForm, setShowForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<{ text: string; createdAt: string } | null>(existingReply ?? null);

  if (submitted) {
    return (
      <div className="mt-3 pl-4 border-l-2 border-blue-300 bg-blue-50 rounded p-3">
        <p className="text-xs font-semibold text-blue-700 mb-1">Instructor Response</p>
        <p className="text-sm text-gray-700">{submitted.text}</p>
        <p className="text-xs text-gray-400 mt-1">{new Date(submitted.createdAt).toLocaleDateString()}</p>
      </div>
    );
  }

  if (!isInstructor) return null;

  if (!showForm) {
    return (
      <button
        className="mt-2 text-sm text-blue-600 hover:underline"
        onClick={() => setShowForm(true)}
      >
        Reply
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await reviewsApi.submitInstructorReply(courseId, reviewId, replyText);
      setSubmitted({ text: replyText, createdAt: new Date().toISOString() });
    } catch {
      setError('Failed to submit reply. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2">
      <textarea
        className="w-full border rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={3}
        maxLength={MAX_REPLY_CHARS}
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder="Write your response..."
      />
      <p className="text-xs text-gray-400">{MAX_REPLY_CHARS - replyText.length} characters remaining</p>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={loading || !replyText.trim()}>
          {loading ? 'Submitting…' : 'Submit Response'}
        </Button>
        <Button variant="outline" type="button" onClick={() => setShowForm(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
