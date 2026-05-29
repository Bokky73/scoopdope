// @ts-nocheck
export interface CourseJsonLesson {
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
  durationMinutes: number;
}
export interface CourseJsonModule {
  title: string;
  order: number;
  lessons: CourseJsonLesson[];
}
export interface CourseJsonExport {
  version: '1.0';
  exportedAt: string;
  course: {
    title: string;
    description: string;
    level: string;
    durationHours: number;
    requiresKyc: boolean;
    modules: CourseJsonModule[];
  };
}