// Seviye sonu deneme sınavı: seviyenin ünitelerinden dengeli seçilen, otomatik puanlanan 25 soru.
// Sonuç backend üzerinden kaydedilir; ünite kilitlerini ve geçme kurallarını değiştirmez.
import { useState } from 'react';
import { LEVEL_EXAM, levelExamUnlocked } from '@core/engine.ts';
import type { Exercise, LevelCode, LevelExamResult, Responses } from '@core/types.ts';
import { Icon } from '../components/Icon.tsx';
import { Player } from '../components/Player.tsx';
import { Confetti, Mascot, Notice, formatMinutes } from '../components/ui.tsx';
import { errorMessage, useApp } from '../lib/app.tsx';
import { curriculum } from '../lib/content.ts';
import { Centered, MistakeList, SkillBreakdown } from './Lesson.tsx';

export function LevelExamScreen({ level }: { level: LevelCode }) {
  const { backend, state, setState, go } = useApp();
  const [exercises, setExercises] = useState<Exercise[] | null>(null);
  const [phase, setPhase] = useState<'intro' | 'play' | 'summary'>('intro');
  const [result, setResult] = useState<LevelExamResult | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const meta = curriculum.levels.find((l) => l.code === level);
  const best = state.levelExams?.[level];

  const start = async () => {
    setBusy(true);
    setError('');
    try {
      const set = await backend.levelExamSet(level);
      if (set.length < LEVEL_EXAM.questions) throw new Error('Bu seviyenin deneme sınavı için yeterli soru henüz hazır değil.');
      setExercises(set);
      setResult(null);
      setPhase('play');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const finish = async (responses: Responses, seconds: number) => {
    try {
      const out = await backend.completeLevelExam(level, exercises!.map((e) => e.id), responses, seconds);
      setState(out.state);
      setResult(out.result);
      setPhase('summary');
    } catch (err) {
      setError(errorMessage(err));
      setPhase('intro');
    }
  };

  if (!meta || !levelExamUnlocked(state, curriculum, level)) {
    return (
      <Centered>
        <Notice tone="warn">Bu seviyenin deneme sınavı henüz kilitli. Önce seviyenin ilk ünitesine ulaşmalısın.</Notice>
        <button className="btn btn-ghost mt-4" onClick={() => go({ name: 'map' })}>Haritaya dön</button>
      </Centered>
    );
  }

  if (phase === 'play' && exercises) return <Player exercises={exercises} exam shuffleOrder onFinish={finish} onQuit={() => setPhase('intro')} />;

  if (phase === 'summary' && result) {
    return (
      <div className="relative h-full overflow-y-auto px-8 py-10" data-screen="level-exam-summary" data-passed={result.passed}>
        {result.passed && <Confetti />}
        <div className="mx-auto max-w-2xl text-center">
          <Mascot mood={result.passed ? 'cheer' : 'sad'} size={110} className="mx-auto" />
          <p className="mt-4 text-sm font-bold uppercase tracking-wide text-fg-3">{level} deneme sınavı</p>
          <h1 className="text-5xl font-black text-fg" data-level-exam-score={result.score}>%{result.score}</h1>
          <p className="mt-2 text-lg font-bold text-fg">{result.passed ? `${level} seviyesine hakimsin!` : `Geçmek için %${LEVEL_EXAM.pass} gerekiyor`}</p>
          <p className="mt-1 text-fg-2">{result.correct} / {result.total} doğru · {formatMinutes(result.seconds)}{result.xp > 0 ? ` · +${result.xp} XP` : ''} · En iyi sonucun: %{result.bestScore}</p>
          {!result.passed && <p className="mt-1 text-fg-2">Yanlış yaptığın sorular akıllı tekrara eklendi. Aşağıda zayıf kaldığın becerileri görebilirsin.</p>}
        </div>
        <div className="mx-auto max-w-2xl text-left">
          <SkillBreakdown details={result.details} />
          <MistakeList details={result.details} />
          <div className="mt-6 flex justify-center gap-3">
            <button className="btn btn-ghost" onClick={() => go({ name: 'map' })}>Haritaya dön</button>
            <button className="btn btn-primary" data-action="level-exam-again" disabled={busy} onClick={() => void start()}>Yeni sorularla tekrar dene</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Centered>
      <div data-screen="level-exam-intro" className="flex flex-col items-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-acc/12 text-acc"><Icon name="trophy" size={40} /></span>
        <h1 className="mt-4 text-3xl font-black text-fg">{level} deneme sınavı</h1>
        <p className="mt-2 max-w-lg text-lg text-fg-2">{meta.name} seviyesinin bütün ünitelerinden {LEVEL_EXAM.questions} soru. Cevapların sınav bitince puanlanır; %{LEVEL_EXAM.pass} ve üzeri geçer.</p>
        <p className="mt-2 max-w-lg text-sm text-fg-3">Bu bir denemedir: ünite kilitlerini açmaz veya kapatmaz, yalnızca seviyedeki genel durumunu gösterir. Her girişte sorular değişir.</p>
        {best && <p className="mt-3 font-bold text-acc">En iyi sonucun: %{best.bestScore} · {best.attempts} deneme{best.passed ? ' · geçildi' : ''}</p>}
        {error && <div className="mt-4"><Notice tone="error">{error}</Notice></div>}
        <div className="mt-8 flex gap-3">
          <button className="btn btn-ghost" onClick={() => go({ name: 'map' })}>Vazgeç</button>
          <button className="btn btn-primary px-10" data-action="start-level-exam" disabled={busy} onClick={() => void start()}>Sınava başla</button>
        </div>
      </div>
    </Centered>
  );
}
