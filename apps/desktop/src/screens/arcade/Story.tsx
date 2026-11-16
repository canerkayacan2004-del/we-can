// Hikaye modu: "Londra'da 7 Gün". Bölümler sırayla açılır; en az 3 yıldızla bölüm geçilir.
import { useState } from 'react';
import { STORY } from '@content/games/story.ts';
import type { StoryChapter, StoryChoice } from '@content/games/story.ts';
import { Icon } from '../../components/Icon.tsx';
import { Mascot, Notice, SpeakButton, cx } from '../../components/ui.tsx';
import { useApp } from '../../lib/app.tsx';
import { playSound } from '../../lib/sound.ts';
import { speak } from '../../lib/tts.ts';
import { shuffle, useRecordGame } from './common.tsx';

const POINTS = { best: 2, ok: 1, bad: 0 } as const;
/** Bölüm başına yıldız: 0–3. */
export function storyStars(points: number, nodes: number): number {
  const ratio = points / (nodes * 2);
  return ratio >= 0.85 ? 3 : ratio >= 0.6 ? 2 : ratio >= 0.4 ? 1 : 0;
}

export function Story() {
  const { state } = useApp();
  const done = state.games?.arcade?.story?.best ?? 0; // tamamlanan en yüksek gün
  const [chapter, setChapter] = useState<StoryChapter | null>(null);

  if (chapter) return <Chapter key={chapter.id} chapter={chapter} onExit={() => setChapter(null)} onNext={(c) => setChapter(c)} />;
  return (
    <section className="card card-glow" data-game="story">
      <p className="section-title"><Icon name="book" size={20} className="text-acc" /> Hikaye modu · Londra'da 7 Gün</p>
      <p className="mb-4 text-fg-2">Londra'ya tatile gittin. Her gün karşına çıkan insanlara en doğal İngilizce cevabı seç; iyi cevaplar hikayeyi ilerletir. Bölümü geçmek için en az 1 yıldız gerekir.</p>
      <ol className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {STORY.map((c) => {
          const open = c.day <= done + 1;
          return (
            <li key={c.id}>
              <button type="button" disabled={!open} onClick={() => setChapter(c)} data-story-chapter={c.id}
                className={cx('card flex w-full items-center gap-3 p-3 text-left', open ? 'hover:border-acc/40' : 'opacity-45', c.day <= done && 'border-acc/30')}>
                <span className="text-3xl">{open ? c.emoji : '🔒'}</span>
                <span className="min-w-0"><span className="block text-xs font-bold text-fg-3">{c.day}. gün · {c.level}</span><span className="block truncate font-bold text-fg">{c.title}</span>{c.day <= done && <span className="text-xs text-acc">✓ tamamlandı</span>}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Chapter({ chapter, onExit, onNext }: { chapter: StoryChapter; onExit: () => void; onNext: (c: StoryChapter) => void }) {
  const [i, setI] = useState(-1);
  const [choices, setChoices] = useState<StoryChoice[]>([]);
  const [picked, setPicked] = useState<StoryChoice | null>(null);
  const [points, setPoints] = useState(0);
  const [showTr, setShowTr] = useState(false);
  const [result, setResult] = useState<null | { stars: number; xp: number }>(null);
  const { record, error } = useRecordGame();
  const node = chapter.nodes[i];
  const nextChapter = STORY.find((c) => c.day === chapter.day + 1);

  const open = (k: number) => { setI(k); setPicked(null); setShowTr(false); setChoices(shuffle(chapter.nodes[k].choices)); window.setTimeout(() => speak(chapter.nodes[k].line, 0.92), 200); };
  const choose = (c: StoryChoice) => { if (picked) return; setPicked(c); setPoints((p) => p + POINTS[c.outcome]); playSound(c.outcome === 'bad' ? 'wrong' : 'correct'); if (c.reply) window.setTimeout(() => speak(c.reply!, 0.92), 300); };
  const next = async () => {
    if (i + 1 < chapter.nodes.length) return open(i + 1);
    const stars = storyStars(points, chapter.nodes.length);
    const won = stars >= 1;
    playSound(won ? 'finish' : 'wrong');
    const xp = await record('story', { won, score: won ? chapter.day : 0 });
    setResult({ stars, xp });
  };

  return (
    <section className="card card-glow" data-game="story" data-story={chapter.id}>
      <div className="mb-3 flex items-center justify-between">
        <button className="btn btn-ghost btn-sm" onClick={onExit}><Icon name="arrowLeft" size={16} /> Bölümler</button>
        <span className="text-sm text-fg-3">{chapter.emoji} {chapter.day}. gün · {chapter.title}{i >= 0 && !result ? ` · ${i + 1}/${chapter.nodes.length}` : ''}</span>
      </div>
      {i < 0 && (
        <div className="py-6 text-center">
          <p className="text-5xl">{chapter.emoji}</p>
          <p className="mt-3 text-2xl font-black text-fg">{chapter.day}. gün: {chapter.title}</p>
          <p className="mx-auto mt-2 max-w-md text-fg-2">{chapter.intro}</p>
          <button className="btn btn-primary mt-5 px-10" data-action="story-start" onClick={() => open(0)}>Başla</button>
        </div>
      )}
      {node && !result && (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-fg-3">📍 {node.scene}</p>
          <div className="flex items-start gap-3 rounded-2xl border border-line bg-panel-2 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-info/15 text-sm font-black text-info">{node.who[0]}</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-info">{node.who}</p>
              <p lang="en" className="text-lg font-semibold text-fg" data-story-line>{node.line}</p>
              {showTr || picked ? <p className="text-sm text-fg-3">{node.tr}</p> : <button className="text-xs text-fg-3 underline" onClick={() => setShowTr(true)}>Türkçesini göster</button>}
            </div>
            <SpeakButton text={node.line} label="" />
          </div>
          <div className="mt-3 grid gap-2">
            {choices.map((c) => (
              <button key={c.text} type="button" lang="en" data-story-choice={c.outcome} disabled={!!picked} onClick={() => choose(c)}
                className={cx('option text-left', picked && (c === picked ? (c.outcome === 'bad' ? 'option-wrong' : c.outcome === 'best' ? 'option-correct' : 'border-warn bg-warn/10 text-warn') : c.outcome === 'best' ? 'border-acc/40' : 'opacity-50'))}>
                <span className="mr-2">🗨️</span>{c.text}
              </button>
            ))}
          </div>
          {picked && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-panel-2 p-3">
              <div className="text-sm">
                <b className={picked.outcome === 'best' ? 'text-acc' : picked.outcome === 'ok' ? 'text-warn' : 'text-bad'}>{picked.outcome === 'best' ? 'Mükemmel! +2' : picked.outcome === 'ok' ? 'Olur ama daha iyisi var. +1' : 'Hmm… +0'}</b>
                <span className="ml-1 text-fg-2">{picked.note}</span>
                {picked.reply && <p lang="en" className="mt-1 text-fg">{node.who}: “{picked.reply}”</p>}
              </div>
              <button className="btn btn-primary px-8" data-action="story-next" autoFocus onClick={() => void next()}>{i + 1 < chapter.nodes.length ? 'Devam' : 'Günü bitir'}</button>
            </div>
          )}
        </div>
      )}
      {result && (
        <div className="py-4 text-center" data-story-result={result.stars}>
          <div className="flex justify-center"><Mascot size={96} mood={result.stars ? 'cheer' : 'sad'} /></div>
          <p className="mt-3 text-4xl tracking-widest">{'⭐'.repeat(result.stars)}{'☆'.repeat(3 - result.stars)}</p>
          <p className="mt-2 text-2xl font-black text-fg">{result.stars ? `${chapter.day}. gün tamamlandı!` : 'Bu günü tekrar dene'}</p>
          <p className="text-fg-2">{points} / {chapter.nodes.length * 2} puan{result.xp ? ` · +${result.xp} XP` : ''}</p>
          <div className="mt-5 flex justify-center gap-2">
            <button className="btn btn-ghost" onClick={() => { setResult(null); setPoints(0); open(0); }}>Tekrar oyna</button>
            {result.stars > 0 && nextChapter && <button className="btn btn-primary" data-action="story-next-chapter" onClick={() => onNext(nextChapter)}>{nextChapter.day}. güne geç <Icon name="arrowRight" size={16} /></button>}
            {result.stars > 0 && !nextChapter && <button className="btn btn-primary" onClick={onExit}>Hikayeyi bitirdin! 🎉</button>}
          </div>
        </div>
      )}
      {error && <div className="mt-3"><Notice tone="error">{error}</Notice></div>}
    </section>
  );
}
