'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { toast } from '@/lib/toast';
import { ArrowLeft, BookOpen, Clock, CheckCircle2, Lock } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  durationHours: number;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  courseOrder: string[];
  courses: Course[];
}

export default function LearningPathDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [path, setPath] = useState<LearningPath | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/learning-paths/${params.id}`),
      api.get('/learning-paths/user/me'),
    ])
      .then(([pathRes, enrollmentsRes]) => {
        setPath(pathRes.data);
        const enrolled = (enrollmentsRes.data as any[]).some(
          (e) => e.learningPathId === params.id || e.learningPath?.id === params.id,
        );
        setIsEnrolled(enrolled);
      })
      .catch(() => {
        toast.error('Failed to load learning path');
        router.push('/learning-paths');
      })
      .finally(() => setIsLoading(false));
  }, [params.id, router]);

  const handleEnroll = async () => {
    setIsEnrolling(true);
    try {
      await api.post(`/learning-paths/${params.id}/enroll`);
      setIsEnrolled(true);
      toast.success('Enrolled! You can now start the first course.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to enroll');
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (!path) return null;

  // Sort courses by courseOrder
  const orderedCourses = [...path.courses].sort((a, b) => {
    const ai = path.courseOrder.indexOf(a.id);
    const bi = path.courseOrder.indexOf(b.id);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  const totalHours = path.courses.reduce((sum, c) => sum + (c.durationHours ?? 0), 0);

  return (
    <ProtectedRoute>
      <main className="max-w-5xl mx-auto p-8 space-y-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-3">
              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                Learning Path
              </Badge>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white">{path.title}</h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                {path.description}
              </p>
              <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {path.courses.length} courses
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {totalHours}h total
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Curriculum</h2>
              <div className="space-y-3">
                {orderedCourses.map((course, index) => (
                  <Card
                    key={course.id}
                    className={`p-4 flex items-center gap-4 ${
                      isEnrolled
                        ? 'cursor-pointer hover:border-purple-300 transition-colors'
                        : 'opacity-75'
                    }`}
                    onClick={() => isEnrolled && router.push(`/courses/${course.id}`)}
                  >
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {course.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                        <span>{course.level}</span>
                        <span>{course.durationHours}h</span>
                      </div>
                    </div>
                    {isEnrolled ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="p-6 sticky top-8 border-purple-200 dark:border-purple-900/50 shadow-xl space-y-6">
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Path includes</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">
                  {path.courses.length}
                </p>
                <p className="text-gray-500 text-sm">courses · {totalHours}h of content</p>
              </div>

              {isEnrolled ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600 font-semibold">
                    <CheckCircle2 className="w-5 h-5" />
                    Enrolled
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => router.push(`/courses/${orderedCourses[0]?.id}`)}
                  >
                    Continue Learning
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full h-12 text-lg font-bold bg-purple-600 hover:bg-purple-700"
                  onClick={handleEnroll}
                  disabled={isEnrolling}
                >
                  {isEnrolling ? 'Enrolling...' : 'Start Learning Path'}
                </Button>
              )}

              <div className="pt-4 border-t dark:border-gray-800 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Path completion certificate
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Sequential course access
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    750 BST reward on completion
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
