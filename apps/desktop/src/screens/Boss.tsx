// Ünite boss'u: ünitenin sorularıyla süreli savaş. Her doğru boss'un canını azaltır, yanlış veya süre bitişi bir kalbe mal olur.
import { useEffect, useMemo, useRef, useState } from 'react';
import { gradeExercise } from '@core/grading.ts';
import type { Grade } from '@core/grading.ts';
import { shuffleExercises } from '@core/shuffle.ts';
import { unitUnlocked } from '@core/engine.ts';
import type { Exercise, ResponseValue } from '@core/types.ts';
import { ExerciseView, hasAnswer } from '../components/Exercise.tsx';
import { Icon } from '../components/Icon.tsx';
import { Mascot, Notice, cx } from '../components/ui.tsx';
import { useApp } from '../lib/app.tsx';
import { curriculum, getLessonContent, getUnit } from '../lib/content.ts';
import { playSound } from '../lib/sound.ts';
import { useRecordGame } from './arcade/common.tsx';

const HP = 8;
const HEARTS = 3;
const SECONDS = 25;
const BOSSES: Record<string, { name: string; emoji: string }> = {
  A1: { name: 'Kelime Canavarı', emoji: '👾' }, A2: { name: 'Zaman Bükücü', emoji: '🐉' }, B1: { name: 'Gramer Golemi', emoji: '🗿' },
  B2: { name: 'Deyim Hayaleti', emoji: '👻' }, C1: { name: 'Akademik Ejder', emoji: '🐲' }, C2: { name: 'Son Patron', emoji: '🤖' },
};
const BOSS_TYPES = new Set(['mcq', 'listen_choice', 'dialogue', 'truefalse', 'fill', 'translate', 'order']);

export function bossQuestions(unitId: string): Exercise[] {
  const unit = getUnit(unitId);
  if (!unit) return [];
  const list: Exercise[] = [];
  for (const l of unit.lessons) {
    const c = getLessonContent(l.code);
    if (!c || c.mode === 'exam') continue;
    list.push(...c.exercises.filter((e) => BOSS_TYPES.has(e.type)));
  }
  return list;
}

export function BossScreen({ unitId }: { unitId: string }) {
  const { state, go } = useApp();
  const unit = getUnit(unitId);
  const pool = useMemo(() => bossQuestions(unitId), [unitId]);
  const [round, setRound] = useState(0);
  const questions = useMemo(() => shuffleExercises(pool, { order: true }).exercises.slice(0, HP + HEARTS + 2), [pool, round]);
  const [phase, setPhase] = useState<'intro' | 'fight' | 'won' | 'lost'>('intro');
  const [i, setI] = useState(0);
  const [hp, setHp] = useState(HP);
  const [hearts, setHearts] = useState(HEARTS);
  const [value, setValue] = useState<ResponseValue>(null);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [left, setLeft] = useState(SECONDS);
  const [hit, setHit] = useState<null | 'boss' | 'me'>(null);
  const [xp, setXp] = useState(0);
  const deadline = useRef(0);
  const { record, error } = useRecordGame();
  const boss = BOSSES[unit?.level ?? 'A1'] ?? BOSSES.A1;
  const ex = questions[i];

  const finish = (won: boolean, finalHp: number) => {
    setPhase(won ? 'won' : 'lost');
    playSound(won ? 'finish' : 'wrong');
    void record('boss', { won, score: HP - finalHp }).then(setXp);
  };

  const resolve = (g: Grade | null) => {
    const correct = !!g?.correct;
    setGrade(g ?? { gradable: true, correct: false, expected: '', given: '' } as Grade);
    setHit(correct ? 'boss' : 'me');
    window.setTimeout(() => setHit(null), 400);
    playSound(correct ? 'correct' : 'wrong');
    if (correct) setHp((h) => h - 1); else setHearts((h) => h - 1);
  };

  useEffect(() => {
    if (phase !== 'fight' || grade) return;
    deadline.current = Date.now() + SECONDS * 1000;
    setLeft(SECONDS);
    const t = window.setInterval(() => {
      const s = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setLeft(s);
      if (s <= 0) { window.clearInterval(t); resolve(null); }
    }, 250);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, i, grade === null]);

  const next = () => {
    if (hp <= 0) return finish(true, hp);
    if (hearts <= 0 || i + 1 >= questions.length) return finish(false, hp);
    setI(i + 1); setValue(null); setGrade(null);
  };

  const start = () => { setRound((r) => r + 1); setI(0); setHp(HP); setHearts(HEARTS); setValue(null); setGrade(null); setXp(0); setPhase('fight'); };

  if (!unit) return <Notice tone="error">Ünite bulunamadı.</Notice>;
  if (!unitUnlocked(state, curriculum, unit.id) || pool.length < HP) {
    return <div className="space-y-4"><Notice tone="info">Bu ünitenin boss savaşı henüz açılmadı.</Notice><button className="btn btn-ghost" onClick={() => go({ name: 'unit', unitId })}>Üniteye dön</button></div>;
  }

  return (
    <div data-screen="boss" className="mx-auto max-w-3xl space-y-4">
      <button className="btn btn-ghost btn-sm" onClick={() => go({ name: 'unit', unitId })}><Icon name="arrowLeft" size={16} /> {unit.id} ünitesine dön</button>
      <section className="card card-glow">
        <div className="flex items-center gap-4">
          <span className={cx('select-none text-6xl leading-none transition-transform', hit === 'boss' && 'animate-shake', phase === 'won' && 'opacity-30 grayscale')} aria-hidden="true">{boss.emoji}</span>
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm"><b className="text-fg">{boss.name}</b><span className="font-mono-num text-bad" data-boss-hp>{Math.max(0, hp)} / {HP}</span></div>
            <div className="mt-1 h-3 overflow-hidden rounded-full bg-panel-3"><div className="h-full rounded-full bg-bad transition-all duration-300" style={{ width: `${(Math.max(0, hp) / HP) * 100}%` }} /></div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className={cx('tracking-widest', hit === 'me' && 'animate-shake')} data-boss-hearts={hearts}>{'❤️'.repeat(Math.max(0, hearts))}{'🖤'.repeat(HEARTS - Math.max(0, hearts))}</span>
              {phase === 'fight' && !grade && <span className={cx('font-mono-num font-black', left <= 5 ? 'text-bad' : 'text-fg-2')}>⏱ {left}</span>}
            </div>
          </div>
        </div>
      </section>

      {phase === 'intro' && (
        <section className="card text-center">
          <p className="text-2xl font-black text-fg">{unit.id} boss savaşı</p>
          <p className="mx-auto mt-2 max-w-md text-fg-2">Ünitenin sorularıyla {boss.name}'ı yen. Her doğru cevap boss'a vurur; yanlış cevap ya da süre bitişi bir kalbine mal olur. 3 kalbin var, soru başına {SECONDS} saniye.</p>
          <button className="btn btn-primary mt-5 px-10" data-action="boss-start" onClick={start}>Savaşa başla</button>
        </section>
      )}

      {phase === 'fight' && ex && (
        <section className="card" data-boss-question={ex.id}>
          <ExerciseView key={ex.id + round} exercise={ex} value={value} onChange={setValue} locked={!!grade} grade={grade} />
          <div className="mt-5 flex justify-end">
            {!grade ? (
              <button className="btn btn-primary px-10" data-action="boss-hit" disabled={!hasAnswer(ex, value)} onClick={() => resolve(gradeExercise(ex, value))}>Saldır ⚔️</button>
            ) : (
              <div className="flex w-full items-center justify-between gap-3">
                <p className={cx('font-bold', grade.correct ? 'text-acc' : 'text-bad')}>{grade.correct ? 'Kritik vuruş! 💥' : `Doğrusu: ${grade.expected || '—'}`}</p>
                <button className="btn btn-primary px-8" data-action="boss-next" autoFocus onClick={next}>Devam</button>
              </div>
            )}
          </div>
        </section>
      )}

      {(phase === 'won' || phase === 'lost') && (
        <section className="card text-center" data-boss-result={phase}>
          <div className="flex justify-center"><Mascot size={110} mood={phase === 'won' ? 'cheer' : 'sad'} /></div>
          <p className="mt-4 text-3xl font-black text-fg">{phase === 'won' ? `${boss.name} yenildi!` : 'Boss kazandı…'}</p>
          <p className="text-fg-2">{phase === 'won' ? 'Bu ünitenin konularına hakimsin.' : 'Dersleri tekrar edip yeniden dene.'}{xp > 0 ? ` +${xp} XP` : ''}</p>
          <div className="mt-5 flex justify-center gap-2">
            <button className="btn btn-ghost" onClick={() => go({ name: 'unit', unitId })}>Üniteye dön</button>
            <button className="btn btn-primary" data-action="boss-again" onClick={start}>Tekrar savaş</button>
          </div>
        </section>
      )}
      {error && <Notice tone="error">{error}</Notice>}
    </div>
  );
}
