import { useState } from 'react';
import { ProfileFields } from '../components/ProfileFields.tsx';
import type { ProfileFieldValues } from '../components/ProfileFields.tsx';
import { Mascot, Notice, cx } from '../components/ui.tsx';
import { errorMessage, useApp } from '../lib/app.tsx';
import { THEMES, applyAppearance } from '../lib/theme.ts';

export { GOALS, INTERESTS, MINUTES } from '../components/ProfileFields.tsx';

export function OnboardingScreen() {
  const { backend, state, setState } = useApp();
  const p = state.profile;
  const [fields, setFields] = useState<ProfileFieldValues>({
    goal: p.goal || 'Günlük hayatta rahat konuşmak', interests: p.interests, hobbies: p.hobbies,
    dailyMinutes: p.dailyMinutes, studyDays: p.studyDays, studyTime: p.studyTime,
  });
  const [error, setError] = useState('');
  const [theme, setTheme] = useState(state.profile.appearance.theme);

  const save = async () => {
    try {
      await backend.saveAppearance({ ...state.profile.appearance, theme, accent: null });
      setState(await backend.saveProfile({ ...fields, onboardingDone: true }));
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

        <div className="mt-6"><ProfileFields numbered value={fields} onChange={setFields} /></div>

        <section className="card mt-4">
          <h2 className="mb-1 text-lg font-extrabold">5. Görünümünü seç</h2>
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
