// Dikte yarışı: cümleyi dinle, duyduğunu yaz. Doğru kelime sayısı ve süre puanlanır.
import { useMemo, useRef, useState } from 'react';
import { PHRASES } from '@content/phrases.ts';
import { Icon } from '../../components/Icon.tsx';
import { Notice, cx } from '../../components/ui.tsx';
import { useApp } from '../../lib/app.tsx';
import { playSound } from '../../lib/sound.ts';
import { speak } from '../../lib/tts.ts';
import { nearLevels, normalizeSentence, shuffle, useLevel, useRecordGame, wordsNear } from './common.tsx';

const ROUND = 6;

/** Yazılanı hedefle kelime kelime karşılaştırır (sıra korunarak en uzun ortak dizi). */
export function compareWords(target: string, typed: string): { word: string; ok: boolean }[] {
  const t = normalizeSentence(target);
  const y = normalizeSentence(typed);
  const dp = Array.from({ length: t.length + 1 }, () => Array(y.length + 1).fill(0));
  for (let i = t.length - 1; i >= 0; i--) for (let j = y.length - 1; j >= 0; j--) dp[i][j] = t[i] === y[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out: { word: string; ok: boolean }[] = [];
  let i = 0, j = 0;
  while (i < t.length) {
    if (j < y.length && t[i] === y[j]) { out.push({ word: t[i], ok: true }); i++; j++; }
    else if (j < y.length && dp[i][j + 1] >= dp[i + 1][j]) j++;
    else { out.push({ word: t[i], ok: false }); i++; }
  }
  return out;
}

function pickSentences(level: ReturnType<typeof useLevel>): string[] {
  const near = new Set(nearLevels(level));
  const pool = [
    ...wordsNear(level).map((w) => w.exampleEn),
    ...PHRASES.filter((p) => near.has(p.level)).map((p) => p.exEn),
  ].filter((s) => { const n = normalizeSentence(s).length; return n >= 3 && n <= 12; });
  return shuffle([...new Set(pool)]).slice(0, ROUND);
}

export function Dictation() {
  const { state } = useApp();
  const level = useLevel();
  const best = state.games?.arcade?.dictation?.best ?? 0;
  const [seed, setSeed] = useState(0);
  const sentences = useMemo(() => pickSentences(level), [level, seed]);
  const [phase, setPhase] = useState<'ready' | 'play' | 'done'>('ready');
  const [i, setI] = useState(0);
  const [typed, setTyped] = useState('');
  const [checked, setChecked] = useState<null | { word: string; ok: boolean }[]>(null);
  const [score, setScore] = useState(0);
  const [plays, setPlays] = useState(0);
  const [xp, setXp] = useState(0);
  const started = useRef(0);
  const [seconds, setSeconds] = useState(0);
  const { record, error } = useRecordGame();
  const target = sentences[i] ?? '';
  const total = useMemo(() => sentences.reduce((n, s) => n + normalizeSentence(s).length, 0), [sentences]);

  const play = (slow = false) => { speak(target, slow ? 0.7 : 0.92); setPlays((p) => p + 1); };
  const start = () => { setSeed((s) => s + 1); setI(0); setScore(0); setTyped(''); setChecked(null); setXp(0); setPlays(0); started.current = Date.now(); setPhase('play'); };
  // seed değişince yeni cümleler gelir; ilk cümleyi otomatik çalmak için kısa gecikme
  const check = () => {
    const res = compareWords(target, typed);
    const good = res.filter((r) => r.ok).length;
    setChecked(res);
    setScore((s) => s + good);
    playSound(good === res.length ? 'correct' : 'wrong');
  };
  const next = () => {
    if (i + 1 >= sentences.length) {
      const secs = Math.round((Date.now() - started.current) / 1000);
      setSeconds(secs);
      setPhase('done');
      playSound('finish');
      void record('dictation', { won: score >= total * 0.8, score }).then(setXp);
      return;
    }
    setI(i + 1); setTyped(''); setChecked(null); setPlays(0);
    window.setTimeout(() => speak(sentences[i + 1], 0.92), 150);
  };

  return (
    <section className="card card-glow" data-game="dictation">
      <div className="mb-3 flex items-center justify-between">
        <p className="section-title mb-0"><Icon name="headphones" size={20} className="text-acc" /> Dikte yarışı</p>
        <span className="chip bg-gold/15 text-gold">Rekor {best}</span>
      </div>
      {phase === 'ready' && (
        <div className="py-6 text-center">
          <p className="text-fg-2">{ROUND} cümle dinleyeceksin; her birinde duyduğunu yaz. Doğru yazdığın her kelime 1 puan.</p>
          <p className="mt-1 text-sm text-fg-3">Büyük harf ve noktalama önemli değil. İstediğin kadar tekrar dinleyebilirsin.</p>
          <button className="btn btn-primary mt-5 px-10" data-action="dictation-start" onClick={() => { start(); window.setTimeout(() => document.querySelector<HTMLButtonElement>('[data-action="dictation-play"]')?.click(), 200); }}>Başla</button>
        </div>
      )}
      {phase === 'play' && (
        <div>
          <div className="mb-4 flex items-center justify-between text-sm text-fg-3"><span>Cümle {i + 1} / {sentences.length}</span><span className="font-mono-num font-bold text-acc" data-dictation-score>{score} puan</span></div>
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" className="btn btn-primary" data-action="dictation-play" onClick={() => play()}><Icon name="volume" size={18} /> Dinle{plays > 0 ? ` (${plays})` : ''}</button>
            <button type="button" className="btn btn-ghost" onClick={() => play(true)}>🐢 Yavaş</button>
          </div>
          <input lang="en" data-dictation-input className="field mt-5 w-full text-lg" placeholder="Duyduğunu buraya yaz…" value={typed} disabled={!!checked} autoFocus
            onChange={(e) => setTyped(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { if (!checked && typed.trim()) check(); else if (checked) next(); } }} spellCheck={false} />
          {checked && (
            <div className="mt-4 rounded-2xl border border-line bg-panel-2 p-3" data-dictation-check>
              <p lang="en" className="flex flex-wrap gap-1.5 text-lg">
                {checked.map((r, k) => <span key={k} className={cx('rounded px-1', r.ok ? 'text-acc' : 'bg-bad/15 text-bad line-through decoration-1')}>{r.word}</span>)}
              </p>
              <p lang="en" className="mt-1 text-sm text-fg-2">Doğrusu: <b className="text-fg">{target}</b></p>
            </div>
          )}
          <div className="mt-4 flex justify-end">
            {!checked
              ? <button className="btn btn-primary px-10" data-action="dictation-check" disabled={!typed.trim()} onClick={check}>Kontrol et</button>
              : <button className="btn btn-primary px-10" data-action="dictation-next" onClick={next} autoFocus>{i + 1 >= sentences.length ? 'Bitir' : 'Sonraki'}</button>}
          </div>
        </div>
      )}
      {phase === 'done' && (
        <div className="py-4 text-center" data-dictation-result={score}>
          <p className="text-5xl">{score > best ? '🏆' : '🎧'}</p>
          <p className="mt-2 text-3xl font-black text-fg">{score} / {total} kelime</p>
          <p className="text-fg-2">%{Math.round((100 * score) / Math.max(1, total))} doğruluk · {Math.floor(seconds / 60)} dk {seconds % 60} sn{xp > 0 ? ` · +${xp} XP` : ''}</p>
          <button className="btn btn-primary mt-5 px-10" onClick={start}>Tekrar oyna</button>
        </div>
      )}
      {error && <div className="mt-3"><Notice tone="error">{error}</Notice></div>}
    </section>
  );
}
