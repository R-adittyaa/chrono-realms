'use client';
import { useState } from 'react';

type DiceProps = {
  onRoll: (d1: number, d2: number) => void;
  disabled?: boolean;
  currentPlayer?: {
    id: number;
    name: string;
    faction: { color: string; textColor: string; name: string };
  };
};

export default function Dice({ onRoll, disabled = false, currentPlayer }: DiceProps) {
  const [rolling, setRolling] = useState(false);
  const [face, setFace] = useState({ d1: 1, d2: 1 });

  const handleRoll = () => {
    if (rolling || disabled) return;
    setRolling(true);

    const interval = setInterval(() => {
      setFace({
        d1: Math.floor(Math.random() * 6) + 1,
        d2: Math.floor(Math.random() * 6) + 1,
      });
    }, 80);

    setTimeout(() => {
      clearInterval(interval);
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      setFace({ d1, d2 });
      setRolling(false);
      onRoll(d1, d2);
    }, 700);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 🔥 Indikator Pemain Aktif */}
      {currentPlayer && (
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border-2 ${
            disabled ? 'border-slate-600' : 'border-amber-400 animate-pulse'
          }`}
        >
          <span className={`w-3 h-3 rounded-full ${currentPlayer.faction.color}`} />
          <span className="font-bold text-sm">{currentPlayer.name}</span>
          <span className={`text-xs ${currentPlayer.faction.textColor}`}>
            ({currentPlayer.faction.name})
          </span>
        </div>
      )}

      {/* Dadu */}
      <div className="flex gap-3">
        <div className={`w-16 h-16 bg-white text-black rounded-xl flex items-center justify-center text-3xl font-bold shadow-lg transition-transform ${rolling ? 'animate-spin' : ''}`}>
          {face.d1}
        </div>
        <div className={`w-16 h-16 bg-white text-black rounded-xl flex items-center justify-center text-3xl font-bold shadow-lg transition-transform ${rolling ? 'animate-spin' : ''}`}>
          {face.d2}
        </div>
      </div>

      {/* Tombol */}
      <button
        onClick={handleRoll}
        disabled={rolling || disabled}
        className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {rolling
          ? '🎲 Rolling...'
          : disabled
            ? '⏸️ Menunggu...'
            : `🎲 Roll untuk ${currentPlayer?.name || 'Player'}`}
      </button>
    </div>
  );
}