import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { backgroundSocialSync } from '../lib/social.ts';
import { currentLevel, dayKey, dueReviews, effectiveStreak, mistakeExerciseIds } from '@core/engine.ts';
import { useApp } from '../lib/app.tsx';
import type { Route } from '../lib/app.tsx';
import { curriculum } from '../lib/content.ts';
import { UserAvatar } from './Avatar.tsx';
import { GoalCelebration } from './GoalCelebration.tsx';
import { Icon } from './Icon.tsx';
import { Logo, Mascot, cx } from './ui.tsx';

const NAV: { route: Route; label: string; icon: string; group?: string }[] = [
  { route: { name: 'dashboard' }, label: 'Pano', icon: 'home' },
  { route: { name: 'map' }, label: 'Öğrenme haritası', icon: 'map' },
  { route: { name: 'review' }, label: 'Akıllı tekrar', icon: 'repeat' },
  { route: { name: 'daily' }, label: 'Günün kelimeleri', icon: 'sparkles' },
  { route: { name: 'games' }, label: 'Kelime oyunları', icon: 'target' },
  { route: { name: 'vocab' }, label: 'Kelime defteri', icon: 'book' },
  { route: { name: 'audio' }, label: 'Dinleme odası', icon: 'headphones' },
  { route: { name: 'ai' }, label: 'AI öğretmen', icon: 'bot' },
  { route: { name: 'friends' }, label: 'Arkadaşlar', icon: 'user' },
  { route: { name: 'analytics' }, label: 'Gelişim', icon: 'chart', group: 'Araçlar' },
  { route: { name: 'report' }, label: 'Haftalık rapor', icon: 'wrench' },
  { route: { name: 'planner' }, label: 'Çalışma planı', icon: 'calendar' },
  { route: { name: 'notebook' }, label: 'Not defterim', icon: 'notebook' },
  { route: { name: 'achievements' }, label: 'Başarılar', icon: 'trophy' },
  { route: { name: 'settings' }, label: 'Ayarlar', icon: 'settings' },
];

export function Shell({ children }: { children: ReactNode }) {
  const { state, route, go, backend, session } = useApp();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => backgroundSocialSync(session.userId, state), [state.stats.totalXp, state.profile.avatar, state.profile.displayName]);
  const today = dayKey(new Date());
  const due = dueReviews(state, today).length + mistakeExerciseIds(state).length;
  const streak = effectiveStreak(state, today);
  const status = backend.status();
  const active = route.name === 'unit' ? 'map' : route.name === 'practice' ? 'review' : route.name === 'status' ? 'settings' : route.name;

  return (
    <div className="flex h-full">
      <GoalCelebration />
      <aside className="flex w-64 shrink-0 flex-col border-r border-line bg-panel/80 px-4 py-5 backdrop-blur max-[1100px]:w-[76px] max-[1100px]:px-2" data-sidebar>
        <button type="button" className="mb-4 flex cursor-pointer items-center gap-2 px-2" onClick={() => go({ name: 'dashboard' })}>
          <Mascot size={42} />
          <div className="text-left max-[1100px]:hidden">
            <Logo />
            <p className="text-xs text-fg-3">Learn. Practice. Speak.</p>
          </div>
        </button>
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
          {NAV.map((item) => (
            <div key={item.route.name}>
              {item.group && <p className="mb-1 mt-3 px-3 text-xs font-bold uppercase tracking-wider text-fg-3 max-[1100px]:hidden">{item.group}</p>}{item.group && <div className="my-2 hidden border-t border-line max-[1100px]:block" />}
              <button
                type="button"
                data-nav={item.route.name}
                title={item.label}
                onClick={() => go(item.route)}
                className={cx(
                  'relative flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3 py-1.5 text-left text-[0.95rem] font-semibold transition-colors max-[1100px]:justify-center max-[1100px]:px-0 max-[1100px]:py-2.5',
                  active === item.route.name ? 'border-acc/40 bg-acc/12 text-acc card-glow' : 'border-transparent text-fg-2 hover:bg-panel-2 hover:text-fg',
                )}
              >
                <Icon name={item.icon} size={19} />
                <span className="flex-1 max-[1100px]:hidden">{item.label}</span>
                {item.route.name === 'review' && due > 0 && (
                  <span className="rounded-full bg-bad px-2 py-0.5 text-xs font-black text-white max-[1100px]:absolute max-[1100px]:-right-1 max-[1100px]:-top-1 max-[1100px]:px-1.5" data-badge-count>{due}</span>
                )}
              </button>
            </div>
          ))}
        </nav>

        {status.mode === 'local' && (
          <button type="button" onClick={() => go({ name: 'status' })} className="mt-3 flex cursor-pointer items-center gap-2 rounded-xl border border-warn/30 bg-warn/10 px-3 py-1.5 text-left text-xs text-fg-2 max-[1100px]:justify-center" title="Veriler bu bilgisayarda. AI öğretmen bağlı değil.">
            <Icon name="plug" size={15} className="shrink-0 text-warn" />
            <span className="max-[1100px]:hidden"><b className="text-fg">Yerel mod</b> · ayrıntılar</span>
          </button>
        )}

        <button type="button" onClick={() => go({ name: 'profile' })} className="mt-2 flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-panel-2 p-2.5 text-left hover:bg-panel-3 max-[1100px]:justify-center" data-nav="profile" title="Profil">
          <UserAvatar name={state.profile.displayName} src={state.profile.avatar} size={40} />
          <span className="min-w-0 max-[1100px]:hidden">
            <span className="block truncate font-bold text-fg">{state.profile.displayName}</span>
            <span className="block text-xs text-acc">{currentLevel(state, curriculum)} · {streak > 0 ? `🔥 ${streak} gün` : state.profile.plan === 'premium' ? 'Premium' : 'Ücretsiz plan'}</span>
          </span>
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-end gap-3 border-b border-line bg-panel/60 px-8 py-3 backdrop-blur max-[1100px]:px-4">
          <span className="chip bg-acc/12 text-acc" title="Şu anki seviye"><Icon name="target" size={16} /> {currentLevel(state, curriculum)}</span>
          <span className="chip bg-[#ff7a3d]/15 text-[#ff9a62]" title="Günlük seri" data-stat="streak"><Icon name="flame" size={16} /> {streak}</span>
          <span className="chip bg-gold/12 text-gold" title="Toplam XP" data-stat="xp"><Icon name="bolt" size={16} /> {state.stats.totalXp} XP</span>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto px-8 py-7 max-[1100px]:px-4 max-[1100px]:py-5">
          <div className="mx-auto max-w-6xl animate-rise" key={route.name}>{children}</div>
        </main>
      </div>
    </div>
  );
}
