import { useMemo, useState } from 'react';
import { checkWriting } from '@core/grading.ts';
import type { Grade } from '@core/grading.ts';
import type { Exercise, MatchExercise, OrderExercise, ResponseValue } from '@core/types.ts';
import { canSpeak, speak } from '../lib/tts.ts';
import { Icon } from './Icon.tsx';
import { SpeakButton, cx } from './ui.tsx';

interface Props {
  exercise: Exercise;
  value: ResponseValue;
  onChange: (value: ResponseValue) => void;
  /** Kontrol edildikten sonra cevap değiştirilemez. */
  locked: boolean;
  /** Anında geri bildirim için sonuç; sınav modunda her zaman null. */
  grade: Grade | null;
}

export function hasAnswer(exercise: Exercise, value: ResponseValue): boolean {
  if (exercise.type === 'info' || exercise.type === 'flashcard') return true;
  if (['mcq', 'listen_choice', 'dialogue', 'truefalse'].includes(exercise.type)) return typeof value === 'number';
  if (exercise.type === 'match') return !!value && typeof value === 'object';
  return typeof value === 'string' && value.trim().length > 0;
}

const SKILL_TR: Record<Exercise['skill'], string> = {
  grammar: 'Gramer',
  vocabulary: 'Kelime',
  reading: 'Okuma',
  listening: 'Dinleme',
  writing: 'Yazma',
  speaking: 'Konuşma (yazılı)',
};

export function ExerciseView(props: Props) {
  const { exercise } = props;
  const plain = exercise.type === 'info' || exercise.type === 'flashcard';
  return (
    <div className="animate-pop">
      {!plain && <p className="mb-1 text-sm font-bold uppercase tracking-wide text-acc">{SKILL_TR[exercise.skill]}</p>}
      {exercise.context && (
        <div className="mb-4 whitespace-pre-line rounded-2xl border border-line-2 bg-panel-2 px-4 py-3 text-base leading-relaxed text-fg">
          {exercise.context}
        </div>
      )}
      {!plain && <h2 className="mb-5 text-2xl font-extrabold text-fg">{exercise.prompt}</h2>}
      <Body {...props} />
      {exercise.hintTr && !props.locked && <p className="mt-3 text-sm text-fg-3">İpucu: {exercise.hintTr}</p>}
    </div>
  );
}

function choiceClass(i: number, answer: number, value: ResponseValue, grade: Grade | null): string {
  const selected = value === i;
  if (grade) return i === answer ? 'option-correct' : selected ? 'option-wrong' : 'opacity-60';
  return selected ? 'option-selected' : '';
}

function Choices({ options, answer, value, onChange, locked, grade }: { options: string[]; answer: number } & Omit<Props, 'exercise'>) {
  return (
    <div className="grid gap-3">
      {options.map((option, i) => (
        <button key={i} type="button" data-option={i} data-option-value={option} disabled={locked} className={cx('option', choiceClass(i, answer, value, grade))} onClick={() => onChange(i)}>
          <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-lg border border-line-2 text-sm text-fg-3">{i + 1}</span>
          {option}
        </button>
      ))}
    </div>
  );
}

function Body({ exercise, value, onChange, locked, grade }: Props) {
  switch (exercise.type) {
    case 'info':
      return (
        <div>
          <h2 className="mb-4 text-2xl font-extrabold text-fg">{exercise.title}</h2>
          <div className="space-y-2 text-lg leading-relaxed text-fg-2">
            {exercise.body.map((line, i) => <p key={i}>{line}</p>)}
          </div>
          {exercise.examples && (
            <div className="mt-5 space-y-2">
              {exercise.examples.map((ex, i) => (
                <div key={i} className="flex items-center justify-between gap-3 rounded-2xl border border-line-2 bg-panel-2 px-4 py-3">
                  <div>
                    <p className="text-lg font-bold text-acc-2">{ex.en}</p>
                    <p className="text-sm text-fg-3">{ex.tr}</p>
                  </div>
                  <SpeakButton text={ex.en} />
                </div>
              ))}
            </div>
          )}
        </div>
      );

    case 'flashcard':
      return <FlashcardBody key={exercise.id} exercise={exercise} />;

    case 'mcq':
      return <Choices options={exercise.options} answer={exercise.answer} value={value} onChange={onChange} locked={locked} grade={grade} />;

    case 'listen_choice':
      return (
        <div>
          <ListenControls text={exercise.audioText} />
          <Choices options={exercise.options} answer={exercise.answer} value={value} onChange={onChange} locked={locked} grade={grade} />
          {grade && <p className="mt-3 rounded-2xl bg-panel-2 px-4 py-2 text-sm text-fg-2">Duyduğun: <b className="text-fg">{exercise.audioText}</b></p>}
        </div>
      );

    case 'dialogue':
      return (
        <div>
          <div className="mb-5 space-y-2">
            {exercise.lines.map((line, i) => {
              const blank = line.text === '___';
              const filled = blank && typeof value === 'number' ? exercise.options[value] : null;
              return (
                <div key={i} className={cx('flex', line.me ? 'justify-end' : 'justify-start')}>
                  <div className={cx('max-w-[80%] rounded-2xl px-4 py-2.5', line.me ? 'rounded-br-md bg-acc/15 text-fg' : 'rounded-bl-md bg-panel-3 text-fg')}>
                    <p className="text-xs font-bold text-fg-3">{line.speaker}</p>
                    {blank
                      ? <p className={cx('font-semibold', filled ? 'text-acc-2' : 'tracking-widest text-fg-3')}>{filled ?? '_ _ _ _ _'}</p>
                      : <p className="font-semibold">{line.text}</p>}
                  </div>
                  {!blank && !line.me && canSpeak() && (
                    <button type="button" className="ml-1 self-center rounded-full p-1.5 text-fg-3 hover:text-acc" onClick={() => speak(line.text)} aria-label="Dinle"><Icon name="volume" size={16} /></button>
                  )}
                </div>
              );
            })}
          </div>
          <Choices options={exercise.options} answer={exercise.answer} value={value} onChange={onChange} locked={locked} grade={grade} />
        </div>
      );

    case 'truefalse':
      return (
        <div>
          <p className="mb-5 rounded-2xl border border-line-2 bg-panel-2 px-4 py-4 text-xl font-bold text-fg">“{exercise.statement}”</p>
          <div className="grid grid-cols-2 gap-3">
            {[{ v: 1, label: 'Doğru', icon: 'check' }, { v: 0, label: 'Yanlış', icon: 'x' }].map(({ v, label, icon }) => (
              <button key={v} type="button" data-option={v} disabled={locked} className={cx('option flex items-center justify-center gap-2 py-4 text-lg', choiceClass(v, exercise.answer ? 1 : 0, value, grade))} onClick={() => onChange(v)}>
                <Icon name={icon} size={20} /> {label}
              </button>
            ))}
          </div>
        </div>
      );

    case 'fill': {
      const [before, after] = exercise.text.split('___');
      return (
        <p className="text-2xl font-semibold leading-loose text-fg">
          {before}
          <input
            data-answer
            className={cx(
              'mx-2 inline-block w-44 rounded-xl border-2 border-b-4 bg-panel-2 px-3 py-1 text-center text-2xl font-bold text-fg outline-none',
              grade ? (grade.correct ? 'border-good bg-good/10' : 'border-bad bg-bad/10') : 'border-line-2 focus:border-acc',
            )}
            value={typeof value === 'string' ? value : ''}
            disabled={locked}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            onChange={(e) => onChange(e.target.value)}
          />
          {after}
        </p>
      );
    }

    case 'translate':
      return (
        <div>
          <p className="mb-4 rounded-2xl border border-line-2 bg-panel-2 px-4 py-3 text-xl font-bold text-fg">{exercise.source}</p>
          <TextAnswer value={value} onChange={onChange} locked={locked} grade={grade} placeholder="İngilizcesini yaz" />
        </div>
      );

    case 'listen':
      return (
        <div>
          <ListenControls text={exercise.audioText} />
          <TextAnswer value={value} onChange={onChange} locked={locked} grade={grade} placeholder="Duyduğunu yaz" />
        </div>
      );

    case 'order':
      return <OrderBody key={exercise.id} exercise={exercise} onChange={onChange} locked={locked} grade={grade} />;

    case 'match':
      return <MatchBody key={exercise.id} exercise={exercise} onChange={onChange} />;

    case 'write': {
      const text = typeof value === 'string' ? value : '';
      const check = checkWriting(exercise, text);
      return (
        <div>
          <textarea
            data-answer
            className="field min-h-40 text-lg leading-relaxed"
            value={text}
            disabled={locked}
            spellCheck={false}
            placeholder="İngilizce yaz…"
            onChange={(e) => onChange(e.target.value)}
          />
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <span className={cx('chip', check.sentenceCount >= exercise.minSentences ? 'bg-good/15 text-good' : 'bg-panel-3 text-fg-2')}>
              Cümle: {check.sentenceCount} / {exercise.minSentences}
            </span>
            {(exercise.mustInclude ?? []).map((group) => {
              const missing = check.missingTr.includes(group.labelTr);
              return (
                <span key={group.labelTr} className={cx('chip', missing ? 'bg-panel-3 text-fg-2' : 'bg-good/15 text-good')}>
                  <Icon name={missing ? 'target' : 'check'} size={14} /> {group.labelTr}
                </span>
              );
            })}
          </div>
          <div className="mt-4 rounded-2xl border border-line bg-panel-2 px-4 py-3">
            <p className="mb-1 text-sm font-bold text-fg-2">Göndermeden önce kendin kontrol et</p>
            <ul className="list-inside list-disc text-sm text-fg-2">
              {exercise.checklistTr.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
      );
    }
  }
}

function ListenControls({ text }: { text: string }) {
  const [showText, setShowText] = useState(false);
  const speech = canSpeak();
  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center gap-2">
        {speech && (
          <button type="button" className="btn btn-primary" onClick={() => speak(text)} data-action="play-audio">
            <Icon name="volume" size={20} /> Dinle
          </button>
        )}
        {speech && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => speak(text, 0.65)}>🐢 Yavaş</button>
        )}
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowText(!showText)}>{showText ? 'Metni gizle' : 'Metni göster'}</button>
      </div>
      {!speech && <p className="mt-2 text-sm text-warn">Bu bilgisayarda seslendirme bulunamadı. "Metni göster" ile devam edebilirsin.</p>}
      {showText && <p className="mt-3 rounded-2xl border border-line-2 bg-panel-2 px-4 py-3 text-lg font-bold text-fg">{text}</p>}
      <p className="mt-2 text-xs text-fg-3">Ses, bilgisayarın kendi sesidir; gerçek bir konuşma kaydı değildir.</p>
    </div>
  );
}

function FlashcardBody({ exercise }: { exercise: Extract<Exercise, { type: 'flashcard' }> }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="flex flex-col items-center">
      <p className="mb-3 text-sm font-bold uppercase tracking-wide text-acc">Yeni kelime</p>
      <button
        type="button"
        onClick={() => { setFlipped(!flipped); if (!flipped) speak(exercise.term); }}
        className="card card-glow flex min-h-56 w-full max-w-md cursor-pointer flex-col items-center justify-center gap-2 text-center transition-transform hover:scale-[1.01]"
        data-flashcard={exercise.term}
      >
        <p className="text-4xl font-black text-fg">{exercise.term}</p>
        {exercise.ipa && <p className="text-fg-3">{exercise.ipa}</p>}
        {flipped ? (
          <div className="mt-3 animate-pop">
            <p className="text-2xl font-extrabold text-acc">{exercise.meaningTr}</p>
            <p className="mt-3 text-lg text-fg">{exercise.exampleEn}</p>
            <p className="text-sm text-fg-3">{exercise.exampleTr}</p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-fg-3">Anlamını görmek için karta dokun</p>
        )}
      </button>
      {exercise.mnemonicTr && flipped && (
        <p className="mt-4 max-w-md rounded-2xl bg-gold/10 px-4 py-3 text-sm text-fg"><b className="text-gold">Hafıza ipucu:</b> {exercise.mnemonicTr}</p>
      )}
      <div className="mt-4"><SpeakButton text={exercise.term} /></div>
    </div>
  );
}

function TextAnswer({ value, onChange, locked, grade, placeholder }: { value: ResponseValue; onChange: (v: ResponseValue) => void; locked: boolean; grade: Grade | null; placeholder: string }) {
  return (
    <input
      data-answer
      className={cx('field text-xl font-semibold', grade && (grade.correct ? 'border-good bg-good/10' : 'border-bad bg-bad/10'))}
      value={typeof value === 'string' ? value : ''}
      disabled={locked}
      autoFocus
      spellCheck={false}
      autoComplete="off"
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function OrderBody({ exercise, onChange, locked, grade }: { exercise: OrderExercise; onChange: (v: ResponseValue) => void; locked: boolean; grade: Grade | null }) {
  const [picked, setPicked] = useState<number[]>([]);
  const update = (next: number[]) => {
    setPicked(next);
    onChange(next.length ? next.map((i) => exercise.tiles[i]).join(' ') : null);
  };
  return (
    <div>
      <div
        className={cx(
          'mb-5 flex min-h-16 flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed px-3 py-3',
          grade ? (grade.correct ? 'border-good bg-good/10' : 'border-bad bg-bad/10') : 'border-line-2 bg-panel-2',
        )}
        data-order-answer
      >
        {picked.length === 0 && <span className="text-fg-3">Kelimelere sırayla tıkla</span>}
        {picked.map((tileIndex, pos) => (
          <button key={pos} type="button" disabled={locked} className="tile" onClick={() => update(picked.filter((_, p) => p !== pos))}>
            {exercise.tiles[tileIndex]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {exercise.tiles.map((tile, i) => (
          <button key={i} type="button" data-tile={tile} disabled={locked || picked.includes(i)} className={cx('tile', picked.includes(i) && 'opacity-25')} onClick={() => update([...picked, i])}>
            {tile}
          </button>
        ))}
      </div>
    </div>
  );
}

function MatchBody({ exercise, onChange }: { exercise: MatchExercise; onChange: (v: ResponseValue) => void }) {
  // Sağ sütun sabit bir kuralla karıştırılır (her açılışta aynı düzen).
  const right = useMemo(() => {
    const items = exercise.pairs.map((p) => p[1]);
    const rotated = items.map((_, i) => items[(i * 3 + 1) % items.length]);
    return new Set(rotated).size === items.length ? rotated : [...items].reverse();
  }, [exercise]);
  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);

  const choose = (rightItem: string) => {
    if (!selected) return;
    const pair = exercise.pairs.find((p) => p[0] === selected)!;
    if (pair[1] === rightItem) {
      const next = [...matched, selected];
      setMatched(next);
      setSelected(null);
      if (next.length === exercise.pairs.length) onChange({ mistakes });
    } else {
      setMistakes(mistakes + 1);
      setWrong(rightItem);
      setTimeout(() => setWrong(null), 400);
    }
  };
  const matchedRight = exercise.pairs.filter((p) => matched.includes(p[0])).map((p) => p[1]);

  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-3">
          {exercise.pairs.map(([left]) => (
            <button key={left} type="button" data-left={left} disabled={matched.includes(left)}
              className={cx('option', matched.includes(left) ? 'option-correct opacity-60' : selected === left && 'option-selected')}
              onClick={() => { setSelected(left); if (/^[a-z ]+$/i.test(left)) speak(left); }}>
              {left}
            </button>
          ))}
        </div>
        <div className="grid gap-3">
          {right.map((item) => (
            <button key={item} type="button" data-right={item} disabled={matchedRight.includes(item)}
              className={cx('option', matchedRight.includes(item) ? 'option-correct opacity-60' : wrong === item && 'option-wrong animate-shake')}
              onClick={() => choose(item)}>
              {item}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-3 text-sm text-fg-3">Önce soldan birini, sonra sağdan karşılığını seç. Yanlış deneme: {mistakes}</p>
    </div>
  );
}
