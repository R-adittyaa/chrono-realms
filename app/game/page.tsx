'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Board from '@/components/Board';
import Dice from '@/components/Dice';
import Cards from '@/components/Cards';
import PlayerPanel from '@/components/PlayerPanel';
import ToastContainer, { Toast, ToastType } from '@/components/Toast';
import TileTooltip from '@/components/TileTooltip';
import { FACTIONS } from '@/config/factions';
import { TILES } from '@/config/tiles';
import { rollGlobalEvent, GLOBAL_EVENTS } from '@/config/events';
import { checkAllWinConditions } from '@/utils/gameLogic';
import { aiShouldBuy, aiShouldSiege, getAiDelay } from '@/utils/aiLogic';
import {
  sfxDiceRoll,
  sfxBuy,
  sfxPay,
  sfxSiegeWin,
  sfxSiegeLose,
  sfxEvent,
  sfxVictory,
  sfxClick,
  sfxTick,
  sfxLand,
} from '@/utils/sfx';
import {
  saveGame,
  loadGame,
  clearSave,
  timeAgo,
} from '@/utils/storage';

type Player = {
  id: number;
  name: string;
  gold: number;
  position: number;
  faction: (typeof FACTIONS)[number];
  eventImmune: number;
  isAI?: boolean;
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

const MAX_TURNS = 40;
const ANIM_STEP_MS = 250;
const ANIM_FAST_MS = 80;
const FAST_THRESHOLD = 6;

function createNewPlayers(vsAI = true): Player[] {
  let p1Faction = FACTIONS[1];
  let p2Faction = FACTIONS.find(f => f.id !== p1Faction.id) || FACTIONS[2];
  let isAIMode = vsAI;

  if (typeof window !== 'undefined') {
    const p1FactionId = localStorage.getItem('p1Faction');
    const foundP1 = FACTIONS.find(f => f.id === p1FactionId);
    if (foundP1) p1Faction = foundP1;

    const savedMode = localStorage.getItem('gameMode');
    isAIMode = savedMode !== 'pvp';

    if (!isAIMode) {
      const p2FactionId = localStorage.getItem('p2Faction');
      const foundP2 = FACTIONS.find(f => f.id === p2FactionId && f.id !== p1Faction.id);
      if (foundP2) p2Faction = foundP2;
    } else {
      const available = FACTIONS.filter(f => f.id !== p1Faction.id);
      p2Faction = available[Math.floor(Math.random() * available.length)];
    }
  }

  return [
    { id: 1, name: 'Player 1', gold: 1500, position: 0, faction: p1Faction, eventImmune: 0, isAI: false },
    { id: 2, name: isAIMode ? '🤖 AI' : 'Player 2', gold: 1500, position: 0, faction: p2Faction, eventImmune: 0, isAI: isAIMode },
  ];
}

function createNewTiles(): Tile[] {
  return TILES.map(t => ({ ...t, owner: null }));
}

export default function GamePage() {
  const router = useRouter();

  // === STATE ===
  const [players, setPlayers] = useState<Player[]>(() => createNewPlayers(true));
  const [tiles, setTiles] = useState<Tile[]>(createNewTiles);
  const [turn, setTurn] = useState(1);
  const [turnCount, setTurnCount] = useState(1);
  const [log, setLog] = useState<string[]>(['> Game dimulai. Player 1 maju duluan!']);
  const [activeEvent, setActiveEvent] = useState<typeof GLOBAL_EVENTS[number] | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);
  const [winCondition, setWinCondition] = useState<string | null>(null);

  const [modal, setModal] = useState<ModalState>({ show: false, title: '', message: '' });
  const [readyToPlay, setReadyToPlay] = useState(false);

  const [aiIsThinking, setAiIsThinking] = useState(false);
  const aiActedForTurnRef = useRef<number | null>(null);

  const [isAnimating, setIsAnimating] = useState(false);

  // === TOAST ===
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  // === TOOLTIP ===
  const [hoveredTile, setHoveredTile] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const addToast = (message: string, type: ToastType = 'info', emoji?: string) => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, type, message, emoji }].slice(-3));
  };

  const dismissToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // === TOOLTIP HANDLER ===
  const handleTileHover = (
    tileId: number,
    position: { x: number; y: number } | null
  ) => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }

    if (!position) {
      tooltipTimeoutRef.current = setTimeout(() => {
        setHoveredTile(null);
      }, 100);
      return;
    }

    setTooltipPos(position);

    if (hoveredTile !== tileId) {
      tooltipTimeoutRef.current = setTimeout(() => {
        setHoveredTile(tileId);
      }, 400);
    }
  };

  // === CEK SAVE SAAT MOUNT ===
  useEffect(() => {
    const saved = loadGame();
    if (saved) {
      setModal({
        show: true,
        title: '💾 Lanjutkan Game?',
        message: `Ada game tersimpan dari ${timeAgo(saved.savedAt)}.`,
        highlight: `Turn ${saved.turnCount} • P1: ${saved.players[0].gold}g • P2: ${saved.players[1].gold}g`,
        confirmText: '📂 Lanjutkan',
        confirmColor: 'bg-green-500 hover:bg-green-600 text-black',
        cancelText: '🆕 Game Baru',
        onConfirm: () => {
          sfxClick();
          setPlayers(saved.players);
          setTiles(saved.tiles);
          setTurn(saved.turn);
          setTurnCount(saved.turnCount);
          setLog(saved.log);
          setModal({ show: false, title: '', message: '' });
          setReadyToPlay(true);
        },
        onCancel: () => {
          sfxClick();
          clearSave();
          setModal({ show: false, title: '', message: '' });
          setReadyToPlay(true);
        },
      });
    } else {
      setReadyToPlay(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // === AUTO-SAVE ===
  useEffect(() => {
    if (!readyToPlay) return;
    if (winner) return;
    if (isAnimating) return;
    saveGame({ players, tiles, turn, turnCount, log });
  }, [players, tiles, turn, turnCount, log, winner, readyToPlay, isAnimating]);

  // === RESET AI THINKING ===
  useEffect(() => {
    const currentPlayer = players.find(p => p.id === turn);
    if (currentPlayer && !currentPlayer.isAI) {
      setAiIsThinking(false);
    }
  }, [turn, players]);

  const addLog = (msg: string) =>
    setLog(prev => [msg, ...prev].slice(0, 50));

  const closeModal = () => setModal(m => ({ ...m, show: false }));

  const endTurn = () => {
    setAiIsThinking(false);
    setTurnCount(c => c + 1);
    setTimeout(() => setTurn(t => (t === 1 ? 2 : 1)), 200);
  };

  // === AUTO CEK WIN ===
  useEffect(() => {
    if (winner) return;
    if (!readyToPlay) return;
    if (isAnimating) return;
    const result = checkAllWinConditions(players, tiles, turnCount);
    if (result.winner && result.condition) {
      sfxVictory();
      setWinner(result.winner);
      setWinCondition(result.condition);
      addLog(`🏆 ${result.winner.name} MENANG via ${result.condition}!`);
      clearSave();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players, tiles, turnCount, winner, readyToPlay, isAnimating]);

  // === GLOBAL EVENT ===
  const triggerGlobalEvent = () => {
    sfxEvent();
    const event = rollGlobalEvent();
    setActiveEvent(event);

    const isNegative = event.type === 'negative';
    let immuneMsg = '';

    setPlayers(prev =>
      prev.map(p => {
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
        sfxClick();
        closeModal();
        endTurn();
      },
    });
  };

  // === LOGIKA TILE SETELAH MENDARAT ===
  const processLanding = (
    currentPlayer: Player,
    newPos: number,
    passedStart: boolean
  ) => {
    const landedTile = tiles[newPos];

    addLog(`> ${currentPlayer.name} mendarat di ${landedTile.name}.`);

    if (passedStart && landedTile.type !== 'start') {
      setTimeout(triggerGlobalEvent, 200);
      return;
    }

    if (landedTile.type === 'start') {
      addLog(`> 🎁 ${currentPlayer.name} mendarat di Realm Hub. +200g bonus!`);
      addToast('+200g Realm Hub', 'success', '🎁');
      setPlayers(prev =>
        prev.map(p => (p.id === turn ? { ...p, gold: p.gold + 200 } : p))
      );
      endTurn();
      return;
    }

    if (landedTile.type === 'territory') {
      // KOSONG
      if (landedTile.owner === null) {
        const discount = currentPlayer.faction.passive.type === 'buyDiscount'
          ? currentPlayer.faction.passive.value : 0;
        const finalPrice = Math.floor(landedTile.price * (1 - discount));
        const canAfford = currentPlayer.gold >= finalPrice;

        if (currentPlayer.isAI) {
          const shouldBuy = canAfford && aiShouldBuy(currentPlayer, landedTile, tiles, finalPrice);

          if (shouldBuy) {
            setAiIsThinking(true);
            setTimeout(() => {
              sfxBuy();
              setTiles(prev =>
                prev.map((t, i) =>
                  i === newPos ? { ...t, owner: turn } : t
                )
              );
              setPlayers(prev =>
                prev.map(p =>
                  p.id === turn ? { ...p, gold: p.gold - finalPrice } : p
                )
              );
              addLog(`> 🤖 ${currentPlayer.name} membeli ${landedTile.name} seharga ${finalPrice}g.`);
              addToast(`AI beli ${landedTile.name}`, 'warn', '🤖');
              endTurn();
            }, getAiDelay('buy'));
          } else {
            setAiIsThinking(true);
            setTimeout(() => {
              addLog(`> 🤖 ${currentPlayer.name} skip beli ${landedTile.name}.`);
              endTurn();
            }, getAiDelay('skip'));
          }
          return;
        }

        setModal({
          show: true,
          title: `🏰 Beli ${landedTile.name}?`,
          message: `Wilayah ${landedTile.element?.toUpperCase()} ini belum bertuan.`,
          highlight: `Harga: ${finalPrice}g${
            discount > 0 ? ` (diskon ${Math.round(discount * 100)}%)` : ''
          }\nGold sekarang: ${currentPlayer.gold}g\nSetelah beli: ${currentPlayer.gold - finalPrice}g`,
          confirmText: canAfford ? '💰 Beli' : '❌ Gold Kurang',
          confirmColor: canAfford
            ? 'bg-green-500 hover:bg-green-600 text-black'
            : 'bg-slate-600 text-slate-400 cursor-not-allowed',
          cancelText: '⏭️ Skip',
          onConfirm: canAfford
            ? () => {
                sfxBuy();
                setTiles(prev =>
                  prev.map((t, i) =>
                    i === newPos ? { ...t, owner: turn } : t
                  )
                );
                setPlayers(prev =>
                  prev.map(p =>
                    p.id === turn ? { ...p, gold: p.gold - finalPrice } : p
                  )
                );
                addLog(`> ✅ ${currentPlayer.name} membeli ${landedTile.name} seharga ${finalPrice}g.`);
                addToast(`${landedTile.name} dikuasai!`, 'success', '🏰');
                closeModal();
                endTurn();
              }
            : undefined,
          onCancel: () => {
            sfxClick();
            addLog(`> ${currentPlayer.name} skip beli ${landedTile.name}.`);
            closeModal();
            endTurn();
          },
        });
        return;
      }

      if (landedTile.owner === turn) {
        addLog(`> 🏠 ${currentPlayer.name} mendarat di wilayah sendiri.`);
        endTurn();
        return;
      }

      const owner = players.find(p => p.id === landedTile.owner)!;
      const baseRent = Math.floor(landedTile.price * 0.1);
      const rentDiscount = currentPlayer.faction.passive.type === 'rentDiscount'
        ? currentPlayer.faction.passive.value : 0;
      const finalRent = Math.floor(baseRent * (1 - rentDiscount));

      if (currentPlayer.isAI) {
        const shouldSiege = aiShouldSiege(currentPlayer, owner, landedTile, finalRent);

        if (shouldSiege) {
          setAiIsThinking(true);
          setTimeout(() => {
            addToast(`AI menyerang!`, 'danger', '⚔️');
            initiateSiege(currentPlayer, owner, landedTile, newPos, finalRent);
          }, getAiDelay('siege'));
        } else {
          setAiIsThinking(true);
          setTimeout(() => {
            sfxPay();
            setPlayers(prev =>
              prev.map(p =>
                p.id === turn ? { ...p, gold: p.gold - finalRent } :
                p.id === owner.id ? { ...p, gold: p.gold + finalRent } : p
              )
            );
            addLog(`> 🤖 ${currentPlayer.name} bayar sewa ${finalRent}g ke ${owner.name}.`);
            addToast(`AI bayar sewa ${finalRent}g`, 'info', '💸');
            endTurn();
          }, getAiDelay('skip'));
        }
        return;
      }

      setModal({
        show: true,
        title: `⚔️ Wilayah Lawan: ${landedTile.name}`,
        message: `${landedTile.name} dikuasai ${owner.name}.\nPilih: bayar sewa, atau tantang SIEGE untuk rebut!`,
        highlight: `Sewa: ${finalRent}g\nHadiah menang Siege: ${landedTile.name}\nDenda kalah: ${finalRent * 2}g`,
        confirmText: '🔥 Tantang Siege',
        confirmColor: 'bg-orange-500 hover:bg-orange-600 text-black',
        cancelText: '💸 Bayar Sewa',
        onConfirm: () => {
          sfxClick();
          closeModal();
          setTimeout(() => initiateSiege(currentPlayer, owner, landedTile, newPos, finalRent), 300);
        },
        onCancel: () => {
          sfxPay();
          setPlayers(prev =>
            prev.map(p =>
              p.id === turn ? { ...p, gold: p.gold - finalRent } :
              p.id === owner.id ? { ...p, gold: p.gold + finalRent } : p
            )
          );
          addLog(`> 💸 ${currentPlayer.name} bayar sewa ${finalRent}g ke ${owner.name}.`);
          addToast(`-${finalRent}g sewa`, 'info', '💸');
          closeModal();
          endTurn();
        },
      });
      return;
    }

    endTurn();
  };

  // === ROLL DADU + ANIMASI ===
  const handleRoll = (d1: number, d2: number) => {
    if (winner) return;
    if (!readyToPlay) return;
    if (isAnimating) return;

    const roller = players.find(p => p.id === turn);
    if (roller && !roller.isAI) {
      setAiIsThinking(false);
    }

    sfxDiceRoll();

    const steps = d1 + d2;
    const currentPlayer = players.find(p => p.id === turn)!;
    const oldPos = currentPlayer.position;
    const totalTiles = tiles.length;

    addLog(`> ${currentPlayer.name} rolled ${d1} & ${d2} = ${steps}.`);
    addToast(`+${steps} langkah`, 'info', '🎲');

    const finalPos = (oldPos + steps) % totalTiles;
    const passedStart = (oldPos + steps) >= totalTiles;

    setIsAnimating(true);

    const stepDelay = steps >= FAST_THRESHOLD ? ANIM_FAST_MS : ANIM_STEP_MS;
    let currentStep = 0;

    const moveOneStep = () => {
      currentStep++;
      const newPos = (oldPos + currentStep) % totalTiles;

      setPlayers(prev =>
        prev.map(p => (p.id === turn ? { ...p, position: newPos } : p))
      );

      sfxTick();

      if (currentStep < steps) {
        setTimeout(moveOneStep, stepDelay);
      } else {
        sfxLand();
        setTimeout(() => {
          setIsAnimating(false);
          processLanding(currentPlayer, finalPos, passedStart);
        }, 150);
      }
    };

    setTimeout(moveOneStep, 200);
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
    const isAIAttacker = challenger.isAI;

    if (challengerWins) {
      sfxSiegeWin();
      setTiles(prev =>
        prev.map((t, i) =>
          i === tileIndex ? { ...t, owner: challenger.id } : t
        )
      );
      addLog(`> 🏆 SIEGE MENANG! ${challenger.name} rebut ${tile.name} dari ${defender.name}. (${cTotal} vs ${dTotal})`);
      addToast(`Rebut ${tile.name}!`, 'success', '🏆');

      if (isAIAttacker) {
        setTimeout(() => endTurn(), 1500);
      } else {
        setModal({
          show: true,
          title: `🏆 Siege Victory!`,
          message: `Kamu berhasil merebut ${tile.name} dari ${defender.name}!`,
          highlight: `Challenger: ${cTotal} (${cRoll}+${cBonus})\nDefender: ${dTotal} (${dRoll}+${dBonus})`,
          confirmText: '🎉 Mantap',
          confirmColor: 'bg-green-500 hover:bg-green-600 text-black',
          onConfirm: () => {
            sfxClick();
            closeModal();
            endTurn();
          },
        });
      }
    } else {
      sfxSiegeLose();
      setPlayers(prev =>
        prev.map(p =>
          p.id === challenger.id ? { ...p, gold: p.gold - penalty } : p
        )
      );
      addLog(`> ❌ SIEGE GAGAL. ${challenger.name} bayar denda ${penalty}g. (${cTotal} vs ${dTotal})`);
      addToast(`Siege gagal -${penalty}g`, 'danger', '💥');

      if (isAIAttacker) {
        setTimeout(() => endTurn(), 1500);
      } else {
        setModal({
          show: true,
          title: `❌ Siege Gagal`,
          message: `${defender.name} mempertahankan ${tile.name}.\nKamu wajib bayar denda 2x sewa.`,
          highlight: `Challenger: ${cTotal} (${cRoll}+${cBonus})\nDefender: ${dTotal} (${dRoll}+${dBonus})\nDenda: ${penalty}g`,
          confirmText: '💸 Terima',
          confirmColor: 'bg-red-500 hover:bg-red-600 text-white',
          onConfirm: () => {
            sfxClick();
            closeModal();
            endTurn();
          },
        });
      }
    }
  };

  // === AI AUTO-ROLL ===
  useEffect(() => {
    if (!readyToPlay) return;
    if (winner) return;
    if (modal.show) return;
    if (isAnimating) return;

    const currentPlayer = players.find(p => p.id === turn);
    if (!currentPlayer?.isAI) return;

    if (aiActedForTurnRef.current === turnCount) return;
    aiActedForTurnRef.current = turnCount;

    setAiIsThinking(true);

    const timeout = setTimeout(() => {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      handleRoll(d1, d2);
    }, getAiDelay('roll'));

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, turnCount, readyToPlay, winner, modal.show, isAnimating]);

  // === RESTART ===
  const restartGame = () => {
    clearSave();
    const savedMode = typeof window !== 'undefined' ? localStorage.getItem('gameMode') : null;
    const aiMode = savedMode !== 'pvp';
    setPlayers(createNewPlayers(aiMode));
    setTiles(createNewTiles());
    setTurn(1);
    setTurnCount(1);
    setLog(['> Game baru dimulai!']);
    setActiveEvent(null);
    setWinner(null);
    setWinCondition(null);
    setModal({ show: false, title: '', message: '' });
    aiActedForTurnRef.current = null;
    setAiIsThinking(false);
    setIsAnimating(false);
    setToasts([]);
    setHoveredTile(null);
  };

  if (!readyToPlay) {
    return (
      <>
        <main className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-4 animate-bounce">⚔️</div>
            <div className="text-slate-400">Memuat...</div>
          </div>
        </main>
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
      </>
    );
  }

  const currentTurnPlayer = players.find(p => p.id === turn);
  const diceDisabled =
    modal.show ||
    !!winner ||
    aiIsThinking ||
    isAnimating ||
    currentTurnPlayer?.isAI === true;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-3 md:p-4">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold text-amber-400 drop-shadow-lg">
              ⚔️ Chrono Realms
            </h1>
            <div className={`px-3 py-1 rounded-lg text-sm font-bold border-2 ${
              turnCount >= 35
                ? 'bg-red-900/40 border-red-500 text-red-300 animate-pulse'
                : turnCount >= 25
                  ? 'bg-yellow-900/40 border-yellow-500 text-yellow-300'
                  : 'bg-slate-700 border-slate-600 text-slate-300'
            }`}>
              ⏱️ Turn {turnCount} / {MAX_TURNS}
            </div>
            {aiIsThinking && (
              <div className="px-3 py-1 rounded-lg text-xs font-bold bg-purple-900/40 border border-purple-500 text-purple-300 animate-pulse">
                🤖 AI berpikir...
              </div>
            )}
            {isAnimating && (
              <div className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-900/40 border border-blue-500 text-blue-300 animate-pulse">
                🚶 Token bergerak...
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                sfxClick();
                router.push('/');
              }}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
            >
              🏠 Menu
            </button>
            <button
              onClick={() => {
                sfxClick();
                if (confirm('Yakin restart? Progress akan hilang.')) {
                  restartGame();
                }
              }}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
            >
              🔄 Restart
            </button>
          </div>
        </div>

        {/* Banner Event */}
        {activeEvent && (
          <div className={`mb-3 px-4 py-2 rounded-lg text-sm font-semibold border-2 flex items-center gap-2 ${
            activeEvent.type === 'positive'
              ? 'bg-green-900/40 border-green-500 text-green-300'
              : 'bg-red-900/40 border-red-500 text-red-300'
          }`}>
            <span className="text-xl">{activeEvent.emoji}</span>
            <div>
              <span className="font-bold">{activeEvent.name}</span>
              <span className="ml-2 opacity-80 text-xs">{activeEvent.description}</span>
            </div>
          </div>
        )}

        {/* Layout 3 Kolom */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(200px,240px)_minmax(0,720px)_minmax(200px,240px)] gap-4 justify-center">
          <div className="lg:sticky lg:top-4 lg:self-start">
            <PlayerPanel
              player={players[0]}
              tiles={tiles}
              isActive={turn === 1 && !winner}
            />
          </div>

          <div className="flex flex-col gap-3">
            <Board
              players={players}
              tiles={tiles}
              onTileHover={handleTileHover}
            />

            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col items-center">
              <Dice
                onRoll={handleRoll}
                disabled={diceDisabled}
                currentPlayer={currentTurnPlayer}
              />
            </div>

            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
              <div className="text-sm font-bold text-amber-400 mb-2">📜 Action Log</div>
              <div className="h-32 overflow-y-auto text-sm space-y-1">
                {log.map((line, i) => (
                  <div key={i} className="text-slate-300 font-mono text-xs">{line}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-4 lg:self-start">
            <PlayerPanel
              player={players[1]}
              tiles={tiles}
              isActive={turn === 2 && !winner}
            />
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

      {/* Toast */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Tooltip */}
      <TileTooltip
        tile={hoveredTile !== null ? tiles[hoveredTile] : null}
        players={players}
        position={tooltipPos}
      />

      {/* Winner Overlay */}
      {winner && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-8 text-center max-w-md">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-black mb-2">VICTORY!</h2>
            <p className="text-black/80 mb-2">
              <strong>{winner.name}</strong> memenangkan Chrono Realms!
            </p>
            <p className="text-black/60 text-sm mb-6 font-semibold">
              {winCondition} Victory
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  sfxClick();
                  restartGame();
                }}
                className="px-5 py-3 bg-black text-amber-400 font-bold rounded-lg hover:bg-slate-900"
              >
                🔄 Main Lagi
              </button>
              <button
                onClick={() => {
                  sfxClick();
                  router.push('/');
                }}
                className="px-5 py-3 bg-white/20 text-white font-bold rounded-lg hover:bg-white/30"
              >
                🏠 Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}