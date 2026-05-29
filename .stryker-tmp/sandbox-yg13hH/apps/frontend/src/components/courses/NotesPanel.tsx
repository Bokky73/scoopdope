'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import { toast } from '@/lib/toast';
import { BookOpen, Download, Plus, Search, Trash2, X } from 'lucide-react';

interface Note {
  id: string;
  content: string;
  timestamp: number;
  createdAt: string;
}

interface NotesPanelProps {
  lessonId: string;
  lessonTitle: string;
  currentTime: number;
  onSeek: (time: number) => void;
}

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function NotesPanel({ lessonId, lessonTitle, currentTime, onSeek }: NotesPanelProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  const load = useCallback(async (q?: string) => {
    try {
      const { data } = await api.get(`/v1/lessons/${lessonId}/notes`, { params: q ? { search: q } : {} });
      setNotes(data);
    } catch {
      // silently fail — notes are non-critical
    }
  }, [lessonId]);

  useEffect(() => { load(); }, [load]);

  // Debounced search
  useEffect(() => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => load(search || undefined), 300);
    return () => clearTimeout(searchTimeout.current);
  }, [search, load]);

  const handleAdd = async () => {
    if (!draft.trim()) return;
    setSaving(true);
    try {
      const { data } = await api.post(`/v1/lessons/${lessonId}/notes`, {
        content: draft.trim(),
        timestamp: Math.floor(currentTime),
      });
      setNotes((n) => [...n, data].sort((a, b) => a.timestamp - b.timestamp));
      setDraft('');
    } catch {
      toast.error('Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/v1/notes/${id}`);
      setNotes((n) => n.filter((note) => note.id !== id));
    } catch {
      toast.error('Failed to delete note');
    }
  };

  const handleEditSave = async (id: string) => {
    if (!editContent.trim()) return;
    try {
      const { data } = await api.patch(`/v1/notes/${id}`, { content: editContent.trim() });
      setNotes((n) => n.map((note) => (note.id === id ? data : note)));
      setEditId(null);
    } catch {
      toast.error('Failed to update note');
    }
  };

  const exportMarkdown = () => {
    const lines = [
      `# Notes — ${lessonTitle}`,
      '',
      ...notes.map((n) => `**[${fmt(n.timestamp)}]** ${n.content}`),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    download(blob, `notes-${lessonId}.md`);
  };

  const exportPdf = async () => {
    // Build a minimal printable HTML page and open the browser print dialog
    const html = `<!DOCTYPE html><html><head><title>Notes — ${lessonTitle}</title>
      <style>body{font-family:sans-serif;max-width:700px;margin:40px auto;line-height:1.6}
      h1{font-size:1.4rem}span.ts{color:#4F46E5;font-weight:600;margin-right:8px}</style>
      </head><body><h1>Notes — ${escHtml(lessonTitle)}</h1>
      ${notes.map((n) => `<p><span class="ts">[${fmt(n.timestamp)}]</span>${escHtml(n.content)}</p>`).join('')}
      </body></html>`;
    const win = window.open('', '_blank');
    if (!win) { toast.error('Allow pop-ups to export PDF'); return; }
    win.document.write(html);
    win.document.close();
    win.print();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b dark:border-gray-800 flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes…"
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-2 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex gap-1">
          <button onClick={exportMarkdown} title="Export as Markdown" className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
            <Download className="w-3.5 h-3.5" />
          </button>
          <button onClick={exportPdf} title="Export as PDF" className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
            <BookOpen className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Note list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {notes.length === 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-8">
            {search ? 'No notes match your search.' : 'No notes yet. Add one below!'}
          </p>
        )}
        {notes.map((note) => (
          <div key={note.id} className="rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 space-y-1.5 group">
            <div className="flex items-center justify-between">
              <button
                onClick={() => onSeek(note.timestamp)}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                {fmt(note.timestamp)}
              </button>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => { setEditId(note.id); setEditContent(note.content); }}
                  className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 px-1"
                >
                  Edit
                </button>
                <button onClick={() => handleDelete(note.id)} className="text-gray-400 hover:text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {editId === note.id ? (
              <div className="space-y-1.5">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  className="w-full text-xs rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
                <div className="flex gap-2">
                  <button onClick={() => handleEditSave(note.id)} className="text-xs text-blue-600 hover:underline">Save</button>
                  <button onClick={() => setEditId(null)} className="text-xs text-gray-400 hover:underline">Cancel</button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{note.content}</p>
            )}
          </div>
        ))}
      </div>

      {/* Add note */}
      <div className="p-3 border-t dark:border-gray-800 space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <span>At</span>
          <span className="font-semibold text-blue-600 dark:text-blue-400">{fmt(currentTime)}</span>
        </div>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAdd(); }}
          placeholder="Type a note… (⌘↵ to save)"
          rows={3}
          className="w-full text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
        />
        <button
          onClick={handleAdd}
          disabled={saving || !draft.trim()}
          className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium py-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {saving ? 'Saving…' : 'Add Note'}
        </button>
      </div>
    </div>
  );
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
