export const FACTIONS = [
  {
    id: 'merchant',
    name: 'The Merchant Guild',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-400',
    description: 'Diskon 15% saat membeli Territory atau Building.',
    passive: { type: 'buyDiscount', value: 0.15 },
  },
  {
    id: 'warlord',
    name: 'Iron Warlord',
    color: 'bg-red-600',
    textColor: 'text-red-400',
    description: 'Potong biaya sewa 20% saat mendarat di Territory lawan.',
    passive: { type: 'rentDiscount', value: 0.2 },
  },
  {
    id: 'rogue',
    name: 'Shadow Rogue',
    color: 'bg-purple-700',
    textColor: 'text-purple-400',
    description: '25% peluang mencuri 10% Gold lawan di petak sama.',
    passive: { type: 'stealChance', value: 0.25 },
  },
  {
    id: 'arcane',
    name: 'Arcane Council',
    color: 'bg-blue-600',
    textColor: 'text-blue-400',
    description: 'Imun 1x terhadap Negative Global Event.',
    passive: { type: 'eventImmunity', value: 1 },
  },
];