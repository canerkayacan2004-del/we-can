// Alıştırma oynatıcı: derslerde, ünite sınavlarında ve hata telafisinde ortak kullanılır.
import { useEffect, useMemo, useRef, useState } from 'react';
import { checkWriting, gradeExercise } from '@core/grading.ts';
import { shuffleExercises } from '@core/shuffle.ts';
import type { Grade } from '@core/grading.ts';
import type { Exercise, Responses, ResponseValue } from '@core/types.ts';
import { playSound } from '../lib/sound.ts';
import { ExerciseView, hasAnswer } from './Exercise.tsx';
import { Icon } from './Icon.tsx';
import { Notice, ProgressBar, cx } from './ui.tsx';

interface PlayerProps {
  exercises: Exercise[];
  /** Sınav modunda anında geri bildirim verilmez. */
  exam: boolean;
  /** Soru sırası da karıştırılsın mı (sınav ve tekrar). Şıklar her zaman karıştırılır. */
  shuffleOrder?: boolean;
  onFinish: (responses: Responses, seconds: number) => void;
  onQuit: () => void;
  error?: string;
}

export function Player({ exercises: source, exam, shuffleOrder, onFinish, onQuit, error }: PlayerProps) {
  // Şıklar (ve istenirse soru sırası) her açılışta yeniden karıştırılır.
  const set = useMemo(() => shuffleExercises(source, { order: shuffleOrder ?? exam }), [source, shuffleOrder, exam]);
  const exercises = set.exercises;
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState<Responses>({});
  const [grade, setGrade] = useState<Grade | null>(null);
  const [combo, setCombo] = useState(0);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const started = useRef(Date.now());

  // Enter tuşu: o anki ana eylemi (Kontrol et / Devam) çalıştırır.
  const primaryAction = useRef<(() => void) | null>(null);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') return;
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === 'BUTTON' || tag === 'TEXTAREA') return;
      if (primaryAction.current) {
        event.preventDefault();
        primaryAction.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const exercise = exercises[index];
  const value = responses[exercise.id];
  const answered = hasAnswer(exercise, value);
  const isLast = index === exercises.length - 1;
  const plain = exercise.type === 'info' || exercise.type === 'flashcard';
  const instant = !exam && !plain;

  const setValue = (v: ResponseValue) => setResponses((prev) => ({ ...prev, [exercise.id]: v }));
  const next = (finalResponses: Responses = responses) => {
    setGrade(null);
    if (isLast) {
      playSound('finish');
      onFinish(set.toOriginal(finalResponses), Math.min(3600, Math.round((Date.now() - started.current) / 1000)));
    } else setIndex(index + 1);
  };
  const check = () => {
    const g = gradeExercise(exercise, value);
    setGrade(g);
    setCombo(g.correct ? combo + 1 : 0);
    playSound(g.correct ? 'correct' : 'wrong');
  };
  const giveUp = () => {
    const cleared = { ...responses, [exercise.id]: null };
    setResponses(cleared);
    if (instant) {
      setGrade(gradeExercise(exercise, null));
      setCombo(0);
      playSound('wrong');
    } else next(cleared);
  };

  primaryAction.current = plain || grade ? () => next() : !answered ? null : instant ? check : () => next();

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center gap-4 px-8 py-5">
        <button className="btn btn-ghost btn-sm" aria-label="Çık" onClick={() => setConfirmQuit(true)}><Icon name="x" size={18} /></button>
        <div className="flex-1"><ProgressBar value={index + (grade || plain ? 1 : 0)} max={exercises.length} /></div>
        {combo >= 3 && !exam && (
          <span className="chip animate-pop bg-gold/15 text-gold" data-combo={combo}><Icon name="flame" size={16} /> {combo} üst üste</span>
        )}
        <span className="text-sm font-bold text-fg-3">{index + 1} / {exercises.length}</span>
      </header>

      {confirmQuit && (
        <div className="mx-8 mb-2">
          <Notice tone="warn">
            <div className="flex items-center justify-between gap-4">
              <span>Çıkarsan bu denemedeki cevapların kaydedilmez. Çıkmak istiyor musun?</span>
              <span className="flex shrink-0 gap-2">
                <button className="btn btn-ghost btn-sm" onClick={() => setConfirmQuit(false)}>Devam et</button>
                <button className="btn btn-danger btn-sm" data-action="quit" onClick={onQuit}>Çık</button>
              </span>
            </div>
          </Notice>
        </div>
      )}

      <main className="min-h-0 flex-1 overflow-y-auto px-8 py-4">
        <div className="mx-auto max-w-2xl" data-exercise={exercise.id} data-type={exercise.type}>
          <ExerciseView key={exercise.id} exercise={exercise} value={value} onChange={setValue} locked={!!grade} grade={grade} />
          {error && <div className="mt-4"><Notice tone="error">{error}</Notice></div>}
        </div>
      </main>

      <footer className={cx('shrink-0 border-t px-8 py-5 transition-colors', grade ? (grade.correct ? 'border-good/40 bg-good/10' : 'border-bad/40 bg-bad/10') : 'border-line bg-panel')}>
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            {grade && <Feedback exercise={exercise} grade={grade} value={value} />}
            {!grade && !plain && (
              <button className="btn btn-ghost btn-sm" data-action="give-up" onClick={giveUp}>{exam ? 'Boş bırak' : 'Bilmiyorum'}</button>
            )}
          </div>
          {plain || grade ? (
            <button key={`continue-${index}-${grade ? 'g' : 'i'}`} className={cx('btn px-10', grade && !grade.correct ? 'btn-danger' : 'btn-success')} data-action="continue" autoFocus onClick={() => next()}>
              {isLast ? 'Bitir' : 'Devam'}
            </button>
          ) : instant ? (
            <button key="check" className="btn btn-primary px-10" data-action="check" disabled={!answered} onClick={check}>Kontrol et</button>
          ) : (
            <button key="exam-next" className="btn btn-primary px-10" data-action="continue" disabled={!answered} onClick={() => next()}>{isLast ? 'Sınavı bitir' : 'Sonraki'}</button>
          )}
        </div>
      </footer>
    </div>
  );
}

function Feedback({ exercise, grade, value }: { exercise: Exercise; grade: Grade; value: ResponseValue }) {
  if (exercise.type === 'write') {
    const check = checkWriting(exercise, typeof value === 'string' ? value : '');
    return (
      <div className="text-sm">
        <p className={cx('text-lg font-black', grade.correct ? 'text-good' : 'text-bad')}>{grade.correct ? 'Temel kontrolden geçti' : 'Eksikler var'}</p>
        {!grade.correct && (
          <ul className="list-inside list-disc text-fg">
            {check.sentenceCount < exercise.minSentences && <li>En az {exercise.minSentences} cümle gerekli (şu an {check.sentenceCount}).</li>}
            {check.missingTr.map((m) => <li key={m}>Eksik: {m}</li>)}
          </ul>
        )}
        <p className="mt-1 text-fg-2">Bu yalnızca temel bir kontroldür. Gramer ve doğallık değerlendirmesi AI öğretmen bağlandığında yapılır.</p>
      </div>
    );
  }
  return (
    <div>
      <p className={cx('flex items-center gap-1.5 text-lg font-black', grade.correct ? 'text-good' : 'text-bad')}>
        <Icon name={grade.correct ? 'check' : 'x'} size={20} /> {grade.correct ? 'Doğru!' : 'Yanlış'}
      </p>
      {!grade.correct && exercise.type !== 'match' && <p className="text-fg">Doğru cevap: <b className="text-good">{grade.expected}</b></p>}
      {exercise.explainTr && <p className="text-sm text-fg-2">{exercise.explainTr}</p>}
    </div>
  );
}
