'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FACTIONS } from '@/config/factions';
import { sfxClick, sfxBuy } from '@/utils/sfx';

type GameMode = 'ai' | 'pvp';

export default function LandingPage() {
  const router = useRouter();
  const [mode, setMode] = useState<GameMode>('ai');
  const [p1Faction, setP1Faction] = useState<string | null>(null);
  const [p2Faction, setP2Faction] = useState<string | null>(null);

  const handleStart = () => {
    if (!p1Faction) {
      alert('Pilih faksi Player 1 dulu!');
      return;
    }
    if (mode === 'pvp' && !p2Faction) {
      alert('Pilih faksi Player 2 dulu!');
      return;
    }
    if (mode === 'pvp' && p1Faction === p2Faction) {
      alert('Faksi P1 dan P2 tidak boleh sama!');
      return;
    }

    sfxBuy();
    localStorage.setItem('gameMode', mode);
    localStorage.setItem('p1Faction', p1Faction);

    if (mode === 'pvp' && p2Faction) {
      localStorage.setItem('p2Faction', p2Faction);
    } else {
      localStorage.removeItem('p2Faction'); // AI ambil random
    }

    router.push('/game');
  };

  // Faksi yang bisa dipilih P2 (kalau P1 udah pilih)
  const availableForP2 = FACTIONS.filter(f => f.id !== p1Faction);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white overflow-hidden relative">
      {/* Background Ornamen */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 text-9xl">⚔️</div>
        <div className="absolute top-40 right-20 text-9xl">🏰</div>
        <div className="absolute bottom-20 left-1/3 text-9xl">🎲</div>
        <div className="absolute bottom-40 right-40 text-9xl">🔥</div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="text-6xl md:text-7xl mb-3 animate-bounce">⚔️</div>
          <h1 className="text-4xl md:text-6xl font-bold text-amber-400 drop-shadow-2xl mb-3">
            CHRONO REALMS
          </h1>
          <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto">
            Monopoli Strategy bertema Fantasy — rebut wilayah, kalahkan lawan, kuasai Realm!
          </p>
        </div>

        {/* STEP 1: PILIH MODE */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-amber-400 mb-1 text-center">
            🎮 Pilih Mode
          </h2>
          <p className="text-center text-xs text-slate-400 mb-4">
            Langkah 1 dari 3
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <button
              onClick={() => {
                sfxClick();
                setMode('ai');
                setP2Faction(null);
              }}
              className={`relative text-left bg-slate-800 rounded-xl p-5 border-2 transition-all hover:scale-105 ${
                mode === 'ai'
                  ? 'border-amber-400 shadow-lg shadow-amber-400/30 ring-2 ring-amber-400'
                  : 'border-slate-700 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-4xl">🤖</div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">Solo vs AI</h3>
                  <p className="text-xs text-slate-400">
                    Main sendiri, lawan komputer
                  </p>
                </div>
              </div>
              {mode === 'ai' && (
                <div className="absolute top-2 right-2 bg-amber-400 text-black text-xs font-bold px-2 py-1 rounded-full">
                  ✓
                </div>
              )}
            </button>

            <button
              onClick={() => {
                sfxClick();
                setMode('pvp');
              }}
              className={`relative text-left bg-slate-800 rounded-xl p-5 border-2 transition-all hover:scale-105 ${
                mode === 'pvp'
                  ? 'border-amber-400 shadow-lg shadow-amber-400/30 ring-2 ring-amber-400'
                  : 'border-slate-700 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-4xl">👥</div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">2 Player</h3>
                  <p className="text-xs text-slate-400">
                    Main berdua di device yang sama
                  </p>
                </div>
              </div>
              {mode === 'pvp' && (
                <div className="absolute top-2 right-2 bg-amber-400 text-black text-xs font-bold px-2 py-1 rounded-full">
                  ✓
                </div>
              )}
            </button>
          </div>
        </div>

        {/* STEP 2: PILIH FAKSI P1 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-amber-400 mb-1 text-center">
            🎭 Faksi Player 1
          </h2>
          <p className="text-center text-xs text-slate-400 mb-4">
            Langkah 2 dari 3
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {FACTIONS.map((faction) => {
              const isSelected = p1Faction === faction.id;
              const disabled = false;
              return (
                <button
                  key={faction.id}
                  onClick={() => {
                    if (disabled) return;
                    sfxClick();
                    setP1Faction(faction.id);
                    // Kalau P2 udah pilih faksi yang sama, reset P2
                    if (p2Faction === faction.id) setP2Faction(null);
                  }}
                  disabled={disabled}
                  className={`relative text-left bg-slate-800 rounded-xl p-4 border-2 transition-all hover:scale-105 ${
                    isSelected
                      ? 'border-amber-400 shadow-lg shadow-amber-400/30 ring-2 ring-amber-400'
                      : 'border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full ${faction.color} mb-2 flex items-center justify-center text-xl`}
                  >
                    {faction.id === 'merchant' && '💰'}
                    {faction.id === 'warlord' && '⚔️'}
                    {faction.id === 'rogue' && '🗡️'}
                    {faction.id === 'arcane' && '🔮'}
                  </div>
                  <h3 className="font-bold text-sm mb-1">{faction.name}</h3>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    {faction.description}
                  </p>
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 bg-amber-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 3: PILIH FAKSI P2 (KALAU PVP) */}
        {mode === 'pvp' && (
          <div className="mb-8 animate-fadeIn">
            <h2 className="text-xl font-bold text-amber-400 mb-1 text-center">
              🎭 Faksi Player 2
            </h2>
            <p className="text-center text-xs text-slate-400 mb-4">
              Langkah 3 dari 3 — Faksi berbeda dengan P1
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availableForP2.map((faction) => {
                const isSelected = p2Faction === faction.id;
                return (
                  <button
                    key={faction.id}
                    onClick={() => {
                      sfxClick();
                      setP2Faction(faction.id);
                    }}
                    className={`relative text-left bg-slate-800 rounded-xl p-4 border-2 transition-all hover:scale-105 ${
                      isSelected
                        ? 'border-amber-400 shadow-lg shadow-amber-400/30 ring-2 ring-amber-400'
                        : 'border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full ${faction.color} mb-2 flex items-center justify-center text-xl`}
                    >
                      {faction.id === 'merchant' && '💰'}
                      {faction.id === 'warlord' && '⚔️'}
                      {faction.id === 'rogue' && '🗡️'}
                      {faction.id === 'arcane' && '🔮'}
                    </div>
                    <h3 className="font-bold text-sm mb-1">{faction.name}</h3>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      {faction.description}
                    </p>
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 bg-amber-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Info P2 buat mode AI */}
        {mode === 'ai' && p1Faction && (
          <div className="mb-8 animate-fadeIn">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 max-w-2xl mx-auto text-center">
              <div className="text-sm text-slate-300">
                🤖 <strong>AI</strong> akan mendapat faksi random (bukan {FACTIONS.find(f => f.id === p1Faction)?.name})
              </div>
            </div>
          </div>
        )}

        {/* Cara Main */}
        <div className="mb-8 bg-slate-800/50 rounded-xl p-5 border border-slate-700">
          <h2 className="text-lg font-bold text-amber-400 mb-4 text-center">
            📖 Cara Main
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
            <div className="text-center">
              <div className="text-3xl mb-2">🎲</div>
              <div className="font-bold mb-1 text-amber-300">1. Lempar Dadu</div>
              <p className="text-slate-400 text-xs">
                Setiap turn lempar 2 dadu (total 2-12).
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🏰</div>
              <div className="font-bold mb-1 text-amber-300">2. Beli / Rebut Wilayah</div>
              <p className="text-slate-400 text-xs">
                Beli wilayah kosong, atau tantang Siege!
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🏆</div>
              <div className="font-bold mb-1 text-amber-300">3. Menang!</div>
              <p className="text-slate-400 text-xs">
                Kuasai 4 wilayah elemen sama atau capai 8000g.
              </p>
            </div>
          </div>
        </div>

        {/* Win Conditions */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="bg-slate-800 rounded-lg p-2.5 text-center border border-slate-700">
            <div className="text-xl mb-1">🏆</div>
            <div className="font-bold text-amber-400">Domination</div>
            <div className="text-slate-400 text-[10px]">4 tile elemen sama</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-2.5 text-center border border-slate-700">
            <div className="text-xl mb-1">💰</div>
            <div className="font-bold text-amber-400">Tycoon</div>
            <div className="text-slate-400 text-[10px]">8000g / aset 5000g</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-2.5 text-center border border-slate-700">
            <div className="text-xl mb-1">💀</div>
            <div className="font-bold text-amber-400">Elimination</div>
            <div className="text-slate-400 text-[10px]">Lawan bangkrut</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-2.5 text-center border border-slate-700">
            <div className="text-xl mb-1">⏱️</div>
            <div className="font-bold text-amber-400">Turn Limit</div>
            <div className="text-slate-400 text-[10px]">Poin (40 turn)</div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={handleStart}
            disabled={!p1Faction || (mode === 'pvp' && !p2Faction)}
            className={`px-10 py-4 text-lg font-bold rounded-xl transition-all shadow-2xl ${
              p1Faction && (mode === 'ai' || p2Faction)
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black hover:scale-105'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            {!p1Faction
              ? '👆 Pilih Faksi P1 Dulu'
              : mode === 'pvp' && !p2Faction
                ? '👆 Pilih Faksi P2 Dulu'
                : `🎮 MULAI GAME (${mode === 'ai' ? 'vs AI' : '2 Player'})`}
          </button>
          <p className="text-xs text-slate-500 mt-3">
            Dibuat dengan Next.js + Tailwind CSS
          </p>
        </div>
      </div>
    </main>
  );
}