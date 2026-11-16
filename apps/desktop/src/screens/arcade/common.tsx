// Salon oyunlarının ortak parçaları.
import { useState } from 'react';
import { currentLevel } from '@core/engine.ts';
import { CEFR_LEVELS } from '@core/types.ts';
import type { CefrLevel } from '@core/types.ts';
import type { GameId } from '@core/games.ts';
import { WORD_BANK } from '@content/words/index.ts';
import type { BankWord } from '@content/words/index.ts';
import { errorMessage, useApp } from '../../lib/app.tsx';
import { curriculum } from '../../lib/content.ts';

export function useLevel(): CefrLevel {
  const { state } = useApp();
  const l = currentLevel(state, curriculum) as CefrLevel;
  return CEFR_LEVELS.includes(l) ? l : 'A1';
}

/** Seviyenin bir altı, kendisi ve bir üstü. */
export function nearLevels(level: CefrLevel): CefrLevel[] {
  const i = CEFR_LEVELS.indexOf(level);
  return CEFR_LEVELS.filter((_, j) => Math.abs(j - i) <= 1);
}

export function wordsNear(level: CefrLevel): BankWord[] {
  const near = new Set(nearLevels(level));
  return WORD_BANK.filter((w) => near.has(w.level));
}

export function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/** Oyun sonucunu kaydeder; kazanılan XP'yi döndürür. */
export function useRecordGame() {
  const { backend, setState } = useApp();
  const [error, setError] = useState('');
  const record = async (game: GameId, result: { won: boolean; score?: number; category?: string }) => {
    try { const out = await backend.recordGame(game, result); setState(out.state); return out.xp; } catch (err) { setError(errorMessage(err)); return 0; }
  };
  return { record, error };
}

/** Karşılaştırma için sadeleştirir: küçük harf, noktalama yok, kısaltmalar tek biçim. */
export function normalizeSentence(text: string): string[] {
  return text.toLowerCase().replace(/[’`]/g, "'").replace(/[^a-z0-9' ]+/g, ' ').split(/\s+/).filter(Boolean);
}
