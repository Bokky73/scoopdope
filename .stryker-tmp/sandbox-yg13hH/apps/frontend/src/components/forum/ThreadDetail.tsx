'use client';
import { useState } from 'react';
import { Thread, forumApi } from '@/lib/forumApi';
import { VoteButton } from './VoteButton';
import { Button } from '@/components/ui/Button';

interface ThreadDetailProps {
  thread: Thread;
  courseId: string;
  canModerate: boolean;
  onThreadUpdate: (updated: Thread) => void;
}

export function ThreadDetail({ thread, courseId, canModerate, onThreadUpdate }: ThreadDetailProps) {
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handlePin() {
    setError(null);
    try {
      await forumApi.pinThread(courseId, thread.id);
      onThreadUpdate({ ...thread, isPinned: !thread.isPinned });
    } catch {
      setError('Failed to pin thread.');
    }
  }

  async function handleLock() {
    setError(null);
    try {
      await forumApi.lockThread(courseId, thread.id);
      onThreadUpdate({ ...thread, isLocked: !thread.isLocked });
    } catch {
      setError('Failed to lock thread.');
    }
  }

  async function handleDelete() {
    setConfirmDelete(false);
    setError(null);
    try {
      await forumApi.deleteThread(courseId, thread.id);
      // Parent page handles redirect
    } catch {
      setError('Failed to delete thread.');
    }
  }

  return (
    <div className="border rounded-xl p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex gap-2 mb-2">
            {thread.isPinned && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Pinned</span>}
            {thread.isLocked && <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Locked</span>}
            <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{thread.category}</span>
          </div>
          <h1 className="text-2xl font-bold">{thread.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {thread.authorName} · {new Date(thread.createdAt).toLocaleDateString()}
          </p>
        </div>
        {canModerate && (
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" onClick={handlePin}>{thread.isPinned ? 'Unpin' : 'Pin'}</Button>
            <Button variant="outline" onClick={handleLock}>{thread.isLocked ? 'Unlock' : 'Lock'}</Button>
            <Button variant="outline" onClick={() => setConfirmDelete(true)} className="text-red-600 border-red-300 hover:bg-red-50">Delete</Button>
          </div>
        )}
      </div>

      <div className="text-gray-700 whitespace-pre-wrap">{thread.body}</div>

      <VoteButton type="thread" id={thread.id} initialUpvotes={thread.upvotes} initialDownvotes={thread.downvotes} />

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" role="dialog" aria-modal="true">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl space-y-4">
            <h2 className="font-semibold">Delete this thread?</h2>
            <p className="text-sm text-gray-600">All replies will also be deleted. This cannot be undone.</p>
            <div className="flex gap-3">
              <Button onClick={handleDelete}>Delete</Button>
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
