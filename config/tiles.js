export const TILES = [
  { id: 0,  name: 'Realm Hub',    type: 'start',     element: null,     price: 0,   owner: null },
  { id: 1,  name: 'Eldoria',      type: 'territory', element: 'fire',   price: 200, owner: null },
  { id: 2,  name: 'Frostmere',    type: 'territory', element: 'ice',    price: 220, owner: null },
  { id: 3,  name: 'Arcane Relic', type: 'relic',     element: null,     price: 0,   owner: null },
  { id: 4,  name: 'Emberhold',    type: 'territory', element: 'fire',   price: 240, owner: null },
  { id: 5,  name: 'Stormpeak',    type: 'territory', element: 'ice',    price: 260, owner: null },
  { id: 6,  name: 'Siege Camp',   type: 'siege',     element: null,     price: 0,   owner: null },
  { id: 7,  name: 'Verdania',     type: 'territory', element: 'nature', price: 280, owner: null },
  { id: 8,  name: 'Free Realm',   type: 'free',      element: null,     price: 0,   owner: null },
  { id: 9,  name: 'Shadowfen',    type: 'territory', element: 'nature', price: 300, owner: null },
  { id: 10, name: 'Event Gate',   type: 'event',     element: null,     price: 0,   owner: null },
  { id: 11, name: 'Iron Citadel', type: 'territory', element: 'fire',   price: 320, owner: null },
  { id: 12, name: 'Jail Realm',   type: 'jail',      element: null,     price: 0,   owner: null },
  { id: 13, name: 'Crystal Bay',  type: 'territory', element: 'ice',    price: 340, owner: null },
  { id: 14, name: 'Mystic Grove', type: 'territory', element: 'nature', price: 360, owner: null },
  { id: 15, name: 'Go To Jail',   type: 'gotojail',  element: null,     price: 0,   owner: null },
];

export const ELEMENT_COLORS = {
  fire:   'from-red-500 to-orange-500',
  ice:    'from-blue-400 to-cyan-400',
  nature: 'from-green-500 to-emerald-500',
  null:   'from-slate-600 to-slate-700',
};