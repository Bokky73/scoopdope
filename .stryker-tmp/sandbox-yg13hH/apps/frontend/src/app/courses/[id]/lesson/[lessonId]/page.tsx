'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { TranscriptDisplay } from '@/components/courses/TranscriptDisplay';
import { NotesPanel } from '@/components/courses/NotesPanel';
import { ChevronLeft, ChevronRight, Layout, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useVideoShortcuts } from '@/hooks/useVideoShortcuts';
import { useSyncProgress } from '@/hooks/useSyncProgress';

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id;
  const lessonId = params?.lessonId;

  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [sidebarTab, setSidebarTab] = useState<'transcript' | 'notes'>('transcript');
  const videoRef = useRef<HTMLVideoElement>(null);

  const { recordProgress } = useSyncProgress();

  useVideoShortcuts(videoRef);

  useEffect(() => {
    if (!lessonId) return;
    api.get(`/lessons/${lessonId}`)
      .then(({ data }) => setLesson(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lessonId]);

  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  const handleComplete = async () => {
    if (!courseId || !lessonId) return;
    setIsCompleting(true);
    try {
      await recordProgress(courseId, lessonId, 100);
      setLesson((prev: any) => ({ ...prev, completed: true }));
    } catch (error) {
      console.error('Failed to mark lesson as complete:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading lesson...</div>;
  if (!lesson) return <div className="p-8 text-center">Lesson not found.</div>;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/courses/${courseId}`)}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Button>
          <h1 className="text-lg font-bold">{lesson.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><ChevronLeft className="w-4 h-4" /></Button>
          <Button variant="outline" size="sm"><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
              {lesson.videoUrl ? (
                <video
                  ref={videoRef}
                  src={lesson.videoUrl}
                  className="w-full h-full"
                  controls
                  onTimeUpdate={handleTimeUpdate}
                  data-testid="video-player"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No video available for this lesson.
                </div>
              )}
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">About this lesson</h2>
              <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                {lesson.content}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-96 bg-white dark:bg-gray-900 border-t lg:border-t-0 lg:border-l dark:border-gray-800 flex flex-col h-[50vh] lg:h-auto">
          {/* Tab bar */}
          <div className="flex border-b dark:border-gray-800">
            <button
              onClick={() => setSidebarTab('transcript')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium border-b-2 transition-colors ${
                sidebarTab === 'transcript'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Layout className="w-4 h-4" /> Transcript
            </button>
            <button
              onClick={() => setSidebarTab('notes')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium border-b-2 transition-colors ${
                sidebarTab === 'notes'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Notes
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            {sidebarTab === 'transcript' ? (
              <TranscriptDisplay
                lessonId={lessonId as string}
                currentTime={currentTime}
                onSeek={handleSeek}
              />
            ) : (
              <NotesPanel
                lessonId={lessonId as string}
                lessonTitle={lesson.title}
                currentTime={currentTime}
                onSeek={handleSeek}
              />
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
