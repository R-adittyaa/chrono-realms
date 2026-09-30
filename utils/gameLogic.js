// === DADU ===
export function rollDice() {
  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  return { d1, d2, total: d1 + d2 };
}

// === CEK SEMUA WIN CONDITIONS ===
// Return: { winner: player | null, condition: string | null }
export function checkAllWinConditions(players, tiles, turnCount) {
  // 1. DOMINATION VICTORY — kuasai 4 tile elemen sama
  for (const p of players) {
    const owned = tiles.filter(t => t.owner === p.id && t.element);
    const elements = {};
    owned.forEach(t => {
      if (t.element) elements[t.element] = (elements[t.element] || 0) + 1;
    });
    if (Object.values(elements).some(count => count >= 4)) {
      return { winner: p, condition: 'Domination' };
    }
  }

  // 2. TYCOON VICTORY — 8000 gold atau aset 5000g
  for (const p of players) {
    const assetValue = tiles
      .filter(t => t.owner === p.id)
      .reduce((sum, t) => sum + t.price, 0);

    if (p.gold >= 8000) {
      return { winner: p, condition: 'Tycoon (Gold 8000+)' };
    }
    if (assetValue >= 5000) {
      return { winner: p, condition: 'Tycoon (Aset 5000g+)' };
    }
  }

  // 3. ELIMINATION — sisa 1 pemain hidup
  const alivePlayers = players.filter(p => p.gold > 0);
  if (alivePlayers.length === 1 && players.length > 1) {
    return { winner: alivePlayers[0], condition: 'Elimination' };
  }

  // 4. TURN LIMIT — 40 turn, poin tertinggi
  if (turnCount >= 40) {
    const scores = players.map(p => {
      const owned = tiles.filter(t => t.owner === p.id);
      const assetValue = owned.reduce((sum, t) => sum + t.price, 0);
      const elements = {};
      owned.forEach(t => {
        if (t.element) elements[t.element] = (elements[t.element] || 0) + 1;
      });
      const setBonus = Object.values(elements).filter(c => c >= 4).length * 2000;
      const score = p.gold + assetValue + setBonus + owned.length * 1000;
      return { player: p, score };
    });

    scores.sort((a, b) => b.score - a.score);
    return { winner: scores[0].player, condition: 'Turn Limit (Poin Tertinggi)' };
  }

  return { winner: null, condition: null };
}

// === HITUNG POIN (preview turn limit) ===
export function calculateScore(player, tiles) {
  const owned = tiles.filter(t => t.owner === player.id);
  const assetValue = owned.reduce((sum, t) => sum + t.price, 0);
  const elements = {};
  owned.forEach(t => {
    if (t.element) elements[t.element] = (elements[t.element] || 0) + 1;
  });
  const setBonus = Object.values(elements).filter(c => c >= 4).length * 2000;
  return player.gold + assetValue + setBonus + owned.length * 1000;
}

// === HITUNG SEWA ===
export function calculateRent(tile) {
  return Math.floor(tile.price * 0.1);
}