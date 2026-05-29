'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface CourseAnalytics {
  id: string;
  title: string;
  enrollments: number;
  completionRate: number;
  rating: number;
  revenue: number;
  tokenEarnings: number;
}

interface StudentProgress {
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  progressPct: number;
}

interface SurveyAggregate {
  courseId: string;
  surveyId: string;
  title: string;
  totalResponses: number;
  npsScore: number | null;
}

interface DashboardData {
  courses: CourseAnalytics[];
  studentProgress: StudentProgress[];
  totalRevenue: number;
  totalTokens: number;
  totalEnrollments: number;
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
    </div>
  );
}

function BarChart({ data }: { data: { label: string; value: number; max: number }[] }) {
  return (
    <div className="space-y-2">
      {data.map(({ label, value, max }) => (
        <div key={label}>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span className="truncate max-w-[60%]">{label}</span>
            <span>{value}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-blue-500"
              style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Fallback mock data when API is unavailable
function getMockData(): DashboardData {
  return {
    totalRevenue: 1240,
    totalTokens: 3800,
    totalEnrollments: 142,
    courses: [
      { id: '1', title: 'Intro to Stellar', enrollments: 80, completionRate: 72, rating: 4.8, revenue: 800, tokenEarnings: 2400 },
      { id: '2', title: 'Soroban Smart Contracts', enrollments: 42, completionRate: 55, rating: 4.5, revenue: 420, tokenEarnings: 1260 },
      { id: '3', title: 'DeFi on Stellar', enrollments: 20, completionRate: 40, rating: 4.2, revenue: 200, tokenEarnings: 600 },
    ],
    studentProgress: [
      { studentId: 's1', studentName: 'Alice', courseId: '1', courseTitle: 'Intro to Stellar', progressPct: 90 },
      { studentId: 's2', studentName: 'Bob', courseId: '1', courseTitle: 'Intro to Stellar', progressPct: 45 },
      { studentId: 's3', studentName: 'Carol', courseId: '2', courseTitle: 'Soroban Smart Contracts', progressPct: 60 },
    ],
  };
}

export default function InstructorDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [surveys, setSurveys] = useState<SurveyAggregate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [coursesRes, progressRes] = await Promise.all([
          api.get('/instructor/courses/analytics'),
          api.get('/instructor/students/progress'),
        ]);
        const courses: CourseAnalytics[] = coursesRes.data ?? [];
        const studentProgress: StudentProgress[] = progressRes.data ?? [];
        setData({
          courses,
          studentProgress,
          totalRevenue: courses.reduce((s, c) => s + (c.revenue ?? 0), 0),
          totalTokens: courses.reduce((s, c) => s + (c.tokenEarnings ?? 0), 0),
          totalEnrollments: courses.reduce((s, c) => s + (c.enrollments ?? 0), 0),
        });
      } catch {
        setData(getMockData());
      }
      try {
        const surveyRes = await api.get('/v1/surveys/instructor/me/aggregate');
        setSurveys(surveyRes.data ?? []);
      } catch {
        // surveys optional
      }
      setIsLoading(false);
    }
    }
    load();
  }, []);

  const d = data ?? getMockData();
  const maxEnrollments = Math.max(...d.courses.map((c) => c.enrollments), 1);

  return (
    <ProtectedRoute>
      <main className="max-w-5xl mx-auto p-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Instructor Dashboard</h1>
          <Link
            href="/instructor/courses/new"
            className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700"
          >
            + New Course
          </Link>
          <Link
            href="/instructor/revenue"
            className="rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Revenue Analytics
          </Link>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Enrollments" value={isLoading ? '…' : d.totalEnrollments} />
          <StatCard label="Revenue (USD)" value={isLoading ? '…' : `$${d.totalRevenue}`} />
          <StatCard label="BST Earned" value={isLoading ? '…' : `${d.totalTokens} BST`} />
          <StatCard label="Courses" value={isLoading ? '…' : d.courses.length} />
        </div>

        {/* Course Analytics Table */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Course Performance</h2>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                <tr>
                  {['Course', 'Enrollments', 'Completion', 'Rating', 'Revenue', 'BST', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                {isLoading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 7 }).map((__, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : d.courses.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{c.title}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{c.enrollments}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-16 rounded-full bg-gray-200 dark:bg-gray-700">
                              <div className="h-full rounded-full bg-green-500" style={{ width: `${c.completionRate}%` }} />
                            </div>
                            <span className="text-gray-600 dark:text-gray-300">{c.completionRate}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-yellow-500">{'★'.repeat(Math.round(c.rating))} {c.rating}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">${c.revenue}</td>
                        <td className="px-4 py-3 text-green-600 dark:text-green-400">{c.tokenEarnings} BST</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Link href={`/instructor/courses/${c.id}/edit`} className="text-blue-600 dark:text-blue-400 hover:underline text-xs">Edit</Link>
                            <Link href={`/courses/${c.id}/forum`} className="text-gray-500 hover:underline text-xs">Forum</Link>
                            <Link href={`/instructor/courses/${c.id}/message`} className="text-gray-500 hover:underline text-xs">Message</Link>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Enrollment Chart */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Enrollments by Course</h2>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <BarChart data={d.courses.map((c) => ({ label: c.title, value: c.enrollments, max: maxEnrollments }))} />
            )}
          </div>
        </section>

        {/* Student Progress */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Student Progress</h2>
          <div className="space-y-3">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                ))
              : d.studentProgress.map((sp) => (
                  <div key={`${sp.studentId}-${sp.courseId}`} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{sp.studentName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{sp.courseTitle}</p>
                    </div>
                    <div className="flex items-center gap-2 w-40">
                      <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${sp.progressPct}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right">{sp.progressPct}%</span>
                    </div>
                  </div>
                ))}
          </div>
        </section>

        {/* Survey Feedback Aggregate */}
        {surveys.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Course Feedback (NPS)</h2>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  <tr>
                    {['Survey', 'Responses', 'NPS Score'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                  {surveys.map((s) => (
                    <tr key={s.surveyId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{s.title}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{s.totalResponses}</td>
                      <td className="px-4 py-3 font-medium">
                        {s.npsScore !== null ? (
                          <span className={s.npsScore >= 50 ? 'text-green-600 dark:text-green-400' : s.npsScore >= 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}>
                            {s.npsScore}
                          </span>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </ProtectedRoute>
  );
}
