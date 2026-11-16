// Arkadaşla sohbet: mesajlar Supabase'de, yalnızca karşılıklı arkadaşlar arasında. Açıkken birkaç saniyede bir yenilenir.
import { useEffect, useRef, useState } from 'react';
import { useApp } from '../lib/app.tsx';
import { loadMessages, sendMessage } from '../lib/social.ts';
import type { ChatMessage, FriendRow } from '../lib/social.ts';
import { UserAvatar } from './Avatar.tsx';
import { Icon } from './Icon.tsx';
import { cx } from './ui.tsx';

const QUICK = ['Hi! 👋', 'How is it going?', 'Let\'s practice English!', 'Good luck today! 💪', 'Duel? ⚔️'];

export function FriendChat({ friend, onClose }: { friend: FriendRow; onClose: () => void }) {
  const { session } = useApp();
  const uid = session.userId;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const lastId = useRef(0);
  const box = useRef<HTMLDivElement>(null);

  const pull = async (initial = false) => {
    try {
      const rows = await loadMessages(uid, friend.user_id, initial ? 0 : lastId.current);
      if (rows.length) {
        lastId.current = rows[rows.length - 1].id;
        setMessages((m) => (initial ? rows : [...m, ...rows.filter((r) => !m.some((x) => x.id === r.id))]));
      }
      setError('');
    } catch (err) { setError((err as Error).message); }
  };

  useEffect(() => {
    lastId.current = 0;
    void pull(true);
    const t = window.setInterval(() => { if (!document.hidden) void pull(); }, 4000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friend.user_id]);

  useEffect(() => { box.current?.scrollTo({ top: box.current.scrollHeight }); }, [messages.length]);

  const send = async (body = text) => {
    const clean = body.trim();
    if (!clean || sending) return;
    setSending(true);
    try { await sendMessage(uid, friend.user_id, clean); setText(''); await pull(); } catch (err) { setError((err as Error).message); } finally { setSending(false); }
  };

  return (
    <section className="card flex h-[460px] flex-col p-0" data-friend-chat={friend.display_name}>
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <UserAvatar name={friend.display_name} src={friend.avatar} size={36} />
        <div className="flex-1"><p className="font-bold text-fg">{friend.display_name}</p><p className="text-xs text-fg-3">{friend.level} · İngilizce yazmaya çalışın 😉</p></div>
        <button className="text-fg-3 hover:text-fg" onClick={onClose} title="Kapat" data-action="close-chat"><Icon name="x" size={18} /></button>
      </div>
      <div ref={box} className="flex-1 space-y-2 overflow-y-auto px-4 py-3" data-chat-log>
        {!messages.length && <p className="pt-10 text-center text-sm text-fg-3">Henüz mesaj yok. İlk mesajı sen gönder!</p>}
        {messages.map((m) => (
          <div key={m.id} className={cx('flex', m.mine ? 'justify-end' : 'justify-start')}>
            <div className={cx('max-w-[75%] rounded-2xl px-3 py-2 text-sm', m.mine ? 'rounded-br-md bg-acc text-on-acc' : 'rounded-bl-md bg-panel-3 text-fg')} data-chat-msg={m.mine ? 'mine' : 'theirs'}>
              <p className="whitespace-pre-wrap break-words">{m.body}</p>
              <p className={cx('mt-0.5 text-right text-[0.65rem]', m.mine ? 'text-on-acc/70' : 'text-fg-3')}>{new Date(m.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        ))}
      </div>
      {error && <p className="px-4 pb-1 text-xs text-bad">{error}</p>}
      <div className="flex gap-1 overflow-x-auto px-4 pb-2">
        {QUICK.map((q) => <button key={q} type="button" className="chip shrink-0 bg-panel-3 text-xs text-fg-2 hover:text-fg" onClick={() => void send(q)}>{q}</button>)}
      </div>
      <div className="flex gap-2 border-t border-line p-3">
        <input className="field" placeholder="Mesaj yaz… (Enter ile gönder)" value={text} maxLength={500} data-chat-input
          onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void send(); }} />
        <button className="btn btn-primary shrink-0" onClick={() => void send()} disabled={!text.trim() || sending} data-action="send-chat"><Icon name="arrowRight" size={18} /></button>
      </div>
    </section>
  );
}
