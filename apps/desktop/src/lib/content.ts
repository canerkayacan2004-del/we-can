// İçerik kaydı: müfredat verisi ve hazır dersler.
// Yeni bir ünitenin alıştırmaları eklendiğinde yalnızca bu dosyadaki listelere eklenir.
import curriculumJson from '@content/data/curriculum.json';
import { lessonsA1U1, vocabA1U1 } from '@content/exercises/A1/unit01.ts';
import { lessonsA1U2, vocabA1U2 } from '@content/exercises/A1/unit02.ts';
import { GENERATED_LESSONS, GENERATED_VOCAB } from '@content/exercises/all.ts';
import type { Curriculum, Exercise, LessonContent, LessonMeta, UnitMeta, VocabItem } from '@core/types.ts';
import { pickDailyWords } from '@core/daily.ts';
import { LEVEL_EXAM_TYPES, currentLevel, dayKey } from '@core/engine.ts';
import type { UserState } from '@core/types.ts';
import { WORD_BANK, bankWord } from '@content/words/index.ts';
import type { BankWord } from '@content/words/index.ts';
import { PHRASES } from '@content/phrases.ts';
import type { Phrase } from '@content/phrases.ts';
import { CEFR_LEVELS } from '@core/types.ts';
import { dailyIndex } from '@core/games.ts';
import { INTERVIEW_SCENARIOS } from '@content/interview.ts';
export type { BankWord };
export { INTERVIEW_SCENARIOS };

export const curriculum = curriculumJson as unknown as Curriculum;

const lessonList: LessonContent[] = [...lessonsA1U1, ...lessonsA1U2, ...GENERATED_LESSONS];
const vocabList: VocabItem[] = [...vocabA1U1, ...vocabA1U2, ...GENERATED_VOCAB];

const lessonMap = new Map(lessonList.map((l) => [l.code, l]));
const vocabMap = new Map(vocabList.map((v) => [v.id, v]));
const exerciseMap = new Map(lessonList.flatMap((l) => l.exercises.map((e) => [e.id, { exercise: e, lesson: l }] as const)));
const unitList: UnitMeta[] = curriculum.levels.flatMap((l) => l.units);
const unitMap = new Map(unitList.map((u) => [u.id, u]));

export function getLessonContent(code: string): LessonContent | undefined {
  return lessonMap.get(code);
}
export function getVocabItem(id: string): VocabItem | undefined {
  return vocabMap.get(id) ?? bankWord(id);
}

/** Bugünün 10 kelimesi (kullanıcıya ve güne göre sabit). */
export function todaysWords(state: UserState, today = dayKey(new Date())): BankWord[] {
  // Bugün öğrenilenler hâlâ "bilinmeyen" sayılır; böylece liste gün içinde değişmez.
  const learnedToday = state.dailyWords?.date === today ? new Set(state.dailyWords.learned) : new Set<string>();
  const known = new Set(Object.keys(state.vocab).filter((id) => !learnedToday.has(id)));
  return pickDailyWords(WORD_BANK, currentLevel(state, curriculum), today, known, state.profile.createdAt);
}
export function getExercise(id: string): Exercise | undefined {
  return exerciseMap.get(id)?.exercise;
}
export function getUnit(unitId: string): UnitMeta | undefined {
  return unitMap.get(unitId);
}
export function getLessonMeta(code: string): LessonMeta | undefined {
  const unit = unitMap.get(code.split('.').slice(0, 2).join('.'));
  return unit?.lessons.find((l) => l.code === code);
}
export function allUnitsList(): UnitMeta[] {
  return unitList;
}
/** Ünitenin beş dersinin de içeriği hazır mı? */
export function unitHasContent(unitId: string): boolean {
  const unit = unitMap.get(unitId);
  return !!unit && unit.lessons.every((l) => lessonMap.has(l.code));
}
export function readyUnitCount(): number {
  return unitList.filter((u) => unitHasContent(u.id)).length;
}
/** Seviye deneme sınavı havuzu: seviyenin her ünitesi için otomatik puanlanan ders kartları (ünite sınavları hariç). */
export function levelExamPools(level: string): Exercise[][] {
  const units = curriculum.levels.find((l) => l.code === level)?.units ?? [];
  return units.map((u) => lessonList.filter((l) => l.unitId === u.id && l.mode !== 'exam').flatMap((l) => l.exercises.filter((e) => LEVEL_EXAM_TYPES.includes(e.type))));
}

/** Tüm hazır dersler (sunucu fonksiyonu verisi üretilirken de kullanılır). */
export function allLessons(): LessonContent[] {
  return lessonList;
}

export function aiScenarioLessons(): LessonContent[] {
  return lessonList.filter((l) => l.ai);
}

/** Dinleme odası için cümle bankası: hazır derslerdeki örnek cümleler. */
export function sentenceBank(): { en: string; tr: string; unitId: string }[] {
  const out: { en: string; tr: string; unitId: string }[] = [];
  const seen = new Set<string>();
  const add = (en: string, tr: string, unitId: string) => {
    const words = en.split(/\s+/).length;
    if (words < 3 || words > 9 || seen.has(en)) return;
    seen.add(en);
    out.push({ en, tr, unitId });
  };
  for (const lesson of lessonList) {
    for (const ex of lesson.exercises) {
      if (ex.type === 'info') ex.examples?.forEach((e) => add(e.en, e.tr, lesson.unitId));
      if (ex.type === 'flashcard') add(ex.exampleEn, ex.exampleTr, lesson.unitId);
    }
  }
  for (const v of vocabList) add(v.exampleEn, v.exampleTr, v.id.startsWith('a1u2') ? 'A1.2' : 'A1.1');
  return out;
}

/** Günün cümlesi: seviyene yakın (bir alt, aynı, bir üst) kalıplardan her gün biri. */
export function phraseOfDay(state: UserState, today: string): Phrase {
  const li = CEFR_LEVELS.indexOf(currentLevel(state, curriculum) as (typeof CEFR_LEVELS)[number]);
  const near = new Set(CEFR_LEVELS.filter((_, i) => li < 0 ? i <= 1 : Math.abs(i - li) <= 1));
  const pool = PHRASES.filter((p) => near.has(p.level));
  const list = pool.length ? pool : PHRASES;
  return list[dailyIndex(today, list.length)];
}
