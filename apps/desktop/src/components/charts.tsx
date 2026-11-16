// Hafif SVG grafikleri (harici kütüphane yok). Renkler tema değişkenlerinden gelir.
import { Icon } from './Icon.tsx';

export function Ring({ value, label, icon, size = 104 }: { value: number | null; label: string; icon?: string; size?: number }) {
  const r = size / 2 - 8;
  const c = 2 * Math.PI * r;
  const pct = value ?? 0;
  return (
    <div className="flex flex-col items-center gap-2" data-ring={label}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--wc-line)" strokeWidth="8" />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--wc-acc)" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)}
            style={{ transition: 'stroke-dashoffset .8s ease', filter: 'drop-shadow(0 0 6px color-mix(in oklab, var(--wc-acc) 55%, transparent))' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {icon && <Icon name={icon} size={18} className="text-fg-2" />}
          <span className="text-lg font-black text-fg">{value === null ? '–' : `${value}%`}</span>
        </div>
      </div>
      <span className="text-sm font-semibold text-fg-2">{label}</span>
    </div>
  );
}

export function Bars({ data, height = 120, unit = '' }: { data: { label: string; value: number; highlight?: boolean }[]; height?: number; unit?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2" style={{ height: height + 22 }}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1" title={`${d.label}: ${d.value}${unit}`}>
          <div className="flex w-full flex-1 items-end justify-center rounded-lg bg-panel-3/60">
            <div
              className="w-full max-w-7 rounded-lg transition-all duration-700"
              style={{
                height: `${Math.max(d.value > 0 ? 6 : 0, (d.value / max) * height)}px`,
                background: d.highlight ? 'var(--wc-acc)' : 'color-mix(in oklab, var(--wc-acc) 70%, transparent)',
                boxShadow: d.value > 0 ? '0 0 14px -2px color-mix(in oklab, var(--wc-acc) 60%, transparent)' : 'none',
              }}
            />
          </div>
          <span className="text-xs text-fg-3">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function LineChart({ data, height = 160 }: { data: { label: string; value: number }[]; height?: number }) {
  const w = 600;
  const pad = 8;
  const max = Math.max(1, ...data.map((d) => d.value));
  const step = data.length > 1 ? (w - pad * 2) / (data.length - 1) : 0;
  const pts = data.map((d, i) => [pad + i * step, height - pad - (d.value / max) * (height - pad * 2)] as const);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${pts[pts.length - 1]?.[0] ?? pad},${height - pad} L${pad},${height - pad} Z`;
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="wc-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--wc-acc)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--wc-acc)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => <line key={f} x1={0} x2={w} y1={height * f} y2={height * f} stroke="var(--wc-line)" strokeDasharray="4 6" />)}
        <path d={area} fill="url(#wc-area)" />
        <path d={line} fill="none" stroke="var(--wc-acc)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="mt-1 flex justify-between text-xs text-fg-3">
        <span>{data[0]?.label}</span>
        <span>{data[Math.floor(data.length / 2)]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}

export function Sparkline({ values, width = 150, height = 50 }: { values: number[]; width?: number; height?: number }) {
  const max = Math.max(1, ...values);
  const step = values.length > 1 ? width / (values.length - 1) : 0;
  const pts = values.map((v, i) => [i * step, height - 4 - (v / max) * (height - 8)]);
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke="var(--wc-acc)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" fill="var(--wc-acc)" />)}
    </svg>
  );
}
