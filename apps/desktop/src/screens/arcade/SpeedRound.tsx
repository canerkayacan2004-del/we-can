// Hızlı tur: 60 saniyede olabildiğince çok kelimenin Türkçesini bul.
import { useEffect, useRef, useState } from 'react';
import type { BankWord } from '@content/words/index.ts';
import { Icon } from '../../components/Icon.tsx';
import { Notice, cx } from '../../components/ui.tsx';
import { useApp } from '../../lib/app.tsx';
import { playSound } from '../../lib/sound.ts';
import { shuffle, useLevel, useRecordGame, wordsNear } from './common.tsx';

const DURATION = 60;

function makeQuestion(pool: BankWord[], avoid?: string) {
  let word = pool[Math.floor(Math.random() * pool.length)];
  if (word.term === avoid && pool.length > 1) word = pool.find((w) => w.term !== avoid)!;
  const wrong = shuffle(pool.filter((w) => w.meaningTr !== word.meaningTr)).slice(0, 3).map((w) => w.meaningTr);
  return { word, options: shuffle([word.meaningTr, ...wrong]) };
}

export function SpeedRound() {
  const { state } = useApp();
  const level = useLevel();
  const pool = useRef(wordsNear(level)).current;
  const best = state.games?.arcade?.speed?.best ?? 0;
  const [phase, setPhase] = useState<'ready' | 'play' | 'done'>('ready');
  const [q, setQ] = useState(() => makeQuestion(pool));
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [left, setLeft] = useState(DURATION);
  const [flash, setFlash] = useState<null | 'ok' | 'bad'>(null);
  const [missed, setMissed] = useState<BankWord[]>([]);
  const [xp, setXp] = useState(0);
  const endAt = useRef(0);
  const { record, error } = useRecordGame();

  useEffect(() => {
    if (phase !== 'play') return;
    const t = window.setInterval(() => {
      const s = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000));
      setLeft(s);
      if (s <= 0) setPhase('done');
    }, 200);
    return () => window.clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'done') return;
    playSound('finish');
    void record('speed', { won: score > best, score }).then(setXp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const answer = (option: string) => {
    if (phase !== 'play') return;
    const ok = option === q.word.meaningTr;
    if (ok) { setScore((s) => s + 1 + (combo >= 4 ? 1 : 0)); setCombo((c) => c + 1); playSound('correct'); }
    else { setCombo(0); setMissed((m) => (m.some((w) => w.term === q.word.term) ? m : [...m, q.word])); playSound('wrong'); }
    setFlash(ok ? 'ok' : 'bad');
    window.setTimeout(() => setFlash(null), 180);
    setQ(makeQuestion(pool, q.word.term));
  };

  useEffect(() => {
    if (phase !== 'play') return;
    const onKey = (e: KeyboardEvent) => { const n = Number(e.key); if (n >= 1 && n <= 4) answer(q.options[n - 1]); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const start = () => { setScore(0); setCombo(0); setMissed([]); setXp(0); setLeft(DURATION); endAt.current = Date.now() + DURATION * 1000; setQ(makeQuestion(pool)); setPhase('play'); };

  return (
    <section className="card card-glow text-center" data-game="speed">
      <div className="mb-3 flex items-center justify-between">
        <p className="section-title mb-0"><Icon name="bolt" size={20} className="text-gold" /> Hızlı tur</p>
        <span className="chip bg-gold/15 text-gold">Rekor {best}</span>
      </div>
      {phase === 'ready' && (
        <div className="py-6">
          <p className="text-fg-2">60 saniyede olabildiğince çok kelimenin Türkçesini seç. 5 doğru üst üste = kombo, her doğru 2 puan.</p>
          <p className="mt-1 text-sm text-fg-3">Klavyede 1–4 tuşlarıyla da seçebilirsin.</p>
          <button className="btn btn-primary mt-5 px-10" data-action="speed-start" onClick={start}>Başla</button>
        </div>
      )}
      {phase === 'play' && (
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-panel-3"><div className={cx('h-full rounded-full transition-all', left <= 10 ? 'bg-bad' : 'bg-acc')} style={{ width: `${(left / DURATION) * 100}%` }} /></div>
            <span className="font-mono-num w-10 font-black text-fg" data-speed-left>{left}</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-sm">
            <span className="font-mono-num font-black text-acc" data-speed-score>{score} puan</span>
            {combo >= 5 && <span className="chip animate-pop bg-gold/20 text-xs font-black text-gold">KOMBO x{combo}</span>}
          </div>
          <p lang="en" className={cx('my-6 text-5xl font-black tracking-tight transition-colors', flash === 'ok' ? 'text-acc' : flash === 'bad' ? 'text-bad' : 'text-fg')} data-speed-word>{q.word.term}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {q.options.map((o, i) => (
              <button key={o + i} type="button" className="option text-left" data-speed-option={o} onClick={() => answer(o)}>
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md border border-line-2 text-xs text-fg-3">{i + 1}</span>{o}
              </button>
            ))}
          </div>
        </div>
      )}
      {phase === 'done' && (
        <div className="py-4" data-speed-result={score}>
          <p className="text-5xl">{score > best ? '🏆' : '⚡'}</p>
          <p className="mt-2 text-3xl font-black text-fg">{score} puan</p>
          <p className="text-fg-2">{score > best ? 'Yeni rekor!' : `Rekorun: ${best}`}{xp > 0 ? ` · +${xp} XP` : ''}</p>
          {missed.length > 0 && (
            <div className="mx-auto mt-4 max-w-md rounded-2xl border border-line bg-panel-2 p-3 text-left">
              <p className="mb-1 text-xs font-bold text-fg-3">Kaçırdıkların</p>
              <ul className="grid gap-1 text-sm sm:grid-cols-2">{missed.slice(0, 10).map((w) => <li key={w.term}><b lang="en" className="text-fg">{w.term}</b> <span className="text-fg-2">— {w.meaningTr}</span></li>)}</ul>
            </div>
          )}
          <button className="btn btn-primary mt-5 px-10" data-action="speed-again" onClick={start} autoFocus>Tekrar oyna</button>
        </div>
      )}
      {error && <div className="mt-3"><Notice tone="error">{error}</Notice></div>}
    </section>
  );
}
