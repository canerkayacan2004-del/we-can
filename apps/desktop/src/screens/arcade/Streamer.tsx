// Yayıncı modu: canlı sohbete en doğal İngilizce cevabı süre dolmadan seç.
import { useEffect, useRef, useState } from 'react';
import { STREAM_CHAT } from '@content/games/streamer.ts';
import type { ChatItem } from '@content/games/streamer.ts';
import { Icon } from '../../components/Icon.tsx';
import { Notice, cx } from '../../components/ui.tsx';
import { useApp } from '../../lib/app.tsx';
import { playSound } from '../../lib/sound.ts';
import { speak } from '../../lib/tts.ts';
import { shuffle, useRecordGame } from './common.tsx';

const ROUND = 8;
const SECONDS = 15;
const COLORS = ['#39ff88', '#4dd8ff', '#ffc93c', '#ff7ab6', '#b06bff', '#ff9a62'];

export function Streamer() {
  const { state } = useApp();
  const best = state.games?.arcade?.streamer?.best ?? 0;
  const [items, setItems] = useState<{ item: ChatItem; options: string[] }[]>([]);
  const [phase, setPhase] = useState<'ready' | 'play' | 'done'>('ready');
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(SECONDS);
  const [viewers, setViewers] = useState(12);
  const [xp, setXp] = useState(0);
  const deadline = useRef(0);
  const { record, error } = useRecordGame();
  const cur = items[i];

  const start = () => {
    setItems(shuffle(STREAM_CHAT).slice(0, ROUND).map((item) => ({ item, options: shuffle(item.options) })));
    setI(0); setPicked(null); setScore(0); setViewers(12); setXp(0); setPhase('play');
  };
  const choose = (o: string) => {
    if (picked !== null || !cur) return;
    const ok = o === cur.item.options[0];
    setPicked(o);
    if (ok) { setScore((s) => s + 2 + (left >= 8 ? 1 : 0)); setViewers((v) => v + 3 + Math.floor(Math.random() * 4)); playSound('correct'); speak(cur.item.options[0]); }
    else { setViewers((v) => Math.max(1, v - 2)); playSound('wrong'); }
  };
  useEffect(() => {
    if (phase !== 'play' || picked !== null) return;
    deadline.current = Date.now() + SECONDS * 1000; setLeft(SECONDS);
    const t = window.setInterval(() => { const s = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)); setLeft(s); if (s <= 0) { window.clearInterval(t); setPicked(''); playSound('wrong'); } }, 250);
    return () => window.clearInterval(t);
  }, [phase, i, picked]);
  const next = () => {
    if (i + 1 >= items.length) { setPhase('done'); playSound('finish'); void record('streamer', { won: score > best, score }).then(setXp); return; }
    setI(i + 1); setPicked(null);
  };

  return (
    <section className="card card-glow" data-game="streamer">
      <div className="mb-3 flex items-center justify-between">
        <p className="section-title mb-0"><Icon name="mic" size={20} className="text-[#ff7ab6]" /> Yayıncı modu</p>
        <span className="chip bg-gold/15 text-gold">Rekor {best}</span>
      </div>
      {phase === 'ready' && (
        <div className="py-6 text-center">
          <p className="text-fg-2">Canlı yayındasın! Sohbetten gelen mesajlara en doğal İngilizce cevabı {SECONDS} saniye içinde seç.</p>
          <p className="mt-1 text-sm text-fg-3">Doğru cevaplar izleyici kazandırır, hızlı cevaplar ekstra puan.</p>
          <button className="btn btn-primary mt-5 px-10" data-action="streamer-start" onClick={start}>🔴 Yayını başlat</button>
        </div>
      )}
      {phase === 'play' && cur && (
        <div>
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="chip bg-bad/15 text-xs font-black text-bad">● CANLI · 👁 {viewers}</span>
            <span className="text-fg-3">{i + 1}/{items.length} · <b className="font-mono-num text-acc" data-streamer-score>{score} puan</b></span>
          </div>
          <div className="rounded-2xl border border-line bg-[#0b0f0d] p-4 font-mono-num text-sm" data-streamer-chat>
            {items.slice(Math.max(0, i - 2), i).map((x) => <p key={x.item.message} className="text-fg-3"><b style={{ color: COLORS[x.item.user.length % COLORS.length] }}>{x.item.user}</b>: {x.item.message}</p>)}
            <p lang="en" className="animate-pop text-base text-fg"><b style={{ color: COLORS[cur.item.user.length % COLORS.length] }}>{cur.item.user}</b>: {cur.item.message}</p>
            {picked !== null && <p className="mt-1 text-xs text-fg-3">({cur.item.tr})</p>}
          </div>
          {picked === null && <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-panel-3"><div className={cx('h-full rounded-full transition-all', left <= 5 ? 'bg-bad' : 'bg-acc')} style={{ width: `${(left / SECONDS) * 100}%` }} /></div>}
          <div className="mt-3 grid gap-2">
            {cur.options.map((o) => (
              <button key={o} type="button" lang="en" data-streamer-option={o} disabled={picked !== null} onClick={() => choose(o)}
                className={cx('option text-left', picked !== null && (o === cur.item.options[0] ? 'option-correct' : o === picked ? 'option-wrong' : 'opacity-50'))}>💬 {o}</button>
            ))}
          </div>
          {picked !== null && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-fg-2"><b className={picked === cur.item.options[0] ? 'text-acc' : 'text-bad'}>{picked === cur.item.options[0] ? 'Harika cevap!' : picked === '' ? 'Süre doldu.' : 'Daha doğalı var.'}</b> {cur.item.why}</p>
              <button className="btn btn-primary px-8" data-action="streamer-next" autoFocus onClick={next}>{i + 1 >= items.length ? 'Yayını bitir' : 'Sıradaki mesaj'}</button>
            </div>
          )}
        </div>
      )}
      {phase === 'done' && (
        <div className="py-4 text-center" data-streamer-result={score}>
          <p className="text-5xl">{score > best ? '🏆' : '🎙️'}</p>
          <p className="mt-2 text-3xl font-black text-fg">{score} puan · 👁 {viewers} izleyici</p>
          <p className="text-fg-2">{score > best ? 'Yeni rekor!' : `Rekorun: ${best}`}{xp > 0 ? ` · +${xp} XP` : ''}</p>
          <button className="btn btn-primary mt-5 px-10" onClick={start}>Yeni yayın</button>
        </div>
      )}
      {error && <div className="mt-3"><Notice tone="error">{error}</Notice></div>}
    </section>
  );
}
