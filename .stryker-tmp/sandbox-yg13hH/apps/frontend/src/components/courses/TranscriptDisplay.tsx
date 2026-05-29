'use client';

import React, { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { Search, FileText, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface TranscriptItem {
  start_time: string;
  end_time: string;
  alternatives: { content: string }[];
  type: 'pronunciation' | 'punctuation';
}

interface TranscriptDisplayProps {
  lessonId: string;
  currentTime: number;
  onSeek: (time: number) => void;
}

export const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({
  lessonId,
  currentTime,
  onSeek,
}) => {
  const [transcript, setTranscript] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        const { data } = await api.get(`/lessons/${lessonId}`);
        setTranscript(data.transcript);
      } catch (error) {
        console.error('Failed to fetch transcript:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTranscript();
  }, [lessonId]);

  if (loading) return <div className="p-4 text-center text-gray-500">Loading transcript...</div>;
  if (!transcript) return <div className="p-4 text-center text-gray-500">No transcript available.</div>;

  const items: TranscriptItem[] = transcript.results.items;
  
  // Group items into segments for display
  const segments: { start: number; end: number; text: string }[] = [];
  let currentSegment = { start: 0, end: 0, text: '' };
  
  items.forEach((item, index) => {
    if (item.type === 'pronunciation') {
      if (currentSegment.text === '') currentSegment.start = parseFloat(item.start_time);
      currentSegment.text += (currentSegment.text === '' ? '' : ' ') + item.alternatives[0].content;
      currentSegment.end = parseFloat(item.end_time);
    } else {
      currentSegment.text += item.alternatives[0].content;
      if (['.', '?', '!'].includes(item.alternatives[0].content)) {
        segments.push({ ...currentSegment });
        currentSegment = { start: 0, end: 0, text: '' };
      }
    }
  });
  if (currentSegment.text) segments.push(currentSegment);

  const filteredSegments = segments.filter(s => 
    s.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = (format: 'pdf' | 'srt') => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    window.open(`${baseUrl}/lessons/${lessonId}/transcript/${format}`, '_blank');
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg overflow-hidden">
      <div className="p-4 border-b dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transcript..."
            className="pl-10 w-full"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={() => handleDownload('pdf')} className="flex-1 sm:flex-none">
            <FileText className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleDownload('srt')} className="flex-1 sm:flex-none">
            <FileCode className="w-4 h-4 mr-2" />
            SRT
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[500px]" ref={transcriptRef}>
        {filteredSegments.length > 0 ? (
          filteredSegments.map((segment, index) => {
            const isActive = currentTime >= segment.start && currentTime <= segment.end;
            return (
              <div
                key={index}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  isActive 
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 shadow-sm' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => onSeek(segment.start)}
              >
                <span className="text-xs font-mono text-gray-400 block mb-1">
                  {formatTime(segment.start)}
                </span>
                <p className={`text-sm leading-relaxed ${isActive ? 'text-blue-900 dark:text-blue-100 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                  {segment.text}
                </p>
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-500 py-8">No matches found for "{searchQuery}"</div>
        )}
      </div>
    </div>
  );
};

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h, m, s]
    .map(v => v.toString().padStart(2, '0'))
    .filter((v, i) => v !== '00' || i > 0)
    .join(':');
}
