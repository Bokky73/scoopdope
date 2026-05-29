import { create } from 'zustand';

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  completedAt?: string;
}

// keyed by courseId
type ProgressMap = Record<string, LessonProgress[]>;

interface ProgressState {
  progress: ProgressMap;
  setProgress: (courseId: string, lessons: LessonProgress[]) => void;
  markLesson: (courseId: string, lessonId: string, completed: boolean) => void;
  getCompleted: (courseId: string) => number;
  reset: () => void;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  progress: {},

  setProgress: (courseId, lessons) =>
    set((s) => ({ progress: { ...s.progress, [courseId]: lessons } })),

  markLesson: (courseId, lessonId, completed) =>
    set((s) => {
      const existing = s.progress[courseId] ?? [];
      const updated = existing.some((l) => l.lessonId === lessonId)
        ? existing.map((l) =>
            l.lessonId === lessonId
              ? { ...l, completed, completedAt: completed ? new Date().toISOString() : undefined }
              : l
          )
        : [
            ...existing,
            { lessonId, completed, completedAt: completed ? new Date().toISOString() : undefined },
          ];
      return { progress: { ...s.progress, [courseId]: updated } };
    }),

  getCompleted: (courseId) => (get().progress[courseId] ?? []).filter((l) => l.completed).length,

  reset: () => set({ progress: {} }),
}));
