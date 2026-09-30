'use client';
import { useEffect, useRef, useState } from 'react';

type Tile = {
  id: number;
  name: string;
  type: string;
  element: string | null;
  price: number;
  owner: number | null;
};

type Player = {
  id: number;
  name: string;
  faction: { color: string; name: string; textColor: string };
};

type TileTooltipProps = {
  tile: Tile | null;
  players: Player[];
  position: { x: number; y: number };
};

const ELEMENT_INFO: Record<string, { emoji: string; label: string; color: string }> = {
  fire:   { emoji: '🔥', label: 'Fire',   color: 'text-orange-400' },
  ice:    { emoji: '❄️', label: 'Ice',    color: 'text-blue-400' },
  nature: { emoji: '🌿', label: 'Nature', color: 'text-green-400' },
};

const TYPE_INFO: Record<string, { emoji: string; label: string }> = {
  start:     { emoji: '🏠', label: 'Start' },
  territory: { emoji: '🏰', label: 'Territory' },
  relic:     { emoji: '🔮', label: 'Relic' },
  siege:     { emoji: '⚔️', label: 'Siege Camp' },
  event:     { emoji: '🎴', label: 'Event Gate' },
  free:      { emoji: '✨', label: 'Free Realm' },
  jail:      { emoji: '🔒', label: 'Jail' },
  gotojail:  { emoji: '🚔', label: 'Go To Jail' },
};

export default function TileTooltip({ tile, players, position }: TileTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [adjustedPos, setAdjustedPos] = useState(position);

  useEffect(() => {
    if (!tooltipRef.current) return;
    // Auto-adjust biar gak keluar layar
    const rect = tooltipRef.current.getBoundingClientRect();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    let x = position.x + 15;
    let y = position.y + 15;

    if (x + rect.width > viewportW - 10) x = position.x - rect.width - 15;
    if (y + rect.height > viewportH - 10) y = position.y - rect.height - 15;
    if (x < 10) x = 10;
    if (y < 10) y = 10;

    setAdjustedPos({ x, y });
  }, [position, tile]);

  if (!tile) return null;

  const elementInfo = tile.element ? ELEMENT_INFO[tile.element] : null;
  const typeInfo = TYPE_INFO[tile.type] || { emoji: '❓', label: tile.type };
  const owner = tile.owner ? players.find(p => p.id === tile.owner) : null;
  const rent = tile.price > 0 ? Math.floor(tile.price * 0.1) : 0;

  return (
    <div
      ref={tooltipRef}
      className="fixed z-[80] pointer-events-none animate-fadeIn"
      style={{ left: adjustedPos.x, top: adjustedPos.y }}
    >
      <div className="bg-slate-900/95 backdrop-blur-md border-2 border-amber-500/50 rounded-lg shadow-2xl p-3 min-w-[200px] max-w-[260px]">
        {/* Header */}
        <div className="flex items-center gap-2 pb-2 border-b border-slate-700 mb-2">
          <span className="text-xl">{typeInfo.emoji}</span>
          <div className="flex-1">
            <div className="font-bold text-white text-sm leading-tight">
              {tile.name}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">
              {typeInfo.label}
            </div>
          </div>
        </div>

        {/* Element */}
        {elementInfo && (
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-slate-400">Elemen</span>
            <span className={`text-[11px] font-bold ${elementInfo.color}`}>
              {elementInfo.emoji} {elementInfo.label}
            </span>
          </div>
        )}

        {/* Price & Rent */}
        {tile.price > 0 && (
          <>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-slate-400">Harga</span>
              <span className="text-[11px] font-bold text-yellow-400">
                💰 {tile.price}g
              </span>
            </div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-slate-400">Sewa</span>
              <span className="text-[11px] font-bold text-red-400">
                {rent}g
              </span>
            </div>
          </>
        )}

        {/* Owner */}
        <div className="flex items-center justify-between pt-1.5 border-t border-slate-700 mt-1.5">
          <span className="text-[11px] text-slate-400">Pemilik</span>
          {owner ? (
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${owner.faction.color}`}
              />
              <span className={`text-[11px] font-bold ${owner.faction.textColor}`}>
                {owner.name}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-500 italic">
              Belum bertuan
            </span>
          )}
        </div>

        {/* Hint khusus type */}
        {tile.type === 'relic' && (
          <div className="mt-2 pt-2 border-t border-slate-700 text-[10px] text-purple-300 italic">
            🔮 Mendarat di sini untuk ambil relic
          </div>
        )}
        {tile.type === 'siege' && (
          <div className="mt-2 pt-2 border-t border-slate-700 text-[10px] text-orange-300 italic">
            ⚔️ Zona khusus pertempuran
          </div>
        )}
        {tile.type === 'event' && (
          <div className="mt-2 pt-2 border-t border-slate-700 text-[10px] text-blue-300 italic">
            🎴 Memicu event spesial
          </div>
        )}
      </div>
    </div>
  );
}