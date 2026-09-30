'use client';
import { useEffect } from 'react';

export type ToastType = 'info' | 'success' | 'warn' | 'danger';

export type Toast = {
  id: number;
  type: ToastType;
  message: string;
  emoji?: string;
};

type ToastContainerProps = {
  toasts: Toast[];
  onDismiss: (id: number) => void;
};

const TYPE_STYLES: Record<ToastType, string> = {
  info:    'bg-blue-900/95 border-blue-500/70 text-blue-100',
  success: 'bg-green-900/95 border-green-500/70 text-green-100',
  warn:    'bg-yellow-900/95 border-yellow-500/70 text-yellow-100',
  danger:  'bg-red-900/95 border-red-500/70 text-red-100',
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 2800);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      onClick={() => onDismiss(toast.id)}
      className={`${TYPE_STYLES[toast.type]} border rounded-full px-3 py-1.5 shadow-lg backdrop-blur-md cursor-pointer animate-slideUp hover:scale-105 transition-transform`}
    >
      <div className="flex items-center gap-1.5 text-xs font-semibold">
        {toast.emoji && <span>{toast.emoji}</span>}
        <span className="whitespace-nowrap">{toast.message}</span>
      </div>
    </div>
  );
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  // Hanya tampilkan 3 toast terbaru
  const visible = toasts.slice(-3);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-1.5 pointer-events-none">
      {visible.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}