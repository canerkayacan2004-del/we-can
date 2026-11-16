import { QUESTS, RULES, dayKey, dayStats, dueReviews, mistakeExerciseIds } from '@core/engine.ts';
import type { UserState } from '@core/types.ts';
import { Icon } from '../components/Icon.tsx';
import { PageTitle, ProgressBar, cx } from '../components/ui.tsx';
import { useState } from 'react';
import { useApp } from '../lib/app.tsx';
import { WEEKDAY_LONG, weeklyPlan } from '../lib/insights.ts';
import type { Route } from '../lib/app.tsx';
import { nextLessonCode } from './Dashboard.tsx';

export interface PlanTask {
  id: string;
  title: string;
  detail: string;
  minutes: number;
  done: boolean;
  route: Route;
  icon: string;
}

/** Günün çalışma planı, öğrencinin gerçek durumundan üretilir; görevler yapıldıkça kendiliğinden işaretlenir. */
export function buildPlan(state: UserState): PlanTask[] {
  const today = dayKey(new Date());
  const log = dayStats(state, today);
  const due = dueReviews(state, today).length;
  const mistakes = mistakeExerciseIds(state).length;
  const next = nextLessonCode(state);
  const tasks: PlanTask[] = [];
  tasks.push({
    id: 'lesson', icon: 'book', minutes: 15, route: next ? { name: 'lesson', code: next } : { name: 'map' },
    title: next ? `Ders: ${next}` : 'Yeni ders',
    detail: next ? 'Sıradaki dersini tamamla.' : 'Hazır derslerin bitti; haritadan bir ünite seç veya bir dersi tekrarla.',
    done: log.lessons > 0,
  });
  if (due > 0 || log.reviews > 0) {
    tasks.push({ id: 'review', icon: 'repeat', minutes: Math.max(2, Math.ceil(due / 3)), route: { name: 'review' }, title: due > 0 ? `${due} tekrar kartı` : 'Tekrar kartları', detail: 'Aralıklı tekrar: 1, 3, 7, 14, 30 gün.', done: due === 0 && log.reviews > 0 });
  }
  if (mistakes > 0 || log.practice > 0) {
    tasks.push({ id: 'practice', icon: 'wrench', minutes: 5, route: { name: 'practice' }, title: 'Hatalarını telafi et', detail: `${mistakes} hatan seni bekliyor.`, done: log.practice > 0 });
  }
  tasks.push({ id: 'audio', icon: 'headphones', minutes: 5, route: { name: 'audio' }, title: 'Dinleme odası', detail: 'Bir dikte veya ses ayırt etme oturumu.', done: log.audio > 0 });
  tasks.push({ id: 'goal', icon: 'target', minutes: state.profile.dailyMinutes, route: { name: 'analytics' }, title: `Günlük hedef: ${state.profile.dailyMinutes} dakika`, detail: `Bugün ${Math.floor(log.seconds / 60)} dakika çalıştın.`, done: log.seconds >= state.profile.dailyMinutes * 60 });
  return tasks;
}

export function PlannerScreen() {
  const { state, go } = useApp();
  const [tab, setTab] = useState<'today' | 'week'>('today');
  const tasks = buildPlan(state);
  const done = tasks.filter((t) => t.done).length;
  const today = dayKey(new Date());
  return (
    <div data-screen="planner">
      <PageTitle title="Çalışma planı" icon="calendar" subtitle={new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })} />
      <div className="mb-5 flex gap-1 rounded-2xl border border-line bg-panel-2 p-1 sm:w-fit">
        {([['today', 'Bugün'], ['week', 'Bu hafta']] as const).map(([id, label]) => (
          <button key={id} type="button" data-plan-tab={id} onClick={() => setTab(id)}
            className={cx('flex-1 rounded-xl px-5 py-2 text-sm font-bold sm:flex-none', tab === id ? 'bg-acc text-on-acc' : 'text-fg-2 hover:text-fg')}>{label}</button>
        ))}
      </div>
      {tab === 'week' ? <WeekPlan /> : <>
      <div className="card mb-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-bold text-fg">Bugünün ilerlemesi</p>
          <span className="font-bold text-acc">{done} / {tasks.length}</span>
        </div>
        <ProgressBar value={done} max={tasks.length} />
      </div>
      <div className="space-y-3">
        {tasks.map((t) => (
          <button key={t.id} type="button" className={cx('card flex w-full cursor-pointer items-center gap-4 text-left transition-colors hover:border-acc/40', t.done && 'opacity-70')} onClick={() => go(t.route)} data-task={t.id} data-done={String(t.done)}>
            <span className={cx('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl', t.done ? 'bg-acc text-on-acc' : 'bg-panel-3 text-acc')}>
              <Icon name={t.done ? 'check' : t.icon} size={22} strokeWidth={t.done ? 3 : 1.9} />
            </span>
            <span className="min-w-0 flex-1">
              <span className={cx('block font-extrabold', t.done ? 'text-fg-3 line-through' : 'text-fg')}>{t.title}</span>
              <span className="block text-sm text-fg-2">{t.detail}</span>
            </span>
            <span className="chip bg-panel-3 text-fg-2"><Icon name="clock" size={14} /> ~{t.minutes} dk</span>
          </button>
        ))}
      </div>
      <h2 className="section-title mt-8">Günün görevleri (ödüllü)</h2>
      <div className="grid gap-3 md:grid-cols-3">
        {state.quests.date === today && state.quests.items.map((q) => (
          <div key={q.code} className={cx('card', q.done && 'border-acc/40')} data-quest={q.code} data-done={String(q.done)}>
            <p className="font-bold text-fg">{QUESTS.find((d) => d.code === q.code)?.titleTr}</p>
            <div className="mt-2 flex items-center gap-2"><ProgressBar value={q.progress} max={q.target} color="bg-gold" height="h-2" /><span className="text-xs text-fg-3">{q.progress}/{q.target}</span></div>
            <p className="mt-2 text-xs text-gold">+{RULES.xpQuest} XP</p>
          </div>
        ))}
      </div>
      </>}
    </div>
  );
}

function WeekPlan() {
  const { state, go } = useApp();
  const today = dayKey(new Date());
  const week = weeklyPlan(state, today);
  const planned = week.filter((d) => d.planned);
  const met = week.filter((d) => d.planned && d.goalMet).length;
  return (
    <div data-week-plan>
      <div className="card mb-5 flex flex-wrap items-center gap-4">
        <div className="flex-1">
          <p className="font-bold text-fg">Bu haftanın hedefi: {planned.length} gün × {state.profile.dailyMinutes} dk = {planned.length * state.profile.dailyMinutes} dakika</p>
          <p className="text-sm text-fg-2">Plan; sıradaki derslerinden, tekrar kartlarından ve en zayıf becerinden otomatik oluşur. Günleri Profil'den değiştirebilirsin.</p>
        </div>
        <span className="font-mono-num text-2xl font-black text-acc">{met}/{planned.length}</span>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {week.map((d) => (
          <section key={d.day} data-week-day={d.weekday} className={cx('card', d.isToday && 'card-glow', !d.planned && 'opacity-60')}>
            <div className="mb-2 flex items-center justify-between">
              <p className="font-black text-fg">{WEEKDAY_LONG[d.weekday]}{d.isToday && <span className="ml-2 text-xs text-acc">bugün</span>}</p>
              <span className="text-xs text-fg-3">{new Date(`${d.day}T12:00:00`).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
            </div>
            {!d.planned ? <p className="text-sm text-fg-3">Dinlenme günü {d.doneMinutes > 0 && `· yine de ${d.doneMinutes} dk çalıştın 💪`}</p>
              : d.isPast ? (
                <p className={cx('text-sm font-semibold', d.goalMet ? 'text-acc' : 'text-fg-2')}>{d.goalMet ? '✓ Hedef tamam' : '○ Hedef tamamlanmadı'} · {d.doneMinutes} dk</p>
              ) : (
                <ul className="space-y-1.5">
                  {d.tasks.map((t) => (
                    <li key={t.id}>
                      <button type="button" onClick={() => go(t.route)} className="flex w-full items-center gap-2 rounded-lg px-1 py-1 text-left text-sm hover:bg-panel-2">
                        <Icon name={t.icon} size={15} className="shrink-0 text-acc" />
                        <span className="flex-1 truncate text-fg">{t.title}</span>
                        <span className="text-xs text-fg-3">{t.minutes} dk</span>
                      </button>
                    </li>
                  ))}
                  {d.isToday && <li className="pt-1 text-xs text-fg-3">Bugün: {d.doneMinutes} / {state.profile.dailyMinutes} dk</li>}
                </ul>
              )}
          </section>
        ))}
      </div>
    </div>
  );
}
