// Üretilen bütün derslerin yapısal doğrulaması.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GENERATED_LESSONS, ALL_SPECS } from '../../../content/exercises/all.ts';
import { gradeExercise } from '../src/grading.ts';
import type { Curriculum, Exercise } from '../src/types.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const curriculum: Curriculum = JSON.parse(fs.readFileSync(path.join(here, '../../../content/data/curriculum.json'), 'utf8'));
const codes = new Set(curriculum.levels.flatMap((l) => l.units.flatMap((u) => u.lessons.map((x) => x.code))));

function correctResponse(e: Exercise): unknown {
  switch (e.type) {
    case 'mcq': case 'listen_choice': case 'dialogue': return e.answer;
    case 'truefalse': return e.answer ? 1 : 0;
    case 'fill': case 'translate': case 'listen': return e.accepted[0];
    case 'order': return e.answer;
    case 'match': return { mistakes: 0 };
    default: return null;
  }
}

test('üretilen dersler: kodlar müfredatta, kimlikler benzersiz, doğru cevaplar doğru sayılır', () => {
  const ids = new Set<string>();
  for (const l of GENERATED_LESSONS) {
    assert.ok(codes.has(l.code), `müfredatta yok: ${l.code}`);
    assert.ok(l.exercises.length >= 8, `${l.code} çok kısa (${l.exercises.length})`);
    for (const e of l.exercises) {
      assert.ok(!ids.has(e.id), `tekrar eden kimlik: ${e.id}`);
      ids.add(e.id);
      if (e.type === 'mcq' || e.type === 'listen_choice' || e.type === 'dialogue') {
        assert.ok(e.answer >= 0 && e.answer < e.options.length, `${e.id}: cevap sırası geçersiz`);
        assert.equal(new Set(e.options).size, e.options.length, `${e.id}: aynı seçenek iki kez`);
      }
      if (e.type === 'fill') assert.ok(e.text.includes('___'), `${e.id}: boşluk yok`);
      if (e.type === 'order') assert.equal([...e.tiles].sort().join(' '), e.answer.split(' ').sort().join(' '), `${e.id}: parçalar cevabı oluşturmuyor`);
      const r = correctResponse(e);
      if (r !== null) assert.equal(gradeExercise(e, r as never).correct, true, `${e.id}: doğru cevap yanlış sayıldı`);
    }
  }
  assert.equal(GENERATED_LESSONS.length, ALL_SPECS.length * 5);
});
