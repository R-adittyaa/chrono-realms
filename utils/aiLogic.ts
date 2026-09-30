// === AI OPPONENT LOGIC ===

type Faction = {
  id: string;
  passive: { type: string; value: number };
};

type Player = {
  id: number;
  gold: number;
  faction: Faction;
};

type Tile = {
  id: number;
  element: string | null;
  price: number;
  owner: number | null;
};

// === KEPUTUSAN BELI ===
// Return true kalau AI mau beli tile
export function aiShouldBuy(
  ai: Player,
  tile: Tile,
  allTiles: Tile[],
  finalPrice: number
): boolean {
  if (ai.gold < finalPrice) return false;

  // Hitung elemen yang AI udah punya
  const myTiles = allTiles.filter(t => t.owner === ai.id);
  const myElements: Record<string, number> = {};
  myTiles.forEach(t => {
    if (t.element) myElements[t.element] = (myElements[t.element] || 0) + 1;
  });

  // Kalau tile ini bikin AI makin dekat ke domination (4 elemen sama)
  if (tile.element && (myElements[tile.element] || 0) >= 2) {
    // Butuh 2+ elemen sama? Prioritas tinggi
    return ai.gold >= finalPrice + 200; // sisakan 200g
  }

  // Strategi konservatif: beli kalau sisa gold masih > 2x harga
  if (ai.gold > finalPrice * 2.5) return true;

  // Strategi agresif kalau elemen tile ini jarang AI punya
  if (tile.element && !myElements[tile.element]) {
    return ai.gold >= finalPrice + 100;
  }

  return false;
}

// === KEPUTUSAN SIEGE ===
// Return true kalau AI mau tantang siege daripada bayar sewa
export function aiShouldSiege(
  ai: Player,
  defender: Player,
  tile: Tile,
  rent: number
): boolean {
  const penalty = rent * 2;

  // Kalau gold gak cukup buat denda, jangan siege
  if (ai.gold < penalty + 100) return false;

  // Hitung peluang menang kasar
  // AI vs Defender — pakai bonus faksi sebagai proxy
  const aiPower = getFactionSiegeBonus(ai.faction.id);
  const defPower = getFactionSiegeBonus(defender.faction.id);

  // Avg roll = 7 per dadu, total 2 dadu = 7
  // AI total ~7 + aiPower, Defender ~7 + defPower
  const aiExpected = 7 + aiPower;
  const defExpected = 7 + defPower;

  // Kalau AI unggul, siege
  if (aiExpected > defExpected) {
    // Worth it kalau tile mahal (rebut wilayah bernilai)
    if (tile.price >= 300) return true;
    // Atau kalau gold AI melimpah
    if (ai.gold > penalty * 3) return true;
  }

  // Default: bayar sewa aja (aman)
  return false;
}

// === BONUS SIEGE PER FAKSI (mirror dari page.tsx) ===
function getFactionSiegeBonus(factionId: string): number {
  const bonuses: Record<string, number> = {
    warlord: 2,
    rogue: 1,
    merchant: 0,
    arcane: 1,
  };
  return bonuses[factionId] || 0;
}

// === GET AI DELAY ===
// Delay biar AI keliatan "mikir", bukan instan
export function getAiDelay(action: 'roll' | 'buy' | 'siege' | 'skip' = 'roll'): number {
  const delays = {
    roll: 1500,
    buy: 1200,
    siege: 1500,
    skip: 800,
  };
  return delays[action];
}