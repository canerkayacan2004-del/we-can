// Günlük 10 kelime: seviyeye göre tarihe bağlı (her gün aynı listeyi veren) seçim ve kayıt.
import { addReviewItem, markActive } from './engine.ts';
import { CEFR_LEVELS } from './types.ts';
import type { CefrLevel, UserState, VocabItem } from './types.ts';

export const DAILY_WORD_COUNT = 10;
export const DAILY_WORDS_XP = 10;

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/**
 * Günün kelimeleri: 7 tanesi kullanıcının seviyesinden, 3 tanesi bir üst seviyeden.
 * Öğrenilmiş (deftere eklenmiş) kelimeler atlanır. Aynı gün aynı kullanıcı için liste değişmez.
 */
export function pickDailyWords<T extends VocabItem & { level: CefrLevel }>(bank: T[], level: CefrLevel, today: string, known: Set<string>, seedKey = ''): T[] {
  const idx = CEFR_LEVELS.indexOf(level);
  const next = CEFR_LEVELS[Math.min(CEFR_LEVELS.length - 1, idx + 1)];
  const order = (list: T[]) => list.slice().sort((a, b) => hash(today + seedKey + a.id) - hash(today + seedKey + b.id));
  const fresh = (lvl: CefrLevel) => order(bank.filter((w) => w.level === lvl && !known.has(w.id)));
  const repeat = (lvl: CefrLevel) => order(bank.filter((w) => w.level === lvl && known.has(w.id)));
  const main = fresh(level);
  const upper = next === level ? [] : fresh(next);
  const out: T[] = [...main.slice(0, 7), ...upper.slice(0, 3)];
  // Yeterli yeni kelime yoksa: önce kalan yeniler, sonra alt seviyeler, en son tekrar.
  const fill = [...main.slice(7), ...upper.slice(3), ...CEFR_LEVELS.slice(0, idx).reverse().flatMap((l) => fresh(l)), ...repeat(level)];
  for (const w of fill) {
    if (out.length >= DAILY_WORD_COUNT) break;
    if (!out.includes(w)) out.push(w);
  }
  return out.slice(0, DAILY_WORD_COUNT);
}

function dailyRecord(state: UserState, today: string) {
  return state.dailyWords?.date === today ? state.dailyWords : { date: today, seen: [], learned: [], rewarded: false };
}

/** Bir günlük kelime kartı tamamlandı: "biliyordum" (yalnızca görüldü) veya "öğren" (deftere + tekrara eklenir). */
export function markDailyWord(state: UserState, word: VocabItem, learn: boolean, todaysIds: string[], now: Date, today: string): { state: UserState; xp: number } {
  if (!todaysIds.includes(word.id)) throw new Error('Bu kelime bugünün listesinde değil.');
  const next: UserState = JSON.parse(JSON.stringify(state));
  const rec = dailyRecord(next, today);
  if (!rec.seen.includes(word.id)) rec.seen.push(word.id);
  if (learn) {
    if (!rec.learned.includes(word.id)) rec.learned.push(word.id);
    if (!next.vocab[word.id]) next.vocab[word.id] = { addedAt: now.toISOString() };
    addReviewItem(next, { id: `v:${word.id}`, kind: 'vocab', front: word.term, back: word.meaningTr, extra: word.exampleEn }, today, now);
  }
  let xp = 0;
  if (!rec.rewarded && todaysIds.every((id) => rec.seen.includes(id))) {
    rec.rewarded = true;
    xp = DAILY_WORDS_XP;
    next.stats.totalXp += xp;
    next.xpEvents.push({ at: now.toISOString(), amount: xp, reason: 'daily_words', ref: today });
    const day = (next.study[today] ??= { seconds: 0, xp: 0, lessons: 0, reviews: 0, practice: 0, audio: 0 });
    day.xp += xp;
  }
  markActive(next, today);
  next.dailyWords = rec;
  return { state: next, xp };
}
