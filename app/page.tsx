'use client';
import { useState } from 'react';
import Board from '@/components/Board';
import Dice from '@/components/Dice';
import HUD from '@/components/HUD';
import Cards from '@/components/Cards';
import { FACTIONS } from '@/config/factions';
import { TILES } from '@/config/tiles';
import { rollGlobalEvent, GLOBAL_EVENTS } from '@/config/events';

type Player = {
  id: number;
  name: string;
  gold: number;
  position: number;
  faction: (typeof FACTIONS)[number];
  eventImmune: number;
};

type Tile = (typeof TILES)[number] & { owner: number | null };

type ModalState = {
  show: boolean;
  title: string;
  message: string;
  highlight?: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: 'Player 1', gold: 1500, position: 0, faction: FACTIONS[1], eventImmune: 0 },
    { id: 2, name: 'Player 2', gold: 1500, position: 0, faction: FACTIONS[2], eventImmune: 0 },
  ]);

  const [tiles, setTiles] = useState<Tile[]>(
    TILES.map(t => ({ ...t, owner: null }))
  );
  const [turn, setTurn] = useState(1);
  const [log, setLog] = useState<string[]>(['> Game dimulai. Player 1 maju duluan!']);
  const [activeEvent, setActiveEvent] = useState<typeof GLOBAL_EVENTS[number] | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);

  const [modal, setModal] = useState<ModalState>({ show: false, title: '', message: '' });

  const addLog = (msg: string) =>
    setLog(prev => [msg, ...prev].slice(0, 30));

  const closeModal = () => setModal(m => ({ ...m, show: false }));

  const endTurn = () => {
    setTimeout(() => setTurn(t => (t === 1 ? 2 : 1)), 200);
  };

  // === CEK WIN CONDITION ===
  const checkWin = (updatedTiles: Tile[]) => {
    for (const p of players) {
      const owned = updatedTiles.filter(t => t.owner === p.id && t.element);
      const elements: Record<string, number> = {};
      owned.forEach(t => {
        if (t.element) elements[t.element] = (elements[t.element] || 0) + 1;
      });
      const won = Object.values(elements).some(count => count >= 3);
      if (won) {
        setWinner(p);
        addLog(`🏆 ${p.name} MENANG dengan Domination Victory!`);
        return true;
      }
    }
    return false;
  };

  // === GLOBAL EVENT SAAT LEWAT START ===
  const triggerGlobalEvent = () => {
    const event = rollGlobalEvent();
    setActiveEvent(event);

    const isNegative = event.type === 'negative';
    let immuneMsg = '';

    // Efek langsung
    setPlayers(prev =>
      prev.map(p => {
        // Arcane Council imun 1x
        if (isNegative && p.faction.passive.type === 'eventImmunity' && p.eventImmune > 0) {
          immuneMsg += `\n🛡️ ${p.name} (Arcane Council) imun terhadap ${event.name}!`;
          return { ...p, eventImmune: p.eventImmune - 1 };
        }

        let goldDelta = 0;
        if (event.effect === 'goldenAge') goldDelta = 150;
        if (event.effect === 'economicCrisis') goldDelta = -Math.floor(p.gold * 0.1);

        return { ...p, gold: Math.max(0, p.gold + goldDelta) };
      })
    );

    addLog(`🎴 GLOBAL EVENT: ${event.emoji} ${event.name} — ${event.description}${immuneMsg}`);

    setModal({
      show: true,
      title: `${event.emoji} Global Event: ${event.name}`,
      message: event.description + immuneMsg,
      highlight: `Tipe: ${event.type.toUpperCase()}`,
      confirmText: 'Lanjut',
      confirmColor: event.type === 'negative'
        ? 'bg-red-500 hover:bg-red-600 text-white'
        : 'bg-green-500 hover:bg-green-600 text-black',
      onConfirm: () => {
        closeModal();
        endTurn();
      },
    });
  };

  // === ROLL DADU ===
  const handleRoll = (d1: number, d2: number) => {
    if (winner) return;

    const steps = d1 + d2;
    const currentPlayer = players.find(p => p.id === turn)!;
    const oldPos = currentPlayer.position;
    const newPos = (oldPos + steps) % tiles.length;
    const passedStart = newPos < oldPos; // lewat tile 0
    const landedTile = tiles[newPos];

    addLog(`> ${currentPlayer.name} rolled ${d1} & ${d2} = ${steps}. Moved to ${landedTile.name}.`);

    setPlayers(prev =>
      prev.map(p => (p.id === turn ? { ...p, position: newPos } : p))
    );

    // Kalau lewat start → trigger event
    if (passedStart) {
      setTimeout(triggerGlobalEvent, 300);
      return;
    }

    // === LOGIKA TILE ===
    if (landedTile.type === 'start') {
      addLog(`> 🎁 ${currentPlayer.name} mendarat di Realm Hub. +200g bonus!`);
      setPlayers(prev =>
        prev.map(p => (p.id === turn ? { ...p, gold: p.gold + 200 } : p))
      );
      endTurn();
      return;
    }

    if (landedTile.type === 'territory') {
      // Kosong → Beli
      if (landedTile.owner === null) {
        const discount = currentPlayer.faction.passive.type === 'buyDiscount'
          ? currentPlayer.faction.passive.value : 0;
        const finalPrice = Math.floor(landedTile.price * (1 - discount));
        const canAfford = currentPlayer.gold >= finalPrice;

        setModal({
          show: true,
          title: `🏰 Beli ${landedTile.name}?`,
          message: `Wilayah ${landedTile.element?.toUpperCase()} ini belum bertuan.`,
          highlight: `Harga: ${finalPrice}g${discount > 0 ? ` (diskon ${Math.round(discount*100)}%)` : ''}\nGold: ${currentPlayer.gold}g`,
          confirmText: canAfford ? '💰 Beli' : '❌ Gold Kurang',
          confirmColor: canAfford
            ? 'bg-green-500 hover:bg-green-600 text-black'
            : 'bg-slate-600 text-slate-400 cursor-not-allowed',
          cancelText: '⏭️ Skip',
          onConfirm: canAfford
            ? () => {
                const updated = tiles.map((t, i) =>
                  i === newPos ? { ...t, owner: turn } : t
                );
                setTiles(updated);
                setPlayers(prev =>
                  prev.map(p =>
                    p.id === turn ? { ...p, gold: p.gold - finalPrice } : p
                  )
                );
                addLog(`> ✅ ${currentPlayer.name} membeli ${landedTile.name} seharga ${finalPrice}g.`);
                closeModal();
                if (!checkWin(updated)) endTurn();
              }
            : undefined,
          onCancel: () => {
            addLog(`> ${currentPlayer.name} skip beli ${landedTile.name}.`);
            closeModal();
            endTurn();
          },
        });
        return;
      }

      // Milik sendiri
      if (landedTile.owner === turn) {
        addLog(`> 🏠 ${currentPlayer.name} mendarat di wilayah sendiri.`);
        endTurn();
        return;
      }

      // Milik lawan → Sewa atau SIEGE
      const owner = players.find(p => p.id === landedTile.owner)!;
      const baseRent = Math.floor(landedTile.price * 0.1);
      const rentDiscount = currentPlayer.faction.passive.type === 'rentDiscount'
        ? currentPlayer.faction.passive.value : 0;
      const finalRent = Math.floor(baseRent * (1 - rentDiscount));

      setModal({
        show: true,
        title: `⚔️ Wilayah Lawan: ${landedTile.name}`,
        message: `${landedTile.name} dikuasai ${owner.name}.\nPilih: bayar sewa, atau tantang SIEGE untuk rebut!`,
        highlight: `Sewa: ${finalRent}g\nHadiah menang Siege: ${landedTile.name}\nDenda kalah: ${finalRent * 2}g`,
        confirmText: '🔥 Tantang Siege',
        confirmColor: 'bg-orange-500 hover:bg-orange-600 text-black',
        cancelText: '💸 Bayar Sewa',
        onConfirm: () => {
          closeModal();
          // Delay dulu biar modal nutup
          setTimeout(() => initiateSiege(currentPlayer, owner, landedTile, newPos, finalRent), 300);
        },
        onCancel: () => {
          setPlayers(prev =>
            prev.map(p =>
              p.id === turn ? { ...p, gold: p.gold - finalRent } :
              p.id === owner.id ? { ...p, gold: p.gold + finalRent } : p
            )
          );
          addLog(`> 💸 ${currentPlayer.name} bayar sewa ${finalRent}g ke ${owner.name}.`);
          closeModal();
          endTurn();
        },
      });
      return;
    }

    // Tile lain
    addLog(`> ${currentPlayer.name} mendarat di ${landedTile.name} (${landedTile.type}).`);
    endTurn();
  };

  // === SIEGE ===
  const initiateSiege = (
    challenger: Player,
    defender: Player,
    tile: Tile,
    tileIndex: number,
    baseRent: number
  ) => {
    const cRoll = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
    const dRoll = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;

    // Bonus faksi: Warlord +2, Rogue +1, Merchant +0, Arcane +1
    const factionBonus: Record<string, number> = {
      warlord: 2,
      rogue: 1,
      merchant: 0,
      arcane: 1,
    };
    const cBonus = factionBonus[challenger.faction.id] || 0;
    const dBonus = factionBonus[defender.faction.id] || 0;

    const cTotal = cRoll + cBonus;
    const dTotal = dRoll + dBonus;

    const challengerWins = cTotal > dTotal;
    const penalty = baseRent * 2;

    if (challengerWins) {
      const updated = tiles.map((t, i) =>
        i === tileIndex ? { ...t, owner: challenger.id } : t
      );
      setTiles(updated);
      addLog(`> 🏆 SIEGE MENANG! ${challenger.name} rebut ${tile.name} dari ${defender.name}. (${cTotal} vs ${dTotal})`);
      setModal({
        show: true,
        title: `🏆 Siege Victory!`,
        message: `Kamu berhasil merebut ${tile.name} dari ${defender.name}!`,
        highlight: `Challenger: ${cTotal} (${cRoll}+${cBonus})\nDefender: ${dTotal} (${dRoll}+${dBonus})`,
        confirmText: '🎉 Mantap',
        confirmColor: 'bg-green-500 hover:bg-green-600 text-black',
        onConfirm: () => {
          closeModal();
          if (!checkWin(updated)) endTurn();
        },
      });
    } else {
      setPlayers(prev =>
        prev.map(p =>
          p.id === challenger.id ? { ...p, gold: p.gold - penalty } : p
        )
      );
      addLog(`> ❌ SIEGE GAGAL. ${challenger.name} bayar denda ${penalty}g. (${cTotal} vs ${dTotal})`);
      setModal({
        show: true,
        title: `❌ Siege Gagal`,
        message: `${defender.name} mempertahankan ${tile.name}.\nKamu wajib bayar denda 2x sewa.`,
        highlight: `Challenger: ${cTotal} (${cRoll}+${cBonus})\nDefender: ${dTotal} (${dRoll}+${dBonus})\nDenda: ${penalty}g`,
        confirmText: '💸 Terima',
        confirmColor: 'bg-red-500 hover:bg-red-600 text-white',
        onConfirm: () => {
          closeModal();
          endTurn();
        },
      });
    }
  };

  // === RESTART ===
  const restartGame = () => {
    setPlayers([
      { id: 1, name: 'Player 1', gold: 1500, position: 0, faction: FACTIONS[1], eventImmune: 1 },
      { id: 2, name: 'Player 2', gold: 1500, position: 0, faction: FACTIONS[2], eventImmune: 0 },
    ]);
    setTiles(TILES.map(t => ({ ...t, owner: null })));
    setTurn(1);
    setLog(['> Game baru dimulai!']);
    setActiveEvent(null);
    setWinner(null);
    setModal({ show: false, title: '', message: '' });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-amber-400 drop-shadow-lg">
            ⚔️ Chrono Realms
          </h1>
          <button
            onClick={restartGame}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
          >
            🔄 Restart
          </button>
        </div>

        <HUD players={players} turn={turn} />

        {/* Event Banner */}
        {activeEvent && (
          <div className={`mb-4 px-4 py-2 rounded-lg text-sm font-semibold border-2 ${
            activeEvent.type === 'positive'
              ? 'bg-green-900/40 border-green-500 text-green-300'
              : 'bg-red-900/40 border-red-500 text-red-300'
          }`}>
            {activeEvent.emoji} Event Active: <strong>{activeEvent.name}</strong> — {activeEvent.description}
          </div>
        )}

        <Board players={players} tiles={tiles} />

        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-800 p-5 rounded-xl border border-slate-700">
          <div className="text-center md:text-left">
            <div className="text-sm text-slate-400">Giliran Sekarang</div>
            <div className="text-2xl font-bold text-amber-400">Player {turn}</div>
          </div>
          <Dice onRoll={handleRoll} disabled={modal.show || !!winner} />
        </div>

        <div className="mt-6 bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div className="text-sm font-bold text-amber-400 mb-2">📜 Action Log</div>
          <div className="h-40 overflow-y-auto text-sm space-y-1">
            {log.map((line, i) => (
              <div key={i} className="text-slate-300 font-mono text-xs">{line}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      <Cards
        show={modal.show}
        title={modal.title}
        message={modal.message}
        highlight={modal.highlight}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        confirmColor={modal.confirmColor}
        onConfirm={modal.onConfirm}
        onCancel={modal.onCancel}
      />

      {/* Winner Overlay */}
      {winner && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-8 text-center max-w-md">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-black mb-2">VICTORY!</h2>
            <p className="text-black/80 mb-6">
              <strong>{winner.name}</strong> memenangkan Chrono Realms!
            </p>
            <button
              onClick={restartGame}
              className="px-6 py-3 bg-black text-amber-400 font-bold rounded-lg hover:bg-slate-900"
            >
              🔄 Main Lagi
            </button>
          </div>
        </div>
      )}
    </main>
  );
}