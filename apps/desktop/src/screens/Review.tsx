// Akıllı tekrar: Anki tarzı kart tekrarı (1, 3, 7, 14, 30 gün) + hata telafisi girişi.
import { useRef, useState } from 'react';
import { SRS_INTERVALS, dayKey, dueReviews, mistakeExerciseIds } from '@core/engine.ts';
import type { ReviewResult } from '@core/types.ts';
import { Icon } from '../components/Icon.tsx';
import { Mascot, Notice, PageTitle, ProgressBar, SpeakButton, StatTile, cx, formatDay } from '../components/ui.tsx';
import { errorMessage, useApp } from '../lib/app.tsx';
import { playSound } from '../lib/sound.ts';
import { speak } from '../lib/tts.ts';

export function ReviewScreen() {
  const { state, backend, setState, go } = useApp();
  const today = dayKey(new Date());
  const due = dueReviews(state, today);
  const mistakes = mistakeExerciseIds(state).length;
  const [revealed, setRevealed] = useState(false);
  const [doneCount, setDoneCount] = useState(0);
  const [error, setError] = useState('');
  const shownAt = useRef(Date.now());

  const active = state.reviews.filter((r) => r.status === 'active');
  const learned = state.reviews.filter((r) => r.status === 'learned').length;
  const upcoming = active.filter((r) => r.due > today).sort((a, b) => a.due.localeCompare(b.due));
  const stepCounts = SRS_INTERVALS.map((_, i) => active.filter((r) => r.step === i).length);

  const answer = async (result: ReviewResult) => {
    try {
      const seconds = Math.round((Date.now() - shownAt.current) / 1000);
      setState(await backend.answerReview(due[0].id, result, seconds));
      playSound(result === 'dont' ? 'wrong' : 'correct');
      setRevealed(false);
      setDoneCount(doneCount + 1);
      shownAt.current = Date.now();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <div data-screen="review">
      <PageTitle title="Akıllı tekrar" icon="repeat" subtitle={`Aralıklı tekrar: ${SRS_INTERVALS.join(', ')} gün. Bildiğin kart bir sonraki aralığa geçer.`} />
      <div className="mb-5 grid gap-4 md:grid-cols-4">
        <StatTile label="Bugün" value={<span data-stat="due">{due.length}</span>} icon="calendar" tone="text-bad" />
        <StatTile label="Sırada" value={upcoming.length} icon="clock" />
        <StatTile label="Öğrenildi" value={learned} icon="check" tone="text-good" />
        <StatTile label="Telafi bekleyen hata" value={<span data-stat="mistakes">{mistakes}</span>} icon="wrench" tone="text-warn" />
      </div>
      {error && <div className="mb-4"><Notice tone="error">{error}</Notice></div>}

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {due.length > 0 ? (
          <div className="card card-glow text-center" data-review-item={due[0].id}>
            <div className="mb-4"><ProgressBar value={doneCount} max={doneCount + due.length} /></div>
            <p className="text-xs font-bold uppercase tracking-wide text-fg-3">{due[0].kind === 'vocab' ? 'Kelime' : 'Önceki hatan'} · {SRS_INTERVALS[due[0].step]} günlük basamak</p>
            <p className="mt-4 whitespace-pre-line text-3xl font-black text-fg">{due[0].front}</p>
            {due[0].kind === 'vocab' && <div className="mt-3 flex justify-center"><SpeakButton text={due[0].front} /></div>}
            {!revealed ? (
              <button className="btn btn-primary mt-6 w-full" data-action="reveal" onClick={() => { setRevealed(true); if (due[0].kind === 'vocab' && due[0].extra) speak(due[0].extra); }}>Cevabı göster</button>
            ) : (
              <div className="animate-pop">
                <div className="mt-5 rounded-2xl bg-good/10 px-4 py-4">
                  <p className="text-2xl font-extrabold text-good">{due[0].back}</p>
                  {due[0].extra && <p className="mt-1 text-fg-2">{due[0].extra}</p>}
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  <button className="btn btn-danger flex-col gap-0" data-answer="dont" onClick={() => answer('dont')}>Bilmiyorum<span className="text-xs font-normal opacity-80">1 gün</span></button>
                  <button className="btn btn-sun flex-col gap-0" data-answer="hard" onClick={() => answer('hard')}>Zor hatırladım<span className="text-xs font-normal opacity-80">{SRS_INTERVALS[due[0].step]} gün</span></button>
                  <button className="btn btn-success flex-col gap-0" data-answer="know" onClick={() => answer('know')}>Biliyorum<span className="text-xs font-normal opacity-80">{due[0].step >= SRS_INTERVALS.length - 1 ? 'öğrenildi' : `${SRS_INTERVALS[due[0].step + 1]} gün`}</span></button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="card text-center" data-review-empty>
            <Mascot mood={doneCount > 0 ? 'cheer' : 'happy'} className="mx-auto" />
            <h2 className="mt-3 text-2xl font-black text-fg">{doneCount > 0 ? 'Bugünün tekrarları bitti!' : 'Bugün tekrar edilecek kart yok'}</h2>
            <p className="mt-2 text-fg-2">
              {upcoming.length > 0
                ? `Sıradaki tekrar: ${formatDay(upcoming[0].due)} (${upcoming.filter((u) => u.due === upcoming[0].due).length} kart).`
                : 'Dersleri tamamladıkça öğrendiğin kelimeler ve yaptığın hatalar buraya eklenir.'}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <button type="button" className={cx('card w-full text-left transition-colors', mistakes > 0 ? 'cursor-pointer hover:border-acc/40' : 'opacity-60')} onClick={() => go({ name: 'practice' })} data-action="open-practice">
            <p className="section-title"><Icon name="wrench" size={20} className="text-warn" /> Hata telafisi</p>
            <p className="text-sm text-fg-2">{mistakes > 0 ? `Yanlış yaptığın ${mistakes} soruyu gerçek alıştırma olarak yeniden çöz.` : 'Telafi edilecek hatan yok.'}</p>
          </button>
          <div className="card">
            <p className="section-title">Kart basamakları</p>
            <div className="space-y-2">
              {SRS_INTERVALS.map((d, i) => (
                <div key={d} className="flex items-center gap-3 text-sm">
                  <span className="w-16 text-fg-2">{d} gün</span>
                  <div className="flex-1"><ProgressBar value={stepCounts[i]} max={Math.max(1, active.length)} height="h-2" /></div>
                  <span className="w-6 text-right font-bold text-fg">{stepCounts[i]}</span>
                </div>
              ))}
            </div>
          </div>
          {backend.dev && (
            <button type="button" className="btn btn-ghost btn-sm w-full" data-action="dev-make-due" onClick={async () => setState(await backend.dev!.makeReviewsDueToday())}>
              Test: bekleyen kartları bugüne çek
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
