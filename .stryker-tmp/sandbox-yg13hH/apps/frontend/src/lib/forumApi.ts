import api from './api';

export interface Thread {
  id: string;
  courseId: string;
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  category: string;
  replyCount: number;
  upvotes: number;
  downvotes: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  lastActivityAt: string;
}

export interface Reply {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  body: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
}

export type ThreadSort = 'newest' | 'upvoted' | 'replies';

export const forumApi = {
  getThreads: (courseId: string, sort: ThreadSort = 'newest', search?: string, category?: string) =>
    api.get<{ threads: Thread[]; total: number }>(`/courses/${courseId}/forum/threads`, {
      params: { sort, search, category },
    }).then((r) => r.data),

  getThread: (courseId: string, threadId: string) =>
    api.get<Thread>(`/courses/${courseId}/forum/threads/${threadId}`).then((r) => r.data),

  getReplies: (courseId: string, threadId: string) =>
    api.get<Reply[]>(`/courses/${courseId}/forum/threads/${threadId}/replies`).then((r) => r.data),

  createThread: (courseId: string, data: { title: string; body: string; category: string }) =>
    api.post<Thread>(`/courses/${courseId}/forum/threads`, data).then((r) => r.data),

  createReply: (courseId: string, threadId: string, body: string) =>
    api.post<Reply>(`/courses/${courseId}/forum/threads/${threadId}/replies`, { body }).then((r) => r.data),

  vote: (type: 'thread' | 'reply', id: string, direction: 'up' | 'down' | 'remove') =>
    api.post(`/forum/${type}s/${id}/vote`, { direction }).then((r) => r.data),

  pinThread: (courseId: string, threadId: string) =>
    api.post(`/courses/${courseId}/forum/threads/${threadId}/pin`).then((r) => r.data),

  lockThread: (courseId: string, threadId: string) =>
    api.post(`/courses/${courseId}/forum/threads/${threadId}/lock`).then((r) => r.data),

  deleteThread: (courseId: string, threadId: string) =>
    api.delete(`/courses/${courseId}/forum/threads/${threadId}`).then((r) => r.data),

  deleteReply: (courseId: string, threadId: string, replyId: string) =>
    api.delete(`/courses/${courseId}/forum/threads/${threadId}/replies/${replyId}`).then((r) => r.data),
};
