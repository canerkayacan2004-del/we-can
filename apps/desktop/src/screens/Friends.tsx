// Arkadaşlar: arkadaş kodu ile ekleme ve arkadaşların seviye / XP / seri sıralaması.
import { useEffect, useState } from 'react';
import { currentLevel, dayKey, effectiveStreak } from '@core/engine.ts';
import { UserAvatar } from '../components/Avatar.tsx';
import { Icon } from '../components/Icon.tsx';
import { Notice, PageTitle, cx } from '../components/ui.tsx';
import { useApp } from '../lib/app.tsx';
import { CloudError } from '../lib/backend/cloudAi.ts';
import { curriculum } from '../lib/content.ts';
import { addFriend, answerDuel, cachedFriendCode, createDuel, listDuels, listFriends, normalizeFriendCode, removeFriend, syncSocialProfile, unreadCounts, weekXp } from '../lib/social.ts';
import type { DuelRow, FriendRow } from '../lib/social.ts';
import { FriendChat } from '../components/FriendChat.tsx';
import { DuelGame } from '../components/Duel.tsx';

type Board = 'week' | 'total';

export function FriendsScreen() {
  const { state, session } = useApp();
  const uid = session.userId;
  const [code, setCode] = useState<string | null>(cachedFriendCode(uid));
  const [friends, setFriends] = useState<FriendRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [problem, setProblem] = useState<{ text: string; kind: string } | null>(null);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [board, setBoard] = useState<Board>('week');
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [chatWith, setChatWith] = useState<FriendRow | null>(null);
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [duels, setDuels] = useState<DuelRow[]>([]);
  const [duel, setDuel] = useState<null | { friend: FriendRow | null; seed: number; level: string; answering?: DuelRow }>(null);
  const [duelResult, setDuelResult] = useState<string | null>(null);
  const { backend, setState } = useApp();

  const refreshSocial = async () => {
    try { setUnread(await unreadCounts(uid)); setDuels(await listDuels(uid)); } catch { /* sohbet/düello kurulmamış olabilir */ }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (!problem && !loading) void refreshSocial(); const t = window.setInterval(() => { if (!document.hidden && !problem) void refreshSocial(); }, 20000); return () => window.clearInterval(t); }, [problem, loading]);

  const startDuel = (f: FriendRow) => { setDuelResult(null); setChatWith(null); setDuel({ friend: f, seed: 1 + Math.floor(Math.random() * 1_999_999_999), level: currentLevel(state, curriculum) }); };
  const finishDuel = async (score: number, ms: number) => {
    if (!duel) return;
    try {
      if (duel.answering) {
        await answerDuel(uid, duel.answering.id, score, ms);
        const their = duel.answering.their_score ?? 0, theirMs = duel.answering.their_ms ?? 0;
        const won = score > their || (score === their && ms < theirMs);
        setDuelResult(`${score}/10 · ${(ms / 1000).toFixed(1)} sn — ${won ? 'Kazandın! 🏆' : score === their && ms === theirMs ? 'Berabere' : `${duel.answering.friend_name} kazandı`}`);
        setState((await backend.recordGame('duel', { won, score })).state);
      } else if (duel.friend) {
        await createDuel(uid, duel.friend.user_id, duel.seed, duel.level, score, ms);
        setDuelResult(`${score}/10 · ${(ms / 1000).toFixed(1)} sn. Meydan okuma ${duel.friend.display_name}'a gönderildi!`);
        setState((await backend.recordGame('duel', { won: false, score })).state);
      }
      void refreshSocial();
    } catch (err) { setDuelResult((err as Error).message); }
    setDuel(null);
  };

  const refresh = async () => {
    setLoading(true);
    try {
      setCode(await syncSocialProfile(uid, state));
      setFriends(await listFriends(uid));
      setProblem(null);
    } catch (err) {
      const e = err as CloudError;
      setProblem({ text: e.message || 'Arkadaş listesi alınamadı.', kind: e.code ?? 'server' });
    } finally {
      setLoading(false);
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void refresh(); }, []);

  const add = async () => {
    const normalized = normalizeFriendCode(input);
    if (!normalized) { setMessage({ tone: 'error', text: 'Kod "WC-" ve 6 karakterden oluşur. Örnek: WC-7K3MPQ' }); return; }
    if (normalized === code) { setMessage({ tone: 'error', text: 'Bu senin kendi kodun 🙂' }); return; }
    setBusy(true); setMessage(null);
    try {
      const name = await addFriend(uid, normalized);
      setMessage({ tone: 'success', text: `${name} arkadaş olarak eklendi!` });
      setInput('');
      setFriends(await listFriends(uid));
    } catch (err) {
      setMessage({ tone: 'error', text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await removeFriend(uid, id);
      setFriends(friends.filter((f) => f.user_id !== id));
      setConfirmRemove(null);
    } catch (err) {
      setMessage({ tone: 'error', text: (err as Error).message });
    }
  };

  const copy = async () => {
    if (!code) return;
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* panoya erişilemedi */ }
  };

  const me: FriendRow = {
    user_id: 'me', display_name: state.profile.displayName, level: currentLevel(state, curriculum),
    total_xp: state.stats.totalXp, week_xp: weekXp(state), streak: effectiveStreak(state, dayKey(new Date())),
    avatar: state.profile.avatar ?? null, updated_at: new Date().toISOString(),
  };
  const rows = [...friends, me].sort((a, b) => (board === 'week' ? b.week_xp - a.week_xp || b.total_xp - a.total_xp : b.total_xp - a.total_xp));

  return (
    <div data-screen="friends" className="space-y-5">
      <PageTitle title="Arkadaşlar" icon="user" subtitle="Arkadaş kodunla arkadaşlarını ekle, seviyelerini ve haftalık XP'lerini gör." />

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card card-glow">
          <p className="section-title"><Icon name="sparkles" size={20} className="text-acc" /> Senin arkadaş kodun</p>
          {code ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono-num rounded-2xl border border-acc/40 bg-acc/10 px-5 py-3 text-3xl font-black tracking-widest text-acc" data-friend-code>{code}</span>
              <button className="btn btn-ghost" onClick={copy} data-action="copy-code"><Icon name={copied ? 'check' : 'notebook'} size={18} /> {copied ? 'Kopyalandı' : 'Kopyala'}</button>
            </div>
          ) : (
            <p className="text-fg-2">{loading ? 'Kodun hazırlanıyor…' : 'Kod alınamadı.'}</p>
          )}
          <p className="mt-3 text-sm text-fg-2">Bu kodu arkadaşına gönder; o da kendi We Can'inde <b>Arkadaşlar</b> ekranına yazınca birbirinizi görürsünüz.</p>
        </section>

        <section className="card">
          <p className="section-title"><Icon name="plus" size={20} className="text-acc" /> Arkadaş ekle</p>
          <div className="flex gap-2">
            <input className="field font-mono-num uppercase tracking-widest" placeholder="WC-XXXXXX" value={input} maxLength={12}
              data-input="friend-code" onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && void add()} disabled={!!problem && problem.kind === 'not_installed'} />
            <button className="btn btn-primary shrink-0" onClick={add} disabled={busy || !input.trim() || (!!problem && problem.kind === 'not_installed')} data-action="add-friend">{busy ? 'Ekleniyor…' : 'Ekle'}</button>
          </div>
          {message && <div className="mt-3"><Notice tone={message.tone}>{message.text}</Notice></div>}
        </section>
      </div>

      {problem && (
        <Notice tone={problem.kind === 'not_installed' ? 'info' : 'error'}>
          {problem.text}{' '}
          {problem.kind !== 'not_installed' && <button className="font-bold underline" onClick={refresh}>Tekrar dene</button>}
        </Notice>
      )}

      <section className="card">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="section-title mb-0"><Icon name="trophy" size={20} className="text-gold" /> Sıralama</p>
          <div className="flex gap-1 rounded-xl border border-line bg-panel-2 p-1">
            {(['week', 'total'] as Board[]).map((b) => (
              <button key={b} type="button" data-board={b} onClick={() => setBoard(b)}
                className={cx('rounded-lg px-3 py-1 text-sm font-bold', board === b ? 'bg-acc text-on-acc' : 'text-fg-2 hover:text-fg')}>
                {b === 'week' ? 'Bu hafta' : 'Toplam'}
              </button>
            ))}
          </div>
        </div>
        {loading && !friends.length ? <p className="text-fg-2">Yükleniyor…</p> : (
          <ol className="divide-y divide-line" data-friend-list>
            {rows.map((r, i) => (
              <li key={r.user_id} data-friend-row={r.user_id === 'me' ? 'me' : r.display_name}
                className={cx('flex items-center gap-3 px-2 py-3', r.user_id === 'me' && 'rounded-2xl bg-acc/8')}>
                <span className={cx('w-7 text-center text-lg font-black', i === 0 ? 'text-gold' : i === 1 ? 'text-fg-2' : i === 2 ? 'text-[#d08a52]' : 'text-fg-3')}>{i + 1}</span>
                <UserAvatar name={r.display_name} src={r.avatar} size={42} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-fg">{r.display_name}{r.user_id === 'me' && <span className="ml-2 text-xs font-semibold text-acc">sen</span>}</p>
                  <p className="text-xs text-fg-3">{r.user_id === 'me' ? 'şimdi' : `güncelleme: ${new Date(r.updated_at).toLocaleDateString('tr-TR')}`}</p>
                </div>
                <span className="chip bg-acc/12 text-acc" title="Seviye">{r.level}</span>
                <span className="chip bg-[#ff7a3d]/15 text-[#ff9a62]" title="Seri"><Icon name="flame" size={14} /> {r.streak}</span>
                <span className="font-mono-num w-24 text-right font-black text-gold" title={board === 'week' ? 'Son 7 gün XP' : 'Toplam XP'}>{board === 'week' ? r.week_xp : r.total_xp} XP</span>
                {r.user_id !== 'me' && (
                  <span className="flex gap-1">
                    <button className="btn btn-ghost btn-sm relative" title="Sohbet" data-action="chat" onClick={() => { setDuel(null); setChatWith(r); setUnread((u) => ({ ...u, [r.user_id]: 0 })); }}>
                      💬{unread[r.user_id] ? <span className="absolute -right-1.5 -top-1.5 rounded-full bg-bad px-1.5 text-[0.65rem] font-black text-white">{unread[r.user_id]}</span> : null}
                    </button>
                    <button className="btn btn-ghost btn-sm" title="Kelime düellosu" data-action="duel" onClick={() => startDuel(r)}>⚔️</button>
                  </span>
                )}
                {r.user_id !== 'me' && (
                  confirmRemove === r.user_id
                    ? <span className="flex gap-1"><button className="btn btn-danger btn-sm" onClick={() => remove(r.user_id)}>Çıkar</button><button className="btn btn-ghost btn-sm" onClick={() => setConfirmRemove(null)}>Vazgeç</button></span>
                    : <button className="text-fg-3 hover:text-bad" title="Arkadaşlıktan çıkar" onClick={() => setConfirmRemove(r.user_id)}><Icon name="x" size={16} /></button>
                )}
              </li>
            ))}
          </ol>
        )}
        {!loading && !friends.length && !problem && <p className="mt-2 text-sm text-fg-2">Henüz arkadaşın yok. Kodunu paylaş ya da bir arkadaşının kodunu ekle.</p>}
      </section>
      {chatWith && <FriendChat key={chatWith.user_id} friend={chatWith} onClose={() => setChatWith(null)} />}

      {duel && (
        <section className="card card-glow" data-duel-panel>
          <div className="mb-3 flex items-center justify-between">
            <p className="section-title mb-0">⚔️ Kelime düellosu · {duel.answering ? duel.answering.friend_name : duel.friend?.display_name}</p>
            <button className="text-fg-3 hover:text-fg" onClick={() => setDuel(null)}><Icon name="x" size={18} /></button>
          </div>
          <DuelGame seed={duel.seed} level={duel.level} onDone={(sc, ms) => void finishDuel(sc, ms)}
            rival={duel.answering ? { name: duel.answering.friend_name, score: duel.answering.their_score, ms: duel.answering.their_ms } : undefined} />
        </section>
      )}
      {duelResult && <Notice tone="info">{duelResult}</Notice>}

      {duels.length > 0 && (
        <section className="card" data-duel-list>
          <p className="section-title">⚔️ Düellolar</p>
          <ul className="divide-y divide-line">
            {duels.map((d) => {
              const myTurn = !d.i_challenged && d.my_score === null;
              const finished = d.my_score !== null && d.their_score !== null;
              const won = finished && (d.my_score! > d.their_score! || (d.my_score === d.their_score && (d.my_ms ?? 0) < (d.their_ms ?? 0)));
              return (
                <li key={d.id} className="flex items-center gap-3 py-2.5 text-sm" data-duel={d.id}>
                  <span className="flex-1 text-fg"><b>{d.friend_name}</b> <span className="text-fg-3">· {d.level} · {new Date(d.created_at).toLocaleDateString('tr-TR')}</span></span>
                  {finished && <span className={cx('chip text-xs', won ? 'bg-acc/15 text-acc' : 'bg-bad/15 text-bad')}>{d.my_score}–{d.their_score} {won ? 'kazandın' : 'kaybettin'}</span>}
                  {!finished && d.i_challenged && <span className="chip bg-panel-3 text-xs text-fg-2">Sen {d.my_score}/10 · rakip bekleniyor</span>}
                  {myTurn && <button className="btn btn-primary btn-sm" data-action="answer-duel" onClick={() => { setDuelResult(null); setChatWith(null); setDuel({ friend: null, seed: d.seed, level: d.level, answering: d }); }}>Oyna</button>}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <p className="text-xs text-fg-3">Arkadaşların yalnızca adını, fotoğrafını, seviyeni, XP'ni ve serini görür. Ders ayrıntıların ve e-postan paylaşılmaz. Sohbet mesajları yalnızca karşılıklı arkadaşlar arasında görünür ve 90 gün sonra silinir.</p>
    </div>
  );
}
