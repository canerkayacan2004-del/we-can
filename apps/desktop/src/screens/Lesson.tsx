import { useState } from 'react';
import type { ReactNode } from 'react';
import { BADGES, QUESTS, RULES, lessonUnlocked } from '@core/engine.ts';
import type { ExerciseResult, LessonContent, LessonResult, Responses, Skill } from '@core/types.ts';
import { TEACHERS } from '@content/teachers.ts';
import { Icon } from '../components/Icon.tsx';
import { Player } from '../components/Player.tsx';
import { Confetti, Mascot, Notice, ProgressBar, cx, formatMinutes } from '../components/ui.tsx';
import { errorMessage, useApp } from '../lib/app.tsx';
import { curriculum, getLessonContent, getLessonMeta, getUnit } from '../lib/content.ts';

const SKILL_TR: Record<Skill, string> = {
  grammar: 'Gramer', vocabulary: 'Kelime', reading: 'Okuma', listening: 'Dinleme (bilgisayar sesi)', writing: 'Yazma (temel kontrol)', speaking: 'Konuşma (metin tabanlı)',
};

export function Centered({ children }: { children: ReactNode }) {
  return <div className="flex h-full flex-col items-center justify-center overflow-y-auto px-8 py-10 text-center">{children}</div>;
}

export function LessonScreen({ code }: { code: string }) {
  const { backend, setState, go } = useApp();
  const content = getLessonContent(code);
  const meta = getLessonMeta(code);
  const unitId = code.split('.').slice(0, 2).join('.');
  const [phase, setPhase] = useState<'intro' | 'play' | 'saving' | 'summary'>('intro');
  const [result, setResult] = useState<LessonResult | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  if (!content || !meta) {
    return (
      <Centered>
        <Mascot mood="think" />
        <h1 className="mt-4 text-2xl font-black text-fg">Bu dersin içeriği henüz hazır değil</h1>
        <p className="mt-2 text-fg-2">Ders müfredatta tanımlı, ancak alıştırmaları henüz üretilmedi.</p>
        <button className="btn btn-primary mt-6" onClick={() => go({ name: 'unit', unitId })}>Üniteye dön</button>
      </Centered>
    );
  }

  const isExam = content.mode === 'exam';
  const teacher = TEACHERS[content.teacher];

  const finish = async (responses: Responses, seconds: number) => {
    setPhase('saving');
    setError('');
    try {
      const out = await backend.completeLesson(code, responses, seconds);
      setState(out.state);
      setResult(out.result);
      setPhase('summary');
    } catch (err) {
      setError(errorMessage(err));
      setPhase('intro');
    }
  };

  if (phase === 'intro') {
    const counts = content.exercises.reduce<Record<string, number>>((acc, e) => { acc[e.type] = (acc[e.type] ?? 0) + 1; return acc; }, {});
    return (
      <Centered>
        <div className={cx('mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-acc/12 text-4xl')}>{teacher.emoji}</div>
        <p className="text-sm font-bold uppercase tracking-wide text-acc">{code} · {meta.title}</p>
        <h1 className="mt-1 max-w-2xl text-3xl font-black text-fg">{meta.goal}</h1>
        <p className="mt-3 max-w-2xl text-lg text-fg-2">{content.introTr}</p>
        <p className="mt-2 text-sm text-fg-3">Öğretmenin: <b className="text-fg">{teacher.name}</b> ({teacher.titleTr}) · {content.exercises.length} kart{counts.flashcard ? ` · ${counts.flashcard} yeni kelime` : ''}</p>

        {content.ai && (
          <div className="mt-5 max-w-2xl text-left">
            <div className="card mb-3">
              <p className="font-bold text-fg">Senaryo: {content.ai.titleTr}</p>
              <p className="mt-1 text-fg-2">{content.ai.situationTr}</p>
              <ul className="mt-2 list-inside list-disc text-sm text-fg-2">{content.ai.goalsTr.map((g) => <li key={g}>{g}</li>)}</ul>
            </div>
            {!backend.status().ai.connected && (
              <Notice tone="warn"><b>Canlı AI öğretmen bağlı değil.</b> Bu derste hazır diyalog pratiği yapacaksın. AI bağlandığında aynı senaryoyu öğretmenle canlı konuşabileceksin.</Notice>
            )}
          </div>
        )}
        {isExam && (
          <div className="mt-5 max-w-2xl text-left">
            <Notice tone="info">Sınavda anında geri bildirim yoktur. Geçme eşiği <b>%{RULES.unitPass}</b>. Konuşma ve dinleme metin üzerinden ölçülür; telaffuz ve akıcılık ölçülmez.</Notice>
          </div>
        )}
        {error && <div className="mt-4 max-w-2xl"><Notice tone="error">{error}</Notice></div>}
        <div className="mt-8 flex gap-3">
          <button className="btn btn-ghost" onClick={() => go({ name: 'unit', unitId })}>Vazgeç</button>
          <button className="btn btn-primary px-10" data-action="start-lesson" onClick={() => { setAttempt(attempt + 1); setPhase('play'); }}>Başla</button>
        </div>
      </Centered>
    );
  }

  if (phase === 'play') {
    return <Player key={attempt} exercises={content.exercises} exam={isExam} onFinish={finish} onQuit={() => go({ name: 'unit', unitId })} />;
  }

  if (phase === 'saving' || !result) {
    return (
      <Centered>
        <Mascot mood="think" className="animate-float" />
        <p className="mt-4 text-lg font-bold text-fg-2">Sonuçların kaydediliyor…</p>
      </Centered>
    );
  }

  return <Summary content={content} result={result} onRetry={() => { setAttempt(attempt + 1); setResult(null); setPhase('play'); }} />;
}

export function SkillBreakdown({ details }: { details: ExerciseResult[] }) {
  const bySkill = new Map<Skill, { correct: number; total: number }>();
  for (const d of details) {
    const s = bySkill.get(d.skill) ?? { correct: 0, total: 0 };
    s.total++;
    if (d.correct) s.correct++;
    bySkill.set(d.skill, s);
  }
  return (
    <div className="card mt-4">
      <p className="mb-2 font-bold text-fg">Beceri bazında sonuç</p>
      <div className="space-y-2">
        {[...bySkill.entries()].map(([skill, s]) => (
          <div key={skill} className="flex items-center gap-3 text-sm">
            <span className="w-56 text-fg-2">{SKILL_TR[skill]}</span>
            <div className="flex-1"><ProgressBar value={s.correct} max={s.total} height="h-2" /></div>
            <span className="w-12 text-right font-bold text-fg">{s.correct}/{s.total}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-fg-3">
        <b>Ölçülmeyenler:</b> sesli konuşma, telaffuz ve akıcılık. Konuşma görevleri yazılı yapıldığı için "metin tabanlı" sayılır.
        Dinleme, bilgisayar sesiyle yapılır. Yazma görevleri yalnızca cümle sayısı ve istenen ifadeler açısından kontrol edilir.
      </p>
    </div>
  );
}

export function MistakeList({ details }: { details: ExerciseResult[] }) {
  const wrong = details.filter((d) => !d.correct);
  if (wrong.length === 0) return null;
  return (
    <div className="card mt-4">
      <p className="mb-2 font-bold text-fg">Hataların ({wrong.length})</p>
      <div className="space-y-3">
        {wrong.map((d) => (
          <div key={d.id} className="rounded-2xl border border-bad/25 bg-bad/8 px-4 py-3 text-sm">
            <p className="font-bold text-fg">{d.prompt}</p>
            {d.given && <p className="text-bad">Senin cevabın: {d.given}</p>}
            <p className="text-good">Doğrusu: <b>{d.expected}</b></p>
            {d.explainTr && <p className="text-fg-2">{d.explainTr}</p>}
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-fg-3">Bu hatalar "Akıllı tekrar → Hata telafisi" bölümüne eklendi.</p>
    </div>
  );
}

function Summary({ content, result, onRetry }: { content: LessonContent; result: LessonResult; onRetry: () => void }) {
  const { state, go } = useApp();
  const unit = getUnit(content.unitId)!;
  const isExam = content.mode === 'exam';
  const lessonNumber = Number(content.code.split('.').pop());
  const nextMeta = unit.lessons.find((l) => l.number === lessonNumber + 1);
  const nextAvailable = nextMeta && getLessonContent(nextMeta.code) && lessonUnlocked(state, curriculum, unit, nextMeta.number);

  let title = result.passed ? (result.score === 100 ? 'Kusursuz!' : 'Ders tamamlandı!') : 'Bu sefer olmadı';
  let detail = result.passed ? '' : `Dersi tamamlamak için en az %${RULES.lessonPass} gerekiyor. Hatalarına bakıp tekrar deneyebilirsin.`;
  if (isExam && result.unit) {
    if (result.unit.status === 'passed') { title = 'Üniteyi geçtin!'; detail = `Ünite sınavı: %${result.score}. Bir sonraki ünitenin kilidi açıldı.`; }
    else if (result.unit.status === 'reinforce') { title = 'Az kaldı'; detail = `Sonuç %${result.score}. Geçmek için %${RULES.unitPass} gerekiyor. Yanlışların hata telafisine eklendi; onları çalışıp sınava yeniden gir.`; }
    else { title = 'Üniteyi tekrar çalışalım'; detail = `Sonuç %${result.score}. Önce 1. ve 3. dersleri yeniden yapmanı, sonra sınava tekrar girmeni öneririm.`; }
  }

  return (
    <div className="relative h-full overflow-y-auto px-8 py-10" data-screen="summary" data-passed={String(result.passed)}>
      {result.passed && <Confetti />}
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <Mascot mood={result.passed ? 'cheer' : 'sad'} size={120} className="mx-auto animate-float" />
          <h1 className="mt-4 text-4xl font-black text-fg">{title}</h1>
          {detail && <p className="mx-auto mt-2 max-w-xl text-fg-2">{detail}</p>}
        </div>

        <div className="mt-8 grid grid-cols-4 gap-3 text-center">
          <div className="card p-4"><p className="text-sm font-bold text-fg-3">Doğruluk</p><p className="text-3xl font-black text-acc" data-result="score">%{result.score}</p><p className="text-xs text-fg-3">{result.correct} / {result.total}</p></div>
          <div className="card p-4"><p className="text-sm font-bold text-fg-3">XP</p><p className="text-3xl font-black text-gold" data-result="xp">+{result.xp + result.questXp}</p><p className="text-xs text-fg-3">{result.questXp > 0 ? `${result.xp} ders + ${result.questXp} görev` : result.firstCompletion || !result.passed ? 'ders' : 'tekrar'}</p></div>
          <div className="card p-4"><p className="text-sm font-bold text-fg-3">Seri</p><p className="text-3xl font-black text-[#ff8a4d]">🔥 {result.streak}</p><p className="text-xs text-fg-3">gün</p></div>
          <div className="card p-4"><p className="text-sm font-bold text-fg-3">Süre</p><p className="text-3xl font-black text-fg" data-result="time">{formatMinutes(result.seconds)}</p><p className="text-xs text-fg-3">çalışma</p></div>
        </div>

        {(result.newBadges.length > 0 || result.questsCompleted.length > 0 || result.vocabAdded > 0) && (
          <div className="card mt-4 space-y-2">
            {result.newBadges.map((code) => {
              const badge = BADGES.find((b) => b.code === code);
              return badge && <p key={code} className="font-bold text-fg">{badge.icon} Yeni rozet: {badge.titleTr} <span className="font-normal text-fg-2">— {badge.descTr}</span></p>;
            })}
            {result.questsCompleted.map((code) => {
              const quest = QUESTS.find((q) => q.code === code);
              return quest && <p key={code} className="font-bold text-fg">🎯 Görev tamamlandı: {quest.titleTr} <span className="font-normal text-fg-2">(+{RULES.xpQuest} XP)</span></p>;
            })}
            {result.vocabAdded > 0 && <p className="font-bold text-fg">📒 {result.vocabAdded} kelime defterine eklendi; yarın ilk tekrarı gelecek.</p>}
          </div>
        )}

        <SkillBreakdown details={result.details} />
        <MistakeList details={result.details} />

        <div className="mt-8 flex justify-center gap-3 pb-6">
          <button className="btn btn-ghost" data-action="back-to-unit" onClick={() => go({ name: 'unit', unitId: unit.id })}>Üniteye dön</button>
          {!result.passed && <button className="btn btn-primary" data-action="retry" onClick={onRetry}>Tekrar dene</button>}
          {result.passed && nextAvailable && nextMeta && (
            <button className="btn btn-success" data-action="next-lesson" onClick={() => go({ name: 'lesson', code: nextMeta.code })}>Sonraki ders <Icon name="arrowRight" size={18} /></button>
          )}
          {isExam && result.unit?.status === 'passed' && <button className="btn btn-success" data-action="to-map" onClick={() => go({ name: 'map' })}>Haritaya dön</button>}
        </div>
      </div>
    </div>
  );
}
