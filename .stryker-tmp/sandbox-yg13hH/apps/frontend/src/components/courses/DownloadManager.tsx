'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface DownloadItem {
  id: string;
  courseId: string;
  lessonId?: string;
  lessonTitle?: string;
  fileSizeBytes: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

interface StorageStats {
  totalBytes: number;
  count: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function DownloadManager() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [dlRes, statsRes] = await Promise.all([
      api.get<DownloadItem[]>('/v1/downloads'),
      api.get<StorageStats>('/v1/downloads/storage'),
    ]);
    setDownloads(dlRes.data);
    setStats(statsRes.data);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const remove = async (id: string) => {
    await api.delete(`/v1/downloads/${id}`);
    setDownloads((prev) => prev.filter((d) => d.id !== id));
    refresh();
  };

  if (loading) return <p className="text-sm text-gray-500">Loading downloads…</p>;

  return (
    <div className="space-y-4">
      {stats && (
        <div className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-800 p-3 text-sm">
          <span className="font-medium">Storage used</span>
          <span className="text-gray-600 dark:text-gray-300">
            {formatBytes(stats.totalBytes)} · {stats.count} file{stats.count !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {downloads.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-6">No downloads yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {downloads.map((d) => (
            <li key={d.id} className="flex items-center justify-between py-3 gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{d.lessonTitle ?? `Course ${d.courseId}`}</p>
                <p className="text-xs text-gray-500">
                  {formatBytes(d.fileSizeBytes)} ·{' '}
                  <span
                    className={
                      d.status === 'completed'
                        ? 'text-green-600'
                        : d.status === 'failed'
                        ? 'text-red-500'
                        : 'text-yellow-500'
                    }
                  >
                    {d.status}
                  </span>
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => remove(d.id)}
                className="shrink-0 text-xs px-2 py-1"
                aria-label={`Remove download ${d.lessonTitle}`}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface DownloadButtonProps {
  courseId: string;
  lessonId?: string;
  lessonTitle?: string;
  fileUrl?: string;
  fileSizeBytes?: number;
}

export function DownloadButton({
  courseId,
  lessonId,
  lessonTitle,
  fileUrl,
  fileSizeBytes,
}: DownloadButtonProps) {
  const [queued, setQueued] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      await api.post('/v1/downloads', { courseId, lessonId, lessonTitle, fileUrl, fileSizeBytes });
      setQueued(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleDownload}
      disabled={loading || queued}
      className="text-sm"
      aria-label={queued ? 'Download queued' : 'Download for offline viewing'}
    >
      {queued ? '✓ Queued' : loading ? 'Queuing…' : '⬇ Download Offline'}
    </Button>
  );
}
