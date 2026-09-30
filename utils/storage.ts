// === SAVE/LOAD GAME KE LOCALSTORAGE ===

const SAVE_KEY = 'chrono-realms-save';
const SAVE_VERSION = 1;

export type SavedGame = {
  version: number;
  players: any[];
  tiles: any[];
  turn: number;
  turnCount: number;
  log: string[];
  savedAt: number;
};

export function saveGame(data: Omit<SavedGame, 'version' | 'savedAt'>) {
  if (typeof window === 'undefined') return;
  try {
    const payload: SavedGame = {
      version: SAVE_VERSION,
      ...data,
      savedAt: Date.now(),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('Failed to save game:', e);
  }
}

export function loadGame(): SavedGame | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed: SavedGame = JSON.parse(raw);
    if (parsed.version !== SAVE_VERSION) {
      // Versi lama, buang
      localStorage.removeItem(SAVE_KEY);
      return null;
    }
    return parsed;
  } catch (e) {
    console.warn('Failed to load game:', e);
    return null;
  }
}

export function clearSave() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (e) {
    console.warn('Failed to clear save:', e);
  }
}

export function hasSave(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(SAVE_KEY) !== null;
}

// Format waktu "5 menit lalu"
export function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}