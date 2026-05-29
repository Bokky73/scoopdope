'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  courses: { id: string; title: string; durationHours: number }[];
  createdAt: string;
}

export default function LearningPathsPage() {
  const router = useRouter();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get('/learning-paths')
      .then((res) => setPaths(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const totalHours = (path: LearningPath) =>
    path.courses.reduce((sum, c) => sum + (c.durationHours ?? 0), 0);

  return (
    <ProtectedRoute>
      <main className="max-w-5xl mx-auto p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Learning Paths</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Structured curricula to guide you from beginner to expert.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-48 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ))}
          </div>
        ) : paths.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No learning paths available yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paths.map((path) => (
              <Card
                key={path.id}
                className="p-6 cursor-pointer hover:border-blue-400 transition-colors"
                onClick={() => router.push(`/learning-paths/${path.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 space-y-2">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                      Learning Path
                    </Badge>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                      {path.title}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {path.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 pt-1">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {path.courses.length} courses
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {totalHours(path)}h total
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0 mt-1" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
