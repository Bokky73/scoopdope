'use client';
// RichTextEditor wraps Tiptap (headless ProseMirror).
// Install dependencies: npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-code-block-lowlight lowlight
// Until installed, this component renders a plain textarea fallback.

import { useState } from 'react';

const MAX_CHARS = 10_000;

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [charCount, setCharCount] = useState(value.length);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = e.target.value;
    if (text.length > MAX_CHARS) return;
    setCharCount(text.length);
    onChange(text);
  }

  return (
    <div className="border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
      {/* Toolbar */}
      <div className="flex gap-1 p-2 border-b bg-gray-50 text-xs text-gray-500">
        <span className="px-1 py-0.5 border rounded cursor-default" title="Bold (B)"><strong>B</strong></span>
        <span className="px-1 py-0.5 border rounded cursor-default" title="Italic (I)"><em>I</em></span>
        <span className="px-1 py-0.5 border rounded cursor-default" title="Bullet list">• List</span>
        <span className="px-1 py-0.5 border rounded cursor-default" title="Ordered list">1. List</span>
        <span className="px-1 py-0.5 border rounded cursor-default font-mono" title="Inline code">`code`</span>
        <span className="px-1 py-0.5 border rounded cursor-default font-mono" title="Code block">```</span>
      </div>
      <textarea
        className="w-full p-3 text-sm resize-none focus:outline-none min-h-[120px]"
        value={value}
        onChange={handleChange}
        placeholder={placeholder ?? 'Write your post…'}
        maxLength={MAX_CHARS}
        aria-label="Post content"
      />
      <div className="px-3 pb-2 text-xs text-gray-400 text-right">
        {charCount} / {MAX_CHARS}
      </div>
    </div>
  );
}
