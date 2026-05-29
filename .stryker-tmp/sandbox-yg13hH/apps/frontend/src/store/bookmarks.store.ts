import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

export interface BookmarkedCourse {
  id: string;
  title: string;
  level: string;
  category?: string;
  durationHours?: number;
  price?: number;
  rating?: number;
  description?: string;
}

interface BookmarksState {
  bookmarks: BookmarkedCourse[];
  loading: boolean;
  addBookmark: (course: BookmarkedCourse) => Promise<void>;
  removeBookmark: (courseId: string) => Promise<void>;
  isBookmarked: (courseId: string) => boolean;
  fetchBookmarks: () => Promise<void>;
}

export const useBookmarksStore = create<BookmarksState>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      loading: false,

      isBookmarked: (courseId) => get().bookmarks.some((b) => b.id === courseId),

      addBookmark: async (course) => {
        set((s) => ({ bookmarks: [...s.bookmarks, course] }));
        try {
          await api.post(`/bookmarks/${course.id}`);
        } catch {
          // revert on failure
          set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== course.id) }));
        }
      },

      removeBookmark: async (courseId) => {
        const prev = get().bookmarks;
        set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== courseId) }));
        try {
          await api.delete(`/bookmarks/${courseId}`);
        } catch {
          set({ bookmarks: prev });
        }
      },

      fetchBookmarks: async () => {
        set({ loading: true });
        try {
          const { data } = await api.get('/bookmarks');
          set({ bookmarks: data });
        } catch {
          // silently fail — local state is used as fallback
        } finally {
          set({ loading: false });
        }
      },
    }),
    { name: 'bookmarks' }
  )
);
