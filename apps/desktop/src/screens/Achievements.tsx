import { BADGES, QUESTS, RULES, STREAK_MILESTONES, dayKey, effectiveStreak } from '@core/engine.ts';
import { Icon } from '../components/Icon.tsx';
import { PageTitle, ProgressBar, StatTile, cx } from '../components/ui.tsx';
import { useApp } from '../lib/app.tsx';

const REASON_TR: Record<string, string> = { lesson: 'Ders', exam: 'Ünite sınavı', review: 'Tekrar', quest: 'Görev ödülü', practice: 'Hata telafisi', audio: 'Dinleme odası' };

export function AchievementsScreen() {
  const { state } = useApp();
  const today = dayKey(new Date());
  const streak = effectiveStreak(state, today);
  const recent = [...state.xpEvents].reverse().slice(0, 10);
  const earned = Object.keys(state.badges).length;

  return (
    <div data-screen="achievements" className="space-y-6">
      <PageTitle title="Başarılar" icon="trophy" subtitle={`${earned} / ${BADGES.length} rozet kazanıldı`} />
      <div className="grid gap-4 md:grid-cols-4">
        <StatTile label="Toplam XP" value={state.stats.totalXp} icon="bolt" tone="text-gold" />
        <StatTile label="Günlük seri" value={streak} icon="flame" tone="text-[#ff8a4d]" />
        <StatTile label="En uzun seri" value={state.stats.longestStreak} icon="star" />
        <StatTile label="Rozet" value={`${earned}/${BADGES.length}`} icon="trophy" tone="text-gold" />
      </div>

      <section>
        <p className="section-title">Bugünün görevleri</p>
        <div className="grid gap-3 md:grid-cols-3">
          {state.quests.items.map((q) => (
            <div key={q.code} className={cx('card flex items-center gap-4', q.done && 'border-acc/40')} data-quest={q.code} data-done={String(q.done)}>
              <span className={cx('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl', q.done ? 'bg-acc text-on-acc' : 'bg-panel-3 text-acc')}><Icon name={q.done ? 'check' : 'target'} size={22} /></span>
              <div className="flex-1">
                <p className="font-bold text-fg">{QUESTS.find((d) => d.code === q.code)?.titleTr ?? q.code}</p>
                <div className="mt-2 flex items-center gap-2"><ProgressBar value={q.progress} max={q.target} color="bg-gold" height="h-2" /><span className="text-xs font-bold text-fg-3">{q.progress}/{q.target}</span></div>
              </div>
              <span className="chip bg-gold/12 text-xs text-gold">+{RULES.xpQuest}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <p className="section-title">Seri hedefleri</p>
        <div className="grid gap-3 md:grid-cols-4">
          {STREAK_MILESTONES.map((m) => (
            <div key={m} className={cx('card text-center', state.stats.longestStreak >= m ? 'border-acc/40' : 'opacity-60')}>
              <p className="text-3xl">{state.stats.longestStreak >= m ? '🎁' : '🔒'}</p>
              <p className="font-extrabold text-fg">{m} gün</p>
              <p className="text-xs text-fg-3">{state.stats.longestStreak >= m ? 'Ulaşıldı' : `${m - Math.min(m, state.stats.longestStreak)} gün kaldı`}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <p className="section-title">Rozetler</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {BADGES.map((badge) => {
            const at = state.badges[badge.code];
            return (
              <div key={badge.code} className={cx('card text-center', at ? 'card-glow' : 'opacity-45 grayscale')} data-badge={badge.code} data-earned={String(!!at)}>
                <p className="text-4xl">{badge.icon}</p>
                <p className="mt-1 font-extrabold text-fg">{badge.titleTr}</p>
                <p className="text-xs text-fg-2">{badge.descTr}</p>
                {at && <p className="mt-1 text-xs font-bold text-acc">{new Date(at).toLocaleDateString('tr-TR')}</p>}
              </div>
            );
          })}
        </div>
      </section>

      <section className="card">
        <p className="section-title">Son XP hareketleri</p>
        {recent.length === 0 ? <p className="text-fg-2">Henüz XP kazanmadın. İlk dersini tamamla!</p> : (
          <ul className="divide-y divide-line">
            {recent.map((e, i) => (
              <li key={i} className="flex items-center justify-between py-2 text-sm">
                <span className="text-fg">{REASON_TR[e.reason] ?? e.reason} <span className="text-fg-3">· {e.ref}</span></span>
                <span className="font-bold text-gold">+{e.amount} XP</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
