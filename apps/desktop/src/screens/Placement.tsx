import { useMemo, useState } from 'react';
import { shuffleOptions, shuffled } from '@core/shuffle.ts';
import type { PlacementResult } from '@core/engine.ts';
import { LEVELS } from '@core/types.ts';
import { placementQuestions } from '@content/placement.ts';
import { Mascot, Notice, ProgressBar, cx } from '../components/ui.tsx';
import { errorMessage, useApp } from '../lib/app.tsx';

export function PlacementScreen() {
  const { backend, setState } = useApp();
  const [phase, setPhase] = useState<'intro' | 'test' | 'result'>('intro');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<PlacementResult | null>(null);
  const [pendingState, setPendingState] = useState<Parameters<typeof setState>[0] | null>(null);
  const [error, setError] = useState('');
  // Seviyeler kolaydan zora sıralı kalır; her seviyenin içindeki sorular ve tüm şıklar karıştırılır.
  const questions = useMemo(() => {
    const order: string[] = [];
    for (const q of placementQuestions) if (!order.includes(q.level)) order.push(q.level);
    return order.flatMap((lvl) => shuffled(placementQuestions.filter((q) => q.level === lvl))).map((q) => shuffleOptions(q));
  }, []);

  const submit = async (finalAnswers: Record<string, number> | null) => {
    try {
      const out = await backend.submitPlacement(finalAnswers);
      if (out.result) {
        setResult(out.result);
        setPendingState(out.state);
        setPhase('result');
      } else {
        setState(out.state);
      }
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  if (phase === 'intro') {
    return (
      <div className="flex h-full flex-col items-center justify-center overflow-y-auto px-8 py-10 text-center" data-screen="placement-intro">
        <Mascot size={110} mood="think" className="animate-float" />
        <h1 className="mt-4 text-3xl font-black text-fg">Seviyeni bulalım</h1>
        <p className="mt-2 max-w-xl text-lg text-fg-2">
          {placementQuestions.length} kısa soru. Bildiğin seviyeler atlanır, eksik olan yerden başlarsın. Emin olmadığın soruyu tahmin etme; "Bilmiyorum" de.
        </p>
        <div className="mt-4 max-w-xl text-left">
          <Notice tone="info">
            Bu kısa bir <b>ön tespittir</b>: yalnızca gramer ve kelime bilgisini, yazılı olarak ölçer. Resmî bir seviye belgesi değildir. Atlanan ünitelerin sınavına istediğin zaman girebilirsin.
          </Notice>
        </div>
        {error && <div className="mt-4"><Notice tone="error">{error}</Notice></div>}
        <div className="mt-8 flex gap-3">
          <button className="btn btn-ghost" data-action="placement-skip" onClick={() => submit(null)}>A1'den başla</button>
          <button className="btn btn-primary px-10" data-action="placement-start" onClick={() => setPhase('test')}>Teste başla</button>
        </div>
      </div>
    );
  }

  if (phase === 'result' && result) {
    return (
      <div className="flex h-full flex-col items-center justify-center overflow-y-auto px-8 py-10 text-center" data-screen="placement-result">
        <Mascot size={110} mood="cheer" />
        <p className="mt-4 text-sm font-bold uppercase tracking-wide text-acc">Başlangıç seviyen</p>
        <h1 className="text-6xl font-black text-acc" data-result="level">{result.level}</h1>
        <div className="mt-6 grid w-full max-w-xl grid-cols-4 gap-3">
          {LEVELS.map((level) => (
            <div key={level} className={cx('card py-3', result.mastered.includes(level) && level !== result.level && 'border-good/40 bg-good/10')}>
              <p className="font-black text-fg">{level}</p>
              <p className="text-sm text-fg-2">{result.perLevel[level].correct} / {result.perLevel[level].total}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 max-w-xl text-fg-2">
          {result.mastered.filter((l) => l !== result.level).length > 0
            ? `${result.mastered.filter((l) => l !== result.level).join(' ve ')} üniteleri "atlandı" olarak işaretlendi. İstersen onları da çalışabilir veya ünite sınavlarına girebilirsin.`
            : 'Baştan, sağlam bir temelle başlıyoruz.'}
        </p>
        <button className="btn btn-primary mt-8 px-10" data-action="placement-finish" onClick={() => pendingState && setState(pendingState)}>Haritaya git</button>
      </div>
    );
  }

  const { question, perm } = questions[index];
  const choose = (option: number | null) => {
    const next = option === null ? answers : { ...answers, [question.id]: perm[option] };
    setAnswers(next);
    if (index === questions.length - 1) void submit(next);
    else setIndex(index + 1);
  };

  return (
    <div className="flex h-full flex-col bg-panel" data-screen="placement-test">
      <header className="flex items-center gap-4 px-8 py-5">
        <div className="flex-1"><ProgressBar value={index} max={questions.length} color="bg-acc" /></div>
        <span className="text-sm font-bold text-fg-2">{index + 1} / {questions.length}</span>
      </header>
      <main className="flex-1 overflow-y-auto px-8 py-6">
        <div className="mx-auto max-w-2xl animate-pop" key={question.id} data-question={question.id}>
          <h2 className="mb-6 text-3xl font-extrabold text-fg">{question.prompt}</h2>
          <div className="grid gap-3">
            {question.options.map((option, i) => (
              <button key={i} type="button" data-option={i} data-option-value={option} className="option" onClick={() => choose(i)}>{option}</button>
            ))}
            <button type="button" data-option="skip" className="option border-dashed text-fg-3" onClick={() => choose(null)}>Bilmiyorum</button>
          </div>
          {error && <div className="mt-4"><Notice tone="error">{error}</Notice></div>}
        </div>
      </main>
    </div>
  );
}
