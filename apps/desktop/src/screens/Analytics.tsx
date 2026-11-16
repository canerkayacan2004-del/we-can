import { uiLocale } from '../lib/i18n.ts';
import { currentLevel, dayKey, dayStats, lastDays, levelProgress, skillAccuracy, totals } from '@core/engine.ts';
import { LEVELS, SKILLS } from '@core/types.ts';
import type { Skill, UserState } from '@core/types.ts';
import { Bars, LineChart, Ring } from '../components/charts.tsx';
import { PageTitle, ProgressBar, StatTile } from '../components/ui.tsx';
import { useApp } from '../lib/app.tsx';
import { allUnitsList, curriculum, getLessonMeta } from '../lib/content.ts';

export const SKILL_LABEL: Record<Skill, { label: string; icon: string }> = {
  listening: { label: 'Dinleme', icon: 'headphones' },
  reading: { label: 'Okuma', icon: 'book' },
  speaking: { label: 'Konuşma*', icon: 'mic' },
  writing: { label: 'Yazma', icon: 'pencil' },
  grammar: { label: 'Gramer', icon: 'sparkles' },
  vocabulary: { label: 'Kelime', icon: 'notebook' },
};

/** Profil ve gelişim ekranında kullanılan ilerleme tablosu. */
export function ProgressTable({ state }: { state: UserState }) {
  const rows = LEVELS.map((level) => {
    const units = allUnitsList().filter((u) => u.level === level);
    const lessonCodes = units.flatMap((u) => u.lessons.map((l) => l.code));
    const done = lessonCodes.filter((c) => state.lessons[c]?.status === 'completed');
    const scores = done.map((c) => state.lessons[c].bestScore);
    const p = levelProgress(state, curriculum, level);
    return { level, units: p, lessons: done.length, totalLessons: lessonCodes.length, avg: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null };
  });
  return (
    <table className="table-wc" data-table="progress">
      <thead>
        <tr><th>Seviye</th><th>Ünite</th><th>Ders</th><th>Ortalama başarı</th><th className="w-1/3">İlerleme</th></tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.level}>
            <td className="font-black text-fg">{r.level}</td>
            <td>{r.units.done} / {r.units.total}</td>
            <td>{r.lessons} / {r.totalLessons}</td>
            <td>{r.avg === null ? '–' : `%${r.avg}`}</td>
            <td><ProgressBar value={r.lessons} max={r.totalLessons} height="h-2" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function AnalyticsScreen() {
  const { state } = useApp();
  const today = dayKey(new Date());
  const t = totals(state);
  const acc = skillAccuracy(state);
  const days30 = lastDays(today, 30);
  const xpSeries = days30.map((d) => ({ label: d.slice(5).split('-').reverse().join('.'), value: dayStats(state, d).xp }));
  const minSeries = lastDays(today, 14).map((d) => ({ label: d.slice(8), value: Math.round(dayStats(state, d).seconds / 60), highlight: d === today }));
  const recent = [...state.attempts].reverse().slice(0, 12);

  return (
    <div data-screen="analytics" className="space-y-5">
      <PageTitle title="Gelişim" icon="chart" subtitle={`Şu anki seviyen: ${currentLevel(state, curriculum)}`} />
      <div className="grid gap-4 md:grid-cols-4">
        <StatTile label="Toplam XP" value={state.stats.totalXp} icon="bolt" tone="text-gold" />
        <StatTile label="Çalışma süresi" value={`${t.minutes} dk`} sub={`${t.activeDays} aktif gün`} icon="clock" />
        <StatTile label="Tamamlanan ders" value={t.lessonsCompleted} sub={`${t.unitsPassed} ünite geçildi`} icon="book" />
        <StatTile label="Genel doğruluk" value={t.accuracy === null ? '–' : `%${t.accuracy}`} sub={`${t.answered} cevap`} icon="target" tone="text-good" />
      </div>

      <section className="card">
        <p className="section-title">Son 30 günün XP'si</p>
        <LineChart data={xpSeries} />
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card">
          <p className="section-title">Günlük çalışma süresi (dakika, son 14 gün)</p>
          <Bars data={minSeries} unit=" dk" />
        </section>
        <section className="card">
          <p className="section-title">Beceri doğruluğu</p>
          <div className="grid grid-cols-3 gap-y-4">
            {SKILLS.map((s) => <Ring key={s} value={acc[s]} label={SKILL_LABEL[s].label} icon={SKILL_LABEL[s].icon} size={92} />)}
          </div>
          <p className="mt-3 text-xs text-fg-3">*Konuşma yazılı pratikle ölçülür; telaffuz ve akıcılık ölçülmez.</p>
        </section>
      </div>

      <section className="card">
        <p className="section-title">Gelişim tablosu</p>
        <ProgressTable state={state} />
      </section>

      <section className="card">
        <p className="section-title">Son denemeler</p>
        {recent.length === 0 ? <p className="text-fg-2">Henüz ders yapmadın.</p> : (
          <table className="table-wc">
            <thead><tr><th>Tarih</th><th>Ders</th><th>Sonuç</th><th>Doğru</th><th>Süre</th><th>XP</th></tr></thead>
            <tbody>
              {recent.map((a, i) => (
                <tr key={i}>
                  <td>{new Date(a.at).toLocaleString(uiLocale(), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                  <td><b className="text-fg">{a.lessonCode}</b> <span className="text-fg-3">{getLessonMeta(a.lessonCode)?.title}</span></td>
                  <td className={a.score >= 80 ? 'text-good' : a.score >= 60 ? 'text-warn' : 'text-bad'}>%{a.score}</td>
                  <td>{a.correct}/{a.total}</td>
                  <td>{a.seconds ? `${Math.max(1, Math.round(a.seconds / 60))} dk` : '–'}</td>
                  <td className="text-gold">+{a.xp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
