'use client';

import { useToastStore } from '@/lib/toast';

const icons = { error: '✕', success: '✓', info: 'ℹ' };
const colors = {
  error: 'bg-red-600',
  success: 'bg-green-600',
  info: 'bg-blue-600',
};

export function Toaster() {
  const { toasts, remove } = useToastStore();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 rounded-lg px-4 py-3 text-white shadow-lg text-sm ${colors[t.type]}`}
        >
          <span className="font-bold mt-0.5">{icons[t.type]}</span>
          <span className="flex-1">{t.message}</span>
          <button onClick={() => remove(t.id)} className="opacity-70 hover:opacity-100 ml-2">
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
