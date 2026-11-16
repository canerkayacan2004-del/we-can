// We Can: AI ogretmen sunucu fonksiyonuna (supabase/functions/ai-teacher/index.ts) ders verisini yazar.
// Hazir derslerdeki konusma senaryolari ve yazma gorevleri sunucuda durur; uygulama yalnizca kodunu gonderir.
// Kullanim: node scripts/build-function.mjs
import esbuild from 'esbuild';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmp = path.join(os.tmpdir(), `wecan-content-${process.pid}.mjs`);
await esbuild.build({
  entryPoints: [path.join(root, 'apps/desktop/src/lib/content.ts')],
  bundle: true, format: 'esm', platform: 'node', outfile: tmp, logLevel: 'error',
  tsconfig: path.join(root, 'tsconfig.json'),
});
const content = await import(pathToFileURL(tmp).href);
fs.rmSync(tmp, { force: true });

const scenarios = {};
const writing = {};
for (const lesson of content.allLessons()) {
  const level = lesson.unitId.split('.')[0];
  if (lesson.ai) {
    const a = lesson.ai;
    scenarios[lesson.code] = { level, titleTr: a.titleTr, situationTr: a.situationTr, teacherRoleEn: a.teacherRoleEn, openingEn: a.openingEn, goalsTr: a.goalsTr, maxTurns: a.maxTurns };
  }
  for (const ex of lesson.exercises) {
    if (ex.type === 'write') writing[ex.id] = { level, promptTr: ex.prompt };
  }
}

const file = path.join(root, 'supabase/functions/ai-teacher/index.ts');
const src = fs.readFileSync(file, 'utf8');
const start = src.indexOf('// @@DATA-START');
const end = src.indexOf('// @@DATA-END');
if (start < 0 || end < 0) throw new Error('DATA isaretleri bulunamadi');
const block = `// @@DATA-START\nconst SCENARIOS: Record<string, Scenario> = ${JSON.stringify(scenarios, null, 2)};\nconst WRITING_TASKS: Record<string, WritingTask> = ${JSON.stringify(writing, null, 2)};\n`;
fs.writeFileSync(file, src.slice(0, start) + block + src.slice(end));
console.log(`Sunucu fonksiyonu guncellendi: ${Object.keys(scenarios).length} senaryo, ${Object.keys(writing).length} yazma gorevi.`);
