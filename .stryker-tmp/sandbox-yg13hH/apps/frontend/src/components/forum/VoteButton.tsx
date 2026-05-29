'use client';
import { useState } from 'react';
import { forumApi } from '@/lib/forumApi';

interface VoteButtonProps {
  type: 'thread' | 'reply';
  id: string;
  initialUpvotes: number;
  initialDownvotes: number;
  initialUserVote?: 'up' | 'down' | null;
}

export function VoteButton({ type, id, initialUpvotes, initialDownvotes, initialUserVote = null }: VoteButtonProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(initialUserVote);
  const [error, setError] = useState<string | null>(null);

  async function handleVote(direction: 'up' | 'down') {
    const prevUpvotes = upvotes;
    const prevDownvotes = downvotes;
    const prevUserVote = userVote;

    // Optimistic update
    if (userVote === direction) {
      // Toggle off
      setUserVote(null);
      if (direction === 'up') setUpvotes((v) => v - 1);
      else setDownvotes((v) => v - 1);
    } else {
      if (userVote === 'up') setUpvotes((v) => v - 1);
      if (userVote === 'down') setDownvotes((v) => v - 1);
      setUserVote(direction);
      if (direction === 'up') setUpvotes((v) => v + 1);
      else setDownvotes((v) => v + 1);
    }

    setError(null);
    try {
      const apiDirection = userVote === direction ? 'remove' : direction;
      await forumApi.vote(type, id, apiDirection);
    } catch {
      // Rollback
      setUpvotes(prevUpvotes);
      setDownvotes(prevDownvotes);
      setUserVote(prevUserVote);
      setError('Vote failed. Please try again.');
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleVote('up')}
        className={`flex items-center gap-1 text-sm px-2 py-1 rounded transition-colors ${
          userVote === 'up' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-blue-600'
        }`}
        aria-label="Upvote"
        aria-pressed={userVote === 'up'}
      >
        ▲ {upvotes}
      </button>
      <button
        onClick={() => handleVote('down')}
        className={`flex items-center gap-1 text-sm px-2 py-1 rounded transition-colors ${
          userVote === 'down' ? 'text-red-600 bg-red-50' : 'text-gray-500 hover:text-red-600'
        }`}
        aria-label="Downvote"
        aria-pressed={userVote === 'down'}
      >
        ▼ {downvotes}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
