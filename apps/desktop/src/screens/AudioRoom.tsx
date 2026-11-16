// Dinleme odası: dikte (dinle-yaz), ses ayırt etme (minimal çiftler) ve gölge konuşma.
// Ses, bilgisayarın kendi İngilizce sesiyle üretilir. Telaffuz ölçülmez.
import { useMemo, useRef, useState } from 'react';
import { normalizeAnswer } from '@core/grading.ts';
import { Icon } from '../components/Icon.tsx';
import { Notice, PageTitle, ProgressBar, cx } from '../components/ui.tsx';
import { errorMessage, useApp } from '../lib/app.tsx';
import { sentenceBank } from '../lib/content.ts';
import { playSound } from '../lib/sound.ts';
import { canSpeak, speak } from '../lib/tts.ts';

type Mode = 'dictation' | 'pairs' | 'shadow';

const PAIRS: { a: string; b: string; noteTr: string }[] = [
  { a: 'ship', b: 'sheep', noteTr: 'Kısa "ı" ile uzun "iii" farkı.' },
  { a: 'live', b: 'leave', noteTr: 'live kısa, leave uzun okunur.' },
  { a: 'full', b: 'fool', noteTr: 'full kısa "u", fool uzun "uu".' },
  { a: 'bad', b: 'bed', noteTr: 'bad ağzı daha açık "æ" ile okunur.' },
  { a: 'three', b: 'tree', noteTr: '"th" sesi: dil dişlerin arasında.' },
  { a: 'think', b: 'sink', noteTr: '"th" ile "s" farkı.' },
  { a: 'very', b: 'wary', noteTr: '"v" dişler dudakta, "w" dudaklar yuvarlak.' },
  { a: 'cat', b: 'cut', noteTr: 'cat "æ", cut kısa "ʌ".' },
  { a: 'work', b: 'walk', noteTr: 'work "ör", walk "oo" gibi.' },
  { a: 'hat', b: 'hut', noteTr: 'hat ağız açık, hut kısa "a".' },
];

const SESSION = 8;

function shuffle<T>(items: T[], seed: number): T[] {
  const out = [...items];
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function AudioRoomScreen() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [seed, setSeed] = useState(() => Date.now() % 100000);
  if (mode) return <Session key={`${mode}-${seed}`} mode={mode} seed={seed} onExit={() => { setMode(null); setSeed(Date.now() % 100000); }} />;
  const modes: { id: Mode; icon: string; title: string; text: string }[] = [
    { id: 'dictation', icon: 'pencil', title: 'Dikte', text: 'Cümleyi dinle, duyduğunu yaz. Kulağını ve yazımını birlikte çalıştırır.' },
    { id: 'pairs', icon: 'headphones', title: 'Ses ayırt etme', text: 'ship / sheep gibi birbirine benzeyen kelimelerden hangisini duyduğunu seç.' },
    { id: 'shadow', icon: 'mic', title: 'Gölge konuşma', text: 'Cümleyi dinle ve aynı ritimle yüksek sesle tekrar et. Kendini değerlendir.' },
  ];
  return (
    <div data-screen="audio">
      <PageTitle title="Dinleme odası" icon="headphones" subtitle="Her oturum 8 sorudur. Her doğru cevap 1 XP." />
      {!canSpeak() && <div className="mb-4"><Notice tone="warn">Bu bilgisayarda İngilizce ses bulunamadı. Dikte ve gölge konuşmada "metni göster" ile devam edebilirsin.</Notice></div>}
      <div className="grid gap-4 md:grid-cols-3">
        {modes.map((m) => (
          <button key={m.id} type="button" className="card cursor-pointer text-left transition-colors hover:border-acc/40" onClick={() => setMode(m.id)} data-audio-mode={m.id}>
            <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-acc/12 text-acc"><Icon name={m.icon} size={28} /></span>
            <p className="text-xl font-extrabold text-fg">{m.title}</p>
            <p className="mt-1 text-sm text-fg-2">{m.text}</p>
          </button>
        ))}
      </div>
      <p className="mt-5 text-xs text-fg-3">Sesler bilgisayarın kendi İngilizce sesiyle üretilir; gerçek insan kaydı değildir. Telaffuzun dinlenmez ve puanlanmaz.</p>
    </div>
  );
}

function Session({ mode, seed, onExit }: { mode: Mode; seed: number; onExit: () => void }) {
  const { backend, setState } = useApp();
  const items = useMemo(() => {
    if (mode === 'pairs') return shuffle(PAIRS, seed).slice(0, SESSION).map((p, i) => ({ ...p, target: i % 2 === 0 ? p.a : p.b }));
    return shuffle(sentenceBank(), seed).slice(0, SESSION);
  }, [mode, seed]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState<null | boolean>(null);
  const [correct, setCorrect] = useState(0);
  const [showText, setShowText] = useState(false);
  const [done, setDone] = useState<null | { xp: number }>(null);
  const [error, setError] = useState('');
  const started = useRef(Date.now());

  if (items.length === 0) return <div className="card"><p>Henüz dinleme cümlesi yok.</p><button className="btn btn-ghost mt-3" onClick={onExit}>Geri</button></div>;

  const item = items[index] as { en?: string; tr?: string; a?: string; b?: string; target?: string; noteTr?: string };
  const audio = mode === 'pairs' ? item.target! : item.en!;
  const total = items.length;

  const finish = async (finalCorrect: number) => {
    try {
      const out = await backend.completeAudio({ correct: finalCorrect, total, seconds: Math.round((Date.now() - started.current) / 1000) });
      setState(out.state);
      setDone({ xp: out.xp });
      playSound('finish');
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const grade = (ok: boolean) => {
    setChecked(ok);
    if (ok) setCorrect(correct + 1);
    playSound(ok ? 'correct' : 'wrong');
  };
  const next = () => {
    const finalCorrect = correct;
    if (index === total - 1) { void finish(finalCorrect); return; }
    setIndex(index + 1);
    setAnswer('');
    setChecked(null);
    setShowText(false);
  };

  if (done) {
    return (
      <div className="card mx-auto max-w-xl text-center" data-screen="audio-done">
        <p className="text-5xl">🎧</p>
        <h2 className="mt-3 text-3xl font-black text-fg">{correct} / {total} doğru</h2>
        <p className="mt-1 text-fg-2">+{done.xp} XP kazandın.</p>
        <button className="btn btn-primary mt-6" onClick={onExit}>Dinleme odasına dön</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl" data-screen="audio-session" data-mode={mode}>
      <div className="mb-5 flex items-center gap-4">
        <button className="btn btn-ghost btn-sm" onClick={onExit} aria-label="Çık"><Icon name="x" size={18} /></button>
        <div className="flex-1"><ProgressBar value={index + (checked !== null ? 1 : 0)} max={total} /></div>
        <span className="text-sm font-bold text-fg-3">{index + 1} / {total}</span>
      </div>
      <div className="card card-glow text-center">
        <p className="text-sm font-bold uppercase tracking-wide text-acc">{mode === 'dictation' ? 'Dinle ve yaz' : mode === 'pairs' ? 'Hangisini duydun?' : 'Dinle ve tekrar et'}</p>
        <div className="mt-4 flex justify-center gap-2">
          <button className="btn btn-primary" data-action="play-audio" onClick={() => speak(audio)}><Icon name="volume" size={22} /> Dinle</button>
          <button className="btn btn-ghost" onClick={() => speak(audio, 0.6)}>🐢 Yavaş</button>
          {mode !== 'pairs' && <button className="btn btn-ghost" onClick={() => setShowText(!showText)}>{showText ? 'Gizle' : 'Metni göster'}</button>}
        </div>
        {showText && mode !== 'pairs' && <p className="mt-4 text-xl font-bold text-fg">{item.en}</p>}

        {mode === 'dictation' && (
          <div className="mt-6 text-left">
            <input data-answer className={cx('field text-lg', checked === true && 'border-good', checked === false && 'border-bad')} value={answer} disabled={checked !== null} autoFocus placeholder="Duyduğunu yaz"
              onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && answer.trim() && checked === null) grade(normalizeAnswer(answer) === normalizeAnswer(item.en!)); }} />
            {checked !== null && <p className="mt-3 text-sm"><span className={checked ? 'text-good' : 'text-bad'}>{checked ? 'Doğru!' : 'Doğrusu:'}</span> <b className="text-fg">{item.en}</b> <span className="text-fg-3">— {item.tr}</span></p>}
          </div>
        )}

        {mode === 'pairs' && (
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[item.a!, item.b!].map((w) => (
              <button key={w} type="button" data-option={w} disabled={checked !== null}
                className={cx('option py-5 text-center text-2xl', checked !== null && (w === item.target ? 'option-correct' : 'opacity-50'))}
                onClick={() => grade(w === item.target)}>{w}</button>
            ))}
            {checked !== null && <p className="col-span-2 text-sm text-fg-2">{item.noteTr}</p>}
          </div>
        )}

        {mode === 'shadow' && (
          <div className="mt-6">
            <p className="text-sm text-fg-2">Cümleyi dinle, sonra aynı hız ve vurguyla <b>yüksek sesle</b> tekrar et. Ardından kendini değerlendir.</p>
            {checked === null ? (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button className="btn btn-ghost" data-answer="hard" onClick={() => grade(false)}>Zorlandım</button>
                <button className="btn btn-success" data-answer="ok" onClick={() => grade(true)}>Rahat tekrar ettim</button>
              </div>
            ) : <p className="mt-3 text-sm"><b className="text-fg">{item.en}</b> <span className="text-fg-3">— {item.tr}</span></p>}
            <p className="mt-3 text-xs text-fg-3">Bu öz değerlendirmedir; uygulama sesini dinlemez.</p>
          </div>
        )}
      </div>
      {error && <div className="mt-4"><Notice tone="error">{error}</Notice></div>}
      <div className="mt-5 flex justify-end gap-3">
        {mode === 'dictation' && checked === null && <button className="btn btn-primary" data-action="check" disabled={!answer.trim()} onClick={() => grade(normalizeAnswer(answer) === normalizeAnswer(item.en!))}>Kontrol et</button>}
        {checked !== null && <button className="btn btn-success" data-action="continue" autoFocus onClick={next}>{index === total - 1 ? 'Bitir' : 'Devam'}</button>}
      </div>
    </div>
  );
}
