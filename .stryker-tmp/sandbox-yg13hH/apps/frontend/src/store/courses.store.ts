import { create } from 'zustand';

export interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  durationHours: number;
  isPublished: boolean;
  instructorId?: string;
  createdAt?: string;
}

export interface CourseFilters {
  search: string;
  level: string;
  page: number;
  limit: number;
}

interface CoursesState {
  courses: Course[];
  total: number;
  selectedCourse: Course | null;
  filters: CourseFilters;
  loading: boolean;
  setCourses: (courses: Course[], total: number) => void;
  setSelectedCourse: (course: Course | null) => void;
  setFilters: (filters: Partial<CourseFilters>) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const defaultFilters: CourseFilters = { search: '', level: '', page: 1, limit: 20 };

export const useCoursesStore = create<CoursesState>((set) => ({
  courses: [],
  total: 0,
  selectedCourse: null,
  filters: defaultFilters,
  loading: false,
  setCourses: (courses, total) => set({ courses, total }),
  setSelectedCourse: (course) => set({ selectedCourse: course }),
  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters, page: 1 } })),
  setLoading: (loading) => set({ loading }),
  reset: () => set({ courses: [], total: 0, selectedCourse: null, filters: defaultFilters }),
}));
