'use client';

type Player = {
  id: number;
  name: string;
  gold: number;
  position: number;
  faction: { name: string; color: string; textColor: string };
};

type HUDProps = {
  players: Player[];
  turn: number;
};

export default function HUD({ players, turn }: HUDProps) {
  return (
    <div className="flex flex-wrap gap-3 mb-4">
      {players.map(p => (
        <div
          key={p.id}
          className={`bg-slate-800 px-4 py-3 rounded-lg border-2 transition-all ${
            turn === p.id ? 'border-amber-400 shadow-lg shadow-amber-400/20' : 'border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${p.faction.color}`} />
            <span className="font-bold">{p.name}</span>
            {turn === p.id && (
              <span className="text-xs bg-amber-500 text-black px-2 py-0.5 rounded-full font-bold">
                TURN
              </span>
            )}
          </div>
          <div className="text-yellow-400 font-semibold mt-1">
            💰 {p.gold} Gold
          </div>
          <div className={`text-xs mt-1 ${p.faction.textColor}`}>
            {p.faction.name}
          </div>
        </div>
      ))}
    </div>
  );
}