import type { ReactNode } from 'react';
import { canSpeak, hasRecording, speak } from '../lib/tts.ts';
import { Icon } from './Icon.tsx';

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

/** We Can maskotu "Can": küçük, neşeli bir kıvılcım. Görseli buradan değiştirilebilir. */
const MOOD_BADGE: Record<string, string> = { cheer: '🎉', sad: '💪', think: '💭' };

/** We Can maskotu: kulaklıklı panda. Ruh hâli küçük bir rozetle gösterilir. */
export function Mascot({ mood = 'happy', size = 96, className }: { mood?: 'happy' | 'cheer' | 'sad' | 'think'; size?: number; className?: string }) {
  const badge = MOOD_BADGE[mood];
  return (
    <span className={cx('relative inline-block shrink-0', className)} style={{ width: size, height: size }} role="img" aria-label="We Can maskotu panda Can">
      <img src="assets/panda.jpg" alt="" draggable={false} width={size} height={size}
        className="h-full w-full rounded-full object-cover"
        style={{ boxShadow: `0 0 0 ${Math.max(2, size / 28)}px var(--wc-acc), 0 0 ${Math.round(size / 3)}px -${Math.round(size / 10)}px var(--wc-acc)` }} />
      {badge && size >= 56 && (
        <span className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full border border-line-2 bg-panel" style={{ width: size / 2.6, height: size / 2.6, fontSize: size / 5 }}>{badge}</span>
      )}
    </span>
  );
}

/** Kanatlı kitap simgesi + yazı. */
export function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 64 56" width={size} height={size * 0.875} className={className} aria-hidden="true">
      <g fill="none" stroke="var(--wc-acc)" strokeWidth="4.5" strokeLinejoin="round" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 4px var(--wc-acc))' }}>
        <path d="M32 50 C24 40 12 36 4 36 V10 C14 10 25 15 32 26 Z" />
        <path d="M32 50 C40 40 52 36 60 36 V10 C50 10 39 15 32 26 Z" />
        <path d="M12 18 C18 19 24 22 28 27 M52 18 C46 19 40 22 36 27" />
      </g>
    </svg>
  );
}

export function Logo({ size = 'text-2xl', mark = false }: { size?: string; mark?: boolean }) {
  return (
    <span className={cx('inline-flex items-center gap-1.5 font-black tracking-tight', size)}>
      {mark && <LogoMark size={26} />}
      <span><span className="text-fg">We</span><span className="text-acc">Can</span></span>
    </span>
  );
}

export function ProgressBar({ value, max, color = 'bg-acc', height = 'h-3' }: { value: number; max: number; color?: string; height?: string }) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.round((100 * value) / max));
  return (
    <div className={cx('w-full overflow-hidden rounded-full bg-line', height)} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className={cx('h-full rounded-full transition-all duration-500', color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function SpeakButton({ text, label = 'Dinle', slow = false }: { text: string; label?: string; slow?: boolean }) {
  if (!canSpeak() && !hasRecording(text)) return null;
  return (
    <button type="button" className="btn btn-ghost btn-sm" onClick={() => speak(text, slow ? 0.7 : 0.95)} title="Bilgisayar sesiyle oku">
      <Icon name="volume" size={16} /> {label}
    </button>
  );
}

export function Notice({ tone = 'info', children }: { tone?: 'info' | 'warn' | 'error' | 'success'; children: ReactNode }) {
  const tones = {
    info: 'border-info/40 bg-info/10 text-fg',
    warn: 'border-warn/40 bg-warn/10 text-fg',
    error: 'border-bad/40 bg-bad/10 text-fg',
    success: 'border-good/40 bg-good/10 text-fg',
  };
  return <div className={cx('rounded-2xl border px-4 py-3 text-sm leading-relaxed', tones[tone])}>{children}</div>;
}

export function PageTitle({ title, subtitle, right, icon }: { title: string; subtitle?: string; right?: ReactNode; icon?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div className="flex items-center gap-3">
        {icon && <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-acc/15 text-acc"><Icon name={icon} size={22} /></span>}
        <div>
          <h1 className="text-3xl font-black text-fg">{title}</h1>
          {subtitle && <p className="mt-0.5 text-fg-2">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className="toggle" onClick={() => onChange(!checked)}>
      <span />
    </button>
  );
}

export function StatTile({ label, value, sub, icon, tone = 'text-acc' }: { label: string; value: ReactNode; sub?: ReactNode; icon?: string; tone?: string }) {
  return (
    <div className="card flex items-center gap-4 p-4">
      {icon && <span className={cx('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-panel-3', tone)}><Icon name={icon} size={22} /></span>}
      <div className="min-w-0">
        <p className="text-sm font-semibold text-fg-3">{label}</p>
        <p className="text-2xl font-black text-fg">{value}</p>
        {sub && <p className="text-xs text-fg-3">{sub}</p>}
      </div>
    </div>
  );
}

export function formatDay(day: string): string {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
}

export function formatMinutes(seconds: number): string {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} dk`;
  return `${Math.floor(m / 60)} sa ${m % 60} dk`;
}

export function Confetti() {
  const colors = ['var(--wc-acc)', 'var(--wc-gold)', 'var(--wc-info)', 'var(--wc-bad)', '#ffffff'];
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-0 overflow-visible" aria-hidden="true">
      {Array.from({ length: 36 }, (_, i) => (
        <span
          key={i}
          className="absolute block h-2.5 w-1.5 animate-confetti rounded-sm"
          style={{ left: `${(i * 37) % 100}%`, background: colors[i % colors.length], animationDelay: `${(i % 9) * 0.07}s` }}
        />
      ))}
    </div>
  );
}
