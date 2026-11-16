// Haftalık ilerleme raporu ve hata analizi.
import { dayKey } from '@core/engine.ts';
import { Icon } from '../components/Icon.tsx';
import { Notice, PageTitle, ProgressBar, StatTile, cx } from '../components/ui.tsx';
import { useApp } from '../lib/app.tsx';
import { mistakeAnalysis, weeklyReport } from '../lib/insights.ts';
import type { MistakeGroup, WeekSummary } from '../lib/insights.ts';

function delta(now: number, before: number, unit = '') {
  if (!before && !now) return null;
  const d = now - before;
  return <span className={cx('text-xs font-bold', d >= 0 ? 'text-acc' : 'text-bad')}>{d >= 0 ? '▲' : '▼'} {Math.abs(d)}{unit} geçen haftaya göre</span>;
}

function Groups({ title, groups, empty }: { title: string; groups: MistakeGroup[]; empty: string }) {
  const max = Math.max(1, ...groups.map((g) => g.count));
  return (
    <section className="card">
      <p className="section-title">{title}</p>
      {!groups.length ? <p className="text-sm text-fg-3">{empty}</p> : (
        <ul className="space-y-2">
          {groups.slice(0, 6).map((g) => (
            <li key={g.key}>
              <div className="mb-1 flex justify-between text-sm"><span className="truncate pr-2 text-fg">{g.label}</span><span className="font-mono-num font-bold text-fg-2">{g.count}</span></div>
              <ProgressBar value={g.count} max={max} height="h-2" color="bg-bad" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function ReportScreen() {
  const { state, go } = useApp();
  const today = dayKey(new Date());
  const { thisWeek: w, lastWeek: l, notes } = weeklyReport(state, today);
  const m = mistakeAnalysis(state, today);
  const consistency = w.plannedDays ? Math.round((100 * Math.min(w.activeDays, w.plannedDays)) / w.plannedDays) : 0;

  return (
    <div data-screen="report" className="space-y-5">
      <PageTitle title="Haftalık rapor" icon="chart" subtitle={`Hafta başı: ${new Date(`${w.start}T12:00:00`).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}`} />

      <div className="grid gap-4 md:grid-cols-4" data-week-stats>
        <StatTile label="Çalışma süresi" value={`${w.minutes} dk`} icon="clock" sub={delta(w.minutes, l.minutes, ' dk') ?? undefined} />
        <StatTile label="Kazanılan XP" value={w.xp} icon="bolt" tone="text-gold" sub={delta(w.xp, l.xp) ?? undefined} />
        <StatTile label="Tamamlanan ders" value={w.lessons} icon="book" sub={delta(w.lessons, l.lessons) ?? undefined} />
        <StatTile label="Doğruluk" value={w.accuracy === null ? '—' : `%${w.accuracy}`} icon="target" sub={w.accuracy !== null && l.accuracy !== null ? delta(w.accuracy, l.accuracy, ' puan') ?? undefined : undefined} />
      </div>

      <section className="card card-glow" data-week-summary>
        <p className="section-title"><Icon name="sparkles" size={20} className="text-acc" /> Bu haftanın özeti</p>
        <div className="mb-4 flex items-center gap-3">
          <span className="text-sm text-fg-2">Düzenlilik</span>
          <div className="flex-1"><ProgressBar value={consistency} max={100} /></div>
          <span className="font-mono-num font-bold text-acc">%{consistency}</span>
        </div>
        <ul className="space-y-1.5">
          {notes.map((n) => <li key={n} className="flex gap-2 text-fg"><span className="text-acc">›</span>{n}</li>)}
        </ul>
        <WeekCompare w={w} l={l} />
      </section>

      <h2 className="section-title mt-2"><Icon name="wrench" size={20} className="text-bad" /> Hata analizi</h2>
      <div className="grid gap-4 md:grid-cols-4" data-mistake-stats>
        <StatTile label="Açık hata" value={m.active} icon="wrench" tone="text-bad" />
        <StatTile label="Çözülen hata" value={m.resolved} icon="check" tone="text-acc" />
        <StatTile label="Tekrarlayan" value={m.repeats} icon="repeat" tone="text-warn" sub="hâlâ bilinmeyen" />
        <StatTile label="Toplam" value={m.total} icon="chart" />
      </div>

      {m.recommendations.length > 0 && (
        <section className="card" data-recommendations>
          <p className="section-title">Önerilen adımlar</p>
          <div className="grid gap-2 md:grid-cols-2">
            {m.recommendations.map((r) => (
              <button key={r.text} type="button" onClick={() => go(r.route)} className="flex items-center gap-3 rounded-2xl border border-line bg-panel-2 p-3 text-left hover:border-acc/40">
                <Icon name="arrowRight" size={18} className="shrink-0 text-acc" /><span className="text-sm text-fg">{r.text}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Groups title="Beceriye göre" groups={m.bySkill} empty="Henüz hata yok." />
        <Groups title="Soru türüne göre" groups={m.byType} empty="Henüz hata yok." />
        <Groups title="Konuya göre" groups={m.byUnit} empty="Henüz hata yok." />
      </div>

      <section className="card" data-mistake-list>
        <p className="section-title">Açık hatalar</p>
        {!m.items.length ? <Notice tone="success">Açık hatan yok. Harika! 🎉</Notice> : (
          <ul className="divide-y divide-line">
            {m.items.slice(0, 20).map((i) => (
              <li key={i.id} className="py-3">
                <div className="flex flex-wrap items-center gap-2">
                  {i.repeats && <span className="chip bg-warn/15 text-xs text-warn">tekrarlayan</span>}
                  {i.due && <span className="chip bg-bad/15 text-xs text-bad">tekrar zamanı</span>}
                  <span className="text-sm text-fg">{i.prompt}</span>
                </div>
                <p className="mt-1 text-sm"><span className="text-fg-3">Doğrusu: </span><b className="text-acc">{i.expected}</b></p>
                {i.explain && <p className="text-xs text-fg-2">{i.explain}</p>}
              </li>
            ))}
          </ul>
        )}
        {m.items.length > 0 && <button className="btn btn-primary mt-3" onClick={() => go({ name: 'practice' })}>Hataları şimdi çalış <Icon name="arrowRight" size={16} /></button>}
      </section>
    </div>
  );
}

function WeekCompare({ w, l }: { w: WeekSummary; l: WeekSummary }) {
  const rows: [string, number, number][] = [
    ['Aktif gün', w.activeDays, l.activeDays], ['Hedefe ulaşılan gün', w.goalDays, l.goalDays],
    ['Tekrar kartı', w.reviews, l.reviews], ['Hata telafisi', w.practice, l.practice],
  ];
  return (
    <table className="mt-4 w-full text-sm">
      <thead><tr className="text-left text-fg-3"><th className="py-1 font-semibold"></th><th className="font-semibold">Bu hafta</th><th className="font-semibold">Geçen hafta</th></tr></thead>
      <tbody>
        {rows.map(([label, a, b]) => (
          <tr key={label} className="border-t border-line"><td className="py-1.5 text-fg-2">{label}</td><td className="font-mono-num font-bold text-fg">{a}</td><td className="font-mono-num text-fg-3">{b}</td></tr>
        ))}
      </tbody>
    </table>
  );
}
