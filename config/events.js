export const GLOBAL_EVENTS = [
  {
    id: 'mana-surge',
    name: 'Mana Surge',
    emoji: '✨',
    type: 'positive',
    description: 'Semua wilayah milikmu menghasilkan +50% sewa selama 1 turn.',
    effect: 'manaSurge',
  },
  {
    id: 'blizzard',
    name: 'Blizzard',
    emoji: '❄️',
    type: 'negative',
    description: 'Biaya sewa wilayah Ice meningkat 50% selama 1 turn.',
    effect: 'blizzard',
  },
  {
    id: 'economic-crisis',
    name: 'Economic Crisis',
    emoji: '💸',
    type: 'negative',
    description: 'Semua transaksi & pendapatan terpotong 25%.',
    effect: 'economicCrisis',
  },
  {
    id: 'golden-age',
    name: 'Golden Age',
    emoji: '🌟',
    type: 'positive',
    description: 'Setiap pemain menerima 150g dari Realm.',
    effect: 'goldenAge',
  },
  {
    id: 'arcane-blessing',
    name: 'Arcane Blessing',
    emoji: '🔮',
    type: 'positive',
    description: 'Pemain yang melewati Realm Hub mendapat 300g bonus.',
    effect: 'arcaneBlessing',
  },
];

export function rollGlobalEvent() {
  return GLOBAL_EVENTS[Math.floor(Math.random() * GLOBAL_EVENTS.length)];
}