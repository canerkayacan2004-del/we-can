// Kelime oyunları: Wordle tarzı tahmin oyunu ve harf karıştırma (Kelime Avı).
import { markActive } from './engine.ts';
import type { UserState } from './types.ts';

export type LetterMark = 'correct' | 'present' | 'absent';
export const WORDLE_TRIES = 6;
export const WORDLE_DAILY_XP = 10;
export const PRACTICE_WIN_XP = 2;
export const GAMES_DAILY_XP_CAP = 30;

/** Wordle puanlaması: önce yerinde doğrular, sonra kalan harf sayısına göre "var ama yeri yanlış". */
export function scoreGuess(guess: string, answer: string): LetterMark[] {
  const g = guess.toLowerCase();
  const a = answer.toLowerCase();
  const marks: LetterMark[] = Array(g.length).fill('absent');
  const left: Record<string, number> = {};
  for (let i = 0; i < a.length; i++) {
    if (g[i] === a[i]) marks[i] = 'correct';
    else left[a[i]] = (left[a[i]] ?? 0) + 1;
  }
  for (let i = 0; i < g.length; i++) {
    if (marks[i] === 'correct') continue;
    if (left[g[i]]) { marks[i] = 'present'; left[g[i]]--; }
  }
  return marks;
}

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/** Günün kelimesi: herkes için aynı (tarihe bağlı). */
export function dailyIndex(today: string, count: number): number {
  return hash('wordle:' + today) % count;
}

export interface GameStats {
  wordle: { played: number; won: number; streak: number; best: number; dist: number[]; lastDaily?: string; lastDailyWon?: boolean };
  scramble: { played: number; won: number; best: number };
  /** Salon oyunları: oynama sayısı ve en iyi skor. */
  arcade?: Partial<Record<ArcadeGame, { played: number; best: number; won: number }>>;
  /** Kategori oyunu: kategori başına en iyi skor (0-10). */
  cat?: Record<string, number>;
  xpDate?: string;
  xpToday?: number;
}

export type ArcadeGame = 'speed' | 'dictation' | 'subtitle' | 'streamer' | 'boss' | 'story' | 'duel' | 'categories';
export type GameId = 'wordle' | 'scramble' | ArcadeGame;
export const ARCADE_GAMES: ArcadeGame[] = ['speed', 'dictation', 'subtitle', 'streamer', 'boss', 'story', 'duel', 'categories'];

/** Salon oyunlarında skora göre XP (en fazla 6; boss/hikaye kazanılınca 8). */
export function arcadeXp(game: ArcadeGame, score: number, won: boolean): number {
  if (game === 'boss' || game === 'story') return won ? 8 : 1;
  return Math.max(0, Math.min(6, Math.floor(score / 3)));
}

export function emptyGameStats(): GameStats {
  return { wordle: { played: 0, won: 0, streak: 0, best: 0, dist: [0, 0, 0, 0, 0, 0] }, scramble: { played: 0, won: 0, best: 0 } };
}

/** Oyun sonucunu kaydeder; günlük XP sınırı içinde XP verir. */
export function recordGame(
  state: UserState,
  game: GameId,
  result: { won: boolean; tries?: number; daily?: boolean; streak?: number; score?: number; category?: string },
  now: Date,
  today: string,
): { state: UserState; xp: number } {
  const next: UserState = JSON.parse(JSON.stringify(state));
  const stats: GameStats = next.games ?? emptyGameStats();
  if (stats.xpDate !== today) { stats.xpDate = today; stats.xpToday = 0; }
  let xp = 0;
  if (game === 'wordle') {
    const w = stats.wordle;
    if (result.daily && w.lastDaily === today) throw new Error('Günün Wordle’ı bugün zaten oynandı.');
    w.played++;
    if (result.won) {
      const tries = Math.min(WORDLE_TRIES, Math.max(1, result.tries ?? WORDLE_TRIES));
      w.won++; w.dist[tries - 1]++;
      w.streak++; w.best = Math.max(w.best, w.streak);
      xp = result.daily ? WORDLE_DAILY_XP : PRACTICE_WIN_XP;
    } else {
      w.streak = 0;
    }
    if (result.daily) { w.lastDaily = today; w.lastDailyWon = result.won; }
  } else if (game !== 'scramble') {
    const a = ((stats.arcade ??= {})[game] ??= { played: 0, best: 0, won: 0 });
    a.played++;
    if (result.won) a.won++;
    const score = Math.max(0, Math.floor(result.score ?? 0));
    a.best = Math.max(a.best, score);
    if (game === 'categories' && result.category && /^[a-z]{2,20}$/.test(result.category)) {
      const c = (stats.cat ??= {});
      c[result.category] = Math.max(c[result.category] ?? 0, Math.min(10, score));
    }
    xp = arcadeXp(game, game === 'categories' ? score * 1.5 : score, result.won);
  } else {
    const s = stats.scramble;
    s.played++;
    if (result.won) { s.won++; xp = PRACTICE_WIN_XP; }
    if (result.streak) s.best = Math.max(s.best, result.streak);
  }
  xp = Math.max(0, Math.min(xp, GAMES_DAILY_XP_CAP - (stats.xpToday ?? 0)));
  if (xp > 0) {
    stats.xpToday = (stats.xpToday ?? 0) + xp;
    next.stats.totalXp += xp;
    next.xpEvents.push({ at: now.toISOString(), amount: xp, reason: `game_${game}`, ref: today });
    const day = (next.study[today] ??= { seconds: 0, xp: 0, lessons: 0, reviews: 0, practice: 0, audio: 0 });
    day.xp += xp;
    markActive(next, today);
  }
  next.games = stats;
  return { state: next, xp };
}

/** Harfleri karıştırır; sonuç asla kelimenin kendisi olmaz. */
export function scrambleWord(word: string, rng: () => number = Math.random): string {
  const letters = word.split('');
  for (let attempt = 0; attempt < 10; attempt++) {
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    if (letters.join('') !== word) return letters.join('');
  }
  return word.slice(1) + word[0];
}
