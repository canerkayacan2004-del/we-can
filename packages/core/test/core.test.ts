// Çekirdek kuralların otomatik testleri. Çalıştırmak için: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  addDays, aiAllowance, answerReview, completeAudio, completePractice, deleteNote, migrateState, mistakeExerciseIds, saveNote, applyPlacement, completeLesson, consumeAi, dayKey, dueReviews, effectiveStreak,
  gradeExercise, lessonUnlocked, newUserState, normalizeAnswer, scorePlacement, unitUnlocked, RULES, SRS_INTERVALS, shuffleExercises, seededRng,
  pickDailyWords, markDailyWord, DAILY_WORDS_XP, scoreGuess, recordGame, scrambleWord, dailyIndex, GAMES_DAILY_XP_CAP,
} from '../src/index.ts';
import type { Curriculum, LessonContent, Responses, UserState } from '../src/index.ts';
import { lessonsA1U1 } from '../../../content/exercises/A1/unit01.ts';
import { lessonsA1U2 } from '../../../content/exercises/A1/unit02.ts';
import { placementQuestions } from '../../../content/placement.ts';
import { WORD_BANK } from '../../../content/words/index.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const curriculum: Curriculum = JSON.parse(fs.readFileSync(path.join(here, '../../../content/data/curriculum.json'), 'utf8'));
const lesson = (code: string): LessonContent => lessonsA1U1.find((l) => l.code === code)!;

/** Bir dersin bütün sorularına doğru cevap üretir; wrongCount kadarını bilerek yanlış yapar. */
function answers(content: LessonContent, wrongCount = 0): Responses {
  const res: Responses = {};
  let wrong = wrongCount;
  for (const ex of content.exercises) {
    if (ex.type === 'info' || ex.type === 'flashcard') continue;
    const bad = wrong > 0 && ex.type !== 'write';
    if (bad) wrong--;
    switch (ex.type) {
      case 'mcq': case 'listen_choice': case 'dialogue': res[ex.id] = bad ? (ex.answer + 1) % ex.options.length : ex.answer; break;
      case 'truefalse': res[ex.id] = (ex.answer ? 1 : 0) ^ (bad ? 1 : 0); break;
      case 'fill': case 'translate': case 'listen': res[ex.id] = bad ? 'zzz' : ex.accepted[0]; break;
      case 'order': res[ex.id] = bad ? 'zzz' : ex.answer; break;
      case 'match': res[ex.id] = { mistakes: bad ? 2 : 0 }; break;
      case 'write':
        res[ex.id] = "Hello. I'm Deniz. I am from Turkey. I'm a student. I have a reservation. I am 25. " +
          "This is my mother. Her name is Ayla. I've got a brother. My father has got a red car. " +
          'Where are you from? What do you do? Are you a teacher? Have you got a sister? Thank you.';
        break;
    }
  }
  return res;
}

const day1 = new Date(2026, 10, 16, 10, 0, 0);
const at = (offsetDays: number) => new Date(2026, 10, 16 + offsetDays, 10, 0, 0);

test('cevap sadeleştirme: büyük harf, noktalama ve kısaltmalar', () => {
  assert.equal(normalizeAnswer("  I'm a Teacher. "), 'i am a teacher');
  assert.equal(normalizeAnswer('She isn’t from Turkey!'), 'she is not from turkey');
});

test('alıştırma türleri doğru puanlanıyor', () => {
  const l1 = lesson('A1.1.1');
  const byId = (id: string) => l1.exercises.find((e) => e.id === id)!;
  assert.equal(gradeExercise(byId('a1u1l1-q1'), 0).correct, true);
  assert.equal(gradeExercise(byId('a1u1l1-q1'), 1).correct, false);
  assert.equal(gradeExercise(byId('a1u1l1-q6'), "'m not").correct, true);
  assert.equal(gradeExercise(byId('a1u1l1-q11'), "i'm a teacher").correct, true);
  assert.equal(gradeExercise(byId('a1u1l1-q11'), 'I teacher').correct, false);
  assert.equal(gradeExercise(byId('a1u1l1-q12'), "She's not from Turkey.").correct, true);
  assert.equal(gradeExercise(byId('a1u1l1-q9'), 'My name is Ali').correct, true);
  assert.equal(gradeExercise(byId('a1u1l1-i1'), null).gradable, false);
});

test('içerik bütünlüğü: her ders kendi cevap anahtarıyla %100 alıyor', () => {
  let state = newUserState('Test', day1);
  for (const content of [...lessonsA1U1, ...lessonsA1U2]) {
    const out = completeLesson(state, curriculum, content, answers(content), day1);
    assert.equal(out.result.score, 100, `${content.code} tam puan almalı`);
    state = out.state;
  }
  assert.equal(state.units['A1.1'].status, 'passed');
  assert.equal(state.units['A1.2'].status, 'passed');
  const ids = [...lessonsA1U1, ...lessonsA1U2].flatMap((l) => l.exercises.map((e) => e.id));
  assert.equal(new Set(ids).size, ids.length, 'bütün alıştırma kimlikleri benzersiz');
  assert.ok(lessonsA1U1.every((l) => new Set(l.exercises.map((e) => e.id)).size === l.exercises.length), 'alıştırma kimlikleri benzersiz');
});

test('ders kilidi: sırayla açılır, sınav için ilk dört ders gerekir', () => {
  const state = newUserState('Test', day1);
  const unit = curriculum.levels[0].units[0];
  assert.equal(lessonUnlocked(state, curriculum, unit, 1), true);
  assert.equal(lessonUnlocked(state, curriculum, unit, 2), false);
  assert.equal(lessonUnlocked(state, curriculum, unit, 5), false);
  assert.throws(() => completeLesson(state, curriculum, lesson('A1.1.5'), answers(lesson('A1.1.5')), day1), /kilitli/);
  assert.equal(unitUnlocked(state, curriculum, 'A1.2'), false);
});

test('XP, doğruluk bonusu, tekrar XP si ve görev ödülleri', () => {
  const s0 = newUserState('Test', day1);
  const first = completeLesson(s0, curriculum, lesson('A1.1.1'), answers(lesson('A1.1.1')), day1, 300);
  assert.equal(first.result.xp, RULES.xpLesson + RULES.xpAccuracyBonus);
  assert.ok(first.result.questsCompleted.includes('lesson1'), '"1 ders" görevi tamamlanır');
  assert.equal(first.state.stats.totalXp, 15 + RULES.xpQuest * first.result.questsCompleted.length);
  assert.equal(first.result.questXp, RULES.xpQuest * first.result.questsCompleted.length);
  assert.equal(first.state.study[dayKey(day1)].seconds, 300, 'çalışma süresi kaydedilir');
  assert.equal(first.state.study[dayKey(day1)].xp, first.state.stats.totalXp, 'günlük XP kaydı toplamla aynı');
  assert.ok(first.state.skills.grammar.total > 0, 'beceri istatistiği kaydedilir');
  assert.ok(first.result.newBadges.includes('first_lesson'));
  assert.ok(first.result.newBadges.includes('perfect_lesson'));

  const again = completeLesson(first.state, curriculum, lesson('A1.1.1'), answers(lesson('A1.1.1')), day1);
  assert.equal(again.result.xp, RULES.xpRepeat);
  assert.equal(again.result.firstCompletion, false);
});

test('başarısız ders XP vermez ve sonraki dersi açmaz; hatalar tekrar kuyruğuna girer', () => {
  const s0 = newUserState('Test', day1);
  const content = lesson('A1.1.1');
  const out = completeLesson(s0, curriculum, content, answers(content, 8), day1);
  assert.equal(out.result.passed, false);
  assert.equal(out.result.xp, 0);
  assert.equal(out.state.lessons['A1.1.1'].status, 'failed');
  assert.equal(lessonUnlocked(out.state, curriculum, curriculum.levels[0].units[0], 2), false);
  assert.equal(out.state.reviews.filter((r) => r.kind === 'mistake').length, 8);
});

test('ünite sınavı eşikleri: %80 geçer, %60–79 pekiştirme, altı başarısız', () => {
  let state = newUserState('Test', day1);
  for (const code of ['A1.1.1', 'A1.1.2', 'A1.1.3', 'A1.1.4']) state = completeLesson(state, curriculum, lesson(code), answers(lesson(code)), day1).state;
  const exam = lesson('A1.1.5'); // 11 puanlanan madde
  const r2 = completeLesson(state, curriculum, exam, answers(exam, 2), day1); // 9/11 = %82
  assert.equal(r2.result.unit?.status, 'passed');
  const r3 = completeLesson(state, curriculum, exam, answers(exam, 3), day1); // 8/11 = %73
  assert.equal(r3.result.unit?.status, 'reinforce');
  assert.equal(r3.result.xp, 0);
  const r6 = completeLesson(state, curriculum, exam, answers(exam, 6), day1); // 5/11 = %45
  assert.equal(r6.result.unit?.status, 'failed');
  assert.equal(unitUnlocked(r2.state, curriculum, 'A1.2'), true);
  assert.equal(unitUnlocked(r3.state, curriculum, 'A1.2'), false);
});

test('günlük seri: ardışık günlerde artar, gün atlanınca sıfırlanır', () => {
  let state = newUserState('Test', day1);
  state = completeLesson(state, curriculum, lesson('A1.1.1'), answers(lesson('A1.1.1')), at(0)).state;
  assert.equal(state.stats.streak, 1);
  state = completeLesson(state, curriculum, lesson('A1.1.2'), answers(lesson('A1.1.2')), at(1)).state;
  assert.equal(state.stats.streak, 2);
  assert.equal(effectiveStreak(state, dayKey(at(2))), 2);
  assert.equal(effectiveStreak(state, dayKey(at(3))), 0);
  state = completeLesson(state, curriculum, lesson('A1.1.3'), answers(lesson('A1.1.3')), at(4)).state;
  assert.equal(state.stats.streak, 1);
  assert.equal(state.stats.longestStreak, 2);
});

test('kelime dersi kelimeleri deftere ve tekrar kuyruğuna ekler', () => {
  let state = newUserState('Test', day1);
  for (const code of ['A1.1.1', 'A1.1.2']) state = completeLesson(state, curriculum, lesson(code), answers(lesson(code)), day1).state;
  const out = completeLesson(state, curriculum, lesson('A1.1.3'), answers(lesson('A1.1.3')), day1);
  assert.equal(out.result.vocabAdded, 12);
  assert.equal(Object.keys(out.state.vocab).length, 12);
  assert.equal(dueReviews(out.state, dayKey(at(0))).length, 0);
  assert.equal(dueReviews(out.state, dayKey(at(1))).length, 12);
});

test('aralıklı tekrar: 1, 3, 7, 14, 30 gün ve üç cevap türü', () => {
  assert.deepEqual(SRS_INTERVALS, [1, 3, 7, 14, 30]);
  let state: UserState = newUserState('Test', day1);
  for (const code of ['A1.1.1', 'A1.1.2', 'A1.1.3']) state = completeLesson(state, curriculum, lesson(code), answers(lesson(code)), day1).state;
  const id = 'v:a1u1-nurse';
  const item = () => state.reviews.find((r) => r.id === id)!;
  assert.throws(() => answerReview(state, id, 'know', at(0)), /henüz gelmedi/);

  let today = at(1);
  state = answerReview(state, id, 'know', today);
  assert.equal(item().step, 1);
  assert.equal(item().due, addDays(dayKey(today), 3));

  today = at(4);
  state = answerReview(state, id, 'hard', today); // aynı aralıkta kalır
  assert.equal(item().step, 1);
  assert.equal(item().due, addDays(dayKey(today), 3));

  today = at(7);
  state = answerReview(state, id, 'dont', today); // başa döner
  assert.equal(item().step, 0);
  assert.equal(item().due, addDays(dayKey(today), 1));

  // 1 → 3 → 7 → 14 → 30 → öğrenildi
  let offset = 8;
  for (const expectedNext of [3, 7, 14, 30]) {
    state = answerReview(state, id, 'know', at(offset));
    assert.equal(item().due, addDays(dayKey(at(offset)), expectedNext));
    offset += expectedNext;
  }
  state = answerReview(state, id, 'know', at(offset));
  assert.equal(item().status, 'learned');
});

test('seviye tespit: alt seviyeler yeterliyse atlanır, B2 hiçbir zaman tümüyle atlanmaz', () => {
  const all = Object.fromEntries(placementQuestions.map((q) => [q.id, q.answer]));
  const none = {};
  const upToA2 = Object.fromEntries(placementQuestions.filter((q) => q.level === 'A1' || q.level === 'A2').map((q) => [q.id, q.answer]));

  assert.equal(scorePlacement(placementQuestions, none).level, 'A1');
  const mid = scorePlacement(placementQuestions, upToA2);
  assert.equal(mid.level, 'B1');
  assert.deepEqual(mid.mastered, ['A1', 'A2']);
  const top = scorePlacement(placementQuestions, all);
  assert.equal(top.level, 'B2');

  const s = applyPlacement(newUserState('Test', day1), curriculum, mid, day1);
  assert.equal(s.units['A1.1'].status, 'skipped');
  assert.equal(s.units['A2.10'].status, 'skipped');
  assert.equal(s.units['B1.1'], undefined);
  assert.equal(unitUnlocked(s, curriculum, 'B1.1'), true);
  assert.equal(lessonUnlocked(s, curriculum, curriculum.levels[0].units[0], 5), true); // atlanan ünitede doğrudan sınav

  const t = applyPlacement(newUserState('Test', day1), curriculum, top, day1);
  assert.equal(t.units['B1.12'].status, 'skipped');
  assert.equal(t.units['B2.1'], undefined);
});

test('AI kullanım hakkı: ücretsiz planda günlük sınır, ertesi gün sıfırlanır', () => {
  let state = newUserState('Test', day1);
  const limit = RULES.freeDailyAi.conversation;
  assert.equal(aiAllowance(state, 'conversation', dayKey(day1)).limit, limit);
  for (let i = 0; i < limit; i++) {
    assert.equal(aiAllowance(state, 'conversation', dayKey(day1)).allowed, true);
    state = consumeAi(state, 'conversation', day1);
  }
  assert.equal(aiAllowance(state, 'conversation', dayKey(day1)).allowed, false);
  assert.throws(() => consumeAi(state, 'conversation', day1), /hakkı doldu/);
  assert.equal(aiAllowance(state, 'writing', dayKey(day1)).allowed, true);
  // ertesi gün sıfırlanır
  assert.equal(aiAllowance(state, 'conversation', dayKey(at(1))).allowed, true);
  state = consumeAi(state, 'conversation', at(1));
  assert.equal(state.ai.conversation, 1);
});

test('hata telafisi: yalnızca gerçek hatalar çalışılır, doğrular bir sonraki aralığa geçer', () => {
  const content = lesson('A1.1.1');
  let state = completeLesson(newUserState('Test', day1), curriculum, content, answers(content, 3), day1).state;
  const ids = mistakeExerciseIds(state);
  assert.equal(ids.length, 3);
  const exercises = content.exercises.filter((e) => ids.includes(e.id));
  assert.throws(() => completePractice(state, [content.exercises[5]].filter((e) => !ids.includes(e.id)), {}, day1), /geçerli/);
  const out = completePractice(state, exercises, answers({ ...content, exercises }), at(1), 120);
  assert.equal(out.result.correct, 3);
  assert.equal(out.result.xp, 3 * RULES.xpPracticePerCorrect);
  state = out.state;
  assert.equal(state.reviews.find((r) => r.id === `m:${ids[0]}`)!.step, 1);
  assert.equal(state.study[dayKey(at(1))].practice, 1);
  assert.ok(state.badges.practice_first);
});

test('dinleme odası ve not defteri', () => {
  let state = newUserState('Test', day1);
  const out = completeAudio(state, { correct: 4, total: 5, seconds: 90 }, day1);
  assert.equal(out.xp, 4);
  assert.equal(out.state.skills.listening.total, 5);
  assert.throws(() => completeAudio(state, { correct: 0, total: 0, seconds: 0 }, day1));
  state = saveNote(out.state, { title: 'Kısa cevaplar', body: 'Yes, I am. — kısaltma yok.' }, day1, 'n1');
  assert.equal(state.notes.length, 1);
  state = saveNote(state, { id: 'n1', title: 'Kısa cevaplar', body: 'güncel', pinned: true }, day1, 'x');
  assert.equal(state.notes[0].body, 'güncel');
  assert.equal(state.notes[0].pinned, true);
  assert.throws(() => saveNote(state, { title: ' ', body: '' }, day1, 'n2'));
  assert.equal(deleteNote(state, 'n1').notes.length, 0);
});

test('eski kayıt yükseltmesi eksik alanları doldurur', () => {
  const old = newUserState('Eski', day1) as unknown as Record<string, unknown>;
  delete old.study; delete old.skills; delete old.notes;
  (old.profile as Record<string, unknown>).appearance = undefined;
  const m = migrateState(old);
  assert.equal(m.version, 2);
  assert.deepEqual(m.study, {});
  assert.equal(m.skills.listening.total, 0);
  assert.equal(m.profile.appearance.theme, 'neon');
  assert.deepEqual(m.profile.studyDays, [0, 1, 2, 3, 4]);
  assert.deepEqual(m.profile.hobbies, []);
  // Eski varsayılan tema bir kez Neon'a geçer; sonra kullanıcının seçimine dokunulmaz.
  const chose = migrateState({ ...m, profile: { ...m.profile, appearance: { ...m.profile.appearance, theme: 'emerald' } } });
  assert.equal(chose.profile.appearance.theme, 'emerald');
  const legacy = migrateState({ ...old, profile: { ...(old.profile as object), appearance: { theme: 'emerald' } } });
  assert.equal(legacy.profile.appearance.theme, 'neon');
});

test('karıştırma: şıklar ve soru sırası karışır, puanlama özgün içerikle doğru kalır', () => {
  for (const content of [...lessonsA1U1, ...lessonsA1U2]) {
    for (let seed = 1; seed <= 5; seed++) {
      const set = shuffleExercises(content.exercises, { order: true }, seededRng(seed * 97 + content.code.length));
      assert.equal(set.exercises.length, content.exercises.length);
      assert.deepEqual(new Set(set.exercises.map((e) => e.id)), new Set(content.exercises.map((e) => e.id)));
      // Karışık ekranda doğru şıkkı seçen kullanıcı, özgün içerikte de doğru sayılmalı.
      const shownCorrect = answers({ ...content, exercises: set.exercises });
      const original = set.toOriginal(shownCorrect);
      for (const ex of content.exercises) {
        const g = gradeExercise(ex, original[ex.id] ?? null);
        if (g.gradable) assert.equal(g.correct, true, `${content.code} ${ex.id} seed ${seed}`);
      }
      // Bilgi kartları başta kalır.
      const firstNonInfo = set.exercises.findIndex((e) => e.type !== 'info');
      assert.ok(set.exercises.slice(firstNonInfo).every((e) => e.type !== 'info'));
    }
  }
  // En az bir sorunun şık sırası gerçekten değişmeli.
  const ex = lessonsA1U1[0].exercises.find((e) => e.type === 'mcq')!;
  const changed = [1, 2, 3, 4, 5, 6].some((seed) => {
    const out = shuffleExercises([ex], { order: false }, seededRng(seed)).exercises[0];
    return 'options' in out && 'options' in ex && out.options.join('|') !== ex.options.join('|');
  });
  assert.ok(changed);
});

test('kelime bankası: her seviyede yeterli kelime, eksiksiz alanlar, benzersiz kimlik', () => {
  const ids = new Set<string>();
  for (const w of WORD_BANK) {
    assert.ok(!ids.has(w.id), `tekrar eden kelime: ${w.id}`);
    ids.add(w.id);
    for (const f of [w.term, w.meaningTr, w.pos, w.exampleEn, w.exampleTr]) assert.ok(f && f.trim().length > 0, w.id);
  }
  for (const lvl of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) {
    assert.ok(WORD_BANK.filter((w) => w.level === lvl).length >= 30, `${lvl} seviyesinde en az 30 kelime`);
  }
});

test('günlük 10 kelime: 7 seviye + 3 üst seviye, gün içinde sabit, öğrenilenler atlanır, XP bir kez', () => {
  const d = '2026-11-16';
  const a = pickDailyWords(WORD_BANK, 'A2', d, new Set());
  const b = pickDailyWords(WORD_BANK, 'A2', d, new Set());
  assert.equal(a.length, 10);
  assert.deepEqual(a.map((w) => w.id), b.map((w) => w.id));
  assert.equal(a.filter((w) => w.level === 'A2').length, 7);
  assert.equal(a.filter((w) => w.level === 'B1').length, 3);
  const other = pickDailyWords(WORD_BANK, 'A2', '2026-11-17', new Set());
  assert.notDeepEqual(other.map((w) => w.id), a.map((w) => w.id));
  const known = new Set(a.slice(0, 5).map((w) => w.id));
  assert.ok(pickDailyWords(WORD_BANK, 'A2', d, known).every((w) => !known.has(w.id)));
  const c2 = pickDailyWords(WORD_BANK, 'C2', d, new Set());
  assert.equal(c2.length, 10);

  let state = newUserState('Test', day1);
  const ids = a.map((w) => w.id);
  let gained = 0;
  for (const [i, w] of a.entries()) {
    const out = markDailyWord(state, w, i % 2 === 0, ids, day1, d);
    state = out.state; gained += out.xp;
  }
  assert.equal(gained, DAILY_WORDS_XP);
  assert.equal(state.dailyWords?.learned.length, 5);
  assert.equal(Object.keys(state.vocab).length, 5);
  assert.equal(state.reviews.filter((r) => r.kind === 'vocab').length, 5);
  assert.equal(markDailyWord(state, a[0], true, ids, day1, d).xp, 0);
  assert.throws(() => markDailyWord(state, other.find((w) => !ids.includes(w.id))!, true, ids, day1, d), /listesinde değil/);
});

test('Wordle puanlaması: yerinde, var ama yeri yanlış, tekrar eden harfler', () => {
  assert.deepEqual(scoreGuess('apple', 'apple'), ['correct', 'correct', 'correct', 'correct', 'correct']);
  assert.deepEqual(scoreGuess('learn', 'renal'), ['present', 'correct', 'present', 'present', 'present']);
  // "speed" tahmini, cevap "abide": yalnızca bir "e" ve bir "d" var
  assert.deepEqual(scoreGuess('speed', 'abide'), ['absent', 'absent', 'present', 'absent', 'present']);
  // "eerie" tahmini, cevap "there": e(0) var, e(1) yok... tekrar sayısı aşılmaz
  const m = scoreGuess('eerie', 'there');
  assert.equal(m.filter((x) => x !== 'absent').length <= 3, true);
  assert.equal(m[4], 'correct');
  assert.equal(dailyIndex('2026-11-16', 142), dailyIndex('2026-11-16', 142));
  for (let i = 0; i < 20; i++) assert.notEqual(scrambleWord('apple'), 'apple');
});

test('oyun sonuçları: günlük Wordle bir kez, XP günlük sınırı', () => {
  const d = '2026-11-16';
  let state = newUserState('Test', day1);
  let out = recordGame(state, 'wordle', { won: true, tries: 3, daily: true }, day1, d);
  state = out.state;
  assert.equal(out.xp, 10);
  assert.equal(state.games?.wordle.dist[2], 1);
  assert.throws(() => recordGame(state, 'wordle', { won: true, tries: 2, daily: true }, day1, d), /zaten oynandı/);
  let total = out.xp;
  for (let i = 0; i < 30; i++) { out = recordGame(state, 'scramble', { won: true, streak: i + 1 }, day1, d); state = out.state; total += out.xp; }
  assert.equal(total, GAMES_DAILY_XP_CAP);
  assert.equal(state.games?.scramble.best, 30);
  // ertesi gün sınır sıfırlanır
  assert.equal(recordGame(state, 'scramble', { won: true }, day1, '2026-11-17').xp, 2);
});
