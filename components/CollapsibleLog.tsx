'use client';
import { useState } from 'react';

type CollapsibleLogProps = {
  log: string[];
};

export default function CollapsibleLog({ log }: CollapsibleLogProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-amber-400">📜 Action Log</span>
          <span className="text-[10px] text-slate-500">({log.length})</span>
        </div>
        <span className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {open && (
        <div className="px-3 pb-3 max-h-40 overflow-y-auto space-y-1 border-t border-slate-700 pt-2">
          {log.map((line, i) => (
            <div key={i} className="text-slate-300 font-mono text-[10px] leading-relaxed">
              {line}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}