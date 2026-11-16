// Altyazı görevi: sahnenin repliklerini dinle, doğru altyazıyı seç; sonunda zamanlı altyazı (SRT) oluşur.
import { useMemo, useState } from 'react';
import { CEFR_LEVELS } from '@core/types.ts';
import { SUB_SCENES } from '@content/games/subtitles.ts';
import type { SubScene } from '@content/games/subtitles.ts';
import { Icon } from '../../components/Icon.tsx';
import { Notice, cx } from '../../components/ui.tsx';
import { useApp } from '../../lib/app.tsx';
import { playSound } from '../../lib/sound.ts';
import { speak } from '../../lib/tts.ts';
import { shuffle, useLevel, useRecordGame } from './common.tsx';

const ts = (sec: number) => {
  const ms = Math.round(sec * 1000);
  const p = (n: number, w = 2) => String(n).padStart(w, '0');
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};
/** Okuma süresi tahmini: kelime başına ~0,38 sn + 0,7 sn pay. */
export function lineDuration(text: string) { return Math.round((text.split(/\s+/).length * 0.38 + 0.7) * 10) / 10; }
export function toSrt(lines: { text: string }[]): string {
  let t = 0.5;
  return lines.map((l, i) => { const d = lineDuration(l.text); const s = `${i + 1}\n${ts(t)} --> ${ts(t + d)}\n${l.text}\n`; t += d + 0.25; return s; }).join('\n');
}

export function Subtitles() {
  const { state } = useApp();
  const level = useLevel();
  const best = state.games?.arcade?.subtitle?.best ?? 0;
  const li = CEFR_LEVELS.indexOf(level);
  const scenes = useMemo(() => [...SUB_SCENES].sort((a, b) => Math.abs(CEFR_LEVELS.indexOf(a.level) - li) - Math.abs(CEFR_LEVELS.indexOf(b.level) - li)), [li]);
  const [scene, setScene] = useState<SubScene | null>(null);
  const [i, setI] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [xp, setXp] = useState(0);
  const [copied, setCopied] = useState(false);
  const { record, error } = useRecordGame();
  const line = scene?.lines[i];

  const openLine = (s: SubScene, k: number) => { const l = s.lines[k]; setOptions(shuffle([l.text, ...l.wrong])); setPicked(null); window.setTimeout(() => speak(l.text, 0.92), 150); };
  const start = (s: SubScene) => { setScene(s); setI(0); setScore(0); setDone(false); setXp(0); setCopied(false); openLine(s, 0); };
  const choose = (o: string) => { if (picked || !line) return; setPicked(o); const ok = o === line.text; if (ok) setScore((x) => x + 1); playSound(ok ? 'correct' : 'wrong'); };
  const next = () => {
    if (!scene) return;
    if (i + 1 >= scene.lines.length) { setDone(true); playSound('finish'); void record('subtitle', { won: score === scene.lines.length, score: score * 3 }).then(setXp); return; }
    setI(i + 1); openLine(scene, i + 1);
  };
  const srt = scene ? toSrt(scene.lines.slice(0, done ? scene.lines.length : i + (picked ? 1 : 0))) : '';

  return (
    <section className="card card-glow" data-game="subtitle">
      <div className="mb-3 flex items-center justify-between">
        <p className="section-title mb-0"><Icon name="play" size={20} className="text-info" /> Altyazı görevi</p>
        <span className="chip bg-gold/15 text-gold">Rekor {best}</span>
      </div>
      {!scene && (
        <div>
          <p className="mb-3 text-fg-2">Bir sahne seç. Her repliği dinle ve doğru altyazıyı seç; birbirine çok benzeyen seçenekler var. Sonunda zamanlı bir altyazı dosyası (SRT) oluşur.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {scenes.map((s) => (
              <button key={s.id} type="button" data-sub-scene={s.id} onClick={() => start(s)} className="card flex items-center justify-between p-4 text-left hover:border-acc/40">
                <span><b className="block text-fg">🎬 {s.title}</b><span className="text-xs text-fg-3">{s.lines.length} replik</span></span>
                <span className="chip bg-acc/12 text-xs font-black text-acc">{s.level}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {scene && (
        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          <div>
            {!done && line ? (
              <>
                <div className="relative flex aspect-video items-end justify-center overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-[#0d1a14] to-black p-4">
                  <span className="absolute left-3 top-3 chip bg-black/60 text-xs text-fg-2">🎬 {scene.title} · {i + 1}/{scene.lines.length}</span>
                  <button type="button" className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-acc/20 text-acc hover:bg-acc/30" onClick={() => speak(line.text, 0.92)} title="Tekrar dinle" data-action="sub-play"><Icon name="volume" size={28} /></button>
                  <p lang="en" className={cx('rounded bg-black/75 px-3 py-1 text-center text-lg font-semibold', picked ? (picked === line.text ? 'text-white' : 'text-bad') : 'text-white/30')} data-sub-caption>
                    <span className="text-xs text-acc">{line.who}: </span>{picked ? line.text : '…'}
                  </p>
                </div>
                <div className="mt-3 grid gap-2">
                  {options.map((o) => (
                    <button key={o} type="button" lang="en" data-sub-option={o} disabled={!!picked} onClick={() => choose(o)}
                      className={cx('option text-left', picked && (o === line.text ? 'option-correct' : o === picked ? 'option-wrong' : 'opacity-50'))}>{o}</button>
                  ))}
                </div>
                {picked && (
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-sm text-fg-2">{line.tr}</p>
                    <button className="btn btn-primary px-8" data-action="sub-next" autoFocus onClick={next}>{i + 1 >= scene.lines.length ? 'Bitir' : 'Sonraki replik'}</button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-6 text-center" data-sub-result={score}>
                <p className="text-5xl">{score === scene.lines.length ? '🏆' : '🎞️'}</p>
                <p className="mt-2 text-3xl font-black text-fg">{score} / {scene.lines.length} doğru altyazı</p>
                <p className="text-fg-2">{xp > 0 ? `+${xp} XP · ` : ''}Altyazı dosyan hazır.</p>
                <div className="mt-4 flex justify-center gap-2">
                  <button className="btn btn-ghost" onClick={() => setScene(null)}>Başka sahne</button>
                  <button className="btn btn-primary" onClick={() => { void navigator.clipboard?.writeText(srt).then(() => setCopied(true)).catch(() => {}); }}>{copied ? 'Kopyalandı ✓' : 'SRT’yi kopyala'}</button>
                </div>
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-line bg-panel-2 p-3">
            <p className="mb-2 text-xs font-bold text-fg-3">ZAMAN ÇİZELGESİ (.srt)</p>
            <pre lang="en" className="max-h-72 overflow-auto whitespace-pre-wrap font-mono-num text-xs leading-relaxed text-fg-2" data-sub-srt>{srt || 'Replikleri doğru seçtikçe burada altyazı dosyası oluşacak.'}</pre>
          </div>
        </div>
      )}
      {error && <div className="mt-3"><Notice tone="error">{error}</Notice></div>}
    </section>
  );
}
