'use client';

import { useEffect, useState } from 'react';
import { CircularProgress } from './CircularProgress';

interface Lesson {
  id: string;
  title: string;
  completed: boolean;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface CourseProgressProps {
  courseId: string;
  modules: Module[];
  timeSpentMinutes?: number;
  estimatedMinutes?: number;
}

function MilestoneModal({ progress, onClose }: { progress: number; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-lg p-8 text-center space-y-4 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="text-6xl">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {progress === 100 ? 'Course Complete!' : `${progress}% Milestone!`}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {progress === 100 ? 'Congratulations on completing the course!' : 'Keep up the great work!'}
        </p>
        <button
          onClick={onClose}
          className="rounded-lg bg-blue-600 text-white px-6 py-2 hover:bg-blue-700"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export function CourseProgress({ modules, timeSpentMinutes = 0, estimatedMinutes = 0 }: CourseProgressProps) {
  const totalLessons = modules.reduce((s, m) => s + m.lessons.length, 0);
  const completedLessons = modules.reduce((s, m) => s + m.lessons.filter((l) => l.completed).length, 0);
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const [showMilestone, setShowMilestone] = useState(false);
  const [lastProgress, setLastProgress] = useState(progress);

  useEffect(() => {
    if (progress > lastProgress && (progress === 50 || progress === 100)) {
      setShowMilestone(true);
    }
    setLastProgress(progress);
  }, [progress, lastProgress]);

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="flex items-center gap-6 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <CircularProgress value={progress} size={100} strokeWidth={10} />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Overall Progress</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {completedLessons} of {totalLessons} lessons completed
          </p>
          {estimatedMinutes > 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {timeSpentMinutes}m spent · ~{Math.max(0, estimatedMinutes - timeSpentMinutes)}m remaining
            </p>
          )}
        </div>
      </div>

      {/* Module Progress */}
      <div className="space-y-4">
        {modules.map((mod) => {
          const modCompleted = mod.lessons.filter((l) => l.completed).length;
          const modTotal = mod.lessons.length;
          const modPct = modTotal > 0 ? Math.round((modCompleted / modTotal) * 100) : 0;

          return (
            <div key={mod.id} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">{mod.title}</h4>
                <span className="text-sm text-gray-500 dark:text-gray-400">{modPct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div className="h-full rounded-full bg-blue-500 transition-all duration-300" style={{ width: `${modPct}%` }} />
              </div>
              <ul className="space-y-1.5">
                {mod.lessons.map((lesson) => (
                  <li key={lesson.id} className="flex items-center gap-2 text-sm">
                    <span className={`text-lg ${lesson.completed ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'}`}>
                      {lesson.completed ? '✓' : '○'}
                    </span>
                    <span className={lesson.completed ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'}>
                      {lesson.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {showMilestone && <MilestoneModal progress={progress} onClose={() => setShowMilestone(false)} />}
    </div>
  );
}
