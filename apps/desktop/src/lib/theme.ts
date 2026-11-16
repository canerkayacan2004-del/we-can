import { setUiLang } from './i18n.ts';
// Tema sistemi. Renkler CSS değişkenleri olarak uygulanır; bütün ekranlar bu değişkenleri kullanır.
// Yeni tema eklemek için THEMES listesine bir kayıt eklemek yeterlidir.
import type { Appearance } from '@core/types.ts';
import { DEFAULT_APPEARANCE } from '@core/types.ts';

export interface ThemeDef {
  id: string;
  name: string;
  dark: boolean;
  /** Ek görsel efekt katmanı (neon ızgara, parlama). */
  fx?: 'neon';
  vars: {
    bg: string; panel: string; panel2: string; panel3: string; line: string; line2: string;
    fg: string; fg2: string; fg3: string; acc: string;
    good: string; bad: string; warn: string; gold: string; info: string;
  };
}

export const THEMES: ThemeDef[] = [
  { id: 'neon', name: 'Neon', dark: true, fx: 'neon', vars: { bg: '#010302', panel: '#060c09', panel2: '#0a130e', panel3: '#0f1c15', line: '#123222', line2: '#1b4a31', fg: '#eafff2', fg2: '#9cc7ae', fg3: '#5f8a72', acc: '#39ff88', good: '#39ff88', bad: '#ff4d6d', warn: '#ffc14d', gold: '#ffd84d', info: '#3de0ff' } },
  { id: 'emerald', name: 'Gece Yeşili', dark: true, vars: { bg: '#050907', panel: '#0b120f', panel2: '#101a15', panel3: '#16231c', line: '#1a2a22', line2: '#26392f', fg: '#e8f5ee', fg2: '#a1b7ab', fg3: '#687d72', acc: '#22d37a', good: '#22d37a', bad: '#ff5c6c', warn: '#ffb547', gold: '#ffc23d', info: '#4fb3ff' } },
  { id: 'midnight', name: 'Gece Mavisi', dark: true, vars: { bg: '#060912', panel: '#0c111e', panel2: '#111929', panel3: '#172136', line: '#1c2640', line2: '#2a3656', fg: '#e8eefc', fg2: '#a2adc8', fg3: '#6b7694', acc: '#4f8cff', good: '#2fd27f', bad: '#ff5c6c', warn: '#ffb547', gold: '#ffc23d', info: '#4fb3ff' } },
  { id: 'nebula', name: 'Mor Nebula', dark: true, vars: { bg: '#0a0713', panel: '#120e1f', panel2: '#19142a', panel3: '#211b36', line: '#2a2242', line2: '#392e58', fg: '#f0eafd', fg2: '#b3a8cf', fg3: '#7c7299', acc: '#a46bff', good: '#2fd27f', bad: '#ff5c7c', warn: '#ffb547', gold: '#ffc23d', info: '#59b8ff' } },
  { id: 'ember', name: 'Kor', dark: true, vars: { bg: '#0e0806', panel: '#170f0b', panel2: '#201510', panel3: '#2a1c15', line: '#33231b', line2: '#463026', fg: '#fbeee7', fg2: '#c9ada0', fg3: '#8f7568', acc: '#ff7a3d', good: '#2fd27f', bad: '#ff5c6c', warn: '#ffb547', gold: '#ffc23d', info: '#59b8ff' } },
  { id: 'amoled', name: 'Saf Siyah', dark: true, vars: { bg: '#000000', panel: '#0a0a0a', panel2: '#121212', panel3: '#1a1a1a', line: '#1f1f1f', line2: '#2e2e2e', fg: '#f2f2f2', fg2: '#a8a8a8', fg3: '#6e6e6e', acc: '#22d37a', good: '#22d37a', bad: '#ff5c6c', warn: '#ffb547', gold: '#ffc23d', info: '#4fb3ff' } },
  { id: 'light', name: 'Açık', dark: false, vars: { bg: '#eef3f0', panel: '#ffffff', panel2: '#f5f8f6', panel3: '#e9efeb', line: '#dbe4de', line2: '#c5d1ca', fg: '#0f1a14', fg2: '#46574d', fg3: '#7a8a80', acc: '#12a85c', good: '#109a52', bad: '#d93a4b', warn: '#b86f00', gold: '#c68a00', info: '#1f7ad1' } },
];

export const ACCENTS: { name: string; hex: string }[] = [
  { name: 'Neon', hex: '#39ff88' },
  { name: 'Zümrüt', hex: '#22d37a' },
  { name: 'Nane', hex: '#2ee6c5' },
  { name: 'Gök', hex: '#4f8cff' },
  { name: 'Lavanta', hex: '#a46bff' },
  { name: 'Pembe', hex: '#ff5fa2' },
  { name: 'Turuncu', hex: '#ff7a3d' },
  { name: 'Altın', hex: '#ffc23d' },
  { name: 'Kırmızı', hex: '#ff4d5e' },
];

const LAST_KEY = 'wecan.appearance.last';

function luminance(hex: string): number {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return 0.5;
  const n = parseInt(m[1], 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

export function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
}

export function themeById(id: string): ThemeDef {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function applyAppearance(appearance: Appearance): void {
  const theme = themeById(appearance.theme);
  const acc = isHexColor(appearance.accent) ? appearance.accent : theme.vars.acc;
  const root = document.documentElement;
  const v = theme.vars;
  const set = (k: string, val: string) => root.style.setProperty(k, val);
  set('--wc-bg', v.bg); set('--wc-panel', v.panel); set('--wc-panel-2', v.panel2); set('--wc-panel-3', v.panel3);
  set('--wc-line', v.line); set('--wc-line-2', v.line2);
  set('--wc-fg', v.fg); set('--wc-fg-2', v.fg2); set('--wc-fg-3', v.fg3);
  set('--wc-acc', acc);
  set('--wc-on-acc', luminance(acc) > 0.36 ? '#06120b' : '#ffffff');
  set('--wc-good', v.good); set('--wc-on-good', luminance(v.good) > 0.36 ? '#06120b' : '#ffffff');
  set('--wc-bad', v.bad); set('--wc-warn', v.warn); set('--wc-gold', v.gold); set('--wc-info', v.info);
  set('--wc-scale', String(Math.min(1.2, Math.max(0.9, appearance.scale || 1))));
  root.dataset.mode = theme.dark ? 'dark' : 'light';
  root.dataset.fx = theme.fx ?? 'none';
  root.dataset.motion = appearance.motion ? 'on' : 'off';
  root.style.colorScheme = theme.dark ? 'dark' : 'light';
  setUiLang(appearance.lang);
  try {
    localStorage.setItem(LAST_KEY, JSON.stringify(appearance));
  } catch {
    /* depolama kullanılamıyorsa görünüm yalnızca bu oturum için geçerli olur */
  }
}

/** Giriş ekranında son kullanılan görünümü uygular. */
export function applyLastAppearance(): void {
  try {
    const raw = localStorage.getItem(LAST_KEY);
    applyAppearance(raw ? { ...DEFAULT_APPEARANCE, ...JSON.parse(raw) } : DEFAULT_APPEARANCE);
  } catch {
    applyAppearance(DEFAULT_APPEARANCE);
  }
}
