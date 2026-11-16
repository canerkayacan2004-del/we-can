// Kategori oyunu: ülkeler, meyveler, sebzeler, hayvanlar… Emojiden İngilizcesini seç ya da Türkçesinden İngilizcesini yaz.
import { useState } from 'react';
import { CATEGORIES } from '@content/games/categories.ts';
import type { Category, CategoryWord } from '@content/games/categories.ts';
import { Icon } from '../../components/Icon.tsx';
import { Notice, cx } from '../../components/ui.tsx';
import { useApp } from '../../lib/app.tsx';
import { playSound } from '../../lib/sound.ts';
import { speak } from '../../lib/tts.ts';
import { shuffle, useRecordGame } from './common.tsx';

const ROUND = 10;
type Mode = 'pick' | 'type';
const norm = (s: string) => s.toLowerCase().replace(/^(the|a|an) /, '').replace(/[^a-z ]/g, '').replace(/\s+/g, ' ').trim();

export function Categories() {
  const { state } = useApp();
  const best = state.games?.cat ?? {};
  const [open, setOpen] = useState<{ cat: Category; mode: Mode } | null>(null);
  const [learn, setLearn] = useState<Category | null>(null);

  if (open) return <Round key={open.cat.id + open.mode} cat={open.cat} mode={open.mode} onExit={() => setOpen(null)} />;
  if (learn) return <WordList cat={learn} onExit={() => setLearn(null)} onPlay={(mode) => { setLearn(null); setOpen({ cat: learn, mode }); }} />;

  return (
    <section className="card card-glow" data-game="categories">
      <p className="section-title"><Icon name="layout" size={20} className="text-acc" /> Kategoriler</p>
      <p className="mb-4 text-fg-2">Bir konu seç: önce kelimelere göz at, sonra emojiden İngilizcesini seç ya da Türkçesinden İngilizcesini yaz. Her turda 10 soru.</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {CATEGORIES.map((c) => {
          const b = best[c.id] ?? 0;
          return (
            <button key={c.id} type="button" data-category={c.id} onClick={() => setLearn(c)}
              className={cx('card flex flex-col items-center gap-1 p-3 text-center transition-colors hover:border-acc/50', b >= 10 && 'border-acc/40')}>
              <span className="text-4xl leading-none">{c.emoji}</span>
              <span className="mt-1 text-sm font-bold text-fg">{c.title}</span>
              <span className="text-[0.7rem] text-fg-3">{c.words.length} kelime · {c.level}</span>
              <span className="text-xs tracking-widest" title={`En iyi: ${b}/10`}>{b >= 10 ? '⭐⭐⭐' : b >= 8 ? '⭐⭐☆' : b >= 5 ? '⭐☆☆' : '☆☆☆'}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function WordList({ cat, onExit, onPlay }: { cat: Category; onExit: () => void; onPlay: (m: Mode) => void }) {
  return (
    <section className="card card-glow" data-category-list={cat.id}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <button className="btn btn-ghost btn-sm" onClick={onExit}><Icon name="arrowLeft" size={16} /> Kategoriler</button>
        <p className="text-lg font-black text-fg">{cat.emoji} {cat.title} <span className="text-sm font-semibold text-fg-3">· {cat.titleEn}</span></p>
        <div className="flex gap-2">
          <button className="btn btn-primary btn-sm" data-action="cat-pick" onClick={() => onPlay('pick')}>🎯 Seçmeli oyna</button>
          <button className="btn btn-ghost btn-sm" data-action="cat-type" onClick={() => onPlay('type')}>⌨️ Yazarak oyna</button>
        </div>
      </div>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {cat.words.map((w) => (
          <li key={w.en}>
            <button type="button" onClick={() => speak(w.en)} title="Dinle" className="flex w-full items-center gap-3 rounded-2xl border border-line bg-panel-2 p-2.5 text-left hover:border-acc/40">
              <span className="text-3xl leading-none">{w.emoji}</span>
              <span className="min-w-0"><b lang="en" className="block truncate text-fg">{w.en}</b><span className="block truncate text-xs text-fg-3">{w.tr}</span></span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function makeRound(cat: Category) {
  const words = shuffle(cat.words).slice(0, ROUND);
  return words.map((w) => ({ w, options: shuffle([w.en, ...shuffle(cat.words.filter((x) => x.en !== w.en)).slice(0, 3).map((x) => x.en)]) }));
}

function Round({ cat, mode, onExit }: { cat: Category; mode: Mode; onExit: () => void }) {
  const [qs, setQs] = useState(() => makeRound(cat));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [typed, setTyped] = useState('');
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<CategoryWord[]>([]);
  const [done, setDone] = useState<null | { xp: number }>(null);
  const { record, error } = useRecordGame();
  const q = qs[i];

  const answer = (given: string) => {
    if (picked !== null) return;
    const ok = norm(given) === norm(q.w.en);
    setPicked(given);
    if (ok) { setScore((s) => s + 1); playSound('correct'); speak(q.w.en); } else { setMissed((m) => [...m, q.w]); playSound('wrong'); }
  };
  const next = async () => {
    if (i + 1 < qs.length) { setI(i + 1); setPicked(null); setTyped(''); return; }
    playSound('finish');
    const xp = await record('categories', { won: score >= Math.ceil(qs.length * 0.8), score: Math.round((score * 10) / qs.length), category: cat.id });
    setDone({ xp });
  };
  const restart = () => { setQs(makeRound(cat)); setI(0); setPicked(null); setTyped(''); setScore(0); setMissed([]); setDone(null); };
  const correct = picked !== null && norm(picked) === norm(q.w.en);

  return (
    <section className="card card-glow" data-game="categories" data-category-round={cat.id}>
      <div className="mb-3 flex items-center justify-between">
        <button className="btn btn-ghost btn-sm" onClick={onExit}><Icon name="arrowLeft" size={16} /> Kategoriler</button>
        <span className="text-sm text-fg-3">{cat.emoji} {cat.title} · {mode === 'pick' ? 'seçmeli' : 'yazarak'}{!done ? ` · ${i + 1}/${qs.length}` : ''}</span>
        <span className="font-mono-num text-sm font-bold text-acc" data-cat-score>{score} doğru</span>
      </div>
      {!done && q && (
        <div className="text-center">
          <p className="my-3 text-7xl leading-none" aria-hidden="true">{q.w.emoji}</p>
          <p className="text-lg font-bold text-fg-2" data-cat-tr>{q.w.tr}</p>
          {mode === 'pick' ? (
            <div className="mx-auto mt-5 grid max-w-xl gap-2 sm:grid-cols-2">
              {q.options.map((o) => (
                <button key={o} type="button" lang="en" data-cat-option={o} disabled={picked !== null} onClick={() => answer(o)}
                  className={cx('option', picked !== null && (o === q.w.en ? 'option-correct' : o === picked ? 'option-wrong' : 'opacity-50'))}>{o}</button>
              ))}
            </div>
          ) : (
            <div className="mx-auto mt-5 flex max-w-md gap-2">
              <input lang="en" className="field text-center text-lg" placeholder="İngilizcesini yaz…" value={typed} disabled={picked !== null} autoFocus data-cat-input
                onChange={(e) => setTyped(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { if (picked === null && typed.trim()) answer(typed); else if (picked !== null) void next(); } }} spellCheck={false} />
              {picked === null && <button className="btn btn-primary" disabled={!typed.trim()} onClick={() => answer(typed)} data-action="cat-check">Kontrol et</button>}
            </div>
          )}
          {picked !== null && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <p className={cx('font-bold', correct ? 'text-acc' : 'text-bad')}>{correct ? 'Doğru!' : <>Doğrusu: <span lang="en">{q.w.en}</span></>}</p>
              <button className="btn btn-primary px-8" data-action="cat-next" autoFocus={mode === 'pick'} onClick={() => void next()}>{i + 1 < qs.length ? 'Sonraki' : 'Bitir'}</button>
            </div>
          )}
        </div>
      )}
      {done && (
        <div className="py-4 text-center" data-cat-result={score}>
          <p className="text-5xl">{score === qs.length ? '🏆' : score >= 8 ? '⭐' : '💪'}</p>
          <p className="mt-2 text-3xl font-black text-fg">{score} / {qs.length}</p>
          <p className="text-fg-2">{done.xp > 0 ? `+${done.xp} XP` : ''}</p>
          {missed.length > 0 && (
            <div className="mx-auto mt-4 max-w-md rounded-2xl border border-line bg-panel-2 p-3 text-left">
              <p className="mb-1 text-xs font-bold text-fg-3">Kaçırdıkların</p>
              <ul className="grid gap-1 text-sm sm:grid-cols-2">{missed.map((w) => <li key={w.en}>{w.emoji} <b lang="en" className="text-fg">{w.en}</b> <span className="text-fg-2">— {w.tr}</span></li>)}</ul>
            </div>
          )}
          <div className="mt-5 flex justify-center gap-2">
            <button className="btn btn-ghost" onClick={onExit}>Başka kategori</button>
            <button className="btn btn-primary" onClick={restart}>Tekrar oyna</button>
          </div>
        </div>
      )}
      {error && <div className="mt-3"><Notice tone="error">{error}</Notice></div>}
    </section>
  );
}
