import { useState } from 'react';
import { RULES, aiAllowance, currentLevel, dayKey, dayStats, lastDays, totals } from '@core/engine.ts';
import { Bars } from '../components/charts.tsx';
import { Icon } from '../components/Icon.tsx';
import { Notice, PageTitle, StatTile, cx } from '../components/ui.tsx';
import { errorMessage, useApp } from '../lib/app.tsx';
import { curriculum } from '../lib/content.ts';
import { ProgressTable } from './Analytics.tsx';
import { GOALS, INTERESTS, MINUTES } from './Onboarding.tsx';

export function ProfileScreen() {
  const { state, session, backend, setState, signOut } = useApp();
  const [name, setName] = useState(state.profile.displayName);
  const [goal, setGoal] = useState(state.profile.goal);
  const [interests, setInterests] = useState(state.profile.interests);
  const [minutes, setMinutes] = useState(state.profile.dailyMinutes);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [password, setPassword] = useState('');
  const [pw, setPw] = useState({ old: '', next: '' });
  const today = dayKey(new Date());
  const conv = aiAllowance(state, 'conversation', today);
  const writing = aiAllowance(state, 'writing', today);
  const t = totals(state);
  const toggle = (item: string) => setInterests(interests.includes(item) ? interests.filter((i) => i !== item) : [...interests, item]);
  const initial = state.profile.displayName.trim().charAt(0).toLocaleUpperCase('tr-TR') || '?';
  const weeks = Array.from({ length: 8 }, (_, w) => {
    const days = lastDays(today, 56).slice(w * 7, w * 7 + 7);
    return { label: w === 7 ? 'Bu hafta' : `-${7 - w}`, value: days.reduce((n, d) => n + dayStats(state, d).xp, 0), highlight: w === 7 };
  });

  const save = async () => {
    try {
      setState(await backend.saveProfile({ displayName: name, goal, interests, dailyMinutes: minutes }));
      setMessage({ tone: 'success', text: 'Profilin kaydedildi.' });
    } catch (err) {
      setMessage({ tone: 'error', text: errorMessage(err) });
    }
  };
  const changePassword = async () => {
    try {
      await backend.changePassword(pw.old, pw.next);
      setPw({ old: '', next: '' });
      setMessage({ tone: 'success', text: 'Şifren değiştirildi.' });
    } catch (err) {
      setMessage({ tone: 'error', text: errorMessage(err) });
    }
  };
  const retakePlacement = async () => setState(await backend.resetPlacement());
  const remove = async () => {
    try {
      await backend.deleteAccount(password);
      await signOut();
    } catch (err) {
      setMessage({ tone: 'error', text: errorMessage(err) });
    }
  };

  return (
    <div data-screen="profile" className="space-y-5">
      <PageTitle title="Profil" icon="user" subtitle={session.email} />
      {message && <Notice tone={message.tone}>{message.text}</Notice>}

      <section className="card card-glow flex flex-wrap items-center gap-6">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-acc text-4xl font-black text-on-acc">{initial}</span>
        <div className="flex-1">
          <p className="text-2xl font-black text-fg">{state.profile.displayName}</p>
          <p className="text-fg-2">{state.profile.goal || 'Hedef seçilmedi'} · Günde {state.profile.dailyMinutes} dakika</p>
          <p className="mt-1 text-sm text-fg-3">Üyelik: {new Date(state.profile.createdAt).toLocaleDateString('tr-TR')} · Plan: {state.profile.plan === 'premium' ? 'Premium' : 'Ücretsiz'}</p>
        </div>
        <div className="text-center"><p className="text-sm text-fg-3">Seviye</p><p className="text-4xl font-black text-acc">{currentLevel(state, curriculum)}</p></div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <StatTile label="Toplam XP" value={state.stats.totalXp} icon="bolt" tone="text-gold" />
        <StatTile label="En uzun seri" value={`${state.stats.longestStreak} gün`} icon="flame" tone="text-[#ff8a4d]" />
        <StatTile label="Öğrenilen kelime" value={t.learned} sub={`defterde ${Object.keys(state.vocab).length}`} icon="book" />
        <StatTile label="Çalışma süresi" value={`${t.minutes} dk`} icon="clock" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <section className="card">
          <p className="section-title">Gelişim tablosu</p>
          <ProgressTable state={state} />
        </section>
        <section className="card">
          <p className="section-title">Son 8 haftanın XP'si</p>
          <Bars data={weeks} unit=" XP" height={140} />
        </section>
      </div>

      <section className="card space-y-4">
        <p className="section-title"><Icon name="pencil" size={20} className="text-acc" /> Profili düzenle</p>
        <div>
          <label className="label" htmlFor="pname">Görünen ad</label>
          <input id="pname" className="field max-w-sm" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <p className="label">Hedef</p>
          <div className="flex flex-wrap gap-2">{GOALS.map((g) => <button key={g} type="button" className={cx('tile', goal === g && 'option-selected')} onClick={() => setGoal(g)}>{g}</button>)}</div>
        </div>
        <div>
          <p className="label">İlgi alanları</p>
          <div className="flex flex-wrap gap-2">{INTERESTS.map((i) => <button key={i} type="button" className={cx('tile', interests.includes(i) && 'option-selected')} onClick={() => toggle(i)}>{i}</button>)}</div>
        </div>
        <div>
          <p className="label">Günlük hedef süre</p>
          <div className="flex flex-wrap gap-2">{MINUTES.map((m) => <button key={m} type="button" className={cx('tile', minutes === m && 'option-selected')} onClick={() => setMinutes(m)}>{m} dakika</button>)}</div>
        </div>
        <button className="btn btn-primary" data-action="profile-save" onClick={save}>Kaydet</button>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card">
          <p className="section-title">Seviye tespiti</p>
          <p className="text-fg-2">
            {state.profile.placementLevel ? <>Seviye tespit sonucun: <b className="text-fg">{state.profile.placementLevel}</b> (kısa ön tespit, kesin değildir).</> : "Seviye tespit yapmadın; A1'den başladın."}
          </p>
          <button className="btn btn-ghost btn-sm mt-3" onClick={retakePlacement}>Seviye tespitini {state.profile.placementLevel ? 'yeniden' : 'şimdi'} yap</button>
        </section>
        <section className="card">
          <p className="section-title">Plan ve AI kullanım hakkı</p>
          <p className="text-fg-2">Planın: <b className="text-fg">{state.profile.plan === 'premium' ? 'Premium' : 'Ücretsiz'}</b>. Hazır dersler sınırsızdır.</p>
          <ul className="mt-2 list-inside list-disc text-sm text-fg-2">
            <li>AI ile konuşma dersi: bugün {conv.used} / {conv.limit}</li>
            <li>AI yazı değerlendirmesi: bugün {writing.used} / {writing.limit}</li>
          </ul>
          <p className="mt-2 text-xs text-fg-3">Ücretsiz planda günde {RULES.freeDailyAi.conversation} konuşma dersi ve {RULES.freeDailyAi.writing} yazı değerlendirmesi. AI öğretmen şu an {backend.status().ai.connected ? 'bağlı' : 'bağlı değil'}.</p>
        </section>
      </div>

      <section className="card space-y-4">
        <p className="section-title"><Icon name="lock" size={20} className="text-acc" /> Hesap</p>
        <div className="flex flex-wrap items-end gap-2">
          <div><label className="label" htmlFor="pw-old">Mevcut şifre</label><input id="pw-old" type="password" className="field py-2" value={pw.old} onChange={(e) => setPw({ ...pw, old: e.target.value })} /></div>
          <div><label className="label" htmlFor="pw-new">Yeni şifre</label><input id="pw-new" type="password" className="field py-2" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></div>
          <button className="btn btn-ghost" disabled={!pw.old || !pw.next} onClick={changePassword}>Şifreyi değiştir</button>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="btn btn-ghost" data-action="sign-out" onClick={signOut}><Icon name="logout" size={18} /> Çıkış yap</button>
          <button className="btn btn-ghost text-bad" onClick={() => setDeleting(!deleting)}><Icon name="trash" size={18} /> Hesabımı sil</button>
        </div>
        {deleting && (
          <Notice tone="error">
            <p className="mb-2"><b>Bu işlem geri alınamaz.</b> Hesabın ve bütün ilerlemen silinir. Onaylamak için şifreni yaz.</p>
            <div className="flex gap-2">
              <input type="password" className="field max-w-xs py-2" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Şifren" />
              <button className="btn btn-danger btn-sm" data-action="delete-account" onClick={remove}>Kalıcı olarak sil</button>
            </div>
          </Notice>
        )}
      </section>
    </div>
  );
}
