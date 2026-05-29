'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { forumApi, Thread, Reply } from '@/lib/forumApi';
import { ThreadDetail } from '@/components/forum/ThreadDetail';
import { ReplyList } from '@/components/forum/ReplyList';

interface ThreadPageProps {
  params: { id: string; threadId: string };
}

export default function ThreadPage({ params }: ThreadPageProps) {
  const { id: courseId, threadId } = params;
  const [thread, setThread] = useState<Thread | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      forumApi.getThread(courseId, threadId),
      forumApi.getReplies(courseId, threadId),
    ]).then(([t, r]) => {
      setThread(t);
      // Sort replies chronologically
      setReplies(r.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
      setLoading(false);
    });
  }, [courseId, threadId]);

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="h-40 bg-gray-100 rounded-xl" />
        </div>
      </main>
    );
  }

  if (!thread) return null;

  return (
    <main className="max-w-4xl mx-auto p-8 space-y-6">
      <Link href={`/courses/${courseId}/forum`} className="text-blue-600 hover:underline text-sm">
        ← Back to Forum
      </Link>
      <ThreadDetail
        thread={thread}
        courseId={courseId}
        canModerate={false} // wire up real auth role check
        onThreadUpdate={setThread}
      />
      <ReplyList
        courseId={courseId}
        threadId={threadId}
        initialReplies={replies}
        isLocked={thread.isLocked}
        canModerate={false} // wire up real auth role check
      />
    </main>
  );
}
