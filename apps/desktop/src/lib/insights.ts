// Haftalık çalışma planı, haftalık ilerleme raporu ve hata analizi.
// Hepsi kullanıcının gerçek verisinden (çalışma günlükleri, denemeler, hata kartları) hesaplanır.
import { addDays, dayStats, dueReviews, lessonUnlocked, mistakeExerciseIds, skillAccuracy } from '@core/engine.ts';
import { exerciseLabel } from '@core/grading.ts';
import type { Skill, UserState } from '@core/types.ts';
import type { Route } from './app.tsx';
import { curriculum, getLessonContent, getLessonMeta, getUnit } from './content.ts';

export const SKILL_TR: Record<Skill, string> = { listening: 'Dinleme', reading: 'Okuma', speaking: 'Konuşma', writing: 'Yazma', grammar: 'Gramer', vocabulary: 'Kelime' } as Record<Skill, string>;
export const WEEKDAY_LONG = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

/** 0 = Pazartesi … 6 = Pazar */
export function weekdayIndex(day: string): number {
  const d = new Date(`${day}T12:00:00`);
  return (d.getDay() + 6) % 7;
}
export function weekStart(day: string): string {
  return addDays(day, -weekdayIndex(day));
}
export function weekDays(start: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** Sıradaki (içeriği hazır, tamamlanmamış) dersler, müfredat sırasıyla. */
export function upcomingLessons(state: UserState, limit = 10): string[] {
  const out: string[] = [];
  for (const level of curriculum.levels) {
    for (const unit of level.units) {
      const s = state.units[unit.id]?.status;
      if (s === 'passed' || s === 'skipped') continue;
      for (const lesson of unit.lessons) {
        if (state.lessons[lesson.code]?.status === 'completed') continue;
        if (!getLessonContent(lesson.code)) continue;
        if (!out.length && !lessonUnlocked(state, curriculum, unit, lesson.number)) continue;
        out.push(lesson.code);
        if (out.length >= limit) return out;
      }
    }
  }
  return out;
}

// ---------------- Haftalık plan ----------------
export interface WeekTask { id: string; title: string; minutes: number; route: Route; icon: string }
export interface WeekDay {
  day: string;
  weekday: number;
  planned: boolean;
  isToday: boolean;
  isPast: boolean;
  tasks: WeekTask[];
  plannedMinutes: number;
  doneMinutes: number;
  goalMet: boolean;
}

const FOCUS: Record<string, { title: string; route: Route; icon: string }> = {
  listening: { title: 'Dinleme odası: dikte', route: { name: 'audio' }, icon: 'headphones' },
  reading: { title: 'Okuma: bir dersi tekrarla', route: { name: 'map' }, icon: 'book' },
  speaking: { title: 'AI öğretmenle konuşma', route: { name: 'ai' }, icon: 'mic' },
  writing: { title: 'AI yazı değerlendirmesi', route: { name: 'ai' }, icon: 'pencil' },
  grammar: { title: 'Hatalarını telafi et', route: { name: 'practice' }, icon: 'wrench' },
  vocabulary: { title: 'Kelime oyunları', route: { name: 'games' }, icon: 'target' },
};

/** En zayıf beceriler (verisi olanlar arasında en düşük doğruluk; veri yoksa varsayılan sıra). */
export function weakSkills(state: UserState): Skill[] {
  const acc = skillAccuracy(state);
  const known = (Object.entries(acc) as [Skill, number | null][]).filter(([, v]) => v !== null).sort((a, b) => (a[1] as number) - (b[1] as number)).map(([k]) => k);
  const fallback: Skill[] = ['listening', 'speaking', 'writing', 'grammar'];
  return [...known, ...fallback.filter((s) => !known.includes(s))];
}

export function weeklyPlan(state: UserState, today: string): WeekDay[] {
  const start = weekStart(today);
  const lessons = upcomingLessons(state, 14);
  const weak = weakSkills(state).filter((s) => FOCUS[s]);
  const minutes = state.profile.dailyMinutes;
  let lessonCursor = 0;
  let focusCursor = 0;
  return weekDays(start).map((day, i) => {
    const planned = state.profile.studyDays.includes(i);
    const isPast = day < today;
    const log = dayStats(state, day);
    const tasks: WeekTask[] = [];
    if (planned && !isPast) {
      const pool: WeekTask[] = [];
      const code = lessons[lessonCursor];
      if (code) {
        const meta = getLessonMeta(code);
        pool.push({ id: `l-${code}`, title: `Ders ${code}${meta ? ` · ${meta.title}` : ''}`, minutes: 15, route: { name: 'lesson', code }, icon: 'book' });
        lessonCursor++;
      }
      pool.push({ id: 'words', title: 'Günün 10 kelimesi', minutes: 5, route: { name: 'daily' }, icon: 'sparkles' });
      pool.push({ id: 'review', title: 'Akıllı tekrar', minutes: 5, route: { name: 'review' }, icon: 'repeat' });
      const focus = FOCUS[weak[focusCursor % weak.length]];
      focusCursor++;
      pool.push({ id: 'focus', title: `Zayıf alan · ${focus.title}`, minutes: 10, route: focus.route, icon: focus.icon });
      if (i >= 5) pool.push({ id: 'game', title: 'Hafta sonu: Wordle', minutes: 5, route: { name: 'games' }, icon: 'target' });
      // Süreye sığacak kadar görev; en az bir görev her zaman kalır.
      let used = 0;
      for (const t of pool) {
        if (tasks.length && used + t.minutes > minutes) continue;
        tasks.push(t); used += t.minutes;
      }
      // Süre artıyorsa ikinci dersle doldur.
      const extra = lessons[lessonCursor];
      if (extra && minutes - used >= 15) {
        tasks.push({ id: `l-${extra}`, title: `Ders ${extra}`, minutes: 15, route: { name: 'lesson', code: extra }, icon: 'book' });
        lessonCursor++;
      }
    }
    return {
      day, weekday: i, planned, isToday: day === today, isPast,
      tasks, plannedMinutes: planned ? minutes : 0,
      doneMinutes: Math.floor(log.seconds / 60), goalMet: log.seconds >= minutes * 60,
    };
  });
}

// ---------------- Haftalık rapor ----------------
export interface WeekSummary {
  start: string;
  minutes: number;
  xp: number;
  lessons: number;
  reviews: number;
  practice: number;
  activeDays: number;
  plannedDays: number;
  goalDays: number;
  accuracy: number | null;
  attempts: number;
}

function summarize(state: UserState, start: string, upTo: string): WeekSummary {
  const days = weekDays(start).filter((d) => d <= upTo);
  let minutes = 0, xp = 0, lessons = 0, reviews = 0, practice = 0, activeDays = 0, goalDays = 0;
  for (const d of days) {
    const log = dayStats(state, d);
    minutes += Math.floor(log.seconds / 60); xp += log.xp; lessons += log.lessons; reviews += log.reviews; practice += log.practice;
    if (log.seconds > 0 || log.xp > 0) activeDays++;
    if (log.seconds >= state.profile.dailyMinutes * 60) goalDays++;
  }
  const end = addDays(start, 7);
  const atts = state.attempts.filter((a) => a.at.slice(0, 10) >= start && a.at.slice(0, 10) < end);
  const correct = atts.reduce((n, a) => n + a.correct, 0);
  const total = atts.reduce((n, a) => n + a.total, 0);
  const plannedDays = days.filter((d) => state.profile.studyDays.includes(weekdayIndex(d))).length;
  return { start, minutes, xp, lessons, reviews, practice, activeDays, plannedDays, goalDays, accuracy: total ? Math.round((100 * correct) / total) : null, attempts: atts.length };
}

export function weeklyReport(state: UserState, today: string) {
  const start = weekStart(today);
  const thisWeek = summarize(state, start, today);
  const lastWeek = summarize(state, addDays(start, -7), addDays(start, -1));
  const notes: string[] = [];
  if (thisWeek.activeDays === 0 && thisWeek.attempts === 0) notes.push('Bu hafta henüz çalışma kaydı yok. Küçük bir başlangıç: Günün 10 kelimesi 5 dakika sürer.');
  else {
    const diff = thisWeek.minutes - lastWeek.minutes;
    if (thisWeek.minutes < 1) notes.push('Bu hafta başladın; düzenli küçük oturumlar en hızlı ilerletir.');
    if (lastWeek.minutes > 0) notes.push(diff >= 0 ? `Geçen haftaya göre ${diff} dakika daha fazla çalıştın.` : `Geçen haftadan ${-diff} dakika az çalıştın; hafta bitmeden telafi edebilirsin.`);
    if (thisWeek.plannedDays > 0) notes.push(`Planladığın ${thisWeek.plannedDays} günün ${Math.min(thisWeek.activeDays, thisWeek.plannedDays)} gününde çalıştın.`);
    if (thisWeek.accuracy !== null) notes.push(thisWeek.accuracy >= 85 ? `Doğruluğun %${thisWeek.accuracy}: çok iyi, bir sonraki üniteye hazırsın.` : thisWeek.accuracy >= 60 ? `Doğruluğun %${thisWeek.accuracy}: hatalarını telafi ederek %85'e çıkabilirsin.` : `Doğruluğun %${thisWeek.accuracy}: dersleri tekrar etmek ve hata telafisi yapmak iyi olur.`);
  }
  const weak = weakSkills(state)[0];
  if (weak && skillAccuracy(state)[weak] !== null) notes.push(`En çok gelişmeye açık becerin: ${SKILL_TR[weak]}.`);
  return { thisWeek, lastWeek, notes };
}

// ---------------- Hata analizi ----------------
export interface MistakeGroup { key: string; label: string; count: number }
export interface MistakeItem { id: string; prompt: string; expected: string; explain?: string; skill?: Skill; type: string; unit?: string; repeats: boolean; due: boolean }

const TYPE_TR: Record<string, string> = {
  mcq: 'Çoktan seçmeli', listen_choice: 'Dinle ve seç', dialogue: 'Diyalog tamamlama', truefalse: 'Doğru / yanlış', fill: 'Boşluk doldurma',
  order: 'Kelime sıralama', translate: 'Çeviri', listen: 'Dikte', write: 'Yazma', match: 'Eşleştirme',
};

export function mistakeAnalysis(state: UserState, today: string) {
  const mistakes = state.reviews.filter((r) => r.kind === 'mistake');
  const dueIds = new Set(dueReviews(state, today).map((r) => r.id));
  const items: MistakeItem[] = [];
  for (const r of mistakes) {
    const exId = r.id.slice(2);
    let skill: Skill | undefined; let type = 'other'; let unit: string | undefined;
    for (const level of curriculum.levels) for (const u of level.units) for (const l of u.lessons) {
      const content = getLessonContent(l.code);
      const ex = content?.exercises.find((e) => e.id === exId);
      if (ex) { skill = ex.skill; type = ex.type; unit = u.id; }
    }
    items.push({ id: r.id, prompt: r.front, expected: r.back, explain: r.extra, skill, type, unit, repeats: r.status === 'active' && r.step === 0 && r.lastResult === 'dont', due: dueIds.has(r.id) });
  }
  const active = items.filter((i) => mistakes.find((m) => m.id === i.id)?.status === 'active');
  const count = <K extends string>(keyOf: (i: MistakeItem) => K | undefined, labelOf: (k: K) => string): MistakeGroup[] => {
    const map = new Map<K, number>();
    for (const i of active) { const k = keyOf(i); if (k) map.set(k, (map.get(k) ?? 0) + 1); }
    return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => ({ key: k, label: labelOf(k), count: n }));
  };
  const bySkill = count((i) => i.skill, (k) => SKILL_TR[k as Skill] ?? k);
  const byType = count((i) => i.type, (k) => TYPE_TR[k] ?? k);
  const byUnit = count((i) => i.unit, (k) => { const u = getUnit(k); return u ? `${u.id} · ${u.grammar}` : k; });
  const recommendations: { text: string; route: Route }[] = [];
  if (mistakeExerciseIds(state).length) recommendations.push({ text: `${active.length} açık hatayı "Hatalarını telafi et" ile çalış (her turda en fazla ${mistakeExerciseIds(state).length} soru).`, route: { name: 'practice' } });
  if (byUnit[0]) recommendations.push({ text: `En çok zorlandığın konu: ${byUnit[0].label}. Bu ünitenin gramer dersini tekrar et.`, route: { name: 'unit', unitId: byUnit[0].key } });
  if (byType[0]?.key === 'listen' || byType[0]?.key === 'listen_choice') recommendations.push({ text: 'Dinleme kaynaklı hatalar öne çıkıyor: Dinleme odasında dikte yap.', route: { name: 'audio' } });
  if (byType[0]?.key === 'order' || byType[0]?.key === 'translate') recommendations.push({ text: 'Cümle kurma hataları öne çıkıyor: AI yazı değerlendirmesiyle kısa metinler yaz.', route: { name: 'ai' } });
  return {
    total: mistakes.length,
    active: active.length,
    resolved: mistakes.length - active.length,
    repeats: active.filter((i) => i.repeats).length,
    bySkill, byType, byUnit,
    items: active.sort((a, b) => Number(b.repeats) - Number(a.repeats) || Number(b.due) - Number(a.due)),
    recommendations,
    label: exerciseLabel,
  };
}
