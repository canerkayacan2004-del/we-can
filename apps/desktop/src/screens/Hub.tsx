// Öğrenme Merkezi: tüm ek çalışma araçları ve kaynaklar tek yerde, seviyeye göre filtrelenir.
import { useMemo, useState } from 'react';
import { currentLevel, dayKey } from '@core/engine.ts';
import { CEFR_LEVELS } from '@core/types.ts';
import type { CefrLevel } from '@core/types.ts';
import { PLAY_LIST, READ_LIST, WATCH_LIST, WORD_PACKS } from '@content/hub.ts';
import type { MediaItem, MediaKind, WordPack } from '@content/hub.ts';
import { Icon } from '../components/Icon.tsx';
import { PageTitle, SpeakButton, cx } from '../components/ui.tsx';
import { useApp } from '../lib/app.tsx';
import type { Route } from '../lib/app.tsx';
import { curriculum, phraseOfDay, todaysWords } from '../lib/content.ts';
import { speak } from '../lib/tts.ts';

export type HubTab = 'all' | 'watch' | 'read' | 'play' | 'packs';
const TABS: { id: HubTab; label: string; icon: string }[] = [
  { id: 'all', label: 'Keşfet', icon: 'sparkles' },
  { id: 'watch', label: 'Dizi & film', icon: 'play' },
  { id: 'read', label: 'Kitap & seri', icon: 'book' },
  { id: 'play', label: 'Hikayeli oyunlar', icon: 'target' },
  { id: 'packs', label: 'Kelime paketleri', icon: 'layout' },
];
const KIND_TR: Record<MediaKind, string> = { series: 'Dizi', film: 'Film', doc: 'Belgesel', book: 'Kitap', reader: 'Seviyeli okuma serisi', game: 'Oyun' };
const lvl = (l: string) => CEFR_LEVELS.indexOf(l as CefrLevel);
const fits = (m: MediaItem, level: CefrLevel | 'all') => level === 'all' || (lvl(m.from) <= lvl(level) && lvl(level) <= lvl(m.to));

export function HubScreen({ tab: initial }: { tab?: HubTab }) {
  const { state, go } = useApp();
  const mine = currentLevel(state, curriculum) as CefrLevel;
  const myLevel: CefrLevel = CEFR_LEVELS.includes(mine) ? mine : 'A1';
  const [tab, setTab] = useState<HubTab>(initial ?? 'all');
  const [level, setLevel] = useState<CefrLevel | 'all'>(myLevel);

  return (
    <div data-screen="hub" className="space-y-5">
      <PageTitle title="Öğrenme merkezi" icon="sparkles" subtitle="Kelimeler, oyunlar, dinleme, dizi-film, kitaplar ve paketler tek yerde" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-2xl border border-line bg-panel p-1" role="tablist">
          {TABS.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} data-hub-tab={t.id} onClick={() => setTab(t.id)}
              className={cx('flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold', tab === t.id ? 'bg-acc text-on-acc' : 'text-fg-2 hover:bg-panel-2')}>
              <Icon name={t.icon} size={16} /> {t.label}
            </button>
          ))}
        </div>
        {tab !== 'packs' && (
          <div className="flex flex-wrap items-center gap-1" data-level-filter>
            <span className="mr-1 text-xs font-bold text-fg-3">Seviye</span>
            {(['all', ...CEFR_LEVELS] as const).map((l) => (
              <button key={l} type="button" data-level={l} onClick={() => setLevel(l)}
                className={cx('chip text-xs font-black', level === l ? 'bg-acc/20 text-acc ring-1 ring-acc/50' : 'bg-panel-3 text-fg-2 hover:text-fg')}>
                {l === 'all' ? 'Hepsi' : l}{l === myLevel ? ' •' : ''}
              </button>
            ))}
          </div>
        )}
      </div>

      {tab === 'all' && <Explore level={level} go={go} setTab={setTab} />}
      {tab === 'watch' && <MediaGrid items={WATCH_LIST} level={level} intro="İzleme sırası önerisi: önce Türkçe altyazı, sonra İngilizce altyazı, en son altyazısız." />}
      {tab === 'read' && <MediaGrid items={READ_LIST} level={level} intro="Seviyeli okuma serileri (graded readers) öğrenenler için sadeleştirilmiştir; kendi seviyenden başla." />}
      {tab === 'play' && <MediaGrid items={PLAY_LIST} level={level} intro="Oyunun dilini ve altyazısını İngilizceye al. Hikaye seni sürükler, kelimeler kendiliğinden gelir." />}
      {tab === 'packs' && <Packs />}
    </div>
  );
}

function Explore({ level, go, setTab }: { level: CefrLevel | 'all'; go: (r: Route) => void; setTab: (t: HubTab) => void }) {
  const { state } = useApp();
  const today = dayKey(new Date());
  const words = todaysWords(state, today);
  const seen = state.dailyWords?.date === today ? state.dailyWords.seen.length : 0;
  const phrase = phraseOfDay(state, today);
  const tools: { icon: string; title: string; text: string; route: Route; data: string }[] = [
    { icon: 'sparkles', title: 'Günün 10 kelimesi', text: `${seen}/${words.length} görüldü · Türkçe anlam ve örnek cümle`, route: { name: 'daily' }, data: 'daily' },
    { icon: 'target', title: 'Oyun salonu', text: 'Wordle, hızlı tur, dikte, altyazı, hikaye…', route: { name: 'games' }, data: 'games' },
    { icon: 'headphones', title: 'Dinleme odası', text: 'Dikte, ses ayırt etme, gölge konuşma', route: { name: 'audio' }, data: 'audio' },
    { icon: 'bot', title: 'AI öğretmen', text: 'Konuşma pratiği ve yazı değerlendirme', route: { name: 'ai' }, data: 'ai' },
    { icon: 'book', title: 'Kelime defteri', text: 'Öğrendiğin tüm kelimeler', route: { name: 'vocab' }, data: 'vocab' },
    { icon: 'repeat', title: 'Akıllı tekrar', text: 'Zamanı gelen kartlar ve hatalar', route: { name: 'review' }, data: 'review' },
  ];
  const pick = (list: MediaItem[]) => list.filter((m) => fits(m, level)).slice(0, 3);
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {tools.map((t) => (
          <button key={t.data} type="button" data-hub-tool={t.data} onClick={() => go(t.route)}
            className="card flex items-center gap-4 p-4 text-left transition-colors hover:border-acc/40">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-acc/12 text-acc"><Icon name={t.icon} size={24} /></span>
            <span className="min-w-0"><span className="block font-bold text-fg">{t.title}</span><span className="block truncate text-sm text-fg-3">{t.text}</span></span>
            <Icon name="arrowRight" size={18} className="ml-auto shrink-0 text-fg-3" />
          </button>
        ))}
      </div>

      <section className="card card-glow" data-hub-phrase>
        <p className="section-title"><Icon name="sparkles" size={18} className="text-acc" /> Günün cümlesi <span className="chip ml-1 bg-panel-3 text-xs font-black text-fg-2">{phrase.level}</span></p>
        <div className="flex flex-wrap items-center gap-2">
          <p lang="en" className="text-2xl font-black text-fg">{phrase.en}</p>
          <SpeakButton text={phrase.en} label="" />
          <span className="font-semibold text-acc">— {phrase.tr}</span>
        </div>
        <p lang="en" className="mt-2 text-sm text-fg-2">{phrase.exEn} <span className="text-fg-3">({phrase.exTr})</span></p>
      </section>

      {([['watch', 'Seviyene uygun dizi & film', WATCH_LIST], ['read', 'Seviyene uygun kitap & seri', READ_LIST], ['play', 'İngilizce öğreten hikayeli oyunlar', PLAY_LIST]] as const).map(([id, title, list]) => {
        const items = pick(list);
        return (
          <section key={id} data-hub-section={id}>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="section-title mb-0">{title}</h2>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setTab(id)}>Tümünü gör <Icon name="arrowRight" size={14} /></button>
            </div>
            {items.length ? <div className="grid gap-3 md:grid-cols-3">{items.map((m) => <MediaCard key={m.id} m={m} />)}</div>
              : <p className="text-sm text-fg-3">Bu seviye için öneri yok; seviye filtresini değiştir.</p>}
          </section>
        );
      })}

      <section data-hub-section="packs">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="section-title mb-0">Kelime paketleri</h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setTab('packs')}>Aç <Icon name="arrowRight" size={14} /></button>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {WORD_PACKS.map((p) => (
            <button key={p.id} type="button" onClick={() => setTab('packs')} className="card p-4 text-left hover:border-acc/40">
              <p className="font-bold text-fg">{p.title}</p>
              <p className="text-sm text-fg-3">{p.items.length} ifade · {p.level}+</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function MediaCard({ m }: { m: MediaItem }) {
  return (
    <article className="card flex flex-col gap-2 p-4" data-media={m.id}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p lang="en" className="font-black leading-tight text-fg">{m.title}</p>
          <p className="text-xs text-fg-3">{KIND_TR[m.kind]}{m.accent !== '—' ? ` · ${m.accent} aksanı` : ''}</p>
        </div>
        <span className="chip shrink-0 bg-acc/12 text-xs font-black text-acc">{m.from === m.to ? m.from : `${m.from}–${m.to}`}</span>
      </div>
      <p className="text-sm text-fg-2">{m.why}</p>
      <p className="mt-auto rounded-xl bg-panel-2 px-3 py-2 text-xs text-fg-2"><b className="text-acc">İpucu:</b> {m.tip}</p>
    </article>
  );
}

function MediaGrid({ items, level, intro }: { items: MediaItem[]; level: CefrLevel | 'all'; intro: string }) {
  const list = useMemo(() => items.filter((m) => fits(m, level)), [items, level]);
  return (
    <div className="space-y-3">
      <p className="text-sm text-fg-2">{intro}</p>
      {list.length ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3" data-media-grid>{list.map((m) => <MediaCard key={m.id} m={m} />)}</div>
        : <p className="text-sm text-fg-3">Bu seviye için öneri yok; "Hepsi"ni seç.</p>}
    </div>
  );
}

function Packs() {
  const [open, setOpen] = useState(WORD_PACKS[0].id);
  const pack = WORD_PACKS.find((p) => p.id === open) ?? WORD_PACKS[0];
  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <div className="flex flex-col gap-2">
        {WORD_PACKS.map((p) => (
          <button key={p.id} type="button" data-pack={p.id} onClick={() => setOpen(p.id)}
            className={cx('card p-4 text-left', p.id === open ? 'border-acc/50 bg-acc/8' : 'hover:border-acc/30')}>
            <p className="font-bold text-fg">{p.title}</p>
            <p className="text-xs text-fg-3">{p.items.length} ifade · {p.level}+</p>
          </button>
        ))}
      </div>
      <PackView key={pack.id} pack={pack} />
    </div>
  );
}

function PackView({ pack }: { pack: WordPack }) {
  const [mode, setMode] = useState<'list' | 'cards'>('list');
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);
  const item = pack.items[i];
  return (
    <section className="card" data-pack-view={pack.id}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div><p className="text-lg font-black text-fg">{pack.title}</p><p className="text-sm text-fg-3">{pack.description}</p></div>
        <div className="flex gap-1">
          <button type="button" className={cx('btn btn-sm', mode === 'list' ? 'btn-primary' : 'btn-ghost')} onClick={() => setMode('list')}>Liste</button>
          <button type="button" data-action="pack-cards" className={cx('btn btn-sm', mode === 'cards' ? 'btn-primary' : 'btn-ghost')} onClick={() => { setMode('cards'); setI(0); setShown(false); }}>Kartlarla çalış</button>
        </div>
      </div>
      {mode === 'list' ? (
        <ul className="divide-y divide-line">
          {pack.items.map((it) => (
            <li key={it.en} className="flex items-start gap-3 py-2.5">
              <button type="button" title="Dinle" onClick={() => speak(it.ex ? `${it.en}. ${it.ex}` : it.en)} className="mt-0.5 rounded-lg bg-panel-3 p-1.5 text-acc hover:brightness-125"><Icon name="volume" size={16} /></button>
              <div className="min-w-0">
                <p><b lang="en" className="text-fg">{it.en}</b> <span className="text-acc">— {it.tr}</span></p>
                {it.ex && <p lang="en" className="text-sm text-fg-3">{it.ex}</p>}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mx-auto max-w-lg py-4 text-center" data-pack-card={i}>
          <p className="text-xs font-bold text-fg-3">{i + 1} / {pack.items.length}</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <p lang="en" className="text-3xl font-black text-fg">{item.en}</p>
            <SpeakButton text={item.en} label="" />
          </div>
          {shown ? (
            <div className="mt-4 animate-pop">
              <p className="text-xl font-bold text-acc" data-pack-meaning>{item.tr}</p>
              {item.ex && <p lang="en" className="mt-2 text-sm text-fg-2">{item.ex}</p>}
              <button type="button" className="btn btn-primary mt-5 px-10" data-action="pack-next"
                onClick={() => { setI((i + 1) % pack.items.length); setShown(false); }}>{i + 1 === pack.items.length ? 'Başa dön' : 'Sonraki'} <Icon name="arrowRight" size={16} /></button>
            </div>
          ) : (
            <button type="button" className="btn btn-primary mt-5 px-10" data-action="pack-reveal" autoFocus onClick={() => setShown(true)}>Anlamını göster</button>
          )}
        </div>
      )}
    </section>
  );
}
