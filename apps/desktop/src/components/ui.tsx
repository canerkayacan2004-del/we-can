import type { ReactNode } from 'react';
import { canSpeak, speak } from '../lib/tts.ts';
import { Icon } from './Icon.tsx';

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

/** We Can maskotu "Can": küçük, neşeli bir kıvılcım. Görseli buradan değiştirilebilir. */
export function Mascot({ mood = 'happy', size = 96, className }: { mood?: 'happy' | 'cheer' | 'sad' | 'think'; size?: number; className?: string }) {
  const mouth =
    mood === 'cheer' ? <path d="M47 68c4 9 22 9 26 0z" fill="#1d1238" />
    : mood === 'sad' ? <path d="M48 74c5-6 19-6 24 0" fill="none" stroke="#1d1238" strokeWidth="4" strokeLinecap="round" />
    : mood === 'think' ? <path d="M50 71h20" fill="none" stroke="#1d1238" strokeWidth="4" strokeLinecap="round" />
    : <path d="M48 68c5 7 19 7 24 0" fill="none" stroke="#1d1238" strokeWidth="4" strokeLinecap="round" />;
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={className} role="img" aria-label="We Can maskotu Can">
      <circle cx="60" cy="58" r="44" fill="var(--wc-acc)" opacity="0.14" />
      <path
        d="M60 8c8 15 15 18 31 19-6 14-4 23 7 34-15 4-21 11-23 27-12-8-18-8-30 0-2-16-8-23-23-27 11-11 13-20 7-34 16-1 23-4 31-19z"
        fill="#ffc83d" stroke="#c98f00" strokeWidth="4" strokeLinejoin="round"
      />
      <circle cx="47" cy="54" r="6" fill="#1d1238" />
      <circle cx="73" cy="54" r="6" fill="#1d1238" />
      <circle cx="49" cy="52" r="2" fill="#fff" />
      <circle cx="75" cy="52" r="2" fill="#fff" />
      <circle cx="38" cy="64" r="5" fill="#ff9d7a" opacity="0.7" />
      <circle cx="82" cy="64" r="5" fill="#ff9d7a" opacity="0.7" />
      {mouth}
    </svg>
  );
}

export function Logo({ size = 'text-2xl' }: { size?: string }) {
  return (
    <span className={cx('font-black tracking-tight', size)}>
      <span className="text-fg">We</span><span className="text-acc">Can</span>
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
  if (!canSpeak()) return null;
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

export function StatTile({ label, value, sub, icon, tone = 'text-acc' }: { label: string; value: ReactNode; sub?: string; icon?: string; tone?: string }) {
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
