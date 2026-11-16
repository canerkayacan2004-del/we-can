import { useState } from 'react';
import { Mascot, Notice, cx } from '../components/ui.tsx';
import { errorMessage, useApp } from '../lib/app.tsx';
import { THEMES, applyAppearance } from '../lib/theme.ts';

export const GOALS = ['Günlük hayatta rahat konuşmak', 'Seyahatte derdimi anlatmak', 'İş hayatında kullanmak', 'Sınava veya okula hazırlanmak'];
export const INTERESTS = ['Günlük sohbet', 'Seyahat', 'İş hayatı', 'Emlak sektörü', 'Teknoloji', 'Sosyal hayat'];
export const MINUTES = [10, 20, 30, 45];

export function OnboardingScreen() {
  const { backend, state, setState } = useApp();
  const [goal, setGoal] = useState(state.profile.goal || GOALS[0]);
  const [interests, setInterests] = useState<string[]>(state.profile.interests);
  const [minutes, setMinutes] = useState(state.profile.dailyMinutes);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState(state.profile.appearance.theme);
  const toggle = (item: string) => setInterests(interests.includes(item) ? interests.filter((i) => i !== item) : [...interests, item]);

  const save = async () => {
    try {
      await backend.saveAppearance({ ...state.profile.appearance, theme, accent: null });
      setState(await backend.saveProfile({ goal, interests, dailyMinutes: minutes, onboardingDone: true }));
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <div className="h-full overflow-y-auto px-8 py-10" data-screen="onboarding">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-4">
          <Mascot size={88} mood="happy" />
          <div>
            <h1 className="text-3xl font-black text-fg">Merhaba {state.profile.displayName}! Ben Can.</h1>
            <p className="text-fg-2">Sana uygun bir yol çizebilmem için birkaç kısa soru.</p>
          </div>
        </div>

        <section className="card mt-6">
          <h2 className="mb-3 text-lg font-extrabold">1. İngilizceyi en çok ne için istiyorsun?</h2>
          <div className="grid gap-2">
            {GOALS.map((g) => (
              <button key={g} type="button" className={cx('option', goal === g && 'option-selected')} onClick={() => setGoal(g)}>{g}</button>
            ))}
          </div>
        </section>

        <section className="card mt-4">
          <h2 className="mb-1 text-lg font-extrabold">2. Hangi konular ilgini çekiyor?</h2>
          <p className="mb-3 text-sm text-fg-2">Birden fazla seçebilirsin. Örnekler ve senaryolar buna göre ağırlıklandırılır.</p>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((i) => (
              <button key={i} type="button" data-interest={i} className={cx('tile', interests.includes(i) && 'option-selected')} onClick={() => toggle(i)}>{i}</button>
            ))}
          </div>
        </section>

        <section className="card mt-4">
          <h2 className="mb-3 text-lg font-extrabold">3. Günde ne kadar zaman ayırabilirsin?</h2>
          <div className="flex flex-wrap gap-2">
            {MINUTES.map((m) => (
              <button key={m} type="button" className={cx('tile', minutes === m && 'option-selected')} onClick={() => setMinutes(m)}>{m} dakika</button>
            ))}
          </div>
        </section>

        <section className="card mt-4">
          <h2 className="mb-1 text-lg font-extrabold">4. Görünümünü seç</h2>
          <p className="mb-3 text-sm text-fg-2">Sonra Ayarlar'dan istediğin zaman değiştirebilirsin.</p>
          <div className="flex flex-wrap gap-2">
            {THEMES.map((t) => (
              <button key={t.id} type="button" data-theme-option={t.id} className={cx('tile flex items-center gap-2', theme === t.id && 'option-selected')}
                onClick={() => { setTheme(t.id); applyAppearance({ ...state.profile.appearance, theme: t.id, accent: null }); }}>
                <span className="h-4 w-4 rounded-full border border-line-2" style={{ background: t.vars.acc, boxShadow: `inset 0 0 0 3px ${t.vars.bg}` }} />
                {t.name}
              </button>
            ))}
          </div>
        </section>

        {error && <div className="mt-4"><Notice tone="error">{error}</Notice></div>}
        <button className="btn btn-primary mt-6 w-full" data-action="onboarding-save" onClick={save}>Devam</button>
      </div>
    </div>
  );
}
