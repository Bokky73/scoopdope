import Link from 'next/link';
import { Thread } from '@/lib/forumApi';
import { VoteButton } from './VoteButton';

interface ThreadCardProps {
  thread: Thread;
  courseId: string;
}

export function ThreadCard({ thread, courseId }: ThreadCardProps) {
  return (
    <div className={`border rounded-lg p-4 hover:shadow-sm transition-shadow ${thread.isPinned ? 'border-blue-300 bg-blue-50/30' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {thread.isPinned && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Pinned</span>}
            {thread.isLocked && <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Locked</span>}
            <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{thread.category}</span>
          </div>
          <Link
            href={`/courses/${courseId}/forum/${thread.id}`}
            className="font-medium hover:text-blue-600 hover:underline line-clamp-2"
          >
            {thread.title}
          </Link>
          <p className="text-xs text-gray-500 mt-1">
            {thread.authorName} · {new Date(thread.lastActivityAt).toLocaleDateString()}
          </p>
        </div>
        <div className="text-xs text-gray-500 text-right shrink-0 space-y-1">
          <p>{thread.replyCount} replies</p>
        </div>
      </div>
      <div className="mt-2">
        <VoteButton
          type="thread"
          id={thread.id}
          initialUpvotes={thread.upvotes}
          initialDownvotes={thread.downvotes}
        />
      </div>
    </div>
  );
}
