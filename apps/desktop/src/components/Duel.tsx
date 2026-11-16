// Kelime düellosu: 10 soru, aynı tohumla iki oyuncu aynı soruları çözer; doğru sayısı, eşitlikte süre kazanır.
import { useMemo, useRef, useState } from 'react';
import { seededRng } from '@core/shuffle.ts';
import { CEFR_LEVELS } from '@core/types.ts';
import type { CefrLevel } from '@core/types.ts';
import { WORD_BANK } from '@content/words/index.ts';
import { playSound } from '../lib/sound.ts';
import { cx } from './ui.tsx';

export const DUEL_QUESTIONS = 10;

export function duelQuestions(seed: number, level: string) {
  const rng = seededRng(seed);
  const li = Math.max(0, CEFR_LEVELS.indexOf(level as CefrLevel));
  const pool = WORD_BANK.filter((w) => Math.abs(CEFR_LEVELS.indexOf(w.level) - li) <= 1).sort((a, b) => a.id.localeCompare(b.id));
  const pick = <T,>(list: T[]) => list[Math.floor(rng() * list.length)];
  const used = new Set<string>();
  const out: { term: string; answer: string; options: string[] }[] = [];
  while (out.length < DUEL_QUESTIONS && used.size < pool.length) {
    const w = pick(pool);
    if (used.has(w.id)) continue;
    used.add(w.id);
    const wrong = new Set<string>();
    while (wrong.size < 3) { const x = pick(pool).meaningTr; if (x !== w.meaningTr) wrong.add(x); }
    const options = [w.meaningTr, ...wrong];
    for (let i = options.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [options[i], options[j]] = [options[j], options[i]]; }
    out.push({ term: w.term, answer: w.meaningTr, options });
  }
  return out;
}

export function DuelGame({ seed, level, rival, onDone }: { seed: number; level: string; rival?: { name: string; score: number | null; ms: number | null }; onDone: (score: number, ms: number) => void }) {
  const qs = useMemo(() => duelQuestions(seed, level), [seed, level]);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const started = useRef(Date.now());
  const q = qs[i];
  const choose = (o: string) => {
    if (picked) return;
    setPicked(o);
    const ok = o === q.answer;
    playSound(ok ? 'correct' : 'wrong');
    const nextScore = score + (ok ? 1 : 0);
    if (ok) setScore(nextScore);
    window.setTimeout(() => {
      if (i + 1 >= qs.length) { onDone(nextScore, Date.now() - started.current); return; }
      setI(i + 1); setPicked(null);
    }, 550);
  };
  return (
    <div className="text-center" data-duel-game>
      <div className="mb-3 flex items-center justify-between text-sm text-fg-3">
        <span>Soru {i + 1}/{qs.length}</span>
        <span className="font-mono-num font-bold text-acc">{score} doğru</span>
        {rival && rival.score !== null && <span>{rival.name}: {rival.score}/10</span>}
      </div>
      <p lang="en" className="my-5 text-4xl font-black text-fg" data-duel-word>{q.term}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {q.options.map((o) => (
          <button key={o} type="button" data-duel-option={o} onClick={() => choose(o)} disabled={!!picked}
            className={cx('option', picked && (o === q.answer ? 'option-correct' : o === picked ? 'option-wrong' : 'opacity-50'))}>{o}</button>
        ))}
      </div>
    </div>
  );
}
