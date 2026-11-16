// Günün 10 kelimesi: önce hatırlamaya çalış (anlam gizli), sonra çevir; "Biliyordum" ya da "Öğren".
import { useMemo, useState } from 'react';
import { dayKey } from '@core/engine.ts';
import { DAILY_WORDS_XP } from '@core/daily.ts';
import { Icon } from '../components/Icon.tsx';
import { Confetti, Notice, PageTitle, ProgressBar, SpeakButton, cx } from '../components/ui.tsx';
import { errorMessage, useApp } from '../lib/app.tsx';
import { todaysWords } from '../lib/content.ts';
import type { BankWord } from '../lib/content.ts';
import { playSound } from '../lib/sound.ts';

const LEVEL_TONE: Record<string, string> = {
  A1: 'bg-acc/15 text-acc', A2: 'bg-acc/15 text-acc', B1: 'bg-info/15 text-info', B2: 'bg-info/15 text-info', C1: 'bg-gold/15 text-gold', C2: 'bg-[#ff5fa2]/15 text-[#ff7fb5]',
};

export function LevelChip({ level }: { level: string }) {
  return <span className={cx('chip text-xs font-black', LEVEL_TONE[level] ?? 'bg-panel-3 text-fg-2')} data-level={level}>{level}</span>;
}

export function DailyWordsScreen() {
  const { state, backend, setState, go } = useApp();
  const today = dayKey(new Date());
  const words = useMemo(() => todaysWords(state, today), [state.dailyWords?.date, state.profile.createdAt, today]); // eslint-disable-line react-hooks/exhaustive-deps
  const rec = state.dailyWords?.date === today ? state.dailyWords : { seen: [] as string[], learned: [] as string[], rewarded: false };
  const firstOpen = words.findIndex((w) => !rec.seen.includes(w.id));
  const [index, setIndex] = useState(firstOpen === -1 ? 0 : firstOpen);
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState('');
  const [reward, setReward] = useState(0);
  const done = words.every((w) => rec.seen.includes(w.id));
  const word: BankWord | undefined = words[index];

  const answer = async (learn: boolean) => {
    if (!word) return;
    try {
      const out = await backend.markDailyWord(word.id, learn);
      setState(out.state);
      playSound(learn ? 'tap' : 'correct');
      if (out.xp) { setReward(out.xp); playSound('finish'); }
      const nextOpen = words.findIndex((w, i) => i > index && !out.state.dailyWords?.seen.includes(w.id));
      setIndex(nextOpen === -1 ? Math.min(index + 1, words.length - 1) : nextOpen);
      setRevealed(false);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <div data-screen="daily-words" className="space-y-5">
      {reward > 0 && <Confetti />}
      <PageTitle title="Günün 10 kelimesi" icon="sparkles" subtitle="Önce anlamını hatırlamaya çalış, sonra kartı çevir. Bilmediklerin deftere ve akıllı tekrara eklenir." />
      {error && <Notice tone="error">{error}</Notice>}

      <div className="flex items-center gap-4">
        <div className="flex-1"><ProgressBar value={rec.seen.length} max={words.length} /></div>
        <span className="font-mono-num text-sm font-bold text-fg-2" data-daily-progress>{rec.seen.length} / {words.length}</span>
      </div>

      {done ? (
        <section className="card card-glow text-center" data-daily-done>
          <p className="text-5xl">🎉</p>
          <h2 className="mt-2 text-2xl font-black text-fg">Bugünün kelimeleri tamam!</h2>
          <p className="mt-1 text-fg-2">{rec.learned.length} kelime defterine ve tekrar listene eklendi. {rec.rewarded && <b className="text-gold">+{DAILY_WORDS_XP} XP</b>}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button className="btn btn-primary" onClick={() => go({ name: 'review' })}>Akıllı tekrara geç <Icon name="arrowRight" size={18} /></button>
            <button className="btn btn-ghost" onClick={() => go({ name: 'dashboard' })}>Panoya dön</button>
          </div>
        </section>
      ) : word && (
        <section className="card card-glow mx-auto max-w-2xl p-8 text-center" data-word-card={word.id} key={word.id}>
          <div className="flex items-center justify-center gap-2"><LevelChip level={word.level} /><span className="chip bg-panel-3 text-xs text-fg-2">{word.pos}</span></div>
          <div className="mt-4 flex items-center justify-center gap-3">
            <h2 className="text-5xl font-black tracking-tight text-fg" data-word-term>{word.term}</h2>
            <SpeakButton text={word.term} />
          </div>
          {!revealed ? (
            <div className="mt-8">
              <p className="text-fg-2">Anlamını hatırlıyor musun? Aklından söyle, sonra kontrol et.</p>
              <button className="btn btn-primary mt-4 px-10" data-action="reveal" autoFocus onClick={() => setRevealed(true)}>Anlamını göster</button>
            </div>
          ) : (
            <div className="mt-6 animate-pop">
              <p className="text-3xl font-black text-acc" data-word-meaning>{word.meaningTr}</p>
              <div className="mx-auto mt-5 max-w-lg rounded-2xl border border-line bg-panel-2 p-4 text-left">
                <div className="flex items-start gap-2">
                  <SpeakButton text={word.exampleEn} label="" />
                  <div>
                    <p className="font-semibold text-fg">{word.exampleEn}</p>
                    <p className="text-sm text-fg-2">{word.exampleTr}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button className="btn btn-ghost" data-action="knew" onClick={() => answer(false)}><Icon name="check" size={18} /> Biliyordum</button>
                <button className="btn btn-primary" data-action="learn" onClick={() => answer(true)}><Icon name="plus" size={18} /> Öğren · deftere ekle</button>
              </div>
            </div>
          )}
        </section>
      )}

      <section className="card">
        <p className="section-title">Bugünün listesi</p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {words.map((w, i) => {
            const seen = rec.seen.includes(w.id);
            const learned = rec.learned.includes(w.id);
            return (
              <li key={w.id}>
                <button type="button" onClick={() => { setIndex(i); setRevealed(seen); }} data-word-item={w.id}
                  className={cx('flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left', i === index && !done ? 'border-acc/50 bg-acc/8' : 'border-line hover:bg-panel-2')}>
                  <LevelChip level={w.level} />
                  <span className="font-semibold text-fg">{w.term}</span>
                  <span className="truncate text-sm text-fg-3">{seen ? w.meaningTr : '•••'}</span>
                  <span className="ml-auto">{learned ? <Icon name="book" size={16} className="text-acc" /> : seen ? <Icon name="check" size={16} className="text-good" /> : null}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
