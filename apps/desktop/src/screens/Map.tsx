import { levelProgress, unitUnlocked } from '@core/engine.ts';
import type { UnitMeta, UserState } from '@core/types.ts';
import { Icon } from '../components/Icon.tsx';
import { Notice, PageTitle, ProgressBar, cx } from '../components/ui.tsx';
import { useApp } from '../lib/app.tsx';
import { curriculum, readyUnitCount, unitHasContent } from '../lib/content.ts';

const OFFSETS = [0, 60, 100, 60, 0, -60, -100, -60];
const SCENARIO_ICON: Record<string, string> = { Seyahat: '✈️', İş: '💼', Emlak: '🏠', Sosyal: '☕', 'İş ve Emlak': '🏢' };

type NodeState = 'passed' | 'skipped' | 'current' | 'locked' | 'soon';

function nodeState(state: UserState, unit: UnitMeta): NodeState {
  const status = state.units[unit.id]?.status;
  if (status === 'passed') return 'passed';
  if (status === 'skipped') return 'skipped';
  if (!unitUnlocked(state, curriculum, unit.id)) return 'locked';
  return unitHasContent(unit.id) ? 'current' : 'soon';
}

export function MapScreen() {
  const { state, go } = useApp();
  return (
    <div data-screen="map">
      <PageTitle title="Öğrenme haritası" icon="map" subtitle="A1'den C2'ye 6 seviye, 64 ünite, 320 ders. C1 ve C2, B2 bitince açılır." />
      <div className="mb-6">
        <Notice tone="info">Şu an <b>{readyUnitCount()}</b> ünitenin alıştırmaları hazır. Diğer ünitelerin hedeflerini görebilirsin; içerikleri eklendikçe açılır.</Notice>
      </div>
      {curriculum.levels.map((level) => {
        const progress = levelProgress(state, curriculum, level.code);
        return (
          <section key={level.code} className="mb-12" data-level={level.code}>
            <div className="sticky top-0 z-10 mb-6 rounded-3xl border border-acc/40 bg-panel/95 px-6 py-4 backdrop-blur card-glow">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-fg"><span className="text-acc">{level.code}</span> · {level.name}</h2>
                  <p className="text-sm text-fg-2">{level.units.length} ünite · {level.units.length * 5} ders</p>
                </div>
                <div className="w-56">
                  <p className="mb-1 text-right text-sm font-bold text-fg-2">{progress.done} / {progress.total} ünite</p>
                  <ProgressBar value={progress.done} max={progress.total} />
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-6">
              {level.units.map((unit, i) => {
                const ns = nodeState(state, unit);
                return (
                  <div key={unit.id} style={{ transform: `translateX(${OFFSETS[i % OFFSETS.length]}px)` }} className="flex w-80 items-center gap-4">
                    <button
                      type="button"
                      data-unit={unit.id}
                      data-state={ns}
                      onClick={() => go({ name: 'unit', unitId: unit.id })}
                      title={unit.title}
                      className={cx(
                        'flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center rounded-full border-b-8 text-3xl font-black transition-transform hover:scale-105 active:translate-y-1',
                        ns === 'passed' && 'border-acc-3 bg-acc text-on-acc',
                        ns === 'skipped' && 'border-info/60 bg-info/70 text-white',
                        ns === 'current' && 'border-acc-3 bg-acc text-on-acc animate-ring',
                        ns === 'soon' && 'border-2 border-b-8 border-dashed border-line-2 bg-panel-2 text-fg-3',
                        ns === 'locked' && 'border-line bg-panel-3 text-fg-3',
                      )}
                    >
                      {ns === 'passed' ? <Icon name="check" size={34} strokeWidth={3} /> : ns === 'locked' ? <Icon name="lock" size={28} /> : ns === 'skipped' ? '⏭' : SCENARIO_ICON[unit.scenario] ?? unit.number}
                    </button>
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wide text-fg-3">Ünite {unit.number} · {unit.scenario}</p>
                      <p className="font-extrabold leading-tight text-fg">{unit.title}</p>
                      <p className={cx('text-xs', ns === 'current' ? 'text-acc' : 'text-fg-3')}>
                        {ns === 'passed' && 'Tamamlandı'}
                        {ns === 'skipped' && 'Seviye tespitiyle atlandı'}
                        {ns === 'current' && 'Başlamaya hazır'}
                        {ns === 'soon' && 'İçerik hazırlanıyor'}
                        {ns === 'locked' && 'Kilitli'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
