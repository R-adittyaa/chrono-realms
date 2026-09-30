export function rollDice() {
  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  return { d1, d2, total: d1 + d2 };
}

export function movePlayer(player, steps, totalTiles) {
  const newPos = (player.position + steps) % totalTiles;
  return { ...player, position: newPos };
}

export function checkWinCondition(player, tiles) {
  const owned = tiles.filter(t => t.owner === player.id);
  const elements = {};
  owned.forEach(t => {
    if (t.element) elements[t.element] = (elements[t.element] || 0) + 1;
  });
  return Object.values(elements).some(count => count >= 3);
}

export function calculateRent(tile) {
  return Math.floor(tile.price * 0.1);
}