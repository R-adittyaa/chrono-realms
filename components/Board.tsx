'use client';
import { TILES, ELEMENT_COLORS } from '@/config/tiles';

type Player = {
  id: number;
  name: string;
  position: number;
  faction: { color: string; name: string };
};

type BoardProps = {
  players: Player[];
  tiles: typeof TILES;
  onTileHover?: (tileId: number, position: { x: number; y: number } | null) => void;
};

const BOARD_SIZE = 6;

export default function Board({ players, tiles, onTileHover }: BoardProps) {
  const getGridPosition = (index: number) => {
    const positions = [
      { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 1, col: 3 },
      { row: 1, col: 4 }, { row: 1, col: 5 }, { row: 1, col: 6 },
      { row: 2, col: 6 }, { row: 3, col: 6 }, { row: 4, col: 6 }, { row: 5, col: 6 },
      { row: 6, col: 6 }, { row: 6, col: 5 }, { row: 6, col: 4 },
      { row: 6, col: 3 }, { row: 6, col: 2 }, { row: 6, col: 1 },
      { row: 5, col: 1 }, { row: 4, col: 1 }, { row: 3, col: 1 }, { row: 2, col: 1 },
    ];
    return positions[index] || { row: 1, col: 1 };
  };

  return (
    <div className="w-full max-w-[720px] mx-auto bg-slate-900 p-2 rounded-2xl border-2 border-slate-700 shadow-2xl">
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
          aspectRatio: '1 / 1',
        }}
      >
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
              onMouseEnter={(e) => {
                if (onTileHover) onTileHover(tile.id, { x: e.clientX, y: e.clientY });
              }}
              onMouseMove={(e) => {
                if (onTileHover) onTileHover(tile.id, { x: e.clientX, y: e.clientY });
              }}
              onMouseLeave={() => {
                if (onTileHover) onTileHover(tile.id, null);
              }}
              className={`relative bg-gradient-to-br ${elementGradient} rounded p-1 flex flex-col justify-between shadow border-2 transition-all hover:scale-105 hover:z-10 cursor-help ${
                ownerPlayer ? 'border-yellow-400' : 'border-slate-700/40'
              }`}
              style={{ gridRow: pos.row, gridColumn: pos.col }}
            >
              <div className="font-bold text-white text-[9px] leading-tight truncate">
                {tile.name}
              </div>

              {tile.price > 0 && (
                <div className="text-yellow-100 font-semibold text-[8px]">
                  {tile.price}g
                </div>
              )}

              {ownerPlayer && (
                <div
                  className={`absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full ${ownerPlayer.faction.color} border border-white`}
                  title={`Milik ${ownerPlayer.name}`}
                />
              )}

              <div className="absolute inset-x-0 bottom-0 flex gap-0.5 justify-center items-center pb-0.5">
                {playersHere.map(p => (
                  <span
                    key={p.id}
                    className={`w-4 h-4 rounded-full ${p.faction.color} border-2 border-white shadow-lg ring-2 ring-black/40 flex items-center justify-center text-[8px] font-bold text-white`}
                    title={p.name}
                  >
                    P{p.id}
                  </span>
                ))}
              </div>
            </div>
          );
        })}

        {/* Area Tengah */}
        <div
          className="bg-slate-800 rounded-xl border-2 border-amber-500/40 flex flex-col items-center justify-center p-3"
          style={{
            gridRow: '2 / span 4',
            gridColumn: '2 / span 4',
          }}
        >
          <div className="text-3xl md:text-4xl">⚔️</div>
          <div className="text-amber-400 font-bold text-sm md:text-base text-center mt-1">
            CHRONO REALMS
          </div>
          <div className="text-slate-500 text-[10px] mt-1">20 Territories</div>
        </div>
      </div>
    </div>
  );
}