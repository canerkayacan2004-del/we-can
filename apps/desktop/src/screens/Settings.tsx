import { useState } from 'react';
import { DASHBOARD_WIDGETS } from '@core/types.ts';
import type { Appearance } from '@core/types.ts';
import { Icon } from '../components/Icon.tsx';
import { Notice, PageTitle, Toggle, cx } from '../components/ui.tsx';
import { errorMessage, useApp } from '../lib/app.tsx';
import { setSoundEnabled, playSound } from '../lib/sound.ts';
import { ACCENTS, THEMES, applyAppearance, isHexColor, themeById } from '../lib/theme.ts';
import { WIDGET_TR } from './Dashboard.tsx';
import { LangSwitch } from '../components/LangSwitch.tsx';

declare const __APP_VERSION__: string;

export function SettingsScreen() {
  const { state, backend, setState, go } = useApp();
  const a = state.profile.appearance;
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const update = async (patch: Partial<Appearance>) => {
    const next = { ...a, ...patch };
    applyAppearance(next);
    setSoundEnabled(next.sound);
    try {
      setState(await backend.saveAppearance(next));
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const exportData = async () => {
    const json = await backend.exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `we-can-yedek-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage('Yedek dosyası indirildi.');
  };

  const currentAccent = isHexColor(a.accent) ? a.accent : themeById(a.theme).vars.acc;

  return (
    <div data-screen="settings" className="space-y-6">
      <PageTitle title="Ayarlar" icon="settings" subtitle="Görünümü kendine göre düzenle. Değişiklikler anında uygulanır ve hesabına kaydedilir." />
      {error && <Notice tone="error">{error}</Notice>}

      <section className="card flex flex-wrap items-center justify-between gap-4" data-settings-lang>
        <div>
          <p className="section-title mb-1">🌐 Uygulama dili</p>
          <p className="text-sm text-fg-2">Menüler ve düğmeler bu dilde görünür. Ders açıklamaları Türkçe kalır.</p>
        </div>
        <LangSwitch size="lg" />
      </section>

      <section className="card">
        <p className="section-title"><Icon name="palette" size={20} className="text-acc" /> Tema</p>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {THEMES.map((t) => (
            <button key={t.id} type="button" data-theme-option={t.id} onClick={() => update({ theme: t.id, accent: null })}
              className={cx('cursor-pointer rounded-2xl border-2 p-2 text-left transition-colors', a.theme === t.id ? 'border-acc' : 'border-line hover:border-line-2')}>
              <div className="relative h-20 overflow-hidden rounded-xl" style={{ background: t.vars.bg }}>
                <div className="absolute inset-y-2 left-2 w-6 rounded-md" style={{ background: t.vars.panel }} />
                <div className="absolute left-10 right-2 top-2 h-8 rounded-md" style={{ background: t.vars.panel2 }} />
                <div className="absolute bottom-2 left-10 h-4 w-14 rounded-md" style={{ background: t.vars.acc }} />
                {a.theme === t.id && <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-acc text-on-acc"><Icon name="check" size={13} strokeWidth={3} /></span>}
              </div>
              <p className="mt-2 text-sm font-bold text-fg">{t.name}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <p className="section-title">Vurgu rengi</p>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => update({ accent: null })} className={cx('chip cursor-pointer border', a.accent === null ? 'border-acc bg-acc/12 text-acc' : 'border-line-2 text-fg-2')}>Temanın rengi</button>
          {ACCENTS.map((c) => (
            <button key={c.hex} type="button" title={c.name} aria-label={c.name} data-accent={c.hex} onClick={() => update({ accent: c.hex })}
              className={cx('h-10 w-10 cursor-pointer rounded-full border-4 transition-transform hover:scale-110', a.accent === c.hex ? 'border-fg' : 'border-transparent')}
              style={{ background: c.hex }} />
          ))}
          <label className="flex cursor-pointer items-center gap-2 text-sm text-fg-2">
            <input type="color" value={currentAccent} onChange={(e) => update({ accent: e.target.value })} className="h-10 w-10 cursor-pointer rounded-lg border-0 bg-transparent" />
            Özel renk
          </label>
        </div>
      </section>

      <section className="card space-y-5">
        <p className="section-title">Okunabilirlik ve efektler</p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><p className="font-bold text-fg">Yazı ve arayüz boyutu</p><p className="text-sm text-fg-2">Bütün ekranı büyütür veya küçültür.</p></div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-fg-3">A</span>
            <input type="range" min={0.9} max={1.2} step={0.05} value={a.scale} onChange={(e) => update({ scale: Number(e.target.value) })} className="w-48 accent-[var(--wc-acc)]" aria-label="Ölçek" />
            <span className="text-xl text-fg-3">A</span>
            <span className="w-12 text-right font-bold text-fg">%{Math.round(a.scale * 100)}</span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div><p className="font-bold text-fg">Animasyonlar</p><p className="text-sm text-fg-2">Kapatırsan geçişler ve hareketli öğeler durur.</p></div>
          <Toggle checked={a.motion} onChange={(v) => update({ motion: v })} label="Animasyonlar" />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div><p className="font-bold text-fg">Ses efektleri</p><p className="text-sm text-fg-2">Doğru, yanlış ve ders bitişi sesleri.</p></div>
          <div className="flex items-center gap-3">
            <button className="btn btn-ghost btn-sm" onClick={() => playSound('correct')}>Dene</button>
            <Toggle checked={a.sound} onChange={(v) => update({ sound: v })} label="Ses efektleri" />
          </div>
        </div>
      </section>

      <section className="card">
        <p className="section-title"><Icon name="layout" size={20} className="text-acc" /> Pano bölümleri</p>
        <p className="mb-3 text-sm text-fg-2">Ana panoda görmek istediklerini seç. Kapattıkların sol menüden açılabilir.</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {DASHBOARD_WIDGETS.map((w) => (
            <label key={w} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-panel-2 px-3 py-2.5">
              <span className="font-semibold text-fg">{WIDGET_TR[w]}</span>
              <Toggle checked={a.dashboard.includes(w)} onChange={(v) => update({ dashboard: v ? [...a.dashboard, w] : a.dashboard.filter((x) => x !== w) })} label={WIDGET_TR[w]} />
            </label>
          ))}
        </div>
      </section>

      <section className="card">
        <p className="section-title">Verilerim ve uygulama</p>
        <div className="flex flex-wrap gap-3">
          <button className="btn btn-ghost" data-action="export" onClick={exportData}><Icon name="book" size={18} /> Verilerimi dışa aktar</button>
          <button className="btn btn-ghost" onClick={() => go({ name: 'status' })}><Icon name="plug" size={18} /> Servis durumu</button>
          <button className="btn btn-ghost" onClick={() => go({ name: 'profile' })}><Icon name="user" size={18} /> Profil ve hesap</button>
        </div>
        {message && <p className="mt-3 text-sm text-good">{message}</p>}
        <p className="mt-4 text-xs text-fg-3">We Can sürüm {__APP_VERSION__}. Görünüm ayarların hesabına kaydedilir; aynı bilgisayardaki diğer hesapları etkilemez.</p>
      </section>
    </div>
  );
}
