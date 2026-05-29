import { create } from 'zustand';

export interface ComparableCourse {
  id: string;
  title: string;
  level: string;
  category?: string;
  durationHours?: number;
  price?: number;
  rating?: number;
  description?: string;
  enrollments?: number;
  moduleCount?: number;
  prerequisites?: string[];
}

const MAX_COMPARE = 3;

interface CompareState {
  selected: ComparableCourse[];
  add: (course: ComparableCourse) => void;
  remove: (courseId: string) => void;
  toggle: (course: ComparableCourse) => void;
  isSelected: (courseId: string) => boolean;
  clear: () => void;
  isFull: () => boolean;
}

export const useCompareStore = create<CompareState>((set, get) => ({
  selected: [],

  isSelected: (courseId) => get().selected.some((c) => c.id === courseId),
  isFull: () => get().selected.length >= MAX_COMPARE,

  add: (course) => {
    if (get().isFull()) return;
    set((s) => ({ selected: [...s.selected, course] }));
  },

  remove: (courseId) =>
    set((s) => ({ selected: s.selected.filter((c) => c.id !== courseId) })),

  toggle: (course) => {
    if (get().isSelected(course.id)) get().remove(course.id);
    else get().add(course);
  },

  clear: () => set({ selected: [] }),
}));
