'use client';

type Player = {
  id: number;
  name: string;
  gold: number;
  position: number;
  faction: {
    name: string;
    color: string;
    textColor: string;
    description: string;
  };
};

type Tile = {
  id: number;
  name: string;
  element: string | null;
  price: number;
  owner: number | null;
};

type PlayerPanelProps = {
  player: Player;
  tiles: Tile[];
  isActive: boolean;
};

export default function PlayerPanel({ player, tiles, isActive }: PlayerPanelProps) {
  const ownedTiles = tiles.filter(t => t.owner === player.id);

  const elementCount = ownedTiles.reduce((acc, t) => {
    if (t.element) {
      acc[t.element] = (acc[t.element] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const totalValue = ownedTiles.reduce((sum, t) => sum + t.price, 0);
  const rentIncome = ownedTiles.reduce((sum, t) => sum + Math.floor(t.price * 0.1), 0);

  const elementEmoji: Record<string, string> = {
    fire: '🔥',
    ice: '❄️',
    nature: '🌿',
  };

  // Cek apakah player punya set lengkap (4 tile elemen sama)
  const hasDomination = Object.values(elementCount).some(c => c >= 4);

  return (
    <div
      className={`bg-slate-800 rounded-xl border-2 p-4 transition-all ${
        isActive
          ? 'border-amber-400 shadow-lg shadow-amber-400/20 scale-[1.02]'
          : 'border-slate-700'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-3 h-3 rounded-full ${player.faction.color}`} />
        <div className="flex-1">
          <div className="font-bold text-sm">{player.name}</div>
          <div className={`text-[10px] ${player.faction.textColor}`}>
            {player.faction.name}
          </div>
        </div>
        {isActive && (
          <span className="text-[10px] bg-amber-500 text-black px-2 py-0.5 rounded-full font-bold animate-pulse">
            TURN
          </span>
        )}
      </div>

      {/* Gold */}
      <div className="bg-slate-900 rounded-lg p-2.5 mb-3">
        <div className="text-[10px] text-slate-400 uppercase tracking-wider">Gold</div>
        <div className={`text-xl font-bold ${player.gold >= 8000 ? 'text-green-400' : 'text-yellow-400'}`}>
          💰 {player.gold}
        </div>
        <div className="text-[10px] text-slate-500 mt-0.5">
          Income/turn: +{rentIncome}g
        </div>
        {player.gold >= 8000 && (
          <div className="text-[10px] text-green-400 mt-1 font-bold">
            ⚡ Menang Tycoon!
          </div>
        )}
      </div>

      {/* Statistik Aset */}
      <div className="grid grid-cols-3 gap-1.5 mb-3">
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
        <div className="bg-slate-900 rounded p-1.5 text-center">
          <div className="text-[9px] text-slate-400">Elemen</div>
          <div className="text-sm font-bold text-white">
            {Object.keys(elementCount).length}
          </div>
        </div>
      </div>

      {/* Progress Elemen */}
      <div className="mb-3">
        <div className="text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">
          Koleksi (4 = Menang)
        </div>
        <div className="flex gap-1.5">
          {['fire', 'ice', 'nature'].map(el => {
            const count = elementCount[el] || 0;
            const isComplete = count >= 4;
            return (
              <div
                key={el}
                className={`flex-1 rounded p-1.5 text-center border transition-all ${
                  isComplete
                    ? 'bg-amber-500/30 border-amber-400 shadow-lg shadow-amber-500/30'
                    : count > 0
                      ? 'bg-slate-900 border-slate-600'
                      : 'bg-slate-900/50 border-slate-700/50 opacity-40'
                }`}
              >
                <div className="text-base">{elementEmoji[el]}</div>
                <div className={`text-xs font-bold ${
                  isComplete ? 'text-amber-400' : 'text-slate-300'
                }`}>
                  {count}/4
                </div>
              </div>
            );
          })}
        </div>
        {hasDomination && (
          <div className="text-[10px] text-amber-400 mt-1.5 font-bold text-center animate-pulse">
            🏆 DOMINATION SIAP!
          </div>
        )}
      </div>

      {/* Daftar Aset */}
      {ownedTiles.length > 0 ? (
        <div>
          <div className="text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">
            Aset ({ownedTiles.length})
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {ownedTiles.map(t => (
              <div
                key={t.id}
                className="bg-slate-900 rounded px-2 py-1 text-[11px] flex items-center justify-between"
              >
                <span className="truncate">
                  {elementEmoji[t.element || ''] || '📍'} {t.name}
                </span>
                <span className="text-yellow-400 font-mono text-[10px]">{t.price}g</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-[10px] text-slate-500 italic text-center py-2">
          Belum punya wilayah
        </div>
      )}
    </div>
  );
}