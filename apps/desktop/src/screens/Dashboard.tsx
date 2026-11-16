import { useState } from 'react';
import {
  BADGES, STREAK_MILESTONES, currentLevel, dayKey, dayStats, dueReviews, effectiveStreak, lastDays, lessonUnlocked,
  mistakeExerciseIds, skillAccuracy,
} from '@core/engine.ts';
import { DASHBOARD_WIDGETS, LEVELS } from '@core/types.ts';
import type { UserState } from '@core/types.ts';
import { Bars, Ring, Sparkline } from '../components/charts.tsx';
import { Icon } from '../components/Icon.tsx';
import { Mascot, ProgressBar, Toggle, cx } from '../components/ui.tsx';
import { errorMessage, useApp } from '../lib/app.tsx';
import { curriculum, getLessonContent, getLessonMeta, getUnit, getVocabItem } from '../lib/content.ts';
import { speak } from '../lib/tts.ts';
import { buildPlan } from './Planner.tsx';

const DAY_TR = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

export const WIDGET_TR: Record<string, string> = {
  skills: 'Becerilerin', weekly: 'Haftalık ilerleme', continue: 'Son ders', words: 'Bugünün kelimeleri', ai: 'AI öğretmen',
  rewards: 'Seri ödülleri', planner: 'Günlük plan', revision: 'Akıllı tekrar', analytics: 'Gelişim özeti',
  notebook: 'Not defterim', audio: 'Dinleme odası', achievements: 'Başarılar',
};

/** Öğrencinin sıradaki dersi: içeriği hazır, kilidi açık ve henüz tamamlanmamış ilk ders. */
export function nextLessonCode(state: UserState): string | null {
  for (const level of curriculum.levels) {
    for (const unit of level.units) {
      const status = state.units[unit.id]?.status;
      if (status === 'passed' || status === 'skipped') continue;
      for (const lesson of unit.lessons) {
        if (state.lessons[lesson.code]?.status === 'completed' && lesson.kind !== 'exam') continue;
        if (getLessonContent(lesson.code) && lessonUnlocked(state, curriculum, unit, lesson.number)) return lesson.code;
      }
    }
  }
  return null;
}

export function DashboardScreen() {
  const { state, go, backend, setState } = useApp();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const today = dayKey(new Date());
  const level = currentLevel(state, curriculum);
  const nextLevel = LEVELS[LEVELS.indexOf(level) + 1];
  const streak = effectiveStreak(state, today);
  const todayLog = dayStats(state, today);
  const goalSec = state.profile.dailyMinutes * 60;
  const next = nextLessonCode(state);
  const widgets = state.profile.appearance.dashboard;
  const on = (w: string) => widgets.includes(w);

  const toggleWidget = async (w: string) => {
    const dashboard = on(w) ? widgets.filter((x) => x !== w) : [...widgets, w];
    try {
      setState(await backend.saveAppearance({ ...state.profile.appearance, dashboard }));
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <div data-screen="dashboard" className="space-y-5">
      {/* Karşılama */}
      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <section className="card card-glow relative overflow-hidden p-7" data-widget="hero">
          <Skyline />
          <div className="relative md:max-w-[62%]">
            <h1 className="text-3xl font-black text-fg">Tekrar hoş geldin, <span className="text-acc">{state.profile.displayName}</span>! 👋</h1>
            <p className="mt-1 text-lg text-fg-2">Bugün de bir adım ileri gidelim.</p>
            <div className="mt-6 flex flex-wrap items-center gap-6">
              <div className="flex min-w-64 items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-acc/15 text-acc"><Icon name="target" size={28} /></span>
                <div className="flex-1">
                  <p className="text-sm text-fg-2">Günlük hedef</p>
                  <p className="font-bold text-fg" data-stat="daily-goal">{Math.floor(todayLog.seconds / 60)} dk / {state.profile.dailyMinutes} dk</p>
                  <div className="mt-1.5"><ProgressBar value={todayLog.seconds} max={goalSec} height="h-2" /></div>
                </div>
              </div>
              <div className="h-12 w-px bg-line-2" />
              <div className="flex items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/15 text-gold"><Icon name="star" size={28} /></span>
                <div>
                  <p className="text-sm text-fg-2">Seviyen</p>
                  <p className="text-2xl font-black text-fg" data-stat="level">{level}</p>
                  {nextLevel && <p className="text-xs text-acc">Sıradaki: {nextLevel}</p>}
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {next
                ? <button className="btn btn-primary" data-action="continue-learning" onClick={() => go({ name: 'lesson', code: next })}>Derse devam et <Icon name="arrowRight" size={18} /></button>
                : <button className="btn btn-primary" onClick={() => go({ name: 'map' })}>Öğrenme haritası <Icon name="arrowRight" size={18} /></button>}
              <button className="btn btn-ghost" onClick={() => setEditing(!editing)} data-action="customize-dashboard"><Icon name="layout" size={18} /> Panoyu düzenle</button>
            </div>
          </div>
        </section>

        <section className="card flex flex-col p-6" data-widget="streak">
          <p className="flex items-center gap-2 text-lg font-bold text-fg">Serin <Icon name="flame" size={18} className="text-[#ff7a3d]" /></p>
          <div className="mt-2 flex items-end justify-between">
            <div>
              <p className="text-5xl font-black text-fg">{streak}</p>
              <p className="text-fg-2">gün</p>
            </div>
            <span className="text-6xl" aria-hidden="true">🔥</span>
          </div>
          <div className="mt-auto pt-4">
            <Sparkline values={lastDays(today, 7).map((d) => dayStats(state, d).xp)} width={240} height={46} />
            <p className="mt-1 text-xs text-fg-3">Son 7 günün XP'si · En uzun seri: {state.stats.longestStreak}</p>
          </div>
        </section>
      </div>

      {editing && (
        <section className="card animate-pop" data-panel="customize">
          <p className="section-title"><Icon name="layout" size={20} className="text-acc" /> Panoda neler görünsün?</p>
          <p className="mb-4 text-sm text-fg-2">Hepsini ana ekrana koymak zorunda değilsin. Kapattıkların menüden her zaman açılabilir.</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {DASHBOARD_WIDGETS.map((w) => (
              <label key={w} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-panel-2 px-3 py-2.5" data-widget-toggle={w}>
                <span className="font-semibold text-fg">{WIDGET_TR[w]}</span>
                <Toggle checked={on(w)} onChange={() => toggleWidget(w)} label={WIDGET_TR[w]} />
              </label>
            ))}
          </div>
          {error && <p className="mt-2 text-sm text-bad">{error}</p>}
        </section>
      )}

      <div className="grid gap-5 lg:grid-cols-12">
        {on('skills') && <SkillsCard />}
        {on('weekly') && <WeeklyCard />}
        {on('continue') && <ContinueCard next={next} />}
        {on('planner') && <PlannerCard />}
        {on('words') && <WordsCard />}
        {on('ai') && <AiCard />}
        {on('revision') && <ModuleCard id="revision" icon="repeat" title="Akıllı tekrar" text={`${dueReviews(state, today).length} kart ve ${mistakeExerciseIds(state).length} hata seni bekliyor.`} route={{ name: 'review' }} />}
        {on('analytics') && <ModuleCard id="analytics" icon="chart" title="Gelişim" text={`Toplam ${state.stats.totalXp} XP · ${Object.values(state.lessons).filter((l) => l.status === 'completed').length} ders tamamlandı.`} route={{ name: 'analytics' }} />}
        {on('notebook') && <ModuleCard id="notebook" icon="notebook" title="Not defterim" text={state.notes.length ? `${state.notes.length} not · son: ${state.notes[0].title || 'Başlıksız'}` : 'Öğrendiklerini kendi cümlelerinle not al.'} route={{ name: 'notebook' }} />}
        {on('audio') && <ModuleCard id="audio" icon="headphones" title="Dinleme odası" text="Dikte, ses ayırt etme ve gölge konuşma pratiği." route={{ name: 'audio' }} />}
        {on('achievements') && <ModuleCard id="achievements" icon="trophy" title="Başarılar" text={`${Object.keys(state.badges).length} / ${BADGES.length} rozet kazanıldı.`} route={{ name: 'achievements' }} />}
      </div>

      {on('rewards') && <RewardsCard streak={streak} />}
    </div>
  );
}

function Skyline() {
  // Özgün, basit bir şehir silueti (dekoratif).
  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[40%] md:block" aria-hidden="true">
      <svg viewBox="0 0 400 220" className="absolute bottom-0 right-0 h-full w-full" preserveAspectRatio="xMaxYMax meet">
        <defs>
          <linearGradient id="sky-fade" x1="0" x2="1">
            <stop offset="0" stopColor="var(--wc-panel)" stopOpacity="1" />
            <stop offset="0.45" stopColor="var(--wc-panel)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g fill="var(--wc-acc)" opacity="0.12">
          <rect x="60" y="150" width="40" height="70" /><rect x="105" y="130" width="30" height="90" />
          <rect x="140" y="160" width="50" height="60" /><rect x="265" y="140" width="45" height="80" />
          <rect x="315" y="120" width="35" height="100" /><rect x="355" y="155" width="45" height="65" />
          <path d="M200 220V70l15-25 15 25v150z" /><rect x="203" y="80" width="24" height="24" rx="12" opacity="0.6" />
          <path d="M215 20v25" stroke="var(--wc-acc)" strokeWidth="2" />
        </g>
        <circle cx="215" cy="92" r="9" fill="none" stroke="var(--wc-acc)" strokeOpacity="0.5" strokeWidth="2" />
        <rect width="400" height="220" fill="url(#sky-fade)" />
      </svg>
      <p className="absolute bottom-6 right-6 rotate-[-6deg] text-right font-script text-xl leading-snug text-acc/90">
        Better English,<br />a brighter you.
      </p>
    </div>
  );
}

function SkillsCard() {
  const { state } = useApp();
  const acc = skillAccuracy(state);
  return (
    <section className="card lg:col-span-7" data-widget="skills">
      <p className="section-title">Becerilerin</p>
      <div className="flex flex-wrap justify-around gap-4">
        <Ring value={acc.listening} label="Dinleme" icon="headphones" />
        <Ring value={acc.reading} label="Okuma" icon="book" />
        <Ring value={acc.speaking} label="Konuşma*" icon="mic" />
        <Ring value={acc.writing} label="Yazma" icon="pencil" />
      </div>
      <p className="mt-3 text-xs text-fg-3">Yüzdeler alıştırmalardaki doğruluk oranındır. *Konuşma yazılı pratikle ölçülür; telaffuz ve akıcılık ölçülmez.</p>
    </section>
  );
}

function WeeklyCard() {
  const { state } = useApp();
  const today = dayKey(new Date());
  const days = lastDays(today, 7);
  const data = days.map((d) => {
    const [y, m, dd] = d.split('-').map(Number);
    return { label: DAY_TR[new Date(y, m - 1, dd).getDay()], value: dayStats(state, d).xp, highlight: d === today };
  });
  const total = data.reduce((n, d) => n + d.value, 0);
  return (
    <section className="card lg:col-span-5" data-widget="weekly">
      <div className="flex items-center justify-between">
        <p className="section-title">Haftalık ilerleme</p>
        <span className="chip bg-acc/12 text-acc">{total} XP</span>
      </div>
      <Bars data={data} unit=" XP" />
    </section>
  );
}

function ContinueCard({ next }: { next: string | null }) {
  const { state, go } = useApp();
  const code = next ?? state.lastLesson;
  const meta = code ? getLessonMeta(code) : undefined;
  const unit = code ? getUnit(code.split('.').slice(0, 2).join('.')) : undefined;
  return (
    <section className="card lg:col-span-4" data-widget="continue">
      <p className="section-title">{next ? 'Sıradaki ders' : 'Son ders'}</p>
      {meta && unit ? (
        <div>
          <div className="mb-3 flex h-24 items-center justify-center rounded-2xl bg-linear-to-br from-acc/25 to-panel-3 text-4xl">
            {unit.scenario === 'Seyahat' ? '✈️' : unit.scenario === 'Emlak' ? '🏠' : unit.scenario === 'İş' ? '💼' : '☕'}
          </div>
          <p className="text-xs font-bold uppercase text-fg-3">Ünite {unit.number} · Ders {meta.number}</p>
          <p className="font-extrabold text-fg">{unit.title}</p>
          <p className="line-clamp-2 text-sm text-fg-2">{meta.goal}</p>
          {next && <button className="btn btn-primary mt-4 w-full" onClick={() => go({ name: 'lesson', code: next })}>Devam et <Icon name="arrowRight" size={18} /></button>}
        </div>
      ) : <p className="text-fg-2">Henüz bir ders yapmadın.</p>}
    </section>
  );
}

function PlannerCard() {
  const { state, go } = useApp();
  const tasks = buildPlan(state);
  const done = tasks.filter((t) => t.done).length;
  return (
    <section className="card lg:col-span-4" data-widget="planner">
      <div className="flex items-center justify-between">
        <p className="section-title"><Icon name="calendar" size={20} className="text-acc" /> Bugünün planı</p>
        <span className="text-sm font-bold text-fg-3">{done}/{tasks.length}</span>
      </div>
      <ul className="space-y-2">
        {tasks.slice(0, 4).map((t) => (
          <li key={t.id}>
            <button type="button" className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 text-left hover:bg-panel-2" onClick={() => go(t.route)}>
              <span className={cx('flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2', t.done ? 'border-acc bg-acc text-on-acc' : 'border-line-2')}>{t.done && <Icon name="check" size={14} strokeWidth={3} />}</span>
              <span className={cx('text-sm', t.done ? 'text-fg-3 line-through' : 'text-fg')}>{t.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function WordsCard() {
  const { state, go } = useApp();
  const today = dayKey(new Date());
  const dueWords = dueReviews(state, today).filter((r) => r.kind === 'vocab').map((r) => getVocabItem(r.id.slice(2))).filter(Boolean);
  const recent = Object.entries(state.vocab).sort((a, b) => b[1].addedAt.localeCompare(a[1].addedAt)).map(([id]) => getVocabItem(id)).filter(Boolean);
  const words = (dueWords.length ? dueWords : recent).slice(0, 5);
  return (
    <section className="card lg:col-span-4" data-widget="words">
      <div className="flex items-center justify-between">
        <p className="section-title">Bugünün kelimeleri</p>
        <button className="btn btn-ghost btn-sm" onClick={() => go({ name: 'vocab' })}>Tümü <Icon name="arrowRight" size={14} /></button>
      </div>
      {words.length === 0 ? <p className="text-sm text-fg-2">Kelime dersini tamamladığında kelimelerin burada görünür.</p> : (
        <ul className="space-y-1.5">
          {words.map((w) => w && (
            <li key={w.id} className="flex items-center gap-2">
              <button type="button" className="cursor-pointer text-acc" onClick={() => speak(w.term)} aria-label={`${w.term} dinle`}><Icon name="volume" size={16} /></button>
              <span className="font-semibold text-fg">{w.term}</span>
              <span className="text-sm text-fg-3">({w.meaningTr})</span>
            </li>
          ))}
        </ul>
      )}
      {dueWords.length > 0 && <p className="mt-2 text-xs text-warn">{dueWords.length} kelimenin tekrar günü geldi.</p>}
    </section>
  );
}

function AiCard() {
  const { backend, go } = useApp();
  const connected = backend.status().ai.connected;
  return (
    <section className="card relative overflow-hidden lg:col-span-4" data-widget="ai">
      <div className="flex items-center justify-between">
        <p className="section-title">AI öğretmen</p>
        <span className={cx('chip text-xs', connected ? 'bg-good/15 text-good' : 'bg-warn/15 text-warn')}>● {connected ? 'Çevrim içi' : 'Bağlı değil'}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-acc/12 text-acc"><Icon name="bot" size={44} strokeWidth={1.5} /></span>
        <p className="rounded-2xl rounded-bl-md bg-panel-3 px-4 py-2 text-sm text-fg">{connected ? 'Sohbete hazır mısın?' : 'Bağlanana kadar hazır diyaloglarla pratik yapabilirsin.'}</p>
      </div>
      <button className="btn btn-primary mt-4 w-full" onClick={() => go({ name: 'ai' })}>{connected ? 'Sohbet et' : 'Konuşma pratiği'} <Icon name="arrowRight" size={18} /></button>
    </section>
  );
}

function ModuleCard({ id, icon, title, text, route }: { id: string; icon: string; title: string; text: string; route: Parameters<ReturnType<typeof useApp>['go']>[0] }) {
  const { go } = useApp();
  return (
    <button type="button" className="card flex cursor-pointer items-start gap-4 text-left transition-colors hover:border-acc/40 lg:col-span-4" data-widget={id} onClick={() => go(route)}>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-acc/12 text-acc"><Icon name={icon} size={24} /></span>
      <span>
        <span className="block text-lg font-extrabold text-fg">{title}</span>
        <span className="block text-sm text-fg-2">{text}</span>
      </span>
    </button>
  );
}

function RewardsCard({ streak }: { streak: number }) {
  const next = STREAK_MILESTONES.find((m) => m > streak) ?? STREAK_MILESTONES[STREAK_MILESTONES.length - 1];
  const max = STREAK_MILESTONES[STREAK_MILESTONES.length - 1];
  return (
    <section className="card flex flex-wrap items-center gap-6" data-widget="rewards">
      <div className="flex items-center gap-4">
        <span className="text-5xl" aria-hidden="true">🏆</span>
        <div>
          <p className="text-lg font-extrabold text-fg">{streak > 0 ? `${streak} günlük serin var!` : 'Serini başlat!'}</p>
          <p className="text-sm text-fg-2">Sıradaki hedef: {next} gün. Her gün en az bir ders veya tekrar yap.</p>
        </div>
      </div>
      <div className="relative min-w-72 flex-1">
        <ProgressBar value={streak} max={max} height="h-2" />
        <div className="mt-2 flex justify-between text-xs text-fg-3">
          {STREAK_MILESTONES.map((m) => (
            <span key={m} className={cx('flex items-center gap-1', streak >= m && 'font-bold text-acc')}><Icon name="gift" size={14} /> {m} gün</span>
          ))}
        </div>
      </div>
      <Mascot size={64} mood={streak > 0 ? 'cheer' : 'happy'} />
    </section>
  );
}
