'use client';
import { useState } from 'react';
import { Reply, forumApi } from '@/lib/forumApi';
import { VoteButton } from './VoteButton';
import { RichTextEditor } from './RichTextEditor';
import { Button } from '@/components/ui/Button';

interface ReplyListProps {
  courseId: string;
  threadId: string;
  initialReplies: Reply[];
  isLocked: boolean;
  canModerate: boolean;
}

export function ReplyList({ courseId, threadId, initialReplies, isLocked, canModerate }: ReplyListProps) {
  const [replies, setReplies] = useState<Reply[]>(initialReplies);
  const [replyBody, setReplyBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  async function handleSubmitReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyBody.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const newReply = await forumApi.createReply(courseId, threadId, replyBody);
      setReplies((r) => [...r, newReply]);
      setReplyBody('');
    } catch {
      setError('Failed to post reply. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteReply(replyId: string) {
    setConfirmDelete(null);
    try {
      await forumApi.deleteReply(courseId, threadId, replyId);
      setReplies((r) => r.filter((x) => x.id !== replyId));
    } catch {
      setError('Failed to delete reply.');
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">{replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}</h2>

      {replies.map((reply) => (
        <div key={reply.id} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm">{reply.authorName}</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">{new Date(reply.createdAt).toLocaleDateString()}</span>
              {canModerate && (
                <button
                  className="text-xs text-red-500 hover:underline"
                  onClick={() => setConfirmDelete(reply.id)}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
          {/* Render HTML body safely — in production use DOMPurify */}
          <div className="text-sm text-gray-700 whitespace-pre-wrap">{reply.body}</div>
          <div className="mt-2">
            <VoteButton type="reply" id={reply.id} initialUpvotes={reply.upvotes} initialDownvotes={reply.downvotes} />
          </div>
        </div>
      ))}

      {!isLocked && (
        <form onSubmit={handleSubmitReply} className="space-y-3 pt-4 border-t">
          <RichTextEditor value={replyBody} onChange={setReplyBody} placeholder="Write a reply…" />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button type="submit" disabled={loading || !replyBody.trim()}>
            {loading ? 'Posting…' : 'Post Reply'}
          </Button>
        </form>
      )}

      {isLocked && (
        <p className="text-sm text-gray-500 border-t pt-4">This thread is locked. No new replies allowed.</p>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" role="dialog" aria-modal="true">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl space-y-4">
            <h2 className="font-semibold">Delete this reply?</h2>
            <p className="text-sm text-gray-600">This action cannot be undone.</p>
            <div className="flex gap-3">
              <Button onClick={() => handleDeleteReply(confirmDelete)}>Delete</Button>
              <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
