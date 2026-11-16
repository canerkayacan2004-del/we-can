// Kelime oyunları: Wordle tarzı "Kelimeyi Bul" (günlük + serbest) ve "Kelime Avı" (karışık harfler).
import { useEffect, useMemo, useRef, useState } from 'react';
import { dayKey } from '@core/engine.ts';
import { WORDLE_TRIES, dailyIndex, emptyGameStats, scoreGuess, scrambleWord } from '@core/games.ts';
import type { LetterMark } from '@core/games.ts';
import { FIVE_LETTER_WORDS as CURATED_5 } from '@content/games/words5.ts';
import { VALID_5 } from '@content/games/valid5.ts';
import { WORD_BANK } from '@content/words/index.ts';
import { Icon } from '../components/Icon.tsx';
import { Notice, PageTitle, SpeakButton, cx } from '../components/ui.tsx';
import { errorMessage, useApp } from '../lib/app.tsx';
import { playSound } from '../lib/sound.ts';
import { SpeedRound } from './arcade/SpeedRound.tsx';
import { Dictation } from './arcade/Dictation.tsx';
import { Streamer } from './arcade/Streamer.tsx';
import { Subtitles } from './arcade/Subtitles.tsx';

const KEY_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

// Cevap havuzu: seçilmiş 5 harfli kelimeler + kelime bankasındaki 5 harfli kelimeler (hepsi Türkçe anlamlı).
const FIVE_LETTER_WORDS: [string, string, string][] = [
  ...CURATED_5,
  ...WORD_BANK.filter((w) => /^[a-z]{5}$/.test(w.term) && !CURATED_5.some(([t]) => t === w.term)).map((w): [string, string, string] => [w.term, w.meaningTr, w.level]),
];
let validSet: Set<string> | null = null;
function isValidGuess(word: string): boolean {
  validSet ??= new Set([...VALID_5.split(' '), ...FIVE_LETTER_WORDS.map(([w]) => w)]);
  return validSet.has(word);
}
const MARK_CLASS: Record<LetterMark, string> = {
  correct: 'border-acc bg-acc text-on-acc shadow-[0_0_16px_-4px_var(--wc-acc)]',
  present: 'border-gold bg-gold text-[#1a1300]',
  absent: 'border-line-2 bg-panel-3 text-fg-3',
};

function randomIndex(n: number, avoid?: number) {
  let i = Math.floor(Math.random() * n);
  if (n > 1 && i === avoid) i = (i + 1) % n;
  return i;
}

export type GameTab = 'wordle' | 'scramble' | 'speed' | 'dictation' | 'subtitle' | 'streamer' | 'story';
const GAMES: { id: GameTab; emoji: string; label: string; hint: string }[] = [
  { id: 'wordle', emoji: '🟩', label: 'Wordle', hint: '5 harfli kelimeyi bul' },
  { id: 'scramble', emoji: '🔤', label: 'Kelime Avı', hint: 'Harfleri diz' },
  { id: 'speed', emoji: '⚡', label: 'Hızlı tur', hint: '60 saniye' },
  { id: 'dictation', emoji: '🎧', label: 'Dikte yarışı', hint: 'Dinle ve yaz' },
  { id: 'streamer', emoji: '🔴', label: 'Yayıncı modu', hint: 'Sohbete cevap ver' },
  { id: 'subtitle', emoji: '🎬', label: 'Altyazı görevi', hint: 'Dinle, altyazıyı seç' },
];

export function GamesScreen({ game }: { game?: GameTab }) {
  const [tab, setTab] = useState<GameTab>(game && GAMES.some((g) => g.id === game) ? game : 'wordle');
  return (
    <div data-screen="games" className="space-y-4">
      <PageTitle title="Oyun salonu" icon="target" subtitle="Oynayarak öğren: kelime, dinleme ve konuşma oyunları tek yerde." />
      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
        {GAMES.map((g) => (
          <button key={g.id} type="button" role="tab" aria-selected={tab === g.id} data-game-tab={g.id} onClick={() => setTab(g.id)} title={g.hint}
            className={cx('flex shrink-0 items-center gap-2 rounded-2xl border px-3 py-2 text-left', tab === g.id ? 'border-acc bg-acc/12 shadow-[0_0_14px_-5px_var(--wc-acc)]' : 'border-line bg-panel-2 hover:border-acc/40')}>
            <span className="text-xl leading-none">{g.emoji}</span>
            <span><span className="block text-sm font-bold text-fg">{g.label}</span><span className="block text-[0.7rem] text-fg-3">{g.hint}</span></span>
          </button>
        ))}
      </div>
      {tab === 'wordle' && <Wordle />}
      {tab === 'scramble' && <Scramble />}
      {tab === 'speed' && <SpeedRound />}
      {tab === 'dictation' && <Dictation />}
      {tab === 'streamer' && <Streamer />}
      {tab === 'subtitle' && <Subtitles />}
    </div>
  );
}

// ---------------- Wordle ----------------
export function Wordle({ compact = false }: { compact?: boolean }) {
  const { state, backend, setState } = useApp();
  const today = dayKey(new Date());
  const stats = state.games ?? emptyGameStats();
  const dailyPlayed = stats.wordle.lastDaily === today;
  const [mode, setMode] = useState<'daily' | 'practice'>(dailyPlayed ? 'practice' : 'daily');
  const [answerIdx, setAnswerIdx] = useState(() => (dailyPlayed ? randomIndex(FIVE_LETTER_WORDS.length) : dailyIndex(today, FIVE_LETTER_WORDS.length)));
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrentState] = useState('');
  // Hızlı yazımda eski değer okunmasın diye güncel tahmin bir ref'te de tutulur.
  const currentRef = useRef('');
  const setCurrent = (v: string | ((c: string) => string)) => {
    currentRef.current = typeof v === 'function' ? v(currentRef.current) : v;
    setCurrentState(currentRef.current);
  };
  const guessesRef = useRef<string[]>([]);
  const [over, setOver] = useState<null | 'won' | 'lost'>(null);
  const overRef = useRef(false);
  const [shake, setShake] = useState(false);
  const [message, setMessage] = useState('');
  const [xp, setXp] = useState(0);
  const [answer, meaning, level] = FIVE_LETTER_WORDS[answerIdx];

  const keyMarks = useMemo(() => {
    const out: Record<string, LetterMark> = {};
    const rank = { absent: 0, present: 1, correct: 2 };
    for (const g of guesses) scoreGuess(g, answer).forEach((m, i) => {
      const ch = g[i];
      if (!out[ch] || rank[m] > rank[out[ch]]) out[ch] = m;
    });
    return out;
  }, [guesses, answer]);

  const finish = async (won: boolean, tries: number) => {
    overRef.current = true;
    setOver(won ? 'won' : 'lost');
    playSound(won ? 'finish' : 'wrong');
    try {
      const res = await backend.recordGame('wordle', { won, tries, daily: mode === 'daily' });
      setState(res.state);
      setXp(res.xp);
    } catch (err) {
      setMessage(errorMessage(err));
    }
  };

  const submit = () => {
    if (overRef.current) return;
    const current = currentRef.current;
    if (current.length !== 5) { setShake(true); setMessage('5 harf yazmalısın.'); setTimeout(() => setShake(false), 400); return; }
    if (!isValidGuess(current)) { setShake(true); setMessage('Bu kelime sözlükte yok. Gerçek bir İngilizce kelime dene.'); setTimeout(() => setShake(false), 400); return; }
    const next = [...guessesRef.current, current];
    guessesRef.current = next;
    setGuesses(next);
    setCurrent('');
    setMessage('');
    if (current === answer) void finish(true, next.length);
    else if (next.length >= WORDLE_TRIES) void finish(false, next.length);
    else playSound('tap');
  };

  const type = (key: string) => {
    if (overRef.current) return;
    if (key === 'enter') submit();
    else if (key === 'back') setCurrent((c) => c.slice(0, -1));
    else if (/^[a-z]$/.test(key)) setCurrent((c) => (c.length < 5 ? c + key : c));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Enter') { e.preventDefault(); type('enter'); }
      else if (e.key === 'Backspace') type('back');
      else if (/^[a-zA-Z]$/.test(e.key)) type(e.key.toLowerCase());
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const newPractice = () => {
    setMode('practice'); setAnswerIdx(randomIndex(FIVE_LETTER_WORDS.length, answerIdx));
    guessesRef.current = []; overRef.current = false;
    setGuesses([]); setCurrent(''); setOver(null); setMessage(''); setXp(0);
  };

  const rows = Array.from({ length: WORDLE_TRIES }, (_, r) => guesses[r] ?? (r === guesses.length ? current : ''));
  const cell = compact ? 'h-10 w-10 text-lg' : 'h-14 w-14 text-2xl';

  return (
    <section className={cx('card', !compact && 'card-glow')} data-game="wordle" data-answer-length={answer.length}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="section-title mb-0"><Icon name="target" size={20} className="text-acc" /> {mode === 'daily' ? 'Günün Wordle’ı' : 'Serbest oyun'}</p>
        <div className="flex items-center gap-2 text-xs text-fg-2">
          <span className="chip bg-panel-3">Oynanan {stats.wordle.played}</span>
          <span className="chip bg-panel-3">Kazanma %{stats.wordle.played ? Math.round((100 * stats.wordle.won) / stats.wordle.played) : 0}</span>
          <span className="chip bg-[#ff7a3d]/15 text-[#ff9a62]"><Icon name="flame" size={12} /> {stats.wordle.streak}</span>
        </div>
      </div>
      {mode === 'daily' && dailyPlayed && !over && <Notice tone="info">Günün Wordle’ını bugün oynadın. Serbest oyunla devam edebilirsin.</Notice>}

      <div lang="en" className={cx('mx-auto grid w-fit gap-1.5', shake && 'animate-shake')} data-wordle-grid>
        {rows.map((word, r) => {
          const scored = r < guesses.length ? scoreGuess(word, answer) : null;
          return (
            <div key={r} className="flex gap-1.5" data-wordle-row={r}>
              {Array.from({ length: 5 }, (_, c) => (
                <span key={c} data-mark={scored?.[c] ?? (word[c] ? 'typed' : 'empty')}
                  className={cx('flex items-center justify-center rounded-lg border-2 font-black uppercase transition-colors', cell,
                    scored ? MARK_CLASS[scored[c]] : word[c] ? 'border-acc/60 bg-panel-2 text-fg' : 'border-line bg-panel-2/60 text-fg')}>
                  {word[c] ?? ''}
                </span>
              ))}
            </div>
          );
        })}
      </div>

      {message && <p className="mt-3 text-center text-sm text-warn">{message}</p>}

      {over ? (
        <div className="mt-4 rounded-2xl border border-line bg-panel-2 p-4 text-center" data-wordle-result={over}>
          <p className="text-lg font-black text-fg">{over === 'won' ? `Bravo! ${guesses.length}. denemede buldun.` : 'Bu sefer olmadı.'}</p>
          <p className="mt-1 text-fg-2">Kelime: <b lang="en" className="uppercase text-acc">{answer}</b> = {meaning} <span className="chip ml-1 bg-panel-3 text-xs">{level}</span></p>
          <div className="mt-2 flex justify-center"><SpeakButton text={answer} /></div>
          {xp > 0 && <p className="mt-1 font-bold text-gold">+{xp} XP</p>}
          <button className="btn btn-primary mt-3" data-action="wordle-new" onClick={newPractice}>Yeni kelime</button>
        </div>
      ) : (
        <div lang="en" className="mx-auto mt-4 max-w-xl space-y-1.5" data-keyboard>
          {KEY_ROWS.map((row, i) => (
            <div key={row} className="flex justify-center gap-1.5">
              {i === 2 && <button type="button" className="rounded-lg bg-panel-3 px-3 text-xs font-bold text-fg" onClick={() => type('enter')} data-key="enter">ENTER</button>}
              {row.split('').map((k) => (
                <button key={k} type="button" data-key={k} onClick={() => type(k)}
                  className={cx('h-11 w-9 rounded-lg border font-bold uppercase', keyMarks[k] ? MARK_CLASS[keyMarks[k]] : 'border-line-2 bg-panel-2 text-fg hover:bg-panel-3')}>{k}</button>
              ))}
              {i === 2 && <button type="button" className="rounded-lg bg-panel-3 px-3 text-fg" onClick={() => type('back')} data-key="back" aria-label="Sil">⌫</button>}
            </div>
          ))}
        </div>
      )}
      {!compact && <p className="mt-4 text-center text-xs text-fg-3">5 harfli İngilizce kelimeyi 6 denemede bul. <span className="text-acc">Yeşil</span>: doğru yerde · <span className="text-gold">Sarı</span>: kelimede var, yeri yanlış · Gri: yok.</p>}
    </section>
  );
}

// ---------------- Kelime Avı ----------------
const SCRAMBLE_POOL = WORD_BANK.filter((w) => /^[a-z]{4,9}$/.test(w.term));

function Scramble() {
  const { state, backend, setState } = useApp();
  const stats = state.games ?? emptyGameStats();
  const [idx, setIdx] = useState(() => randomIndex(SCRAMBLE_POOL.length));
  const word = SCRAMBLE_POOL[idx];
  const letters = useMemo(() => scrambleWord(word.term), [word.term]);
  const [picked, setPicked] = useState<number[]>([]);
  const [result, setResult] = useState<null | boolean>(null);
  const [streak, setStreak] = useState(0);
  const [hint, setHint] = useState(false);
  const [error, setError] = useState('');
  const guess = picked.map((i) => letters[i]).join('');

  const check = async (finalGuess: string) => {
    const won = finalGuess === word.term;
    setResult(won);
    playSound(won ? 'correct' : 'wrong');
    const nextStreak = won ? streak + 1 : 0;
    setStreak(nextStreak);
    try { setState((await backend.recordGame('scramble', { won, streak: nextStreak })).state); } catch (err) { setError(errorMessage(err)); }
  };
  const pick = (i: number) => {
    if (result !== null || picked.includes(i)) return;
    const next = [...picked, i];
    setPicked(next);
    if (next.length === letters.length) void check(next.map((j) => letters[j]).join(''));
  };
  const next = () => { setIdx(randomIndex(SCRAMBLE_POOL.length, idx)); setPicked([]); setResult(null); setHint(false); };

  return (
    <section className="card card-glow text-center" data-game="scramble">
      <div className="mb-2 flex items-center justify-between">
        <p className="section-title mb-0"><Icon name="sparkles" size={20} className="text-acc" /> Kelime Avı</p>
        <span className="chip bg-[#ff7a3d]/15 text-[#ff9a62]">Seri {streak} · En iyi {stats.scramble.best}</span>
      </div>
      <p className="text-fg-2">Türkçe anlamı: <b className="text-fg" data-scramble-meaning>{word.meaningTr}</b> <span className="chip ml-1 bg-panel-3 text-xs">{word.level}</span></p>
      {hint && <p className="mt-1 text-sm text-fg-3">İpucu: “{word.exampleEn.replace(new RegExp(word.term, 'i'), '_'.repeat(word.term.length))}”</p>}
      <div lang="en" className="mt-5 flex min-h-14 justify-center gap-1.5" data-scramble-answer>
        {letters.split('').map((_, i) => (
          <span key={i} className={cx('flex h-12 w-11 items-center justify-center rounded-lg border-2 text-xl font-black uppercase',
            result === true ? MARK_CLASS.correct : result === false ? 'border-bad bg-bad/15 text-bad' : guess[i] ? 'border-acc/60 bg-panel-2 text-fg' : 'border-line bg-panel-2/60')}>{guess[i] ?? ''}</span>
        ))}
      </div>
      <div lang="en" className="mt-4 flex flex-wrap justify-center gap-2" data-scramble-letters>
        {letters.split('').map((ch, i) => (
          <button key={i} type="button" data-letter={i} disabled={picked.includes(i) || result !== null} onClick={() => pick(i)}
            className={cx('h-12 w-11 rounded-xl border-2 border-b-4 text-xl font-black uppercase', picked.includes(i) ? 'border-line bg-panel opacity-30' : 'border-line-2 bg-panel-2 text-fg hover:border-acc')}>{ch}</button>
        ))}
      </div>
      {result === null ? (
        <div className="mt-4 flex justify-center gap-2">
          <button className="btn btn-ghost btn-sm" onClick={() => setPicked(picked.slice(0, -1))} disabled={!picked.length}>⌫ Geri al</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setHint(true)} disabled={hint}>İpucu</button>
          <button className="btn btn-ghost btn-sm" onClick={() => void check('')}>Pes et</button>
        </div>
      ) : (
        <div className="mt-4" data-scramble-result={result ? 'won' : 'lost'}>
          <p className={cx('text-lg font-black', result ? 'text-acc' : 'text-bad')}>{result ? 'Doğru!' : `Cevap: ${word.term}`}</p>
          <p className="text-sm text-fg-2">{word.exampleEn}</p>
          <button className="btn btn-primary mt-3" data-action="scramble-next" onClick={next} autoFocus>Sıradaki</button>
        </div>
      )}
      {error && <div className="mt-3"><Notice tone="error">{error}</Notice></div>}
    </section>
  );
}
