// "Bugünkü 15 dakikam": tek düğmeyle sıradaki adıma götüren günlük çalışma akışı.
import { dayKey, dayStats, dueReviews } from '@core/engine.ts';
import { useApp } from '../lib/app.tsx';
import type { Route } from '../lib/app.tsx';
import { nextLessonCode } from '../screens/Dashboard.tsx';
import { cx } from './ui.tsx';

const GAME_KEY = (day: string) => `wc-today-game-${day}`;

export function markTodayGame(): void {
  try { localStorage.setItem(GAME_KEY(dayKey(new Date())), '1'); } catch { /* depolama yoksa önemsiz */ }
}

function gamePlayed(day: string): boolean {
  try { return localStorage.getItem(GAME_KEY(day)) === '1'; } catch { return false; }
}

export function TodayPlan() {
  const { state, go } = useApp();
  const today = dayKey(new Date());
  const log = dayStats(state, today);
  const due = dueReviews(state, today).length;
  const next = nextLessonCode(state);

  const steps: { id: string; emoji: string; label: string; detail: string; done: boolean; route: Route }[] = [
    { id: 'review', emoji: '🔁', label: 'Tekrar', detail: due > 0 ? `${due} kart seni bekliyor` : 'Bugünlük tekrar yok', done: due === 0 || log.reviews > 0, route: { name: 'review' } },
    { id: 'lesson', emoji: '📘', label: 'Yeni ders', detail: next ? `Sıradaki: ${next}` : 'Bütün dersler bitti', done: log.lessons > 0 || !next, route: next ? { name: 'lesson', code: next } : { name: 'map' } },
    { id: 'speak', emoji: '🎙️', label: 'Telaffuz', detail: 'Cümleleri sesli söyle', done: log.audio > 0 || log.practice > 0, route: { name: 'audio' } },
    { id: 'game', emoji: '🎮', label: 'Oyun', detail: 'Kısa bir oyunla bitir', done: gamePlayed(today), route: { name: 'games' } },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const nextStep = steps.find((s) => !s.done);

  const open = (s: (typeof steps)[number]) => {
    if (s.id === 'game') markTodayGame();
    go(s.route);
  };

  return (
    <section className="card card-glow p-5" data-widget="today-plan">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-fg">Bugünkü 15 dakikam</h2>
          <p className="text-sm text-fg-3">{doneCount === steps.length ? 'Bugünün planı tamam, harikasın! 🎉' : `${doneCount}/${steps.length} adım tamam · sıradaki adıma tek tıkla geç`}</p>
        </div>
        {nextStep && (
          <button type="button" className="btn btn-primary" data-action="today-start" onClick={() => open(nextStep)}>
            {doneCount === 0 ? 'Başla' : 'Devam et'} → {nextStep.label}
          </button>
        )}
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s) => (
          <button key={s.id} type="button" data-today-step={s.id} data-done={s.done ? '1' : '0'} onClick={() => open(s)}
            className={cx('flex items-center gap-3 rounded-2xl border p-3 text-left', s.done ? 'border-good/40 bg-good/10' : 'border-line bg-panel-2 hover:border-acc/40')}>
            <span className="text-2xl leading-none">{s.done ? '✅' : s.emoji}</span>
            <span><b className="block text-sm text-fg">{s.label}</b><span className="block text-xs text-fg-3">{s.detail}</span></span>
          </button>
        ))}
      </div>
    </section>
  );
}
