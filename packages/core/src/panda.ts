// Panda dolabı: XP ile açılan aksesuarlar (her bölmeye bir tane takılır).
import type { UserState } from './types.ts';

export type GearSlot = 'head' | 'eyes' | 'neck' | 'hand' | 'aura';
export interface PandaGear { id: string; name: string; emoji: string; slot: GearSlot; xp: number; color?: string }

export const PANDA_GEAR: PandaGear[] = [
  { id: 'cap', name: 'Şapka', emoji: '🧢', slot: 'head', xp: 50 },
  { id: 'shades', name: 'Güneş gözlüğü', emoji: '🕶️', slot: 'eyes', xp: 100 },
  { id: 'controller', name: 'Oyun kolu', emoji: '🎮', slot: 'hand', xp: 200 },
  { id: 'bow', name: 'Papyon', emoji: '🎀', slot: 'neck', xp: 300 },
  { id: 'scarf', name: 'Atkı', emoji: '🧣', slot: 'neck', xp: 450 },
  { id: 'mic', name: 'Yayıncı mikrofonu', emoji: '🎤', slot: 'hand', xp: 600 },
  { id: 'purple', name: 'Mor neon aura', emoji: '💜', slot: 'aura', xp: 750, color: '#b06bff' },
  { id: 'goggles', name: 'Pilot gözlüğü', emoji: '🥽', slot: 'eyes', xp: 900 },
  { id: 'grad', name: 'Mezuniyet kepi', emoji: '🎓', slot: 'head', xp: 1200 },
  { id: 'books', name: 'Kitap yığını', emoji: '📚', slot: 'hand', xp: 1500 },
  { id: 'gold', name: 'Altın aura', emoji: '✨', slot: 'aura', xp: 2000, color: '#ffc93c' },
  { id: 'crown', name: 'Taç', emoji: '👑', slot: 'head', xp: 3000 },
];

export function gearById(id: string): PandaGear | undefined {
  return PANDA_GEAR.find((g) => g.id === id);
}

export function isGearUnlocked(state: UserState, id: string): boolean {
  const g = gearById(id);
  return !!g && state.stats.totalXp >= g.xp;
}

/** Takılı aksesuarları ayarlar: yalnızca açılmış olanlar, her bölmeye en fazla bir tane. */
export function setPandaGear(state: UserState, ids: string[]): UserState {
  const next: UserState = JSON.parse(JSON.stringify(state));
  const bySlot = new Map<GearSlot, string>();
  for (const id of ids) {
    const g = gearById(id);
    if (!g) throw new Error('Böyle bir aksesuar yok.');
    if (state.stats.totalXp < g.xp) throw new Error(`${g.name} için ${g.xp} XP gerekiyor.`);
    bySlot.set(g.slot, g.id);
  }
  next.panda = { equipped: [...bySlot.values()] };
  return next;
}
