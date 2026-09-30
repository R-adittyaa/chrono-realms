'use client';
import { useState } from 'react';

type Player = {
  id: number;
  name: string;
  gold: number;
  position: number;
  faction: { name: string; color: string; textColor: string; description: string };
};

type Tile = {
  id: number;
  name: string;
  element: string | null;
  price: number;
  owner: number | null;
};

type MobilePlayerTabsProps = {
  players: Player[];
  tiles: Tile[];
  turn: number;
};

const elementEmoji: Record<string, string> = {
  fire: '🔥',
  ice: '❄️',
  nature: '🌿',
};

export default function MobilePlayerTabs({ players, tiles, turn }: MobilePlayerTabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  const player = players[activeTab];
  const ownedTiles = tiles.filter(t => t.owner === player.id);

  const elementCount = ownedTiles.reduce((acc, t) => {
    if (t.element) acc[t.element] = (acc[t.element] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalValue = ownedTiles.reduce((sum, t) => sum + t.price, 0);
  const rentIncome = ownedTiles.reduce((sum, t) => sum + Math.floor(t.price * 0.1), 0);
  const hasDomination = Object.values(elementCount).some(c => c >= 4);
  const isActive = turn === player.id;

  return (
    <div className="lg:hidden mb-3">
      {/* Tab Headers */}
      <div className="flex gap-2 mb-2">
        {players.map((p, idx) => {
          const isSel = activeTab === idx;
          const isTurn = turn === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setActiveTab(idx)}
              className={`flex-1 flex items-center justify-between px-3 py-2 rounded-lg border-2 text-xs font-bold transition-all ${
                isSel
                  ? 'bg-slate-800 border-amber-400 text-white'
                  : 'bg-slate-900/50 border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${p.faction.color}`} />
                <span className="truncate">{p.name}</span>
              </div>
              {isTurn && (
                <span className="text-[9px] bg-amber-500 text-black px-1.5 py-0.5 rounded-full animate-pulse">
                  TURN
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Panel Content */}
      <div
        className={`bg-slate-800 rounded-xl border-2 p-3 ${
          isActive ? 'border-amber-400/60' : 'border-slate-700'
        }`}
      >
        {/* Header Row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${player.faction.color}`} />
            <div>
              <div className="font-bold text-sm">{player.name}</div>
              <div className={`text-[10px] ${player.faction.textColor}`}>
                {player.faction.name}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-yellow-400">💰 {player.gold}g</div>
            <div className="text-[10px] text-slate-500">+{rentIncome}g/turn</div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-1.5 mb-2">
          <div className="bg-slate-900 rounded p-1.5 text-center">
            <div className="text-[9px] text-slate-400">Wilayah</div>
            <div className="text-sm font-bold text-white">{ownedTiles.length}</div>
          </div>
          <div className="bg-slate-900 rounded p-1.5 text-center">
            <div className="text-[9px] text-slate-400">Nilai</div>
            <div className={`text-sm font-bold ${totalValue >= 5000 ? 'text-green-400' : 'text-white'}`}>
              {totalValue}g
            </div>
          </div>
          <div className="bg-slate-900 rounded p-1.5 text-center col-span-2">
            <div className="text-[9px] text-slate-400 mb-0.5">Koleksi (4 = Menang)</div>
            <div className="flex gap-1 justify-center">
              {['fire', 'ice', 'nature'].map(el => {
                const count = elementCount[el] || 0;
                const isComplete = count >= 4;
                return (
                  <span
                    key={el}
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isComplete ? 'bg-amber-500/30 text-amber-400' : 'text-slate-300'
                    }`}
                  >
                    {elementEmoji[el]}{count}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Aset List */}
        {ownedTiles.length > 0 && (
          <div className="flex gap-1 flex-wrap max-h-16 overflow-y-auto">
            {ownedTiles.map(t => (
              <span
                key={t.id}
                className="text-[10px] bg-slate-900 rounded px-1.5 py-0.5 flex items-center gap-1"
              >
                {elementEmoji[t.element || ''] || '📍'}
                <span className="truncate max-w-[80px]">{t.name}</span>
              </span>
            ))}
          </div>
        )}

        {hasDomination && (
          <div className="text-[10px] text-amber-400 mt-2 font-bold text-center animate-pulse">
            🏆 DOMINATION SIAP!
          </div>
        )}
      </div>
    </div>
  );
}