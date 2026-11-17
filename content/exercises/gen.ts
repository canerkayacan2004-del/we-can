// Ders oluşturucu: kısa bir ünite tanımından (UnitSpec) o ünitenin beş dersini üretir.
// Ders 1 gramer, 2 konuşma, 3 kelime ve okuma, 4 senaryo ve yazma, 5 ünite sınavı.
// Bütün cümle ve metinler ünite tanımlarında özgün olarak yazılmıştır.
import type { AiScenario, Exercise, LessonContent, Skill, VocabItem } from '../../packages/core/src/types.ts';

type Pair = [en: string, tr: string];
/** [soru, seçenekler, doğru seçenek sırası, açıklama, bağlam?] */
export type Mcq = [prompt: string, options: string[], answer: number, explainTr: string, context?: string];
/** [boşluklu cümle (___), kabul edilen cevaplar, açıklama] */
export type Fill = [text: string, accepted: string[], explainTr: string];
/** [doğru İngilizce cümle, Türkçesi] — kelimeler karıştırılıp sıralatılır */
export type Order = [sentence: string, tr: string];
/** [karşı tarafın repliği, doğru cevap, yanlış cevaplar, açıklama] */
export type Dlg = [line: string, correct: string, wrong: string[], explainTr: string];
/** [kelime, Türkçe, tür, örnek EN, örnek TR] */
export type Word = [term: string, tr: string, pos: string, exEn: string, exTr: string];
/** [başlık, durum, karşı tarafın rolü (EN), açılış repliği (EN), hedefler] */
export type Ai = [titleTr: string, situationTr: string, roleEn: string, openingEn: string, goalsTr: string[]];
/** [görev, en az cümle, zorunlu ifadeler [[seçenekler], etiket], kontrol listesi] */
export type Write = [prompt: string, minSentences: number, must: [string[], string][], checklistTr: string[]];

export interface UnitSpec {
  unit: string;
  g: { intro: string; cards: [title: string, body: string[], ex: Pair[]][]; mcq: Mcq[]; fill: Fill[]; order: Order[] };
  s: { intro: string; phrases: Pair[]; dlg: Dlg[]; tr: [tr: string, en: string[]][]; ai: Ai; write: Write };
  v: { intro: string; words: Word[]; text: string; q: Mcq[]; tf: [statement: string, answer: boolean, explainTr: string][] };
  c: { intro: string; phrases: Pair[]; dlg: Dlg[]; ai: Ai; write: Write };
  /** Sınava özel ek sorular (isteğe bağlı) */
  x?: Mcq[];
}

const strip = (s: string) => s.replace(/[.?!]+$/, '').trim();
const words = (s: string) => strip(s).split(/\s+/);
/** Belirli (rastgele olmayan) karıştırma: ünite tanımı aynıysa sonuç aynıdır. */
function rotate<T>(list: T[], by: number): T[] { const n = list.length; if (!n) return list; const k = ((by % n) + n) % n; return [...list.slice(k), ...list.slice(0, k)]; }
function hash(s: string): number { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; }

function aiOf(a: Ai, turns = 8): AiScenario {
  return { titleTr: a[0], situationTr: a[1], teacherRoleEn: a[2], openingEn: a[3], goalsTr: a[4], maxTurns: turns };
}
function writeOf(id: string, w: Write, skill: Skill = 'writing'): Exercise {
  return { id, type: 'write', skill, prompt: w[0], minSentences: w[1], mustInclude: w[2].map(([anyOf, labelTr]) => ({ anyOf, labelTr })), checklistTr: w[3] };
}
function mcqOf(id: string, m: Mcq, skill: Skill): Exercise {
  return { id, type: 'mcq', skill, prompt: m[0], options: m[1], answer: m[2], explainTr: m[3], ...(m[4] ? { context: m[4] } : {}) };
}
function fillOf(id: string, f: Fill, skill: Skill): Exercise {
  return { id, type: 'fill', skill, prompt: 'Boşluğu doldur.', text: f[0], accepted: f[1], explainTr: f[2] };
}
function orderOf(id: string, o: Order, skill: Skill): Exercise {
  const w = words(o[0]);
  const tiles = rotate(w, (hash(o[0]) % (w.length - 1)) + 1);
  return { id, type: 'order', skill, prompt: `Kelimeleri sıraya diz: "${o[1]}"`, tiles, answer: w.join(' '), explainTr: o[0] };
}
function dlgOf(id: string, d: Dlg, i: number): Exercise {
  const options = rotate([d[1], ...d[2]], i % (d[2].length + 1));
  return { id, type: 'mcq', skill: 'speaking', prompt: 'En doğal cevabı seç.', context: d[0], options, answer: options.indexOf(d[1]), explainTr: d[3] };
}
function listenOf(id: string, en: string, tr?: string): Exercise {
  return { id, type: 'listen', skill: 'listening', prompt: 'Dinle ve duyduğunu yaz.', audioText: en, accepted: [strip(en)], explainTr: tr ? `${en} = ${tr}` : en };
}
function vocabId(unit: string, term: string) {
  return `${unit.toLowerCase().replace('.', 'u')}-${term.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}

export function buildVocab(spec: UnitSpec): VocabItem[] {
  const level = spec.unit.split('.')[0];
  return spec.v.words.map(([term, tr, pos, exEn, exTr]) => ({ id: vocabId(spec.unit, term), term, meaningTr: tr, pos, exampleEn: exEn, exampleTr: exTr, topic: `${level} · ${spec.unit}` }));
}

export function buildUnit(spec: UnitSpec): LessonContent[] {
  const u = spec.unit;
  const p = (n: number) => `${u.toLowerCase().replace(/\./g, '-')}-l${n}`;
  const level = u.split('.')[0];
  const advanced = level.startsWith('B') || level.startsWith('C');

  // ---- 1. Gramer
  const g: Exercise[] = [];
  spec.g.cards.forEach(([title, body, ex], i) => g.push({ id: `${p(1)}-i${i + 1}`, type: 'info', skill: 'grammar', prompt: '', title, body, examples: ex.map(([en, tr]) => ({ en, tr })) }));
  spec.g.mcq.forEach((m, i) => g.push(mcqOf(`${p(1)}-q${i + 1}`, m, 'grammar')));
  spec.g.fill.forEach((f, i) => g.push(fillOf(`${p(1)}-f${i + 1}`, f, 'grammar')));
  spec.g.order.forEach((o, i) => g.push(orderOf(`${p(1)}-o${i + 1}`, o, 'grammar')));
  const ex1 = spec.g.cards.flatMap((c) => c[2]);
  if (ex1.length) g.push(listenOf(`${p(1)}-l1`, ex1[ex1.length - 1][0], ex1[ex1.length - 1][1]));

  // ---- 2. Konuşma
  const s: Exercise[] = [{ id: `${p(2)}-i1`, type: 'info', skill: 'speaking', prompt: '', title: 'Kullanacağın kalıplar', body: ['Bu kalıpları sesli tekrar et; konuşmada aynen kullanılır.'], examples: spec.s.phrases.map(([en, tr]) => ({ en, tr })) }];
  spec.s.dlg.forEach((d, i) => s.push(dlgOf(`${p(2)}-d${i + 1}`, d, i)));
  const ph = spec.s.phrases;
  ph.slice(0, 2).forEach(([en, tr], i) => {
    const others = ph.filter((x) => x[1] !== tr).map((x) => x[1]);
    const opts = rotate([tr, ...rotate(others, i).slice(0, 2)], i + 1);
    s.push({ id: `${p(2)}-lc${i + 1}`, type: 'listen_choice', skill: 'listening', prompt: 'Dinle: ne söylendi?', audioText: en, options: opts, answer: opts.indexOf(tr), explainTr: `${en} = ${tr}` });
  });
  spec.s.tr.forEach(([tr, en], i) => s.push({ id: `${p(2)}-t${i + 1}`, type: 'translate', skill: 'speaking', prompt: 'İngilizceye çevir.', source: tr, accepted: en, explainTr: en[0] }));
  if (ph[2]) s.push(listenOf(`${p(2)}-l1`, ph[2][0], ph[2][1]));
  s.push(writeOf(`${p(2)}-w1`, spec.s.write, 'speaking'));

  // ---- 3. Kelime ve okuma
  const vocab = buildVocab(spec);
  const v: Exercise[] = [{ id: `${p(3)}-i1`, type: 'info', skill: 'vocabulary', prompt: '', title: 'Bu dersin kelimeleri', body: [spec.v.intro, 'Kartlara göz at, sonra alıştırmalarla pekiştir. Kelimeler kelime defterine ve akıllı tekrara eklenir.'] }];
  spec.v.words.forEach(([term, tr, , exEn, exTr], i) => v.push({ id: `${p(3)}-c${i + 1}`, type: 'flashcard', skill: 'vocabulary', prompt: '', term, meaningTr: tr, exampleEn: exEn, exampleTr: exTr }));
  const W = spec.v.words;
  for (let k = 0; k + 4 <= W.length && k < 8; k += 4) v.push({ id: `${p(3)}-m${k / 4 + 1}`, type: 'match', skill: 'vocabulary', prompt: 'Kelimeyi Türkçesiyle eşleştir.', pairs: W.slice(k, k + 4).map(([t, tr]) => [t, tr] as [string, string]) });
  W.slice(0, 4).forEach(([term, tr], i) => {
    const wrong = rotate(W.filter((x) => x[1] !== tr), i + 1).slice(0, 2).map((x) => x[1]);
    const opts = rotate([tr, ...wrong], i);
    v.push({ id: `${p(3)}-q${i + 1}`, type: 'mcq', skill: 'vocabulary', prompt: `"${term}" ne demek?`, options: opts, answer: opts.indexOf(tr), explainTr: `${term} = ${tr}` });
  });
  // örnek cümlede kelimeyi boşluk yap
  let fills = 0;
  W.slice(4).forEach(([term, tr, , exEn]) => {
    if (fills >= 3) return;
    const re = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (!re.test(exEn)) return;
    fills++;
    v.push({ id: `${p(3)}-f${fills}`, type: 'fill', skill: 'vocabulary', prompt: `Boşluğu doldur (${tr}).`, text: exEn.replace(re, '___'), accepted: [term], explainTr: exEn });
  });
  if (W[1]) {
    const opts = rotate([W[1][0], ...(W[2] ? [W[2][0]] : []), ...(W[3] ? [W[3][0]] : [])], 2);
    v.push({ id: `${p(3)}-lc1`, type: 'listen_choice', skill: 'listening', prompt: 'Dinle ve duyduğun kelimeyi seç.', audioText: W[1][0], options: opts, answer: opts.indexOf(W[1][0]), explainTr: `${W[1][0]} = ${W[1][1]}` });
  }
  if (W[0]) v.push(listenOf(`${p(3)}-l1`, W[0][3], W[0][4]));
  spec.v.q.forEach((m, i) => v.push({ id: `${p(3)}-r${i + 1}`, type: 'mcq', skill: 'reading', prompt: m[0], context: spec.v.text, options: m[1], answer: m[2], explainTr: m[3] }));
  spec.v.tf.forEach(([st, ans, ex], i) => v.push({ id: `${p(3)}-tf${i + 1}`, type: 'truefalse', skill: 'reading', prompt: 'Metne göre doğru mu, yanlış mı?', context: spec.v.text, statement: st, answer: ans, explainTr: ex }));

  // ---- 4. Senaryo ve yazma
  const c: Exercise[] = [{ id: `${p(4)}-i1`, type: 'info', skill: 'speaking', prompt: '', title: 'Senaryo kalıpları', body: [spec.c.intro], examples: spec.c.phrases.map(([en, tr]) => ({ en, tr })) }];
  spec.c.dlg.forEach((d, i) => c.push(dlgOf(`${p(4)}-d${i + 1}`, d, i + 1)));
  spec.c.phrases.slice(0, 2).forEach(([en, tr], i) => c.push({ id: `${p(4)}-t${i + 1}`, type: 'translate', skill: 'speaking', prompt: 'İngilizceye çevir.', source: tr, accepted: [strip(en)], explainTr: en }));
  if (spec.c.phrases[2]) c.push(orderOf(`${p(4)}-o1`, [spec.c.phrases[2][0], spec.c.phrases[2][1]], 'speaking'));
  c.push(writeOf(`${p(4)}-w1`, spec.c.write));

  // ---- 5. Ünite sınavı (geri bildirimsiz)
  const x: Exercise[] = [];
  const gm = spec.g.mcq;
  [gm[gm.length - 1], gm[1], gm[3]].filter(Boolean).forEach((m, i) => x.push(mcqOf(`${p(5)}-g${i + 1}`, m, 'grammar')));
  spec.g.fill.slice(-1).forEach((f, i) => x.push(fillOf(`${p(5)}-f${i + 1}`, f, 'grammar')));
  spec.g.order.slice(-1).forEach((o, i) => x.push(orderOf(`${p(5)}-o${i + 1}`, o, 'grammar')));
  W.slice(-3).forEach(([term, tr], i) => {
    const wrong = rotate(W.filter((x) => x[0] !== term), i + 2).slice(0, 2).map((x) => x[0]);
    const opts = rotate([term, ...wrong], i + 1);
    x.push({ id: `${p(5)}-v${i + 1}`, type: 'mcq', skill: 'vocabulary', prompt: `"${tr}" İngilizcesi hangisi?`, options: opts, answer: opts.indexOf(term), explainTr: `${tr} = ${term}` });
  });
  spec.s.dlg.slice(-1).forEach((d, i) => x.push(dlgOf(`${p(5)}-d${i + 1}`, d, i + 2)));
  (spec.x ?? []).forEach((m, i) => x.push(mcqOf(`${p(5)}-x${i + 1}`, m, 'grammar')));
  if (spec.c.phrases[0]) x.push(listenOf(`${p(5)}-l1`, spec.c.phrases[0][0], spec.c.phrases[0][1]));
  x.push(writeOf(`${p(5)}-w1`, [`Ünite görevi: ${spec.c.write[0]}`, Math.max(spec.c.write[1], advanced ? 6 : 4), spec.c.write[2], spec.c.write[3]]));
  const qCount = x.length - 1;

  return [
    { code: `${u}.1`, unitId: u, teacher: 'grammar', mode: 'cards', introTr: spec.g.intro, exercises: g },
    { code: `${u}.2`, unitId: u, teacher: 'speaking', mode: 'conversation', introTr: spec.s.intro, ai: aiOf(spec.s.ai), exercises: s },
    { code: `${u}.3`, unitId: u, teacher: 'listening', mode: 'cards', introTr: spec.v.intro, vocab, exercises: v },
    { code: `${u}.4`, unitId: u, teacher: 'speaking', mode: 'conversation', introTr: spec.c.intro, ai: aiOf(spec.c.ai, advanced ? 10 : 8), exercises: c },
    { code: `${u}.5`, unitId: u, teacher: 'exam', mode: 'exam', introTr: `Ünite değerlendirmesi: ${qCount} soruluk mini sınav ve ünite görevi. Sınav sırasında ipucu ve düzeltme yoktur; sonuçlar en sonda gösterilir. Geçmek için %80 gerekir.`, exercises: x },
  ];
}
