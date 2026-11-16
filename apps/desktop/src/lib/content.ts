// İçerik kaydı: müfredat verisi ve hazır dersler.
// Yeni bir ünitenin alıştırmaları eklendiğinde yalnızca bu dosyadaki listelere eklenir.
import curriculumJson from '@content/data/curriculum.json';
import { lessonsA1U1, vocabA1U1 } from '@content/exercises/A1/unit01.ts';
import { lessonsA1U2, vocabA1U2 } from '@content/exercises/A1/unit02.ts';
import type { Curriculum, Exercise, LessonContent, LessonMeta, UnitMeta, VocabItem } from '@core/types.ts';

export const curriculum = curriculumJson as unknown as Curriculum;

const lessonList: LessonContent[] = [...lessonsA1U1, ...lessonsA1U2];
const vocabList: VocabItem[] = [...vocabA1U1, ...vocabA1U2];

const lessonMap = new Map(lessonList.map((l) => [l.code, l]));
const vocabMap = new Map(vocabList.map((v) => [v.id, v]));
const exerciseMap = new Map(lessonList.flatMap((l) => l.exercises.map((e) => [e.id, { exercise: e, lesson: l }] as const)));
const unitList: UnitMeta[] = curriculum.levels.flatMap((l) => l.units);
const unitMap = new Map(unitList.map((u) => [u.id, u]));

export function getLessonContent(code: string): LessonContent | undefined {
  return lessonMap.get(code);
}
export function getVocabItem(id: string): VocabItem | undefined {
  return vocabMap.get(id);
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
