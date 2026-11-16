// We Can kural motoru: XP, günlük seri, aralıklı tekrar, ünite geçme, görevler, rozetler,
// çalışma süresi, beceri istatistikleri, hata telafisi, dinleme odası, not defteri, AI kotası.
// Bu fonksiyonlar "sunucu tarafı" kurallardır. Yerel modda uygulamanın içinde,
// bulut modunda Supabase Edge Function içinde çalışır; istemci bu sonuçları kendisi yazamaz.

import { exerciseLabel, gradeExercise } from './grading.ts';
import type {
  Curriculum, DayLog, Exercise, ExerciseResult, LessonContent, LessonResult, LevelCode, Note, PracticeResult,
  QuestProgress, Responses, ReviewItem, ReviewResult, Skill, UnitMeta, UnitStatus, UserState,
} from './types.ts';
import { DEFAULT_APPEARANCE, LEVELS, SKILLS } from './types.ts';

export const SRS_INTERVALS = [1, 3, 7, 14, 30];

export const RULES = {
  lessonPass: 60,
  unitPass: 80,
  unitReinforce: 60,
  accuracyBonusAt: 90,
  xpLesson: 10,
  xpExam: 20,
  xpAccuracyBonus: 5,
  xpRepeat: 3,
  xpReview: 1,
  xpQuest: 5,
  xpPracticePerCorrect: 2,
  xpPracticeMax: 20,
  maxSessionSeconds: 3600,
  freeDailyAi: { conversation: 20, writing: 20 },
  premiumDailyAi: { conversation: 50, writing: 50 },
} as const;

// ---- Tarih yardımcıları (kullanıcının yerel gününe göre) ----
export function dayKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}
export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d + n));
}
export function diffDays(from: string, to: string): number {
  const [y1, m1, d1] = from.split('-').map(Number);
  const [y2, m2, d2] = to.split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
}
export function lastDays(today: string, n: number): string[] {
  return Array.from({ length: n }, (_, i) => addDays(today, i - n + 1));
}

// ---- Görevler ----
export const QUESTS: { code: string; titleTr: string; target: number }[] = [
  { code: 'lesson1', titleTr: 'Bugün 1 ders tamamla', target: 1 },
  { code: 'xp20', titleTr: 'Bugün 20 XP kazan', target: 20 },
  { code: 'accuracy90', titleTr: 'Bir dersi %90 ve üzeri doğrulukla bitir', target: 1 },
  { code: 'minutes10', titleTr: 'Bugün 10 dakika çalış', target: 10 },
  { code: 'review10', titleTr: '10 tekrar kartı çalış', target: 10 },
  { code: 'practice1', titleTr: 'Hatalarını bir kez telafi et', target: 1 },
  { code: 'audio1', titleTr: 'Dinleme odasında 1 oturum tamamla', target: 1 },
];

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Günün görevleri: "1 ders" her gün vardır; diğer ikisi tarihe göre değişir ve kullanıcının yapabileceği görevlerden seçilir. */
function freshQuests(today: string, state: Pick<UserState, 'reviews'> | null): UserState['quests'] {
  const hasReviews = !!state?.reviews.some((r) => r.status === 'active');
  const hasMistakes = !!state?.reviews.some((r) => r.status === 'active' && r.kind === 'mistake');
  const pool = QUESTS.filter((q) => q.code !== 'lesson1')
    .filter((q) => (q.code === 'review10' ? hasReviews : q.code === 'practice1' ? hasMistakes : true))
    .sort((a, b) => hash(today + a.code) - hash(today + b.code))
    .slice(0, 2);
  const chosen = [QUESTS[0], ...pool];
  return { date: today, items: chosen.map((q) => ({ code: q.code, progress: 0, target: q.target, done: false })) };
}

// ---- Rozetler ----
const totalSeconds = (s: UserState) => Object.values(s.study).reduce((n, d) => n + d.seconds, 0);
const anyStudy = (s: UserState, key: keyof DayLog) => Object.values(s.study).some((d) => d[key] > 0);

export const BADGES: { code: string; titleTr: string; descTr: string; icon: string; earned: (s: UserState) => boolean }[] = [
  { code: 'first_lesson', titleTr: 'İlk adım', descTr: 'İlk dersini tamamladın.', icon: '🚀',
    earned: (s) => Object.values(s.lessons).some((l) => l.status === 'completed') },
  { code: 'perfect_lesson', titleTr: 'Kusursuz', descTr: 'Bir dersi %100 doğrulukla bitirdin.', icon: '💎',
    earned: (s) => Object.values(s.lessons).some((l) => l.status === 'completed' && l.bestScore === 100) },
  { code: 'unit_passed', titleTr: 'Ünite tamam', descTr: 'Bir ünite sınavını geçtin.', icon: '🏁',
    earned: (s) => Object.values(s.units).some((u) => u.status === 'passed') },
  { code: 'streak3', titleTr: '3 günlük seri', descTr: 'Üç gün üst üste çalıştın.', icon: '🔥',
    earned: (s) => s.stats.longestStreak >= 3 },
  { code: 'streak7', titleTr: '7 günlük seri', descTr: 'Bir hafta boyunca her gün çalıştın.', icon: '🌟',
    earned: (s) => s.stats.longestStreak >= 7 },
  { code: 'streak30', titleTr: '30 günlük seri', descTr: 'Bir ay boyunca her gün çalıştın.', icon: '👑',
    earned: (s) => s.stats.longestStreak >= 30 },
  { code: 'xp50', titleTr: '50 XP', descTr: 'Toplam 50 XP topladın.', icon: '⚡',
    earned: (s) => s.stats.totalXp >= 50 },
  { code: 'xp200', titleTr: '200 XP', descTr: 'Toplam 200 XP topladın.', icon: '🏆',
    earned: (s) => s.stats.totalXp >= 200 },
  { code: 'xp1000', titleTr: '1000 XP', descTr: 'Toplam 1000 XP topladın.', icon: '🥇',
    earned: (s) => s.stats.totalXp >= 1000 },
  { code: 'words10', titleTr: 'Kelime avcısı', descTr: 'Kelime defterinde 10 kelime birikti.', icon: '📒',
    earned: (s) => Object.keys(s.vocab).length >= 10 },
  { code: 'words25', titleTr: 'Kelime koleksiyoncusu', descTr: 'Kelime defterinde 25 kelime birikti.', icon: '📚',
    earned: (s) => Object.keys(s.vocab).length >= 25 },
  { code: 'practice_first', titleTr: 'Hatadan ders', descTr: 'Hatalarını ilk kez telafi ettin.', icon: '🛠️',
    earned: (s) => anyStudy(s, 'practice') },
  { code: 'audio_first', titleTr: 'Kulak dolgunluğu', descTr: 'Dinleme odasında ilk oturumunu bitirdin.', icon: '🎧',
    earned: (s) => anyStudy(s, 'audio') },
  { code: 'notebook', titleTr: 'Not alan öğrenci', descTr: 'Not defterine ilk notunu yazdın.', icon: '📝',
    earned: (s) => s.notes.length > 0 },
  { code: 'minutes60', titleTr: 'Bir saat', descTr: 'Toplam 60 dakika çalıştın.', icon: '⏱️',
    earned: (s) => totalSeconds(s) >= 3600 },
  { code: 'placement_done', titleTr: 'Yolunu çizdin', descTr: 'Seviye tespit sınavını tamamladın.', icon: '🧭',
    earned: (s) => s.profile.placementDone && s.profile.placementLevel !== null },
];

export const STREAK_MILESTONES = [7, 30, 100, 365];

// ---- Durum oluşturma ve sürüm yükseltme ----
function emptySkills(): UserState['skills'] {
  return Object.fromEntries(SKILLS.map((s) => [s, { correct: 0, total: 0 }])) as UserState['skills'];
}
export function emptyDay(): DayLog {
  return { seconds: 0, xp: 0, lessons: 0, reviews: 0, practice: 0, audio: 0 };
}

export function newUserState(displayName: string, now: Date): UserState {
  const today = dayKey(now);
  return {
    version: 2,
    profile: {
      displayName,
      goal: '',
      dailyMinutes: 30,
      interests: [],
      hobbies: [],
      studyDays: [0, 1, 2, 3, 4],
      studyTime: 'evening',
      onboardingDone: false,
      placementDone: false,
      placementLevel: null,
      plan: 'free',
      createdAt: now.toISOString(),
      appearance: { ...DEFAULT_APPEARANCE, dashboard: [...DEFAULT_APPEARANCE.dashboard] },
    },
    stats: { totalXp: 0, streak: 0, longestStreak: 0, lastActiveDate: null },
    lessons: {},
    units: {},
    xpEvents: [],
    reviews: [],
    vocab: {},
    badges: {},
    quests: freshQuests(today, null),
    ai: { date: today, conversation: 0, writing: 0 },
    attempts: [],
    study: {},
    skills: emptySkills(),
    notes: [],
    lastLesson: null,
  };
}

/** Eski sürümlerden kalan kayıtları güncel biçime getirir; eksik alanları varsayılanlarla doldurur. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function migrateState(raw: any): UserState {
  const base = newUserState(raw?.profile?.displayName ?? '', new Date(raw?.profile?.createdAt ?? Date.now()));
  const state = { ...base, ...raw } as UserState;
  state.version = 2;
  state.profile = { ...base.profile, ...(raw?.profile ?? {}) };
  state.profile.appearance = { ...DEFAULT_APPEARANCE, ...(raw?.profile?.appearance ?? {}) };
  // 0.3 tasarım güncellemesi: eski varsayılan temayı kullananlar bir kez yeni Neon temaya geçer.
  if (!raw?.designV3) {
    if (!raw?.profile?.appearance?.theme || raw.profile.appearance.theme === 'emerald') state.profile.appearance.theme = 'neon';
    // Yeni pano kutusu: oyunlar (bir kez eklenir; kullanıcı sonra kapatabilir).
    if (!state.profile.appearance.dashboard.includes('games')) state.profile.appearance.dashboard = ['games', ...state.profile.appearance.dashboard];
    state.designV3 = true;
  }
  if (!Array.isArray(state.profile.hobbies)) state.profile.hobbies = [];
  if (!Array.isArray(state.profile.studyDays) || !state.profile.studyDays.length) state.profile.studyDays = [0, 1, 2, 3, 4];
  if (!state.profile.studyTime) state.profile.studyTime = 'evening';
  if (!Array.isArray(state.profile.appearance.dashboard)) state.profile.appearance.dashboard = [...DEFAULT_APPEARANCE.dashboard];
  state.study = raw?.study ?? {};
  state.skills = { ...emptySkills(), ...(raw?.skills ?? {}) };
  state.notes = Array.isArray(raw?.notes) ? raw.notes : [];
  state.lastLesson = raw?.lastLesson ?? null;
  return state;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Yeni güne geçildiyse günlük görevleri ve AI sayaçlarını sıfırlar. */
export function ensureDaily(state: UserState, today: string): UserState {
  if (state.quests.date === today && state.ai.date === today) return state;
  const next = clone(state);
  if (next.quests.date !== today) next.quests = freshQuests(today, next);
  if (next.ai.date !== today) next.ai = { date: today, conversation: 0, writing: 0 };
  return next;
}

/** Seri bugün için hâlâ geçerli mi? (Dün veya bugün çalışıldıysa geçerlidir.) */
export function effectiveStreak(state: UserState, today: string): number {
  const last = state.stats.lastActiveDate;
  if (!last) return 0;
  return diffDays(last, today) <= 1 ? state.stats.streak : 0;
}

function touchActivity(state: UserState, today: string): void {
  const last = state.stats.lastActiveDate;
  if (last === today) return;
  state.stats.streak = last && diffDays(last, today) === 1 ? state.stats.streak + 1 : 1;
  state.stats.longestStreak = Math.max(state.stats.longestStreak, state.stats.streak);
  state.stats.lastActiveDate = today;
}

function quest(state: UserState, code: string): QuestProgress | undefined {
  return state.quests.items.find((q) => q.code === code && !q.done);
}
function bumpQuest(state: UserState, code: string, amount = 1): void {
  const q = quest(state, code);
  if (q) q.progress = Math.min(q.target, q.progress + amount);
}

function dayLog(state: UserState, today: string): DayLog {
  if (!state.study[today]) state.study[today] = emptyDay();
  const keys = Object.keys(state.study);
  if (keys.length > 400) for (const k of keys.sort().slice(0, keys.length - 400)) delete state.study[k];
  return state.study[today];
}

function addSeconds(state: UserState, today: string, seconds: number): number {
  const s = Math.max(0, Math.min(RULES.maxSessionSeconds, Math.round(Number.isFinite(seconds) ? seconds : 0)));
  const log = dayLog(state, today);
  log.seconds += s;
  const q = quest(state, 'minutes10');
  if (q) q.progress = Math.min(q.target, Math.floor(log.seconds / 60));
  return s;
}

function addXp(state: UserState, amount: number, reason: string, ref: string, now: Date): void {
  if (amount <= 0) return;
  state.stats.totalXp += amount;
  dayLog(state, dayKey(now)).xp += amount;
  state.xpEvents.push({ at: now.toISOString(), amount, reason, ref });
  if (state.xpEvents.length > 300) state.xpEvents = state.xpEvents.slice(-300);
  bumpQuest(state, 'xp20', amount);
}

function recordSkill(state: UserState, skill: Skill, correct: boolean): void {
  const s = state.skills[skill] ?? (state.skills[skill] = { correct: 0, total: 0 });
  s.total += 1;
  if (correct) s.correct += 1;
}

/** Tamamlanan görevleri işaretler ve ödül XP'sini verir. */
function settleQuests(state: UserState, now: Date): { completed: string[]; xp: number } {
  const completed: string[] = [];
  let xp = 0;
  for (let guard = 0; guard < 5; guard++) {
    const ready = state.quests.items.filter((q) => !q.done && q.progress >= q.target);
    if (ready.length === 0) break;
    for (const q of ready) {
      q.done = true;
      completed.push(q.code);
      xp += RULES.xpQuest;
      addXp(state, RULES.xpQuest, 'quest', q.code, now);
    }
  }
  return { completed, xp };
}

function settleBadges(state: UserState, now: Date): string[] {
  const earned: string[] = [];
  for (const badge of BADGES) {
    if (!state.badges[badge.code] && badge.earned(state)) {
      state.badges[badge.code] = now.toISOString();
      earned.push(badge.code);
    }
  }
  return earned;
}

// ---- Kilit kuralları ----
export function allUnits(curriculum: Curriculum): UnitMeta[] {
  return curriculum.levels.flatMap((l) => l.units);
}

export function unitUnlocked(state: UserState, curriculum: Curriculum, unitId: string): boolean {
  const units = allUnits(curriculum);
  const index = units.findIndex((u) => u.id === unitId);
  if (index < 0) return false;
  if (index === 0) return true;
  if (state.units[unitId]) return true; // geçilmiş, atlanmış veya denenmiş ünite açıktır
  const prev = state.units[units[index - 1].id];
  return prev?.status === 'passed' || prev?.status === 'skipped';
}

export function lessonUnlocked(state: UserState, curriculum: Curriculum, unit: UnitMeta, lessonNumber: number): boolean {
  if (!unitUnlocked(state, curriculum, unit.id)) return false;
  const done = (n: number) => state.lessons[`${unit.id}.${n}`]?.status === 'completed';
  if (lessonNumber === 1) return true;
  const isExam = lessonNumber === unit.lessons.length;
  if (isExam) {
    // Seviye tespitiyle atlanan ünitede öğrenci doğrudan ünite sınavına girebilir.
    if (state.units[unit.id]?.status === 'skipped') return true;
    return unit.lessons.slice(0, -1).every((l) => done(l.number));
  }
  return done(lessonNumber - 1);
}

// ---- Puanlama ----
function gradeAll(exercises: Exercise[], responses: Responses): ExerciseResult[] {
  const details: ExerciseResult[] = [];
  for (const ex of exercises) {
    const grade = gradeExercise(ex, responses[ex.id]);
    if (!grade.gradable) continue;
    details.push({
      id: ex.id,
      correct: grade.correct,
      expected: grade.expected,
      given: grade.given,
      prompt: exerciseLabel(ex),
      explainTr: ex.explainTr,
      skill: ex.skill,
    });
  }
  return details;
}

function unitStatusFor(score: number): UnitStatus {
  if (score >= RULES.unitPass) return 'passed';
  if (score >= RULES.unitReinforce) return 'reinforce';
  return 'failed';
}

function upsertReview(state: UserState, item: Omit<ReviewItem, 'step' | 'due' | 'status' | 'createdAt'>, today: string, now: Date, reset: boolean): boolean {
  const existing = state.reviews.find((r) => r.id === item.id);
  if (existing) {
    if (reset) {
      existing.step = 0;
      existing.due = addDays(today, SRS_INTERVALS[0]);
      existing.status = 'active';
    }
    return false;
  }
  state.reviews.push({ ...item, step: 0, due: addDays(today, SRS_INTERVALS[0]), status: 'active', createdAt: now.toISOString() });
  return true;
}

/** Dışarıdan (günlük kelime vb.) tekrar listesine kart ekler; varsa dokunmaz. */
export function addReviewItem(state: UserState, item: Omit<ReviewItem, 'step' | 'due' | 'status' | 'createdAt'>, today: string, now: Date): boolean {
  return upsertReview(state, item, today, now, false);
}

/** Bugünü aktif gün sayar (seri için). */
export function markActive(state: UserState, today: string): void {
  touchActivity(state, today);
}

// ---- Ders tamamlama ----
export function completeLesson(
  input: UserState,
  curriculum: Curriculum,
  content: LessonContent,
  responses: Responses,
  now: Date,
  seconds = 0,
): { state: UserState; result: LessonResult } {
  const today = dayKey(now);
  const state = clone(ensureDaily(input, today));
  const unit = allUnits(curriculum).find((u) => u.id === content.unitId);
  if (!unit) throw new Error('Ünite bulunamadı.');
  const lessonNumber = Number(content.code.split('.').pop());
  if (!lessonUnlocked(state, curriculum, unit, lessonNumber)) throw new Error('Bu ders henüz kilitli.');

  const details = gradeAll(content.exercises, responses);
  const total = details.length;
  const correct = details.filter((d) => d.correct).length;
  const score = total === 0 ? 100 : Math.round((100 * correct) / total);
  const isExam = content.mode === 'exam';
  const passed = score >= (isExam ? RULES.unitPass : RULES.lessonPass);

  const prev = state.lessons[content.code];
  const firstCompletion = passed && prev?.status !== 'completed';
  state.lessons[content.code] = {
    status: passed || prev?.status === 'completed' ? 'completed' : 'failed',
    bestScore: Math.max(prev?.bestScore ?? 0, score),
    attempts: (prev?.attempts ?? 0) + 1,
    completedAt: passed ? now.toISOString() : prev?.completedAt,
  };
  state.lastLesson = content.code;

  touchActivity(state, today);
  const usedSeconds = addSeconds(state, today, seconds);
  for (const d of details) recordSkill(state, d.skill, d.correct);

  let xp = 0;
  if (passed) {
    dayLog(state, today).lessons += 1;
    xp = firstCompletion
      ? (isExam ? RULES.xpExam : RULES.xpLesson) + (score >= RULES.accuracyBonusAt ? RULES.xpAccuracyBonus : 0)
      : RULES.xpRepeat;
    addXp(state, xp, isExam ? 'exam' : 'lesson', content.code, now);
    bumpQuest(state, 'lesson1');
    if (score >= RULES.accuracyBonusAt) bumpQuest(state, 'accuracy90');
  }

  let unitResult: LessonResult['unit'];
  if (isExam) {
    const status = unitStatusFor(score);
    const current = state.units[unit.id];
    // Geçilmiş bir ünitenin durumu daha düşük bir sonuçla geri alınmaz.
    if (current?.status !== 'passed') state.units[unit.id] = { status, examScore: score };
    else state.units[unit.id] = { status: 'passed', examScore: Math.max(current.examScore ?? 0, score) };
    unitResult = { id: unit.id, status: state.units[unit.id].status, score };
  }

  let vocabAdded = 0;
  if (passed && content.vocab) {
    for (const v of content.vocab) {
      if (!state.vocab[v.id]) {
        state.vocab[v.id] = { addedAt: now.toISOString() };
        vocabAdded++;
      }
      upsertReview(state, { id: `v:${v.id}`, kind: 'vocab', front: v.term, back: v.meaningTr, extra: v.exampleEn }, today, now, false);
    }
  }
  for (const d of details) {
    if (d.correct) continue;
    const ex = content.exercises.find((e) => e.id === d.id);
    if (!ex || ex.type === 'write' || ex.type === 'match') continue;
    upsertReview(state, { id: `m:${d.id}`, kind: 'mistake', front: d.prompt, back: d.expected, extra: d.explainTr }, today, now, true);
  }

  state.attempts.push({ lessonCode: content.code, at: now.toISOString(), score, correct, total, xp, seconds: usedSeconds });
  if (state.attempts.length > 300) state.attempts = state.attempts.slice(-300);

  const quests = settleQuests(state, now);
  const newBadges = settleBadges(state, now);

  return {
    state,
    result: {
      lessonCode: content.code, score, correct, total, passed, firstCompletion, xp,
      questXp: quests.xp, streak: state.stats.streak, seconds: usedSeconds, details, newBadges,
      questsCompleted: quests.completed, vocabAdded, unit: unitResult,
    },
  };
}

// ---- Hata telafisi (Duolingo'daki "hatalarını çalış" yaklaşımı) ----
/** Telafi edilecek hataların alıştırma kimlikleri (en eski önce, en fazla 10). */
export function mistakeExerciseIds(state: UserState, limit = 10): string[] {
  return state.reviews
    .filter((r) => r.kind === 'mistake' && r.status === 'active')
    .sort((a, b) => a.due.localeCompare(b.due))
    .slice(0, limit)
    .map((r) => r.id.slice(2));
}

export function completePractice(input: UserState, exercises: Exercise[], responses: Responses, now: Date, seconds = 0): { state: UserState; result: PracticeResult } {
  const today = dayKey(now);
  const state = clone(ensureDaily(input, today));
  const allowed = new Set(mistakeExerciseIds(state, 50));
  if (exercises.length === 0 || exercises.some((e) => !allowed.has(e.id))) throw new Error('Telafi edilecek geçerli bir hata bulunamadı.');
  const details = gradeAll(exercises, responses);
  const correct = details.filter((d) => d.correct).length;
  const total = details.length;
  const score = total === 0 ? 0 : Math.round((100 * correct) / total);
  touchActivity(state, today);
  const usedSeconds = addSeconds(state, today, seconds);
  for (const d of details) recordSkill(state, d.skill, d.correct);
  // Doğru cevaplanan hatanın tekrar zamanı gelmişse bir sonraki aralığa geçer.
  for (const d of details) {
    const item = state.reviews.find((r) => r.id === `m:${d.id}`);
    if (!item || item.due > today) continue;
    if (d.correct) {
      if (item.step >= SRS_INTERVALS.length - 1) item.status = 'learned';
      else { item.step += 1; item.due = addDays(today, SRS_INTERVALS[item.step]); }
    } else {
      item.step = 0;
      item.due = addDays(today, SRS_INTERVALS[0]);
    }
    item.lastReviewedAt = now.toISOString();
  }
  dayLog(state, today).practice += 1;
  const xp = Math.min(RULES.xpPracticeMax, correct * RULES.xpPracticePerCorrect);
  addXp(state, xp, 'practice', 'mistakes', now);
  bumpQuest(state, 'practice1');
  const quests = settleQuests(state, now);
  const newBadges = settleBadges(state, now);
  return { state, result: { score, correct, total, xp, seconds: usedSeconds, details, newBadges, questsCompleted: quests.completed } };
}

// ---- Dinleme odası ----
export function completeAudio(input: UserState, session: { correct: number; total: number; seconds: number }, now: Date): { state: UserState; xp: number; newBadges: string[] } {
  const today = dayKey(now);
  const total = Math.max(0, Math.min(30, Math.floor(session.total)));
  const correct = Math.max(0, Math.min(total, Math.floor(session.correct)));
  if (total === 0) throw new Error('Oturumda hiç soru cevaplanmadı.');
  const state = clone(ensureDaily(input, today));
  touchActivity(state, today);
  addSeconds(state, today, session.seconds);
  const sk = state.skills.listening;
  sk.total += total;
  sk.correct += correct;
  dayLog(state, today).audio += 1;
  addXp(state, correct, 'audio', 'audio-room', now);
  bumpQuest(state, 'audio1');
  settleQuests(state, now);
  return { state, xp: correct, newBadges: settleBadges(state, now) };
}

// ---- Aralıklı tekrar ----
export function dueReviews(state: UserState, today: string): ReviewItem[] {
  return state.reviews.filter((r) => r.status === 'active' && r.due <= today).sort((a, b) => a.due.localeCompare(b.due));
}

export function answerReview(input: UserState, itemId: string, result: ReviewResult, now: Date, seconds = 0): UserState {
  const today = dayKey(now);
  const state = clone(ensureDaily(input, today));
  const item = state.reviews.find((r) => r.id === itemId);
  if (!item) throw new Error('Tekrar öğesi bulunamadı.');
  if (item.status !== 'active' || item.due > today) throw new Error('Bu öğenin tekrar günü henüz gelmedi.');

  if (result === 'know') {
    if (item.step >= SRS_INTERVALS.length - 1) {
      item.status = 'learned';
    } else {
      item.step += 1;
      item.due = addDays(today, SRS_INTERVALS[item.step]);
    }
  } else if (result === 'hard') {
    item.due = addDays(today, SRS_INTERVALS[item.step]);
  } else {
    item.step = 0;
    item.due = addDays(today, SRS_INTERVALS[0]);
  }
  item.lastResult = result;
  item.lastReviewedAt = now.toISOString();

  touchActivity(state, today);
  addSeconds(state, today, Math.min(120, seconds));
  dayLog(state, today).reviews += 1;
  addXp(state, RULES.xpReview, 'review', itemId, now);
  bumpQuest(state, 'review10');
  settleQuests(state, now);
  settleBadges(state, now);
  return state;
}

// ---- Not defteri ----
export function saveNote(input: UserState, note: Partial<Note> & { title: string; body: string }, now: Date, newId: string): UserState {
  const state = clone(input);
  const title = note.title.trim().slice(0, 80);
  const body = note.body.trim().slice(0, 4000);
  if (!title && !body) throw new Error('Not boş olamaz.');
  const tag = (note.tag ?? '').trim().slice(0, 24);
  const existing = note.id ? state.notes.find((n) => n.id === note.id) : undefined;
  if (existing) {
    Object.assign(existing, { title, body, tag, pinned: !!note.pinned, updatedAt: now.toISOString() });
  } else {
    if (state.notes.length >= 500) throw new Error('Not sınırına ulaştın (500).');
    state.notes.unshift({ id: newId, title, body, tag, pinned: !!note.pinned, createdAt: now.toISOString(), updatedAt: now.toISOString() });
  }
  settleBadges(state, now);
  return state;
}
export function deleteNote(input: UserState, id: string): UserState {
  const state = clone(input);
  state.notes = state.notes.filter((n) => n.id !== id);
  return state;
}

// ---- Seviye tespit ----
export interface PlacementQuestion {
  id: string;
  level: LevelCode;
  prompt: string;
  options: string[];
  answer: number;
}
export interface PlacementResult {
  perLevel: Record<LevelCode, { correct: number; total: number }>;
  /** Öğrencinin çalışmaya başlayacağı seviye. */
  level: LevelCode;
  /** Yeterli bulunan (atlanacak) seviyeler. */
  mastered: LevelCode[];
}

/** Bir seviye, sorularının en az %75'i doğruysa ve alt seviyeler de yeterliyse "yeterli" sayılır. */
export function scorePlacement(questions: PlacementQuestion[], answers: Record<string, number>): PlacementResult {
  const perLevel = Object.fromEntries(LEVELS.map((l) => [l, { correct: 0, total: 0 }])) as PlacementResult['perLevel'];
  for (const q of questions) {
    perLevel[q.level].total++;
    if (answers[q.id] === q.answer) perLevel[q.level].correct++;
  }
  const mastered: LevelCode[] = [];
  let level: LevelCode = 'A1';
  for (const l of LEVELS) {
    const { correct, total } = perLevel[l];
    level = l;
    if (total > 0 && correct / total >= 0.75) mastered.push(l);
    else break;
  }
  return { perLevel, level, mastered };
}

export function applyPlacement(input: UserState, curriculum: Curriculum, result: PlacementResult | null, now: Date): UserState {
  const state = clone(input);
  state.profile.placementDone = true;
  if (result) {
    state.profile.placementLevel = result.level;
    for (const level of curriculum.levels) {
      // Son seviye (B2) hiçbir zaman tümüyle atlanmaz; B2 ünite sınavlarıyla doğrulanır.
      if (!result.mastered.includes(level.code) || level.code === result.level) continue;
      for (const unit of level.units) {
        if (!state.units[unit.id]) state.units[unit.id] = { status: 'skipped' };
      }
    }
    settleBadges(state, now);
  }
  return state;
}

// ---- AI kullanım hakkı ----
export type AiKind = 'conversation' | 'writing';

export function aiAllowance(state: UserState, kind: AiKind, today: string): { allowed: boolean; used: number; limit: number } {
  const limits = state.profile.plan === 'premium' ? RULES.premiumDailyAi : RULES.freeDailyAi;
  const used = state.ai.date === today ? state.ai[kind] : 0;
  return { allowed: used < limits[kind], used, limit: limits[kind] };
}

export function consumeAi(input: UserState, kind: AiKind, now: Date): UserState {
  const today = dayKey(now);
  const state = clone(ensureDaily(input, today));
  if (!aiAllowance(state, kind, today).allowed) throw new Error('Günlük AI kullanım hakkı doldu.');
  state.ai[kind] += 1;
  return state;
}

// ---- Özetler ve analiz ----
export function levelProgress(state: UserState, curriculum: Curriculum, level: LevelCode): { done: number; total: number } {
  const units = curriculum.levels.find((l) => l.code === level)?.units ?? [];
  const done = units.filter((u) => state.units[u.id]?.status === 'passed' || state.units[u.id]?.status === 'skipped').length;
  return { done, total: units.length };
}

/** Öğrencinin şu anki seviyesi: geçilmemiş ilk ünitenin seviyesi. */
export function currentLevel(state: UserState, curriculum: Curriculum): LevelCode {
  for (const unit of allUnits(curriculum)) {
    const s = state.units[unit.id]?.status;
    if (s !== 'passed' && s !== 'skipped') return unit.level;
  }
  return 'B2';
}

export function skillAccuracy(state: UserState): Record<Skill, number | null> {
  return Object.fromEntries(SKILLS.map((s) => {
    const v = state.skills[s];
    return [s, v && v.total > 0 ? Math.round((100 * v.correct) / v.total) : null];
  })) as Record<Skill, number | null>;
}

export function dayStats(state: UserState, day: string): DayLog {
  return state.study[day] ?? emptyDay();
}

export function totals(state: UserState) {
  const lessonsCompleted = Object.values(state.lessons).filter((l) => l.status === 'completed').length;
  const unitsPassed = Object.values(state.units).filter((u) => u.status === 'passed').length;
  const learned = state.reviews.filter((r) => r.status === 'learned').length;
  const minutes = Math.round(totalSeconds(state) / 60);
  const answered = Object.values(state.skills).reduce((n, s) => n + s.total, 0);
  const correct = Object.values(state.skills).reduce((n, s) => n + s.correct, 0);
  const reviewsDone = Object.values(state.study).reduce((n, d) => n + d.reviews, 0);
  const activeDays = Object.values(state.study).filter((d) => d.seconds > 0 || d.xp > 0).length;
  return { lessonsCompleted, unitsPassed, learned, minutes, answered, accuracy: answered ? Math.round((100 * correct) / answered) : null, reviewsDone, activeDays };
}
