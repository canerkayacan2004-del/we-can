// content/source/curriculum/*.md dosyalarindan content/data/curriculum.json uretir.
// Mufredat metni degisirse: npm run content
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'content/source/curriculum');
const outFile = path.join(root, 'content/data/curriculum.json');

const KINDS = ['grammar', 'speaking', 'vocab', 'scenario', 'exam'];
const clean = (s) => s.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1').replace(/`/g, '').replace(/\s+/g, ' ').trim();

const levels = [];
for (const code of ['A1', 'A2', 'B1', 'B2']) {
  const md = fs.readFileSync(path.join(srcDir, `${code}.md`), 'utf8');
  const name = (md.match(/^# We Can — Müfredat: \w+ \((.+?)\)/m) || [])[1] || code;
  const summary = clean((md.match(/\*\*Seviye sonunda öğrenci:\*\*\s*(.+)/) || [])[1] || '');
  const units = [];
  const blocks = md.split(/^### /m).slice(1);
  for (const block of blocks) {
    const head = block.match(new RegExp(`^${code} Ünite (\\d+) — (.+?) · (.+?)\\n`));
    if (!head) continue;
    const number = Number(head[1]);
    const id = `${code}.${number}`;
    const gv = block.match(/\*\*Gramer:\*\*\s*(.+?)\s*·\s*\*\*Kelime:\*\*\s*(.+)/);
    const task = block.match(/\*\*Ünite görevi \([^)]+\):\*\*\s*(.+)/);
    const lessons = [];
    const rowRe = new RegExp(`^\\| ${code.replace('.', '\\.')}\\.${number}\\.(\\d) (.+?) \\| (.+?) \\| (.+?) \\|$`, 'gm');
    let m;
    while ((m = rowRe.exec(block))) {
      const n = Number(m[1]);
      lessons.push({ code: `${id}.${n}`, number: n, kind: KINDS[n - 1], title: clean(m[2]), goal: clean(m[3]), outcome: clean(m[4]) });
    }
    const unitTask = clean(task ? task[1] : '');
    lessons.push({
      code: `${id}.5`, number: 5, kind: 'exam', title: 'Tekrar ve ünite değerlendirmesi',
      goal: unitTask,
      outcome: 'Mini sınavda %80 ve üzeri alınır ve ünite görevi tamamlanır.',
    });
    if (lessons.length !== 5) throw new Error(`${id}: 5 ders bekleniyordu, ${lessons.length} bulundu`);
    units.push({ id, level: code, number, title: clean(head[2]), scenario: clean(head[3]), grammar: clean(gv ? gv[1] : ''), vocab: clean(gv ? gv[2] : ''), unitTask, lessons });
  }
  levels.push({ code, name, summary, units });
}

const unitCount = levels.reduce((n, l) => n + l.units.length, 0);
const lessonCount = levels.reduce((n, l) => n + l.units.reduce((k, u) => k + u.lessons.length, 0), 0);
if (unitCount !== 42 || lessonCount !== 210) throw new Error(`Beklenen 42 ünite / 210 ders; bulunan ${unitCount} / ${lessonCount}`);

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify({ levels }, null, 1));
console.log(`Müfredat verisi yazıldı: ${unitCount} ünite, ${lessonCount} ders -> content/data/curriculum.json`);
