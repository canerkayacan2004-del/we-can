import { useState } from 'react';
import type { Note } from '@core/types.ts';
import { Icon } from '../components/Icon.tsx';
import { Notice, PageTitle, cx } from '../components/ui.tsx';
import { errorMessage, useApp } from '../lib/app.tsx';

const TAGS = ['Gramer', 'Kelime', 'Kalıp', 'Hata', 'Emlak', 'Seyahat', 'İş'];

export function NotebookScreen() {
  const { state, backend, setState } = useApp();
  const [editing, setEditing] = useState<Partial<Note> | null>(null);
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState('');
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const q = query.trim().toLocaleLowerCase('tr-TR');
  const notes = [...state.notes]
    .filter((n) => (!tag || n.tag === tag) && (!q || `${n.title} ${n.body}`.toLocaleLowerCase('tr-TR').includes(q)))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt));

  const save = async () => {
    if (!editing) return;
    try {
      setState(await backend.saveNote({ ...editing, title: editing.title ?? '', body: editing.body ?? '' }));
      setEditing(null);
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    }
  };
  const togglePin = async (n: Note) => setState(await backend.saveNote({ ...n, pinned: !n.pinned }));
  const remove = async (id: string) => {
    setState(await backend.deleteNote(id));
    setConfirmDelete(null);
  };

  return (
    <div data-screen="notebook">
      <PageTitle title="Not defterim" icon="notebook" subtitle="Öğrendiğin kuralları, kalıpları ve kendi örnek cümlelerini kendi sözlerinle yaz."
        right={<button className="btn btn-primary" data-action="new-note" onClick={() => setEditing({ title: '', body: '', tag: '' })}><Icon name="plus" size={18} /> Yeni not</button>} />

      {editing && (
        <div className="card card-glow mb-5 animate-pop" data-panel="note-editor">
          <input className="field mb-3 text-lg font-bold" placeholder="Başlık (ör. Kısa cevaplar)" value={editing.title ?? ''} autoFocus onChange={(e) => setEditing({ ...editing, title: e.target.value })} data-field="title" />
          <textarea className="field min-h-36" placeholder="Notun… (ör. Yes, I am. Olumlu kısa cevapta kısaltma yapılmaz.)" value={editing.body ?? ''} onChange={(e) => setEditing({ ...editing, body: e.target.value })} data-field="body" />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-fg-3">Etiket:</span>
            {TAGS.map((t) => (
              <button key={t} type="button" className={cx('tile py-1 text-sm', editing.tag === t && 'option-selected')} onClick={() => setEditing({ ...editing, tag: editing.tag === t ? '' : t })}>{t}</button>
            ))}
          </div>
          {error && <div className="mt-3"><Notice tone="error">{error}</Notice></div>}
          <div className="mt-4 flex justify-end gap-2">
            <button className="btn btn-ghost" onClick={() => { setEditing(null); setError(''); }}>Vazgeç</button>
            <button className="btn btn-primary" data-action="save-note" onClick={save}>Kaydet</button>
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input className="field max-w-xs" placeholder="Notlarda ara…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button type="button" className={cx('tile', !tag && 'option-selected')} onClick={() => setTag('')}>Hepsi</button>
        {TAGS.filter((t) => state.notes.some((n) => n.tag === t)).map((t) => (
          <button key={t} type="button" className={cx('tile', tag === t && 'option-selected')} onClick={() => setTag(t)}>{t}</button>
        ))}
      </div>

      {state.notes.length === 0 && !editing ? (
        <div className="card text-center">
          <p className="text-4xl">📝</p>
          <p className="mt-2 font-bold text-fg">Henüz notun yok</p>
          <p className="text-sm text-fg-2">Bir kuralı kendi cümlelerinle yazmak, onu hatırlamanın en iyi yollarından biridir.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((n) => (
            <div key={n.id} className={cx('card flex flex-col', n.pinned && 'border-acc/40')} data-note={n.id}>
              <div className="flex items-start justify-between gap-2">
                <p className="font-extrabold text-fg">{n.title || 'Başlıksız'}</p>
                <button type="button" className={cx('cursor-pointer rounded-lg p-1', n.pinned ? 'text-acc' : 'text-fg-3 hover:text-fg')} onClick={() => togglePin(n)} aria-label="Sabitle"><Icon name="pin" size={18} /></button>
              </div>
              {n.tag && <span className="chip mt-1 w-fit bg-acc/12 text-xs text-acc">{n.tag}</span>}
              <p className="mt-2 flex-1 whitespace-pre-line text-sm text-fg-2">{n.body}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-fg-3">
                <span>{new Date(n.updatedAt).toLocaleDateString('tr-TR')}</span>
                {confirmDelete === n.id ? (
                  <span className="flex gap-2">
                    <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(null)}>Vazgeç</button>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(n.id)}>Sil</button>
                  </span>
                ) : (
                  <span className="flex gap-1">
                    <button className="cursor-pointer rounded-lg p-1.5 hover:bg-panel-3 hover:text-fg" onClick={() => setEditing(n)} aria-label="Düzenle"><Icon name="pencil" size={16} /></button>
                    <button className="cursor-pointer rounded-lg p-1.5 hover:bg-panel-3 hover:text-bad" onClick={() => setConfirmDelete(n.id)} aria-label="Sil"><Icon name="trash" size={16} /></button>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
