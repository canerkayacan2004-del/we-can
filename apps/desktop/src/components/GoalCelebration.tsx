// Günlük hedef tamamlanınca bir kez gösterilen kutlama (neon konfeti + panda).
import { useEffect, useRef, useState } from 'react';
import { dayKey, dayStats } from '@core/engine.ts';
import { useApp } from '../lib/app.tsx';
import { Icon } from './Icon.tsx';
import { Mascot } from './ui.tsx';

const KEY = (userId: string) => `wecan:goal-celebrated:${userId}`;

function readMark(userId: string): string | null {
  try { return window.localStorage.getItem(KEY(userId)); } catch { return null; }
}
function writeMark(userId: string, day: string) {
  try { window.localStorage.setItem(KEY(userId), day); } catch { /* depolama kapalıysa yalnızca bu oturumda hatırlanır */ }
}

const PIECES = Array.from({ length: 70 }, (_, i) => ({
  left: (i * 53) % 100,
  delay: ((i * 7) % 20) / 10,
  dur: 2.6 + ((i * 13) % 14) / 10,
  size: 6 + ((i * 5) % 7),
  color: ['var(--wc-acc)', 'var(--wc-gold)', 'var(--wc-info)', '#ffffff', 'var(--wc-acc)'][i % 5],
  round: i % 3 === 0,
}));

export function GoalCelebration() {
  const { state, session } = useApp();
  const today = dayKey(new Date());
  const reached = dayStats(state, today).seconds >= state.profile.dailyMinutes * 60;
  const [show, setShow] = useState(false);
  const shownFor = useRef<string | null>(readMark(session.userId));

  useEffect(() => {
    // Hedef tamamlandığında her gün bir kez kutla (ders ekranı panodan ayrı olduğu için dönüşte gösterilir).
    if (reached && shownFor.current !== today) {
      shownFor.current = today;
      writeMark(session.userId, today);
      setShow(true);
    }
  }, [reached, today, session.userId]);

  useEffect(() => {
    if (!show) return;
    const t = window.setTimeout(() => setShow(false), 7000);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShow(false); };
    window.addEventListener('keydown', onKey);
    return () => { window.clearTimeout(t); window.removeEventListener('keydown', onKey); };
  }, [show]);

  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" data-goal-celebration onClick={() => setShow(false)} role="dialog" aria-label="Günlük hedef tamamlandı">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {PIECES.map((p, i) => (
          <span key={i} className="wc-fall absolute top-[-20px] block"
            style={{ left: `${p.left}%`, width: p.size, height: p.round ? p.size : p.size * 1.6, background: p.color, borderRadius: p.round ? '50%' : 2,
              boxShadow: `0 0 8px ${p.color}`, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }} />
        ))}
      </div>
      <div className="card card-glow relative mx-4 max-w-sm animate-pop p-8 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-center"><span className="wc-bounce inline-block"><Mascot mood="cheer" size={112} /></span></div>
        <h2 className="mt-5 text-2xl font-black text-fg">Günlük hedef tamam!</h2>
        <p className="mt-2 text-fg-2">Bugün <b className="text-acc">{state.profile.dailyMinutes} dakikalık</b> hedefini bitirdin. Harika gidiyorsun 🐼</p>
        <button className="btn btn-primary mt-6 w-full" data-action="close-celebration" autoFocus onClick={() => setShow(false)}>Devam <Icon name="arrowRight" size={16} /></button>
      </div>
    </div>
  );
}
