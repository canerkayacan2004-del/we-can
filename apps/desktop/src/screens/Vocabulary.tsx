import { useState } from 'react';
import { Icon } from '../components/Icon.tsx';
import { Notice, PageTitle, cx, formatDay } from '../components/ui.tsx';
import { errorMessage, useApp } from '../lib/app.tsx';
import { getVocabItem } from '../lib/content.ts';
import { speak } from '../lib/tts.ts';

export function VocabularyScreen() {
  const { state, backend, setState } = useApp();
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('hepsi');
  const [editing, setEditing] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const items = Object.keys(state.vocab).map((id) => getVocabItem(id)).filter((v): v is NonNullable<typeof v> => !!v);
  const topics = ['hepsi', ...new Set(items.map((v) => v.topic ?? 'diğer'))];
  const q = query.trim().toLowerCase();
  const shown = items.filter((v) => (topic === 'hepsi' || (v.topic ?? 'diğer') === topic) && (!q || v.term.toLowerCase().includes(q) || v.meaningTr.toLowerCase().includes(q)));
  const learned = items.filter((v) => state.reviews.find((r) => r.id === `v:${v.id}`)?.status === 'learned').length;

  const saveNote = async (id: string) => {
    try {
      setState(await backend.setVocabNote(id, note));
      setEditing(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <div data-screen="vocab">
      <PageTitle title="Kelime defteri" icon="book" subtitle="Derslerde öğrendiğin kelimeler burada birikir. Liste sen öğrendikçe büyür."
        right={items.length > 0 && <span className="chip bg-acc/12 text-acc" data-stat="vocab-count">{items.length} kelime · {learned} öğrenildi</span>} />
      {items.length === 0 ? (
        <Notice tone="info">Defterin henüz boş. Kelime derslerini (her ünitenin 3. dersi) tamamladığında kelimeler buraya eklenir.</Notice>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <input className="field max-w-xs" placeholder="Kelime ara…" value={query} onChange={(e) => setQuery(e.target.value)} />
            {topics.map((t) => <button key={t} type="button" className={cx('tile', topic === t && 'option-selected')} onClick={() => setTopic(t)}>{t}</button>)}
          </div>
          {error && <div className="mb-3"><Notice tone="error">{error}</Notice></div>}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {shown.map((v) => {
              const review = state.reviews.find((r) => r.id === `v:${v.id}`);
              const userNote = state.vocab[v.id]?.note;
              return (
                <div key={v.id} className="card" data-vocab={v.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xl font-black text-fg">{v.term} <span className="text-sm font-normal text-fg-3">{v.ipa}</span></p>
                      <p className="font-semibold text-acc">{v.meaningTr} <span className="text-xs font-normal text-fg-3">· {v.pos}</span></p>
                    </div>
                    <button type="button" className="cursor-pointer rounded-xl bg-panel-3 p-2 text-acc hover:brightness-125" onClick={() => speak(v.term)} aria-label="Dinle"><Icon name="volume" size={18} /></button>
                  </div>
                  <p className="mt-2 text-sm text-fg">{v.exampleEn}</p>
                  <p className="text-sm text-fg-3">{v.exampleTr}</p>
                  {v.note && <p className="mt-1 text-xs text-fg-3">Not: {v.note}</p>}
                  <p className="mt-2 text-xs font-bold text-fg-3">
                    {review?.status === 'learned' ? <span className="text-good">✓ Öğrenildi</span> : review ? `Sonraki tekrar: ${formatDay(review.due)}` : ''}
                  </p>
                  {editing === v.id ? (
                    <div className="mt-2 flex gap-2">
                      <input className="field py-2 text-sm" value={note} autoFocus onChange={(e) => setNote(e.target.value)} placeholder="Kişisel notun" />
                      <button className="btn btn-primary btn-sm" onClick={() => saveNote(v.id)}>Kaydet</button>
                    </div>
                  ) : (
                    <button className="mt-2 cursor-pointer text-left text-sm text-acc underline-offset-2 hover:underline" onClick={() => { setEditing(v.id); setNote(userNote ?? ''); }}>
                      {userNote ? `Notum: ${userNote}` : '+ Kişisel not ekle'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
