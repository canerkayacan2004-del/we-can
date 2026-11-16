// Panda dolabı: XP ile açılan aksesuarlar; tıklayınca tak/çıkar.
import { useState } from 'react';
import { PANDA_GEAR } from '@core/panda.ts';
import { errorMessage, useApp } from '../lib/app.tsx';
import { Icon } from './Icon.tsx';
import { Mascot, cx } from './ui.tsx';

export function PandaWardrobe() {
  const { state, backend, setState } = useApp();
  const equipped = state.panda?.equipped ?? [];
  const xp = state.stats.totalXp;
  const [error, setError] = useState('');
  const next = PANDA_GEAR.find((g) => g.xp > xp);

  const toggle = async (id: string) => {
    const g = PANDA_GEAR.find((x) => x.id === id)!;
    const list = equipped.includes(id) ? equipped.filter((x) => x !== id) : [...equipped.filter((x) => PANDA_GEAR.find((y) => y.id === x)?.slot !== g.slot), id];
    try { setError(''); setState(await backend.setPandaGear(list)); } catch (err) { setError(errorMessage(err)); }
  };

  return (
    <section className="card" data-panda-wardrobe>
      <div className="flex flex-wrap items-center gap-6">
        <div className="px-4 pt-4"><Mascot size={110} mood="happy" /></div>
        <div className="flex-1">
          <p className="section-title mb-1">🐼 Panda dolabı</p>
          <p className="text-sm text-fg-2">XP kazandıkça yeni aksesuarlar açılır. Her bölmeye (baş, göz, boyun, el, aura) bir tane takabilirsin.</p>
          {next && <p className="mt-1 text-xs text-fg-3">Sıradaki: {next.emoji} {next.name} · {next.xp - xp} XP kaldı</p>}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {PANDA_GEAR.map((g) => {
          const open = xp >= g.xp;
          const on = equipped.includes(g.id);
          return (
            <button key={g.id} type="button" disabled={!open} data-gear={g.id} aria-pressed={on} onClick={() => void toggle(g.id)}
              className={cx('relative flex flex-col items-center gap-1 rounded-2xl border p-3 text-center transition-colors',
                on ? 'border-acc bg-acc/12 shadow-[0_0_14px_-4px_var(--wc-acc)]' : open ? 'border-line bg-panel-2 hover:border-acc/40' : 'border-line bg-panel opacity-50')}>
              <span className={cx('text-3xl', !open && 'grayscale')}>{g.emoji}</span>
              <span className="text-xs font-bold text-fg">{g.name}</span>
              <span className="text-[0.68rem] text-fg-3">{open ? (on ? 'Takılı' : 'Tak') : <><Icon name="lock" size={10} className="inline" /> {g.xp} XP</>}</span>
            </button>
          );
        })}
      </div>
      {error && <p className="mt-2 text-sm text-bad">{error}</p>}
    </section>
  );
}
