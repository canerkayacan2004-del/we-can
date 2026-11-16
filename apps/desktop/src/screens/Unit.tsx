import { lessonUnlocked, unitUnlocked } from '@core/engine.ts';
import { TEACHERS } from '@content/teachers.ts';
import { Icon } from '../components/Icon.tsx';
import { Notice, PageTitle, cx } from '../components/ui.tsx';
import { useApp } from '../lib/app.tsx';
import { curriculum, getLessonContent, getUnit, unitHasContent } from '../lib/content.ts';

const KIND_TR = { grammar: 'Gramer', speaking: 'Konuşma', vocab: 'Kelime ve beceri', scenario: 'Senaryo ve yazma', exam: 'Ünite sınavı' } as const;
const STATUS_TR = { passed: 'Ünite geçildi', reinforce: 'Pekiştirme gerekli', failed: 'Sınav tekrarlanmalı', skipped: 'Seviye tespitiyle atlandı' } as const;

export function UnitScreen({ unitId }: { unitId: string }) {
  const { state, go } = useApp();
  const unit = getUnit(unitId);
  if (!unit) return <Notice tone="error">Ünite bulunamadı.</Notice>;
  const unlocked = unitUnlocked(state, curriculum, unit.id);
  const hasContent = unitHasContent(unit.id);
  const progress = state.units[unit.id];

  return (
    <div data-screen="unit" data-unit-id={unit.id}>
      <button className="btn btn-ghost btn-sm mb-4" onClick={() => go({ name: 'map' })}><Icon name="arrowLeft" size={16} /> Haritaya dön</button>
      <PageTitle
        title={`${unit.id} · ${unit.title}`}
        subtitle={`Senaryo alanı: ${unit.scenario}`}
        right={progress && <span className={cx('chip', progress.status === 'passed' ? 'bg-good/15 text-good' : progress.status === 'skipped' ? 'bg-info/15 text-info' : 'bg-warn/15 text-warn')}>{STATUS_TR[progress.status]}{progress.examScore !== undefined && ` · %${progress.examScore}`}</span>}
      />

      <div className="card mb-5 grid gap-4 text-sm md:grid-cols-3">
        <div><p className="font-bold text-fg-3">Gramer</p><p className="text-fg">{unit.grammar}</p></div>
        <div><p className="font-bold text-fg-3">Kelime</p><p className="text-fg">{unit.vocab}</p></div>
        <div><p className="font-bold text-fg-3">Ünite görevi</p><p className="text-fg">{unit.unitTask}</p></div>
      </div>

      {!unlocked && <div className="mb-4"><Notice tone="warn">Bu ünite kilitli. Açmak için bir önceki ünitenin sınavını geçmelisin.</Notice></div>}
      {!hasContent && <div className="mb-4"><Notice tone="info"><b>Bu ünitenin alıştırmaları henüz hazırlanmadı.</b> Aşağıda derslerin hedeflerini görebilirsin.</Notice></div>}
      {progress?.status === 'skipped' && <div className="mb-4"><Notice tone="info">Bu ünite seviye tespitiyle atlandı. Emin değilsen doğrudan ünite sınavına girebilir veya dersleri baştan çalışabilirsin.</Notice></div>}

      <div className="space-y-3">
        {unit.lessons.map((lesson) => {
          const content = getLessonContent(lesson.code);
          const done = state.lessons[lesson.code];
          const open = unlocked && lessonUnlocked(state, curriculum, unit, lesson.number);
          const teacher = content ? TEACHERS[content.teacher] : null;
          return (
            <div key={lesson.code} data-lesson={lesson.code} className={cx('card flex items-center gap-4', !open && 'opacity-55', done?.status === 'completed' && 'border-acc/30')}>
              <div className={cx('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl', done?.status === 'completed' ? 'bg-acc text-on-acc' : 'bg-panel-3')}>
                {done?.status === 'completed' ? <Icon name="check" size={26} strokeWidth={3} /> : teacher ? teacher.emoji : lesson.number}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wide text-fg-3">{lesson.code} · {KIND_TR[lesson.kind]}{teacher && ` · ${teacher.name}`}{content && ` · ${content.exercises.length} kart`}</p>
                <p className="font-bold text-fg">{lesson.goal}</p>
                <p className="text-sm text-fg-2">Kazanım: {lesson.outcome}</p>
                {done && <p className="mt-1 text-xs font-bold text-acc">En iyi sonuç: %{done.bestScore} · {done.attempts} deneme</p>}
              </div>
              {content ? (
                <button className={cx('btn shrink-0', done?.status === 'completed' ? 'btn-ghost' : 'btn-primary')} disabled={!open} data-action="open-lesson" onClick={() => go({ name: 'lesson', code: lesson.code })}>
                  {!open ? <><Icon name="lock" size={16} /> Kilitli</> : done?.status === 'completed' ? 'Tekrarla' : done ? 'Yeniden dene' : 'Başla'}
                </button>
              ) : <span className="chip shrink-0 bg-panel-3 text-fg-3">Hazırlanıyor</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
