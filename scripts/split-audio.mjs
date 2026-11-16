// Uzun bir ses kaydını sessizliklerden bölüp her parçayı listedeki metnin adıyla kaydeder.
// Kullanım: node scripts/split-audio.mjs <kayit.mp3> <liste.txt> [--min-silence 0.45] [--noise -38]
// Liste: her satırda bir kelime/cümle, kayıttaki okunma sırasıyla. Çıktı: apps/desktop/src/assets/audio/<metin>.mp3
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const [input, listFile, ...rest] = process.argv.slice(2);
if (!input || !listFile) { console.error('Kullanım: node scripts/split-audio.mjs <kayit> <liste.txt>'); process.exit(1); }
const opt = (name, def) => { const i = rest.indexOf(name); return i >= 0 ? Number(rest[i + 1]) : def; };
const minSilence = opt('--min-silence', 0.45);
const noise = opt('--noise', -38);
const outDir = path.resolve('apps/desktop/src/assets/audio');
const key = (t) => t.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const lines = fs.readFileSync(listFile, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
const probe = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', input, '-af', `silencedetect=noise=${noise}dB:d=${minSilence}`, '-f', 'null', '-'], { encoding: 'utf8' });
const text = probe.stderr ?? '';
const starts = [...text.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]));
const ends = [...text.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));
const durMatch = /Duration: (\d+):(\d+):([\d.]+)/.exec(text);
const total = durMatch ? Number(durMatch[1]) * 3600 + Number(durMatch[2]) * 60 + Number(durMatch[3]) : Infinity;

// Konuşma parçaları = sessizliklerin arası.
const segs = [];
let cursor = 0;
for (let i = 0; i < starts.length; i++) {
  if (starts[i] - cursor > 0.12) segs.push([cursor, starts[i]]);
  cursor = ends[i] ?? total;
}
if (total - cursor > 0.12 && Number.isFinite(total)) segs.push([cursor, total]);

console.log(`${lines.length} satır, kayıtta ${segs.length} konuşma parçası bulundu.`);
if (segs.length !== lines.length) {
  console.error('Sayılar tutmuyor. --min-silence (ör. 0.3 veya 0.7) ve --noise (ör. -32 veya -45) ile tekrar dene.');
  process.exit(2);
}
fs.mkdirSync(outDir, { recursive: true });
segs.forEach(([a, b], i) => {
  const out = path.join(outDir, `${key(lines[i])}.mp3`);
  const from = Math.max(0, a - 0.08), to = b + 0.12;
  spawnSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-ss', from.toFixed(3), '-to', to.toFixed(3), '-i', input,
    '-af', 'loudnorm=I=-18:TP=-2', '-ac', '1', '-ar', '44100', '-b:a', '64k', out]);
});
console.log(`${segs.length} dosya yazıldı: ${outDir}`);
