'use client';

type CardsProps = {
  title: string;
  message: string;
  highlight?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  show?: boolean;
};

export default function Cards({
  title,
  message,
  highlight,
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Batal',
  confirmColor = 'bg-amber-500 hover:bg-amber-600 text-black',
  show = false,
}: CardsProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border-2 border-amber-500 shadow-2xl">
        <h2 className="text-xl font-bold text-amber-400 mb-3">{title}</h2>
        <p className="text-slate-300 mb-3 whitespace-pre-line">{message}</p>

        {highlight && (
          <div className="bg-slate-900 border border-amber-500/40 rounded-lg px-4 py-2 mb-5 text-amber-300 font-mono text-sm">
            {highlight}
          </div>
        )}

        <div className="flex gap-3 justify-end">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors"
            >
              {cancelText}
            </button>
          )}
          {onConfirm && (
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${confirmColor}`}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}