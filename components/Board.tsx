'use client';
import { TILES, ELEMENT_COLORS } from '@/config/tiles';

type Player = {
  id: number;
  name: string;
  position: number;
  faction: { color: string };
};

type BoardProps = {
  players: Player[];
  tiles: typeof TILES;
};

// Layout papan 5x5 keliling (16 petak pinggir + 9 tengah kosong)
const BOARD_SIZE = 5;
const CENTER = { row: 3, col: 3 };

export default function Board({ players, tiles }: BoardProps) {
  // Mapping posisi tile ke koordinat grid 5x5 (keliling)
  const getGridPosition = (index: number) => {
    // 16 petak keliling 5x5 = total 16 tile
    // Baris atas: 0-4 (tile 0-4), kolom kanan: 5-9, baris bawah: 10-14, kolom kiri: 15
    const positions = [
      // Baris atas (kiri ke kanan)
      { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 1, col: 3 }, { row: 1, col: 4 }, { row: 1, col: 5 },
      // Kolom kanan (atas ke bawah)
      { row: 2, col: 5 }, { row: 3, col: 5 }, { row: 4, col: 5 }, { row: 5, col: 5 },
      // Baris bawah (kanan ke kiri)
      { row: 5, col: 4 }, { row: 5, col: 3 }, { row: 5, col: 2 }, { row: 5, col: 1 },
      // Kolom kiri (bawah ke atas)
      { row: 4, col: 1 }, { row: 3, col: 1 }, { row: 2, col: 1 },
    ];
    return positions[index] || { row: 1, col: 1 };
  };

  return (
    <div className="bg-slate-900 p-3 rounded-2xl border-2 border-slate-700 shadow-2xl">
      <div
        className="grid gap-1.5"
        style={{
          gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
          aspectRatio: '1 / 1',
        }}
      >
        {/* Petak keliling */}
        {tiles.map((tile, index) => {
          const pos = getGridPosition(index);
          const playersHere = players.filter(p => p.position === tile.id);
          const ownerPlayer = tile.owner
            ? players.find(p => p.id === tile.owner)
            : null;
          const elementGradient =
            ELEMENT_COLORS[tile.element as keyof typeof ELEMENT_COLORS] ||
            ELEMENT_COLORS.null;

          return (
            <div
              key={tile.id}
              className={`relative bg-gradient-to-br ${elementGradient} rounded-md p-1.5 flex flex-col justify-between text-[10px] shadow-md border-2 transition-all hover:scale-105 ${
                ownerPlayer ? 'border-yellow-400 shadow-yellow-400/30' : 'border-slate-700/50'
              }`}
              style={{
                gridRow: pos.row,
                gridColumn: pos.col,
              }}
            >
              <div className="font-bold text-white leading-tight truncate">
                {tile.name}
              </div>

              {tile.price > 0 && (
                <div className="text-yellow-200 font-semibold text-[9px]">
                  {tile.price}g
                </div>
              )}

              {ownerPlayer && (
                <div
                  className={`absolute top-0.5 right-0.5 w-3 h-3 rounded-full ${ownerPlayer.faction.color} border border-white/70`}
                  title={`Owned by ${ownerPlayer.name}`}
                />
              )}

              {/* Token pemain */}
              <div className="absolute bottom-0.5 right-0.5 flex gap-0.5 flex-wrap max-w-[80%] justify-end">
                {playersHere.map(p => (
                  <span
                    key={p.id}
                    className={`w-2.5 h-2.5 rounded-full ${p.faction.color} border border-white shadow-md animate-bounce`}
                    title={p.name}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Area Tengah (Dice Box + Info) */}
        <div
          className="bg-slate-800/80 rounded-xl border-2 border-amber-500/30 flex flex-col items-center justify-center p-4"
          style={{
            gridRow: `${CENTER.row - 1} / span 3`,
            gridColumn: `${CENTER.col - 1} / span 3`,
          }}
        >
          <div className="text-4xl mb-2">⚔️</div>
          <div className="text-amber-400 font-bold text-sm md:text-base text-center">
            CHRONO REALMS
          </div>
          <div className="text-slate-400 text-[10px] text-center mt-1">
            Roll dadu untuk mulai
          </div>
        </div>
      </div>
    </div>
  );
}