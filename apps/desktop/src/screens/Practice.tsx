// Hata telafisi: daha önce yanlış yapılan alıştırmalar yeniden sorulur (Duolingo'daki "hatalarını çalış" yaklaşımı).
import { useEffect, useState } from 'react';
import type { Exercise, PracticeResult, Responses } from '@core/types.ts';
import { Icon } from '../components/Icon.tsx';
import { Player } from '../components/Player.tsx';
import { Confetti, Mascot, Notice, formatMinutes } from '../components/ui.tsx';
import { errorMessage, useApp } from '../lib/app.tsx';
import { Centered, MistakeList, SkillBreakdown } from './Lesson.tsx';

export function PracticeScreen() {
  const { backend, setState, go } = useApp();
  const [exercises, setExercises] = useState<Exercise[] | null>(null);
  const [phase, setPhase] = useState<'intro' | 'play' | 'summary'>('intro');
  const [result, setResult] = useState<PracticeResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    backend.practiceSet().then(setExercises, (err) => setError(errorMessage(err)));
  }, [backend]);

  const finish = async (responses: Responses, seconds: number) => {
    try {
      const out = await backend.completePractice(exercises!.map((e) => e.id), responses, seconds);
      setState(out.state);
      setResult(out.result);
      setPhase('summary');
    } catch (err) {
      setError(errorMessage(err));
      setPhase('intro');
    }
  };

  if (!exercises) return <Centered><Mascot mood="think" className="animate-float" />{error && <Notice tone="error">{error}</Notice>}</Centered>;

  if (exercises.length === 0) {
    return (
      <Centered>
        <div data-screen="practice-empty" className="flex flex-col items-center">
          <Mascot mood="cheer" size={110} />
          <h1 className="mt-4 text-3xl font-black text-fg">Telafi edilecek hatan yok</h1>
          <p className="mt-2 max-w-md text-fg-2">Derslerde yanlış yaptığın sorular burada toplanır ve sen onları doğru yapana kadar aralıklarla geri gelir.</p>
          <button className="btn btn-primary mt-6" onClick={() => go({ name: 'review' })}>Akıllı tekrara dön</button>
        </div>
      </Centered>
    );
  }

  if (phase === 'play') return <Player exercises={exercises} exam={false} onFinish={finish} onQuit={() => go({ name: 'review' })} />;

  if (phase === 'summary' && result) {
    return (
      <div className="relative h-full overflow-y-auto px-8 py-10" data-screen="practice-summary">
        {result.score >= 80 && <Confetti />}
        <div className="mx-auto max-w-2xl text-center">
          <Mascot mood={result.score >= 60 ? 'cheer' : 'sad'} size={110} className="mx-auto" />
          <h1 className="mt-4 text-4xl font-black text-fg">{result.correct} / {result.total} hata telafi edildi</h1>
          <p className="mt-2 text-fg-2">+{result.xp} XP · {formatMinutes(result.seconds)}. Doğru yaptıkların bir sonraki tekrar aralığına geçti; yanlışlar yarın yeniden gelecek.</p>
        </div>
        <div className="mx-auto max-w-2xl text-left">
          <SkillBreakdown details={result.details} />
          <MistakeList details={result.details} />
          <div className="mt-6 flex justify-center gap-3">
            <button className="btn btn-ghost" onClick={() => go({ name: 'review' })}>Akıllı tekrara dön</button>
            <button className="btn btn-primary" onClick={() => go({ name: 'dashboard' })}>Panoya dön</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Centered>
      <div data-screen="practice-intro" className="flex flex-col items-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-acc/12 text-acc"><Icon name="wrench" size={40} /></span>
        <h1 className="mt-4 text-3xl font-black text-fg">Hata telafisi</h1>
        <p className="mt-2 max-w-lg text-lg text-fg-2">Daha önce yanlış yaptığın {exercises.length} soru seni bekliyor. Her doğru cevap 2 XP kazandırır.</p>
        {error && <div className="mt-4"><Notice tone="error">{error}</Notice></div>}
        <div className="mt-8 flex gap-3">
          <button className="btn btn-ghost" onClick={() => go({ name: 'review' })}>Vazgeç</button>
          <button className="btn btn-primary px-10" data-action="start-practice" onClick={() => setPhase('play')}>Başla</button>
        </div>
      </div>
    </Centered>
  );
}
