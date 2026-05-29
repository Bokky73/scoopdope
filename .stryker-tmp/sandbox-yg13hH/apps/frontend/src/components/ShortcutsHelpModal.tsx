'use client';

import { useEffect } from 'react';

interface ShortcutsHelpModalProps {
  onClose: () => void;
}

const SHORTCUTS = [
  { keys: ['Ctrl', 'K'], description: 'Focus search' },
  { keys: ['/'], description: 'Focus search' },
  { keys: ['?'], description: 'Show this help' },
  { keys: ['Esc'], description: 'Close modal / dialog' },
  { keys: ['Space'], description: 'Play / Pause video' },
  { keys: ['←'], description: 'Seek video back 10s' },
  { keys: ['→'], description: 'Seek video forward 10s' },
];

export function ShortcutsHelpModal({ onClose }: ShortcutsHelpModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Keyboard Shortcuts</h2>
          <button onClick={onClose} aria-label="Close" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
        </div>
        <ul className="p-4 space-y-2">
          {SHORTCUTS.map(({ keys, description }) => (
            <li key={description} className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{description}</span>
              <span className="flex gap-1">
                {keys.map((k) => (
                  <kbd key={k} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono text-gray-700 dark:text-gray-300">
                    {k}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
