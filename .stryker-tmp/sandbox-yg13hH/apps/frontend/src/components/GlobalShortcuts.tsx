'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { ShortcutsHelpModal } from '@/components/ShortcutsHelpModal';

export function GlobalShortcuts() {
  const router = useRouter();
  const [helpOpen, setHelpOpen] = useState(false);

  const focusSearch = useCallback(() => {
    const input = document.querySelector<HTMLInputElement>('input[placeholder*="earch"]');
    if (input) { input.focus(); input.select(); }
  }, []);

  const shortcuts = useMemo(() => [
    {
      key: '/',
      skipOnInput: true,
      handler: (e: KeyboardEvent) => { e.preventDefault(); focusSearch(); },
    },
    {
      key: 'k',
      ctrl: true,
      skipOnInput: false,
      handler: (e: KeyboardEvent) => { e.preventDefault(); focusSearch(); },
    },
    {
      key: '?',
      skipOnInput: true,
      handler: (e: KeyboardEvent) => { e.preventDefault(); setHelpOpen((o) => !o); },
    },
    {
      key: 'Escape',
      skipOnInput: false,
      handler: () => {
        // Modals listen for Escape themselves; this is a fallback to navigate back
        // if no modal is open. We only close the help modal here.
        setHelpOpen(false);
      },
    },
  ], [focusSearch]);

  useKeyboardShortcuts(shortcuts);

  return helpOpen ? <ShortcutsHelpModal onClose={() => setHelpOpen(false)} /> : null;
}
