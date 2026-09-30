'use client';
import { useState } from 'react';

type DiceProps = {
  onRoll: (d1: number, d2: number) => void;
  disabled?: boolean;
};

export default function Dice({ onRoll, disabled = false }: DiceProps) {
  const [rolling, setRolling] = useState(false);
  const [face, setFace] = useState({ d1: 1, d2: 1 });

  const handleRoll = () => {
    if (rolling || disabled) return;
    setRolling(true);

    // Animasi dadu berputar cepat
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
      <div className="flex gap-3">
        <div className="w-16 h-16 bg-white text-black rounded-xl flex items-center justify-center text-3xl font-bold shadow-lg">
          {face.d1}
        </div>
        <div className="w-16 h-16 bg-white text-black rounded-xl flex items-center justify-center text-3xl font-bold shadow-lg">
          {face.d2}
        </div>
      </div>
      <button
        onClick={handleRoll}
        disabled={rolling || disabled}
        className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {rolling ? '🎲 Rolling...' : '🎲 Roll Dice'}
      </button>
    </div>
  );
}