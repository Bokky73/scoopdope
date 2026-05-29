'use client';
import { useState } from 'react';
import { StarRating } from './StarRating';
import { Button } from '@/components/ui/Button';
import { reviewsApi } from '@/lib/reviewsApi';

const MAX_CHARS = 1000;
const COUNTER_THRESHOLD = 900;

interface ReviewFormProps {
  courseId: string;
  onSuccess: () => void;
}

export function ReviewForm({ courseId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const remaining = MAX_CHARS - text.length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating || !text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await reviewsApi.submitReview(courseId, rating, text);
      setSuccess(true);
      onSuccess();
    } catch {
      setError('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return <p className="text-green-600 font-medium">Review submitted successfully!</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Your Rating</label>
        <StarRating value={rating} onRatingChange={setRating} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Your Review</label>
        <textarea
          className="w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          maxLength={MAX_CHARS}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share your experience with this course..."
        />
        {text.length >= COUNTER_THRESHOLD && (
          <p className={`text-xs mt-1 ${remaining <= 50 ? 'text-red-500' : 'text-gray-500'}`}>
            {remaining} characters remaining
          </p>
        )}
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Button type="submit" disabled={loading || !rating || !text.trim()}>
        {loading ? 'Submitting…' : 'Submit Review'}
      </Button>
    </form>
  );
}
