// TR / EN arayüz dili düğmesi.
import { useApp } from '../lib/app.tsx';
import { applyAppearance } from '../lib/theme.ts';
import { cx } from './ui.tsx';

export function LangSwitch({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  const { state, backend, setState } = useApp();
  const a = state.profile.appearance;
  const cur = a.lang === 'en' ? 'en' : 'tr';
  const pick = async (lang: 'tr' | 'en') => {
    if (lang === cur) return;
    const next = { ...a, lang };
    applyAppearance(next);
    try { setState(await backend.saveAppearance(next)); } catch { /* görünüm yine de uygulandı */ }
  };
  return (
    <span className={cx('inline-flex rounded-full border border-line bg-panel-2 p-0.5', size === 'lg' && 'p-1')} role="group" aria-label="Dil / Language" data-no-translate>
      {(['tr', 'en'] as const).map((l) => (
        <button key={l} type="button" data-lang={l} aria-pressed={cur === l} onClick={() => void pick(l)}
          className={cx('rounded-full font-black', size === 'lg' ? 'px-5 py-2 text-sm' : 'px-2.5 py-0.5 text-xs', cur === l ? 'bg-acc text-on-acc' : 'text-fg-3 hover:text-fg')}>
          {l === 'tr' ? '🇹🇷 TR' : '🇬🇧 EN'}
        </button>
      ))}
    </span>
  );
}
